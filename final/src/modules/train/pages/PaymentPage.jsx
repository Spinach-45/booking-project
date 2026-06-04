import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Copy, CheckCheck } from 'lucide-react';
import useStore from '../../../store/useTrainStore';
import useAuthStore from '../../../store/useAuthStore';
import { PAYMENT_METHODS, TRAIN_TYPES, formatDuration } from '../data/trainData';
import { useToast } from '../../../components/common/Toast';

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getOrder, processPayment, cancelOrder } = useStore();

  const [method, setMethod] = useState('credit');
  const [creditCard, setCreditCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [cvsCode, setCvsCode] = useState('');
  const [bankAcct, setBankAcct] = useState('');
  const [linepayReady, setLinepayReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const { currentUser } = useAuthStore();
  const [pointsToUse, setPointsToUse] = useState(0);

  const order = getOrder(orderId);

  if (!order) return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <div className="empty-state">
        <div style={{ fontSize: '3rem' }}>❌</div>
        <p>找不到訂單</p>
        <button className="btn-primary" onClick={() => navigate('/ticket')}>返回首頁</button>
      </div>
    </div>
  );

  const typeInfo   = TRAIN_TYPES[order.train.type] ?? {};
  const userPoints = currentUser?.points || 0;
  const maxPoints  = Math.min(userPoints, order.totalAmount);
  const finalAmount = order.totalAmount - pointsToUse;

  const formatCard = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) => {
    const d = val.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const generateCvs = () => {
    const code = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
    setCvsCode(code.replace(/(.{4})/g, '$1 ').trim());
  };

  const generateBank = () => {
    const acct = `808${Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('')}`;
    setBankAcct(acct);
  };

  const canPay = () => {
    if (method === 'credit') {
      return creditCard.number.replace(/\s/g, '').length === 16 &&
             creditCard.expiry.length === 5 &&
             creditCard.cvv.length === 3 &&
             creditCard.name.trim();
    }
    if (method === 'linepay') return linepayReady;
    if (method === 'cvs')     return !!cvsCode;
    if (method === 'bank')    return !!bankAcct;
    return false;
  };

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      const { success } = processPayment(orderId, method, creditCard.number, pointsToUse);
      setPaying(false);
      if (success) toast('付款成功！', 'success');
      else toast('付款失敗', 'error');
      navigate(`/ticket/payment-result/${orderId}`);
    }, 1500);
  };

  const handleCancel = () => {
    cancelOrder(orderId);
    toast('訂單已取消', 'info');
    navigate('/ticket');
  };

  const copyAcct = () => {
    navigator.clipboard.writeText(bankAcct.replace(/\s/g, '')).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <button className="btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> 返回
        </button>
        <h1 className="page-title">💳 付款</h1>
      </div>

      <div className="payment-layout">
        {/* Left: payment method + form */}
        <div>
          <div className="form-section">
            <div className="form-section-title">選擇付款方式</div>
            <div className="payment-method-grid">
              {PAYMENT_METHODS.map(pm => (
                <button
                  key={pm.id}
                  className={`payment-method-btn ${method === pm.id ? 'active' : ''}`}
                  onClick={() => setMethod(pm.id)}
                >
                  <div className="pm-icon">{pm.icon}</div>
                  <div className="pm-name">{pm.name}</div>
                  <div className="pm-desc">{pm.desc}</div>
                </button>
              ))}
            </div>

            {/* Credit card form */}
            {method === 'credit' && (
              <div className="payment-form-area">
                <div className="pfa-title"><CreditCard size={16} /> 信用卡資訊</div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label>卡號</label>
                  <input
                    className="form-input card-input-mono"
                    placeholder="0000 0000 0000 0000"
                    value={creditCard.number}
                    onChange={e => setCreditCard(p => ({ ...p, number: formatCard(e.target.value) }))}
                    maxLength={19}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    提示：以 0000 開頭可模擬付款失敗
                  </span>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>有效期限（MM/YY）</label>
                    <input
                      className="form-input card-input-mono"
                      placeholder="12/28"
                      value={creditCard.expiry}
                      onChange={e => setCreditCard(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                      maxLength={5}
                    />
                  </div>
                  <div className="form-group">
                    <label>安全碼（CVV）</label>
                    <input
                      className="form-input card-input-mono"
                      placeholder="123"
                      value={creditCard.cvv}
                      onChange={e => setCreditCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                      maxLength={3}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label>持卡人姓名</label>
                  <input
                    className="form-input"
                    placeholder="姓名（與卡片相同）"
                    value={creditCard.name}
                    onChange={e => setCreditCard(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* LINE Pay */}
            {method === 'linepay' && (
              <div className="payment-form-area">
                <div className="pfa-title">📱 LINE Pay 授權</div>
                <div className="linepay-area">
                  <div className="linepay-qr">📲</div>
                  <div className="linepay-hint">掃描 QR Code 或點擊下方按鈕完成授權</div>
                  {!linepayReady ? (
                    <button className="btn-primary" onClick={() => setLinepayReady(true)}>
                      確認 LINE Pay 授權
                    </button>
                  ) : (
                    <div className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
                      ✅ 授權完成，可進行付款
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CVS */}
            {method === 'cvs' && (
              <div className="payment-form-area">
                <div className="pfa-title">🏪 超商繳費代碼</div>
                <div className="cvs-area">
                  {!cvsCode ? (
                    <button className="btn-primary" onClick={generateCvs}>產生繳費代碼</button>
                  ) : (
                    <>
                      <div className="cvs-code-box">
                        <div className="cvs-code">{cvsCode}</div>
                        <div className="cvs-hint">請至 7-11、全家、萊爾富 輸入此代碼繳費</div>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        代碼有效期限：24 小時內，金額：NT${order.totalAmount.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Bank transfer */}
            {method === 'bank' && (
              <div className="payment-form-area">
                <div className="pfa-title">🏦 銀行轉帳資訊</div>
                {!bankAcct ? (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <button className="btn-primary" onClick={generateBank}>產生虛擬帳號</button>
                  </div>
                ) : (
                  <div className="bank-area">
                    <div className="bank-row">
                      <span className="bank-label">銀行代碼</span>
                      <span className="bank-value">808（玉山銀行）</span>
                    </div>
                    <div className="bank-row">
                      <span className="bank-label">虛擬帳號</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="bank-value bank-account">{bankAcct}</span>
                        <button className="btn-ghost btn-sm" onClick={copyAcct}>
                          {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                    <div className="bank-row">
                      <span className="bank-label">轉帳金額</span>
                      <span className="bank-value" style={{ color: 'var(--primary)' }}>NT${order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="bank-row">
                      <span className="bank-label">帳號有效期</span>
                      <span className="bank-value">24 小時</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn-primary btn-lg" onClick={handlePay} disabled={!canPay() || paying} style={{ flex: 1 }}>
              {paying ? '處理中…' : `確認付款 NT$${finalAmount.toLocaleString()}`}
            </button>
            <button className="btn-danger" onClick={handleCancel} disabled={paying}>
              取消訂單
            </button>
          </div>
        </div>

        {/* Right: order summary */}
        <div className="order-sidebar">
          <div className="order-summary-card">
            <div className="order-summary-title">📋 訂單摘要</div>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span className="train-type-badge" style={{ background: typeInfo.bg, color: typeInfo.color }}>
                  {typeInfo.icon} {typeInfo.name}
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{order.train.trainNo}</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                {order.train.fromName} → {order.train.toName}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {order.train.date}  {order.train.depTime} – {order.train.arrTime}
              </div>
            </div>
            <div className="order-rows">
              {order.tickets.map(t => (
                <div key={t.typeId} className="order-row">
                  <span>{t.typeName} × {t.count}</span>
                  <span>NT${t.subtotal.toLocaleString()}</span>
                </div>
              ))}
              {order.multiDiscount && (
                <div className="order-row" style={{ color: 'var(--success)' }}>
                  <span>優惠折扣</span>
                  <span>－NT${order.discountAmount?.toLocaleString()}</span>
                </div>
              )}
              {pointsToUse > 0 && (
                <div className="order-row" style={{ color: 'var(--success)' }}>
                  <span>點數折抵</span>
                  <span>－NT${pointsToUse.toLocaleString()}</span>
                </div>
              )}
              <div className="order-row total">
                <span>實付金額</span>
                <span>NT${finalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* 點數折抵 */}
            {userPoints > 0 && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  🌟 點數折抵（持有 {userPoints} 點）
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number" min={0} max={maxPoints}
                    value={pointsToUse}
                    onChange={e => setPointsToUse(Math.min(Math.max(0, parseInt(e.target.value) || 0), maxPoints))}
                    className="form-input"
                    style={{ width: 90 }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    點（＝ NT${pointsToUse}，最多可折抵 {maxPoints} 點）
                  </span>
                </div>
              </div>
            )}
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              訂單編號：{order.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
