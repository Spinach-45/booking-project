import { useParams, useNavigate, Link } from 'react-router-dom';
import useStore from '../../../store/useTrainStore';
import { TRAIN_TYPES } from '../data/trainData';

export default function PaymentResultPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrder, paymentResult, cancelOrder } = useStore();

  const order = getOrder(orderId);
  const result = paymentResult;

  if (!order) return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <div className="empty-state">
        <i className="fi fi-rr-question fi-lg" style={{ color: 'var(--secondary)' }} />
        <p>找不到訂單資訊</p>
        <Link to="/ticket" className="btn-primary">返回首頁</Link>
      </div>
    </div>
  );

  const success = order.status === 'paid';
  const typeInfo = TRAIN_TYPES[order.train.type] ?? {};
  const pmLabels = { credit: '信用卡', linepay: 'LINE Pay', cvs: '超商付款', bank: '銀行轉帳' };

  const handleRetry  = () => navigate(`/ticket/payment/${orderId}`);
  const handleCancel = () => { cancelOrder(orderId); navigate('/ticket'); };

  return (
    <div className="container">
      {success ? (
        <div className="result-page">
          <div className="result-icon"><i className="fi fi-rr-star fi-lg" style={{ color: 'var(--success)' }} /></div>
          <div className="result-title" style={{ color: 'var(--success)' }}>付款成功！</div>
          <div className="result-sub">訂票完成，請妥善保管您的訂票編號</div>

          <div className="booking-no-card">
            <div className="booking-no-label">訂票編號</div>
            <div className="booking-no">{order.bookingNo}</div>
          </div>

          {/* 點數獲得 */}
          {order.pointsEarned > 0 && (
            <div className="points-earned-banner">
              <i className="fi fi-sr-star fi-sm" style={{ color: '#f59e0b' }} />
              本次訂票獲得 <strong>{order.pointsEarned}</strong> 點！
            </div>
          )}

          <div className="result-detail-card">
            {[
              ['車次', <><span className="train-type-badge" style={{ background: typeInfo.bg, color: typeInfo.color }}>{typeInfo.icon} {typeInfo.name}</span> {order.train.trainNo}</>],
              ['路線', `${order.train.fromName} → ${order.train.toName}`],
              ['日期時間', `${order.train.date} ${order.train.depTime}`],
              ['座位偏好', order.seatPref === 'window' ? '靠窗' : order.seatPref === 'aisle' ? '靠走道' : '不指定'],
              ['票種', order.tickets.map(t => `${t.typeName}×${t.count}`).join('、')],
              ['付款方式', pmLabels[order.paymentMethod] ?? order.paymentMethod],
              ['總金額', <span style={{ color: 'var(--primary)', fontWeight: 800 }}>NT${order.totalAmount.toLocaleString()}</span>],
            ].map(([label, val]) => (
              <div key={label} className="result-detail-row">
                <span className="result-detail-label">{label}</span>
                <span className="result-detail-value">{val}</span>
              </div>
            ))}
          </div>

          {/* 座位號碼 */}
          {order.passengers?.some(p => p.seatNo) && (
            <div className="seat-assignment-card">
              <div className="seat-assignment-title"><i className="fi fi-rr-chair fi-sm" style={{ marginRight: 6 }} />座位分配</div>
              <div className="seat-assignment-list">
                {order.passengers.map((p, i) => (
                  <div key={i} className="seat-assignment-row">
                    <span className="seat-passenger-name">{p.name}</span>
                    <span className="seat-badge">{p.seatNo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
            <i className="fi fi-rr-envelope fi-xs" style={{ marginRight: 3 }} />訂票確認通知已發送至您的 Email，<i className="fi fi-rr-bell fi-xs" style={{ margin: '0 3px' }} />出發前 30 分鐘將以簡訊提醒
          </p>

          <div className="result-actions">
            <Link to={`/ticket/ticket/${orderId}`} className="btn-primary">
              <i className="fi fi-rr-ticket fi-sm" style={{ marginRight: 4 }} />取票 / 查看電子票
            </Link>
            <Link to="/ticket/orders" className="btn-outline">
              <i className="fi fi-rr-ticket fi-sm" /> 查看我的訂單
            </Link>
            <Link to="/ticket" className="btn-ghost">
              <i className="fi fi-rr-home fi-sm" /> 返回首頁
            </Link>
          </div>
        </div>
      ) : (
        <div className="result-page">
          <div className="result-icon"><i className="fi fi-sr-cross-circle fi-lg" style={{ color: 'var(--danger)' }} /></div>
          <div className="result-title" style={{ color: 'var(--danger)' }}>付款失敗</div>
          <div className="result-sub">很抱歉，您的付款未能完成</div>
          <div className="fail-reason-box">
            <i className="fi fi-rr-exclamation" style={{ fontSize: 18 }} />
            <span>{result?.reason ?? '付款過程發生錯誤，請重新嘗試'}</span>
          </div>
          <div className="result-actions">
            <button className="btn-primary" onClick={handleRetry}><i className="fi fi-rr-arrows-h fi-sm" /> 重新付款</button>
            <button className="btn-danger" onClick={handleCancel}>取消訂單</button>
          </div>
        </div>
      )}
    </div>
  );
}
