import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, X, RefreshCw } from 'lucide-react';
import useStore from '../../../../store/useHotelStore';
import { t } from '../../i18n';
import Modal from '../../../../components/common/Modal';
import { useToast } from '../../../../components/common/Toast';

const STATUS_COLOR = { confirmed: 'badge-confirmed', cancelled: 'badge-cancelled', completed: 'badge-completed' };

export default function OrdersPage() {
  const { lang, currentUser, orders, cancelOrder } = useStore();
  const addToast = useToast();
  const T = (key) => t(lang, key);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [refundInfo, setRefundInfo] = useState(null);

  const myOrders = orders.filter(o => o.userId === currentUser?.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleCancel = (order) => {
    const today = new Date();
    const checkIn = new Date(order.checkIn);
    const diffDays = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));
    let refundPercent = 0;
    let policyKey = 'noRefund';
    if (diffDays >= 10) { refundPercent = 100; policyKey = 'refundFull'; }
    else if (diffDays >= 4) { refundPercent = 70; policyKey = 'refund70'; }
    setCancelTarget({ order, refundPercent, policyKey, refundAmount: Math.round(order.finalAmount * refundPercent / 100) });
  };

  const confirmCancel = () => {
    const result = cancelOrder(cancelTarget.order.id);
    setRefundInfo(result);
    setCancelTarget(null);
    addToast(lang === 'zh' ? '訂單已取消' : 'Order cancelled', 'success');
  };

  if (!currentUser) return (
    <div className="container empty-page">
      <p>{lang === 'zh' ? '請先登入' : 'Please login first'}</p>
      <Link to="/login" className="btn-primary">{T('nav.login')}</Link>
    </div>
  );

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="page-title"><ClipboardList size={24} /> {T('orders.title')}</h1>

        {myOrders.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} className="empty-icon" />
            <p>{T('orders.noOrders')}</p>
            <Link to="/hotel/properties" className="btn-primary">{lang === 'zh' ? '瀏覽房源' : 'Browse Properties'}</Link>
          </div>
        ) : (
          <div className="orders-list">
            {myOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <span className="order-number">#{order.id}</span>
                  <div className="order-badges">
                    <span className={`badge ${STATUS_COLOR[order.status]}`}>{T(`orders.${order.status}`)}</span>
                    <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-paid' : 'badge-unpaid'}`}>
                      {T(`booking.${order.paymentStatus}`)}
                    </span>
                  </div>
                </div>
                <div className="order-card-body">
                  <div className="order-property">
                    <h3>{order.propertyName}</h3>
                    <p>{order.roomType} · {order.guests} {T('common.persons')}</p>
                  </div>
                  <div className="order-dates">
                    <div>📅 {order.checkIn} → {order.checkOut}</div>
                    <div>🌙 {order.nights} {T('common.nights')}</div>
                  </div>
                  <div className="order-host">
                    <span className="label">{T('orders.hostInfo')}:</span>
                    <span>{order.hostName}</span>
                  </div>
                  <div className="order-price">
                    {order.couponDiscount > 0 && (
                      <div className="price-row">
                        <span>{T('booking.originalPrice')}</span>
                        <span>NT$ {order.baseAmount?.toLocaleString()}</span>
                      </div>
                    )}
                    {order.couponDiscount > 0 && (
                      <div className="price-row price-discount">
                        <span>{T('booking.couponDiscount')} ({order.couponCode})</span>
                        <span>-NT$ {order.couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="price-row price-total">
                      <span>{T('orders.totalAmount')}</span>
                      <strong>NT$ {order.finalAmount.toLocaleString()}</strong>
                    </div>
                    {order.refundAmount > 0 && (
                      <div className="price-row price-refund">
                        <span>{T('orders.refundAmount')}</span>
                        <span>NT$ {order.refundAmount.toLocaleString()} ({order.refundPercent}%)</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="order-card-footer">
                  <span className="order-date">{lang === 'zh' ? '訂單時間' : 'Created'}: {new Date(order.createdAt).toLocaleString(lang === 'zh' ? 'zh-TW' : 'en-US')}</span>
                  {order.status === 'confirmed' && (
                    <button className="btn-danger-outline" onClick={() => handleCancel(order)}>
                      <X size={16} /> {T('orders.cancelOrder')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refund Policy */}
        <div className="refund-policy-card">
          <h3><RefreshCw size={18} /> {T('orders.refundPolicy')}</h3>
          <ul>
            <li className="refund-ok">✓ {T('orders.refundFull')}</li>
            <li className="refund-partial">◐ {T('orders.refund70')}</li>
            <li className="refund-no">✗ {T('orders.noRefund')}</li>
          </ul>
        </div>
      </div>

      {/* Cancel Confirm Modal */}
      <Modal isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} title={T('orders.cancelOrder')}>
        {cancelTarget && (
          <div className="cancel-modal">
            <p>{T('orders.cancelConfirm')}</p>
            <div className="refund-preview">
              <div className="refund-policy-tag">{T(`orders.${cancelTarget.policyKey}`)}</div>
              <div className="refund-amount-preview">
                {T('orders.refundAmount')}: NT$ {cancelTarget.refundAmount.toLocaleString()} ({cancelTarget.refundPercent}%)
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-danger" onClick={confirmCancel}>{T('common.confirm')}</button>
              <button className="btn-ghost" onClick={() => setCancelTarget(null)}>{T('common.cancel')}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
