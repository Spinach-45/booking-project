import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useStore from '../../../store/useTrainStore';
import useAuthStore from '../../../store/useAuthStore';
import { TICKET_TYPES, TRAIN_TYPES, formatDuration, getMultiDiscount, POINTS_RATE } from '../data/trainData';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useToast } from '../../../components/common/Toast';

export default function BookingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { selectedTrain, searchParams, createOrder } = useStore();
  const { currentUser } = useAuthStore();
  const [seatPref, setSeatPref] = useState(searchParams.seatPref || 'any');
  const [passengers, setPassengers] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  if (!selectedTrain) return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <div className="empty-state">
        <i className="fi fi-rr-ticket fi-lg" style={{ color: 'var(--secondary)' }} />
        <p>尚未選擇車次</p>
        <Link to="/ticket" className="btn-primary">返回查詢</Link>
      </div>
    </div>
  );

  if (!currentUser) return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <div className="empty-state">
        <i className="fi fi-rr-lock fi-lg" style={{ color: 'var(--secondary)' }} />
        <p>請先登入才能訂票</p>
        <Link to="/login" className="btn-primary">前往登入</Link>
      </div>
    </div>
  );

  const typeInfo = TRAIN_TYPES[selectedTrain.type] ?? {};

  const allPassengerTickets = useMemo(() => {
    const list = [];
    TICKET_TYPES.forEach(tt => {
      const count = searchParams.ticketCounts[tt.id] ?? 0;
      for (let i = 0; i < count; i++) list.push({ ...tt, key: `${tt.id}-${i}`, index: list.length });
    });
    return list;
  }, [searchParams.ticketCounts]);

  const tickets = useMemo(() =>
    TICKET_TYPES
      .filter(tt => (searchParams.ticketCounts[tt.id] ?? 0) > 0)
      .map(tt => ({
        typeId: tt.id, typeName: tt.name,
        count: searchParams.ticketCounts[tt.id],
        unitPrice: Math.round(selectedTrain.basePrice * tt.discount),
        subtotal: Math.round(selectedTrain.basePrice * tt.discount) * searchParams.ticketCounts[tt.id],
      })),
    [selectedTrain, searchParams.ticketCounts]
  );

  const totalPassengers = allPassengerTickets.length;
  const baseAmount = tickets.reduce((s, t) => s + t.subtotal, 0);
  const multiDiscount = getMultiDiscount(totalPassengers);
  const discountAmount = multiDiscount ? Math.round(baseAmount * multiDiscount.percent / 100) : 0;
  const totalAmount = baseAmount - discountAmount;
  const pointsPreview = Math.floor(totalAmount / (100 / POINTS_RATE));

  const availableSeats =
    seatPref === 'window' ? selectedTrain.availableWindow :
    seatPref === 'aisle'  ? selectedTrain.availableAisle :
    selectedTrain.availableWindow + selectedTrain.availableAisle;
  const hasEnoughSeats = availableSeats >= totalPassengers;

  const setPassenger = (key, field, value) =>
    setPassengers(prev => ({ ...prev, [key]: { ...(prev[key] ?? {}), [field]: value } }));

  const isFormValid = allPassengerTickets.every(pt => {
    const p = passengers[pt.key] ?? {};
    return p.name?.trim() && p.phone?.trim() && p.idNo?.trim();
  }) && hasEnoughSeats;

  const handleConfirm = () => {
    const builtPassengers = allPassengerTickets.map(pt => ({
      ...passengers[pt.key], ticketType: pt.id, ticketTypeName: pt.name,
    }));
    const orderId = createOrder({ train: selectedTrain, tickets, passengers: builtPassengers, seatPref, multiDiscount });
    toast('訂單建立成功，請完成付款', 'success');
    navigate(`/ticket/payment/${orderId}`);
  };

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <button className="btn-ghost btn-sm" onClick={() => navigate('/ticket/search')}>
          <i className="fi fi-rr-arrow-left fi-sm" /> 返回車次列表
        </button>
        <h1 className="page-title"><i className="fi fi-rr-ticket fi-sm" style={{ marginRight: 6 }} />填寫乘客資料</h1>
      </div>

      <div className="booking-layout">
        <div>
          {/* Train summary */}
          <div className="train-summary-strip">
            <div className="train-summary-route">
              <span className="train-type-badge" style={{ background: typeInfo.bg, color: typeInfo.color }}>
                {typeInfo.icon} {typeInfo.name}
              </span>
              {selectedTrain.trainNo}：{selectedTrain.fromName} → {selectedTrain.toName}
            </div>
            <div className="train-summary-meta">
              <span><i className="fi fi-rr-calendar fi-xs" style={{ marginRight: 3 }} />{selectedTrain.date}</span>
              <span><i className="fi fi-rr-clock fi-xs" style={{ marginRight: 3 }} />{selectedTrain.depTime} – {selectedTrain.arrTime}</span>
              <span><i className="fi fi-rr-clock fi-xs" style={{ marginRight: 3 }} />{formatDuration(selectedTrain.duration)}</span>
            </div>
          </div>

          {/* Seat preference */}
          <div className="form-section">
            <div className="form-section-title"><i className="fi fi-rr-chair fi-sm" style={{ marginRight: 6 }} />座位偏好</div>
            <div className="seat-pref-grid">
              {[
                { id: 'window', icon: <i className="fi fi-rr-window" />, label: '靠窗',   avail: selectedTrain.availableWindow },
                { id: 'aisle',  icon: <i className="fi fi-rr-chair" />, label: '靠走道', avail: selectedTrain.availableAisle },
                { id: 'any',    icon: <i className="fi fi-rr-arrows-h" />, label: '不指定', avail: selectedTrain.availableWindow + selectedTrain.availableAisle },
              ].map(opt => {
                const enough = opt.avail >= totalPassengers;
                return (
                  <button key={opt.id} className={`seat-pref-btn ${seatPref === opt.id ? 'active' : ''}`} onClick={() => setSeatPref(opt.id)}>
                    <div className="seat-pref-icon">{opt.icon}</div>
                    <div className="seat-pref-label">{opt.label}</div>
                    <div className={`seat-pref-avail ${!enough ? 'low' : ''}`}>剩餘 {opt.avail} 席{!enough ? '（不足）' : ''}</div>
                  </button>
                );
              })}
            </div>
            {!hasEnoughSeats && (
              <div className="seat-warn">
                <i className="fi fi-rr-exclamation fi-sm" />
                <span>所選座位類型餘票不足（需要 {totalPassengers} 席，剩餘 {availableSeats} 席），請換選其他座位類型或返回選擇其他車次。</span>
              </div>
            )}
          </div>

          {/* Passenger forms */}
          <div className="form-section">
            <div className="form-section-title"><i className="fi fi-rr-user fi-sm" /> 乘客資料（共 {totalPassengers} 位）</div>
            {allPassengerTickets.map((pt, idx) => (
              <div key={pt.key} className="passenger-card">
                <div className="passenger-header">
                  <span className="train-type-badge" style={{ background: '#f1f5f9', color: 'var(--text)' }}>
                    乘客 {idx + 1}
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem' }}>{pt.name}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 400 }}>{pt.desc}</span>
                  </span>
                </div>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>姓名 *</label>
                    <input className="form-input" placeholder="真實姓名"
                      value={passengers[pt.key]?.name ?? ''}
                      onChange={e => setPassenger(pt.key, 'name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>聯絡電話 *</label>
                    <input className="form-input" placeholder="09xx-xxx-xxx"
                      value={passengers[pt.key]?.phone ?? ''}
                      onChange={e => setPassenger(pt.key, 'phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>身分證 / 護照 *</label>
                    <input className="form-input" placeholder={pt.id === 'child' ? '可填監護人證號' : 'A123456789'}
                      value={passengers[pt.key]?.idNo ?? ''}
                      onChange={e => setPassenger(pt.key, 'idNo', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="order-sidebar">
          <div className="order-summary-card">
            <div className="order-summary-title"><i className="fi fi-rr-clipboard-list fi-sm" style={{ marginRight: 6 }} />訂單明細</div>
            <div className="order-rows">
              {tickets.map(t => (
                <div key={t.typeId} className="order-row subtotal">
                  <span>{t.typeName} × {t.count}</span>
                  <span>NT${t.subtotal.toLocaleString()}</span>
                </div>
              ))}
              {tickets.map(t => (
                <div key={`unit-${t.typeId}`} className="order-row" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: -6 }}>
                  <span style={{ paddingLeft: '0.5rem' }}>（每張 NT${t.unitPrice.toLocaleString()}）</span>
                </div>
              ))}

              {/* 多張折扣 */}
              {multiDiscount && (
                <>
                  <div className="order-row" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', borderTop: '1px dashed var(--border)', paddingTop: '0.4rem', marginTop: '0.25rem' }}>
                    <span>小計</span>
                    <span>NT${baseAmount.toLocaleString()}</span>
                  </div>
                  <div className="order-row" style={{ color: 'var(--success)', fontSize: '0.82rem' }}>
                    <span><i className="fi fi-rr-gift fi-xs" style={{ marginRight: 3 }} />{multiDiscount.label}</span>
                    <span>－NT${discountAmount.toLocaleString()}</span>
                  </div>
                </>
              )}

              <div className="order-row total">
                <span>合計</span>
                <span>NT${totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* 可累積點數預覽 */}
            <div className="points-preview">
              <i className="fi fi-sr-star fi-xs" style={{ color: '#f59e0b' }} />
              本次可累積 <strong>{pointsPreview}</strong> 點
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              座位：{seatPref === 'window' ? '靠窗' : seatPref === 'aisle' ? '靠走道' : '不指定'}
            </div>
            <button className="btn-primary full-width" onClick={() => setShowConfirm(true)} disabled={!isFormValid}>
              確認訂單並付款
            </button>
            {!isFormValid && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.5rem' }}>
                請填寫所有乘客資料
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="確認訂單"
        message={`確認建立訂單？總金額 NT$${totalAmount.toLocaleString()}，共 ${totalPassengers} 位乘客。建立後將導向付款頁面。`}
        icon={<i className="fi fi-rr-ticket fi-lg" style={{ color: 'var(--primary)' }} />}
        confirmLabel="確認，前往付款"
        confirmClass="btn-primary"
      />
    </div>
  );
}
