import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Ticket, ArrowRight, ChevronDown, ChevronUp, MapPin, Star } from 'lucide-react';
import useStore from '../../../store/useTrainStore';
import useAuthStore from '../../../store/useAuthStore';
import { TRAIN_TYPES, ORDER_STATUSES, REFUND_RULES, generateTrains, TICKET_TYPES, getStopsBetween, getDelayStatus } from '../data/trainData';
import Modal from '../../../components/common/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useToast } from '../../../components/common/Toast';

const STATUS_TABS = [
  { key: 'all',       label: '全部' },
  { key: 'pending',   label: '待付款' },
  { key: 'paid',      label: '已付款' },
  { key: 'used',      label: '已使用' },
  { key: 'refunded',  label: '已退票' },
  { key: 'cancelled', label: '已取消' },
  { key: 'changed',   label: '已改票' },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { getUserOrders, requestRefund, changeTicket, cancelOrder } = useStore();
  const { currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [detailOrder, setDetailOrder] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null); // { order, passenger }
  const [refundOrder, setRefundOrder] = useState(null);
  const [changeOrder, setChangeOrder] = useState(null);
  const [confirmRefund, setConfirmRefund] = useState(false);

  if (!currentUser) return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <div className="empty-state">
        <div style={{ fontSize: '3rem' }}>🔐</div>
        <p>請先登入才能查看訂單</p>
        <Link to="/login" className="btn-primary">前往登入</Link>
      </div>
    </div>
  );

  const allOrders = getUserOrders();
  const orders = activeTab === 'all' ? allOrders : allOrders.filter(o => o.status === activeTab);

  const handleRefundConfirm = () => {
    requestRefund(refundOrder.id);
    toast('退票申請成功，款項將於 3-5 個工作日退回', 'success');
    setConfirmRefund(false);
    setRefundOrder(null);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1 className="page-title"><Ticket size={20} /> 我的票務</h1>
        <Link to="/ticket" className="btn-outline btn-sm">+ 查詢新車次</Link>
      </div>

      <div className="order-tabs">
        {STATUS_TABS.map(t => (
          <button key={t.key} className={`order-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
            {t.key !== 'all' && (
              <span style={{ marginLeft: '0.3rem', opacity: 0.75 }}>
                ({allOrders.filter(o => o.status === t.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>🎫</div>
          <p>{activeTab === 'all' ? '尚無任何訂單' : '此狀態無訂單'}</p>
          <Link to="/ticket" className="btn-primary">查詢車次</Link>
        </div>
      ) : (
        orders.slice().sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)).map(order => (
          <OrderCard
            key={order.id}
            order={order}
            today={today}
            onDetail={() => setDetailOrder(order)}
            onTicketDetail={(passenger) => setTicketDetail({ order, passenger })}
            onRefund={() => setRefundOrder(order)}
            onChange={() => setChangeOrder(order)}
            onPay={() => navigate(`/ticket/payment/${order.id}`)}
            onTicket={() => navigate(`/ticket/ticket/${order.id}`)}
          />
        ))
      )}

      {detailOrder && <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />}
      {ticketDetail && (
        <TicketDetailModal
          order={ticketDetail.order}
          passenger={ticketDetail.passenger}
          onClose={() => setTicketDetail(null)}
        />
      )}

      {refundOrder && !confirmRefund && (
        <RefundModal
          order={refundOrder}
          onClose={() => setRefundOrder(null)}
          onConfirm={() => setConfirmRefund(true)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmRefund}
        onClose={() => { setConfirmRefund(false); setRefundOrder(null); }}
        onConfirm={handleRefundConfirm}
        title="確認退票"
        message="確認申請退票？退票後無法恢復，款項將依規定退回。"
        icon="🔄"
        confirmLabel="確認退票"
        confirmClass="btn-warning"
      />

      {changeOrder && (
        <ChangeTicketModal
          order={changeOrder}
          onClose={() => setChangeOrder(null)}
          onConfirm={(newTrain, priceDiff) => {
            changeTicket(changeOrder.id, newTrain, priceDiff);
            toast('改票成功，Email 通知已發送', 'success');
            setChangeOrder(null);
          }}
        />
      )}
    </div>
  );
}

/* ── Order Card ──────────────────────────────────────────────── */
function OrderCard({ order, today, onDetail, onTicketDetail, onRefund, onChange, onPay, onTicket }) {
  const typeInfo  = TRAIN_TYPES[order.train.type] ?? {};
  const statusInfo = ORDER_STATUSES[order.status] ?? {};
  const canRefund = (order.status === 'paid' || order.status === 'changed') && order.train.date >= today;
  const canChange = order.status === 'paid' && order.train.date > today;
  const canTicket = order.status === 'paid' || order.status === 'used' || order.status === 'changed';
  const delay = order.train.delay ?? getDelayStatus(order.train.id ?? order.train.trainNo);

  return (
    <div className="order-card">
      <div className="order-card-top">
        <div>
          <div className="order-id-label">訂單：{order.id}</div>
          {order.bookingNo && (
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 700 }}>
              票號：{order.bookingNo}
            </div>
          )}
        </div>
        <span className="order-status-badge" style={{ background: statusInfo.bg, color: statusInfo.color }}>
          {statusInfo.label}
        </span>
      </div>

      <div className="order-route">
        <span className="train-type-badge" style={{ background: typeInfo.bg, color: typeInfo.color }}>
          {typeInfo.icon} {typeInfo.name}
        </span>
        {' '}{order.train.trainNo}：
        {order.train.fromName} <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {order.train.toName}
        <span style={{ marginLeft: 8, padding: '1px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700, background: delay.bg, color: delay.color }}>
          {delay.status === 'ontime' ? '✓ 準時' : delay.status === 'delayed' ? `⚠ ${delay.label}` : `? ${delay.label}`}
        </span>
      </div>

      <div className="order-meta">
        <span>📅 {order.train.date}</span>
        <span>🕐 {order.train.depTime} – {order.train.arrTime}</span>
        <span>💺 {order.seatPref === 'window' ? '靠窗' : order.seatPref === 'aisle' ? '靠走道' : '不指定'}</span>
        {order.pointsEarned > 0 && (
          <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star size={12} fill="#f59e0b" strokeWidth={0} /> +{order.pointsEarned} 點
          </span>
        )}
      </div>

      {/* Per-ticket rows */}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
          車票明細（點擊查看詳情）
        </div>
        {order.passengers.map((p, i) => (
          <button
            key={i}
            onClick={() => onTicketDetail(p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%',
              padding: '0.4rem 0.6rem', marginBottom: '0.25rem',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
          >
            <Ticket size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.83rem', fontWeight: 600, flex: 1 }}>{p.name}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.ticketTypeName}</span>
            {p.seatNo
              ? <span className="seat-badge">{p.seatNo}</span>
              : <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>候補</span>
            }
            <ArrowRight size={12} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          </button>
        ))}
      </div>

      <div className="order-card-bottom">
        <span className="order-total-price">NT${order.totalAmount.toLocaleString()}</span>
        <div className="order-actions">
          <button className="btn-ghost btn-sm" onClick={onDetail}>訂單詳情</button>
          {canTicket && (
            <button className="btn-outline btn-sm" onClick={onTicket}>🎟️ 取票</button>
          )}
          {order.status === 'pending' && (
            <button className="btn-primary btn-sm" onClick={onPay}>前往付款</button>
          )}
          {canChange && <button className="btn-warning btn-sm" onClick={onChange}>改票</button>}
          {canRefund && <button className="btn-danger btn-sm" onClick={onRefund}>退票</button>}
        </div>
      </div>
    </div>
  );
}

/* ── Order Detail Modal ──────────────────────────────────────── */
function OrderDetailModal({ order, onClose }) {
  const [stopsOpen, setStopsOpen] = useState(false);
  const typeInfo   = TRAIN_TYPES[order.train.type] ?? {};
  const statusInfo = ORDER_STATUSES[order.status] ?? {};
  const pmLabels   = { credit: '信用卡', linepay: 'LINE Pay', cvs: '超商付款', bank: '銀行轉帳' };

  const stops = stopsOpen
    ? getStopsBetween(order.train.from, order.train.to, order.train.type, order.train.depTime, order.train.duration)
    : [];

  return (
    <Modal isOpen onClose={onClose} title="訂單詳情" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="train-type-badge" style={{ background: typeInfo.bg, color: typeInfo.color, fontSize: '0.88rem' }}>
            {typeInfo.icon} {typeInfo.name} {order.train.trainNo}
          </span>
          <span className="order-status-badge" style={{ background: statusInfo.bg, color: statusInfo.color }}>
            {statusInfo.label}
          </span>
        </div>

        {[
          ['路線',     `${order.train.fromName} → ${order.train.toName}`],
          ['日期',     order.train.date],
          ['時間',     `${order.train.depTime} – ${order.train.arrTime}`],
          ['座位偏好', order.seatPref === 'window' ? '靠窗' : order.seatPref === 'aisle' ? '靠走道' : '不指定'],
          ['訂單編號', order.id],
          ['票號',     order.bookingNo ?? '（未付款）'],
          ['付款方式', pmLabels[order.paymentMethod] ?? '—'],
          ['建立時間', new Date(order.createdAt).toLocaleString('zh-TW')],
        ].map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.45rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{val}</span>
          </div>
        ))}

        {/* 多張折扣 */}
        {order.multiDiscount && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 'var(--radius)', padding: '0.6rem 0.85rem', fontSize: '0.85rem', color: '#15803d' }}>
            🎁 {order.multiDiscount.label}：節省 NT${order.discountAmount?.toLocaleString()}
          </div>
        )}

        {/* 乘客名單 + 座位 */}
        <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '0.85rem', marginTop: '0.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.5rem' }}>乘客名單與座位</div>
          {order.passengers.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.83rem', marginBottom: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-secondary)', minWidth: 60 }}>{p.ticketTypeName}</span>
              <span style={{ fontWeight: 600 }}>{p.name}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{p.phone}</span>
              {p.seatNo && <span className="seat-badge">{p.seatNo}</span>}
            </div>
          ))}
        </div>

        {/* 沿途停靠站 */}
        <div>
          <button className="stops-toggle-btn" onClick={() => setStopsOpen(v => !v)}>
            <MapPin size={12} /> 沿途停靠站
            {stopsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {stopsOpen && (
            <div className="stops-list" style={{ marginTop: 6 }}>
              <div className="stop-item stop-item-origin">
                <span className="stop-dot origin" /><span className="stop-name">{order.train.fromName}</span><span className="stop-time">{order.train.depTime} 出發</span>
              </div>
              {stops.map(s => (
                <div key={s.id} className="stop-item">
                  <span className="stop-dot" /><span className="stop-name">{s.name}</span><span className="stop-time">{s.arrTime}</span>
                </div>
              ))}
              <div className="stop-item stop-item-dest">
                <span className="stop-dot dest" /><span className="stop-name">{order.train.toName}</span><span className="stop-time">{order.train.arrTime} 抵達</span>
              </div>
            </div>
          )}
        </div>

        {/* 點數 */}
        {order.pointsEarned > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#d97706' }}>
            <Star size={14} fill="#f59e0b" strokeWidth={0} />
            本次訂票累積 {order.pointsEarned} 點
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)', paddingTop: '0.5rem', borderTop: '2px solid var(--border)' }}>
          <span>總金額</span>
          <span>NT${order.totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </Modal>
  );
}

/* ── Refund Modal ────────────────────────────────────────────── */
function RefundModal({ order, onClose, onConfirm }) {
  const today = new Date().toISOString().split('T')[0];
  const diffDays = Math.ceil((new Date(order.train.date) - new Date(today)) / 86400000);
  let ruleIdx = -1;
  if (diffDays >= 25) ruleIdx = 0;
  else if (diffDays >= 3) ruleIdx = 1;
  else if (diffDays >= 1) ruleIdx = 2;
  else if (diffDays === 0) ruleIdx = 3;
  const rule = ruleIdx >= 0 ? REFUND_RULES[ruleIdx] : null;
  const refundPcts = [0.99, 0.97, 0.95, 0.90];
  const refundAmount = ruleIdx >= 0 ? Math.round(order.totalAmount * refundPcts[ruleIdx]) : 0;

  return (
    <Modal isOpen onClose={onClose} title="申請退票" size="md">
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        退票規則依出發日期計算，請詳閱以下說明：
      </p>
      <table className="refund-table">
        <thead><tr><th>申請時間</th><th>退票費用說明</th></tr></thead>
        <tbody>
          {REFUND_RULES.map((r, i) => (
            <tr key={i} style={i === ruleIdx ? { background: '#fef3c7' } : {}}>
              <td>{r.condition} {i === ruleIdx && '← 目前適用'}</td>
              <td>{r.fee}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {ruleIdx >= 0 ? (
        <div className="refund-estimate">
          <strong>預估退款金額：NT${refundAmount.toLocaleString()}</strong>
          （原票價 NT${order.totalAmount.toLocaleString()}，扣除 {rule.fee}）
        </div>
      ) : (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 'var(--radius)', padding: '0.75rem', marginTop: '0.75rem', color: 'var(--danger)', fontSize: '0.88rem' }}>
          ⚠ 車次出發後無法申請退票
        </div>
      )}
      <div className="modal-footer">
        <button className="btn-ghost" onClick={onClose}>取消</button>
        {ruleIdx >= 0 && <button className="btn-warning" onClick={onConfirm}>確認申請退票</button>}
      </div>
    </Modal>
  );
}

/* ── Ticket Detail Modal ─────────────────────────────────────── */
function TicketDetailModal({ order, passenger, onClose }) {
  const typeInfo = TRAIN_TYPES[order.train.type] ?? {};
  const delay = order.train.delay ?? getDelayStatus(order.train.id ?? order.train.trainNo);

  const rows = [
    ['乘客姓名', passenger.name],
    ['票種',     passenger.ticketTypeName],
    ['座位號碼', passenger.seatNo ?? '候補（未分配）'],
    ['車次號',   `${typeInfo.icon ?? ''} ${typeInfo.name ?? ''} ${order.train.trainNo}`],
    ['起點',     order.train.fromName],
    ['目的地',   order.train.toName],
    ['發車時間', `${order.train.date} ${order.train.depTime}`],
    ['抵達時間', `${order.train.date} ${order.train.arrTime}`],
    ['票號',     order.bookingNo ?? '（未付款）'],
    ['訂票時間', new Date(order.createdAt).toLocaleString('zh-TW')],
  ];

  return (
    <Modal isOpen onClose={onClose} title="車票詳細資料" size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>
          <span style={{ padding: '4px 16px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700, background: delay.bg, color: delay.color }}>
            {delay.status === 'ontime' ? '✓ 列車準時' : delay.status === 'delayed' ? `⚠ ${delay.label}` : `? ${delay.label}`}
          </span>
        </div>
        {rows.map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
            <span style={{ fontWeight: 600, textAlign: 'right', marginLeft: '1rem' }}>{val}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ── Change Ticket Modal ─────────────────────────────────────── */
function ChangeTicketModal({ order, onClose, onConfirm }) {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [newDate, setNewDate] = useState(order.train.date);
  const [timeSlot, setTimeSlot] = useState('all');
  const [trains, setTrains] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const results = generateTrains({ from: order.train.from, to: order.train.to, date: newDate, timeSlot });
    setTrains(results); setSearched(true); setSelected(null);
  };

  const totalTickets = order.tickets.reduce((s, t) => s + t.count, 0);
  const oldBasePrice = order.train.basePrice;
  const priceDiff = selected ? (selected.basePrice - oldBasePrice) * totalTickets : 0;

  return (
    <Modal isOpen onClose={onClose} title="申請改票" size="lg">
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        原車次：{order.train.fromName} → {order.train.toName}（{order.train.date} {order.train.depTime}）
      </p>
      <div className="form-grid" style={{ marginBottom: '0.75rem' }}>
        <div className="form-group">
          <label>新出發日期</label>
          <input className="form-input" type="date" min={tomorrow} value={newDate} onChange={e => setNewDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>時段</label>
          <select className="form-input" value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
            <option value="all">不限時段</option>
            <option value="morning">上午（06-12）</option>
            <option value="afternoon">下午（12-18）</option>
            <option value="evening">晚上（18-24）</option>
          </select>
        </div>
      </div>
      <button className="btn-primary btn-sm" onClick={handleSearch}>查詢可用車次</button>

      {searched && trains.length > 0 && (
        <div style={{ marginTop: '1rem', maxHeight: '260px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          {trains.slice(0, 8).map(t => {
            const ti = TRAIN_TYPES[t.type] ?? {};
            const diff = (t.basePrice - oldBasePrice) * totalTickets;
            return (
              <div key={t.id} onClick={() => setSelected(t)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                background: selected?.id === t.id ? 'var(--primary-light)' : 'white',
                borderLeft: selected?.id === t.id ? '3px solid var(--primary)' : '3px solid transparent',
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span className="train-type-badge" style={{ background: ti.bg, color: ti.color }}>{ti.icon} {ti.name}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.trainNo}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.depTime} – {t.arrTime}</span>
                </div>
                <span style={{ fontWeight: 700, color: diff > 0 ? 'var(--danger)' : diff < 0 ? 'var(--success)' : 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {diff > 0 ? `補差額 NT$${diff.toLocaleString()}` : diff < 0 ? `退差額 NT$${Math.abs(diff).toLocaleString()}` : '同價'}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {searched && trains.length === 0 && <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>無可用車次</p>}
      {selected && (
        <div className={`change-diff-box ${priceDiff > 0 ? 'extra' : priceDiff < 0 ? 'refund' : 'same'}`}>
          {priceDiff > 0 ? `⚠ 需補差額 NT$${priceDiff.toLocaleString()}` :
           priceDiff < 0 ? `✅ 退還差額 NT$${Math.abs(priceDiff).toLocaleString()}` : '✓ 無差額，直接改票'}
        </div>
      )}
      <div className="modal-footer">
        <button className="btn-ghost" onClick={onClose}>取消</button>
        <button className="btn-primary" disabled={!selected} onClick={() => onConfirm(selected, priceDiff)}>確認改票</button>
      </div>
    </Modal>
  );
}
