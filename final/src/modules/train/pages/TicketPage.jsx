import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useStore from '../../../store/useTrainStore';
import { TRAIN_TYPES, formatDuration, getDelayStatus } from '../data/trainData';

/* ── Pseudo QR Code ─────────────────────────────────────────── */
function PseudoQR({ value, size = 160 }) {
  const cells = 25;
  const h = value.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 7);

  const bit = (r, c) => {
    const inTL = r < 7 && c < 7;
    const inTR = r < 7 && c >= cells - 7;
    const inBL = r >= cells - 7 && c < 7;
    if (inTL || inTR || inBL) {
      const lr = inBL ? r - (cells - 7) : r;
      const lc = inTR ? c - (cells - 7) : c;
      const border = lr === 0 || lr === 6 || lc === 0 || lc === 6;
      const inner  = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
      return (border || inner) ? 1 : 0;
    }
    // Quiet zone around finders
    if ((r < 8 && c < 8) || (r < 8 && c >= cells - 8) || (r >= cells - 8 && c < 8)) return 0;
    // Data
    const n = (h + r * cells * 3 + c * 7) * 2654435761;
    return ((n >>> 24) ^ (n >>> 16)) % 2;
  };

  const cs = size / cells;
  return (
    <svg width={size} height={size} style={{ display: 'block', background: 'white' }}>
      {Array.from({ length: cells }, (_, r) =>
        Array.from({ length: cells }, (_, c) =>
          bit(r, c) ? <rect key={`${r}-${c}`} x={c * cs} y={r * cs} width={cs} height={cs} fill="#111" /> : null
        )
      )}
    </svg>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function TicketPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrder } = useStore();
  const [ticketMode, setTicketMode] = useState('qr'); // 'qr' | 'cvs'
  const [copied, setCopied] = useState(false);

  const order = getOrder(orderId);

  if (!order || order.status === 'pending') return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <div className="empty-state">
        <i className="fi fi-rr-ticket fi-lg" style={{ color: 'var(--secondary)' }} />
        <p>{!order ? '找不到訂單' : '訂單尚未付款，無法取票'}</p>
        <Link to="/ticket/orders" className="btn-primary">返回票務</Link>
      </div>
    </div>
  );

  const typeInfo = TRAIN_TYPES[order.train.type] ?? {};
  const delay = order.train.delay ?? getDelayStatus(order.train.id ?? order.train.trainNo);

  const copyCvs = () => {
    const code = order.cvsPickupCode ?? '';
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '3rem' }}>
      <div className="container" style={{ paddingTop: '1.5rem', maxWidth: 540 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button className="btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <i className="fi fi-rr-arrow-left fi-sm" /> 返回
          </button>
          <h1 className="page-title"><i className="fi fi-rr-ticket fi-sm" style={{ marginRight: 6 }} />電子票</h1>
          <button className="btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => window.print()}>
            <i className="fi fi-rr-print fi-sm" /> 列印
          </button>
        </div>

        {/* Ticket card */}
        <div className="ticket-card">
          {/* Header band */}
          <div className="ticket-header-band" style={{ background: typeInfo.bg ?? 'var(--primary-light)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="train-type-badge" style={{ background: 'white', color: typeInfo.color }}>
                  {typeInfo.icon} {typeInfo.name}
                </span>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: typeInfo.color }}>{order.train.trainNo}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: typeInfo.color, letterSpacing: 2 }}>
                {order.train.fromName} → {order.train.toName}
              </div>
              <div style={{ fontSize: '0.88rem', color: typeInfo.color, opacity: 0.85, marginTop: 2 }}>
                {order.train.date}　{order.train.depTime} 出發　({formatDuration(order.train.duration)})
              </div>
              <div style={{ marginTop: 6 }}>
                <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, background: delay.bg, color: delay.color }}>
                  {delay.status === 'ontime' ? <><i className="fi fi-sr-check fi-xs" style={{ marginRight: 3 }} />準時</> : delay.status === 'delayed' ? <><i className="fi fi-sr-exclamation fi-xs" style={{ marginRight: 3 }} />{delay.label}</> : `? ${delay.label}`}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket no */}
          <div style={{ padding: '0.9rem 1.25rem', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 2 }}>訂票編號</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', letterSpacing: 2, color: 'var(--primary)' }}>
                {order.bookingNo}
              </div>
            </div>
            <div className="ticket-status-chip">
              {order.status === 'paid' ? <><i className="fi fi-sr-check-circle fi-xs" style={{ marginRight: 3, color: 'var(--success)' }} />有效票</> : order.status === 'used' ? '已使用' : order.status === 'changed' ? '已改票' : order.status}
            </div>
          </div>

          {/* Divider notch */}
          <div className="ticket-notch-divider">
            <div className="notch-left" />
            <div style={{ flex: 1, borderTop: '2px dashed var(--border)', margin: '0 4px' }} />
            <div className="notch-right" />
          </div>

          {/* Pickup mode tabs */}
          <div style={{ padding: '0.75rem 1.25rem 0', background: 'white' }}>
            <div className="rec-source-tabs">
              <button className={`rec-source-tab ${ticketMode === 'qr' ? 'active' : ''}`} onClick={() => setTicketMode('qr')}>
                <i className="fi fi-rr-mobile fi-xs" style={{ marginRight: 4 }} />線上電子票
              </button>
              <button className={`rec-source-tab ${ticketMode === 'cvs' ? 'active' : ''}`} onClick={() => setTicketMode('cvs')}>
                <i className="fi fi-rr-store-alt fi-xs" style={{ marginRight: 4 }} />超商取票
              </button>
            </div>
          </div>

          {/* QR Code section */}
          {ticketMode === 'qr' && (
            <div className="ticket-qr-section">
              <PseudoQR value={order.bookingNo ?? order.id} size={160} />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8, textAlign: 'center' }}>
                請出示此 QR Code 供驗票使用
              </p>
            </div>
          )}

          {/* CVS pickup section */}
          {ticketMode === 'cvs' && (
            <div className="ticket-cvs-section">
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                請至 7-11、全家、萊爾富 輸入以下代碼取票：
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '0.65rem 1rem', border: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.3rem', letterSpacing: 4, flex: 1 }}>
                  {order.cvsPickupCode ?? 'CV--------'}
                </span>
                <button className="btn-ghost btn-sm" onClick={copyCvs}>
                  {copied ? <i className="fi fi-sr-check-circle fi-sm" style={{ color: 'var(--success)' }} /> : <i className="fi fi-rr-copy fi-sm" />}
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                代碼效期至乘車日前 24 小時
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="ticket-notch-divider">
            <div className="notch-left" />
            <div style={{ flex: 1, borderTop: '2px dashed var(--border)', margin: '0 4px' }} />
            <div className="notch-right" />
          </div>

          {/* Passengers */}
          <div style={{ padding: '0.85rem 1.25rem', background: 'white' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              乘客 · 座位
            </div>
            {order.passengers.map((p, i) => (
              <div key={i} className="ticket-passenger-row">
                <span className="ticket-passenger-name">{p.name}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.ticketTypeName}</span>
                {p.seatNo
                  ? <span className="seat-badge">{p.seatNo}</span>
                  : <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>候補</span>
                }
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg)', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>票種：{order.tickets.map(t => `${t.typeName}×${t.count}`).join('、')}</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>NT${order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'center' }}>
          <Link to="/ticket/orders" className="btn-outline btn-sm">← 返回訂單列表</Link>
          <Link to="/ticket" className="btn-ghost btn-sm">訂購新車票</Link>
        </div>
      </div>
    </div>
  );
}
