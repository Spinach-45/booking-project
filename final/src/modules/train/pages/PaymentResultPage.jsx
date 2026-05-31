import { useParams, useNavigate, Link } from 'react-router-dom';
import { Home, TicketCheck, AlertCircle, RefreshCw } from 'lucide-react';
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
        <div style={{ fontSize: '3rem' }}>❓</div>
        <p>找不到訂單資訊</p>
        <Link to="/ticket" className="btn-primary">返回首頁</Link>
      </div>
    </div>
  );

  const success = order.status === 'paid';
  const typeInfo = TRAIN_TYPES[order.train.type] ?? {};

  const pmLabels = { credit: '信用卡', linepay: 'LINE Pay', cvs: '超商付款', bank: '銀行轉帳' };

  const handleRetry = () => navigate(`/ticket/payment/${orderId}`);
  const handleCancel = () => { cancelOrder(orderId); navigate('/ticket'); };

  return (
    <div className="container">
      {success ? (
        <div className="result-page">
          <div className="result-icon">🎉</div>
          <div className="result-title" style={{ color: 'var(--success)' }}>付款成功！</div>
          <div className="result-sub">訂票完成，請妥善保管您的訂票編號</div>

          <div className="booking-no-card">
            <div className="booking-no-label">訂票編號</div>
            <div className="booking-no">{order.bookingNo}</div>
          </div>

          <div className="result-detail-card">
            <div className="result-detail-row">
              <span className="result-detail-label">車次</span>
              <span className="result-detail-value">
                <span className="train-type-badge" style={{ background: typeInfo.bg, color: typeInfo.color }}>
                  {typeInfo.icon} {typeInfo.name}
                </span>
                {' '}{order.train.trainNo}
              </span>
            </div>
            <div className="result-detail-row">
              <span className="result-detail-label">路線</span>
              <span className="result-detail-value">{order.train.fromName} → {order.train.toName}</span>
            </div>
            <div className="result-detail-row">
              <span className="result-detail-label">日期時間</span>
              <span className="result-detail-value">{order.train.date} {order.train.depTime}</span>
            </div>
            <div className="result-detail-row">
              <span className="result-detail-label">座位偏好</span>
              <span className="result-detail-value">
                {order.seatPref === 'window' ? '靠窗' : order.seatPref === 'aisle' ? '靠走道' : '不指定'}
              </span>
            </div>
            <div className="result-detail-row">
              <span className="result-detail-label">票種</span>
              <span className="result-detail-value">
                {order.tickets.map(t => `${t.typeName}×${t.count}`).join('、')}
              </span>
            </div>
            <div className="result-detail-row">
              <span className="result-detail-label">付款方式</span>
              <span className="result-detail-value">{pmLabels[order.paymentMethod] ?? order.paymentMethod}</span>
            </div>
            <div className="result-detail-row">
              <span className="result-detail-label">總金額</span>
              <span className="result-detail-value" style={{ color: 'var(--primary)', fontWeight: 800 }}>
                NT${order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            📧 訂票確認通知已發送至您的 Email，🔔 出發前 30 分鐘將以簡訊提醒
          </p>

          <div className="result-actions">
            <Link to="/ticket/orders" className="btn-primary">
              <TicketCheck size={15} /> 查看我的訂單
            </Link>
            <Link to="/ticket" className="btn-ghost">
              <Home size={15} /> 返回首頁
            </Link>
          </div>
        </div>
      ) : (
        <div className="result-page">
          <div className="result-icon">❌</div>
          <div className="result-title" style={{ color: 'var(--danger)' }}>付款失敗</div>
          <div className="result-sub">很抱歉，您的付款未能完成</div>

          <div className="fail-reason-box">
            <AlertCircle size={18} />
            <span>{result?.reason ?? '付款過程發生錯誤，請重新嘗試'}</span>
          </div>

          <div className="result-actions">
            <button className="btn-primary" onClick={handleRetry}>
              <RefreshCw size={15} /> 重新付款
            </button>
            <button className="btn-danger" onClick={handleCancel}>
              取消訂單
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
