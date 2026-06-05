import { useState } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../../../../store/useHotelStore';
import useAuthStore from '../../../../store/useAuthStore';
import { t } from '../../i18n';
import Modal from '../../../../components/common/Modal';
import { useToast } from '../../../../components/common/Toast';

const STATUS_COLOR = {
  confirmed:          'badge-confirmed',
  cancelled:          'badge-cancelled',
  completed:          'badge-completed',
  conflict_cancelled: 'badge-cancelled',
  cancelling_full:    'badge-paid',
  cancelling_partial: 'badge-pending',
  cancelled_no_refund:'badge-cancelled',
  refunded:           'badge-confirmed',
};

const STATUS_LABEL_ZH = {
  confirmed:          '待入住',
  cancelled:          '已取消',
  completed:          '已完成',
  conflict_cancelled: '衝突取消',
  cancelling_full:    '全額退款中',
  cancelling_partial: '部分退款中',
  cancelled_no_refund:'已取消（不退款）',
  refunded:           '退款完成',
};

function getRefundPolicy(checkInDate) {
  const today = new Date();
  const checkIn = new Date(checkInDate);
  const diffDays = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));
  if (diffDays >= 10) return { refundRate: 1.0, feeRate: 0,   label: '全額退款',              diffDays };
  if (diffDays >= 4)  return { refundRate: 0.7, feeRate: 0.3, label: '退款 70%（收取 30% 手續費）', diffDays };
  return               { refundRate: 0,   feeRate: 1.0, label: '不予退款',              diffDays };
}

export default function OrdersPage() {
  const { lang, orders, cancelOrder, getUserOrders } = useStore();
  const { currentUser } = useAuthStore();
  const addToast = useToast();
  const T = (key) => t(lang, key);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [refundInfo, setRefundInfo] = useState(null);

  // 訂閱 orders 狀態以取得響應式更新，但改用 getUserOrders 直接讀 localStorage 確保正確性
  const myOrders = getUserOrders(currentUser?.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleCancel = (order) => {
    const policy = getRefundPolicy(order.checkIn);
    const base = order.finalAmount ?? 0;
    const refundAmount = Math.round(base * policy.refundRate);
    const feeAmount = base - refundAmount;
    setCancelTarget({ order, policy, refundAmount, feeAmount });
  };

  const confirmCancel = () => {
    const { order, policy, refundAmount, feeAmount } = cancelTarget;
    cancelOrder(order.id);
    setCancelTarget(null);
    const msg = policy.refundRate === 1
      ? `訂單已成功取消，NT$ ${refundAmount.toLocaleString()} 將於 3～5 個工作天內退回您的付款帳戶。`
      : policy.refundRate > 0
        ? `訂單已取消，依退款政策退還 70%，NT$ ${refundAmount.toLocaleString()} 將退回，手續費 NT$ ${feeAmount.toLocaleString()} 不予退還。`
        : `訂單已取消，依退款政策距入住不足 3 天，恕無法退款。`;
    addToast(msg, refundAmount > 0 ? 'success' : 'info');
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
        <h1 className="page-title"><i className="fi fi-rr-clipboard-list" style={{ fontSize: 24 }} /> {T('orders.title')}</h1>

        {myOrders.length === 0 ? (
          <div className="empty-state">
            <i className="fi fi-rr-clipboard-list fi-lg empty-icon" />
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
                    <span className={`badge ${STATUS_COLOR[order.status] || 'badge-cancelled'}`}>
                      {STATUS_LABEL_ZH[order.status] || T(`orders.${order.status}`)}
                    </span>
                    {order.paymentStatus && (
                      <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-paid' : 'badge-unpaid'}`}>
                        {T(`booking.${order.paymentStatus}`)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="order-card-body">
                  <div className="order-property">
                    <h3>{order.propertyName}</h3>
                    <p>{order.roomType} · {order.guests} {T('common.persons')}</p>
                  </div>
                  <div className="order-dates">
                    <div><i className="fi fi-rr-calendar fi-xs" style={{ marginRight: 3 }} />{order.checkIn} → {order.checkOut}</div>
                    <div><i className="fi fi-rr-moon fi-xs" style={{ marginRight: 3 }} />{order.nights} {T('common.nights')}</div>
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
                      <strong>NT$ {(order.finalAmount ?? 0).toLocaleString()}</strong>
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
                      <i className="fi fi-rr-cross fi-sm" /> 取消訂單
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refund Policy */}
        <div className="refund-policy-card">
          <h3><i className="fi fi-rr-arrows-h" style={{ fontSize: 18 }} /> {T('orders.refundPolicy')}</h3>
          <ul>
            <li className="refund-ok"><i className="fi fi-sr-check fi-xs" style={{ marginRight: 4 }} />{T('orders.refundFull')}</li>
            <li className="refund-partial"><i className="fi fi-rr-arrows-h fi-xs" style={{ marginRight: 4 }} />{T('orders.refund70')}</li>
            <li className="refund-no"><i className="fi fi-sr-cross fi-xs" style={{ marginRight: 4 }} />{T('orders.noRefund')}</li>
          </ul>
        </div>
      </div>

      {/* Cancel Confirm Modal */}
      <Modal isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} title="取消訂單確認" size="md">
        {cancelTarget && (() => {
          const { order, policy, refundAmount, feeAmount } = cancelTarget;
          const base = order.finalAmount ?? 0;
          const isFullRefund = policy.refundRate === 1;
          const isPartial   = policy.refundRate > 0 && policy.refundRate < 1;
          const noRefund    = policy.refundRate === 0;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* 訂單基本資訊 */}
              <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '0.85rem 1rem', border: '1px solid var(--border)' }}>
                {[
                  ['房源名稱', order.propertyName],
                  ['房型',     order.roomType],
                  ['入住日期', order.checkIn],
                  ['退房日期', order.checkOut],
                  ['距入住還有', `${policy.diffDays} 天`],
                  ['訂單金額', `NT$ ${base.toLocaleString()}`],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '0.25rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* 退款政策 */}
              <div style={{
                borderRadius: 8, padding: '0.85rem 1rem', border: '2px solid',
                borderColor: isFullRefund ? '#86efac' : isPartial ? '#fcd34d' : '#fca5a5',
                background:  isFullRefund ? '#f0fdf4'  : isPartial ? '#fefce8' : '#fef2f2',
              }}>
                <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.9rem' }}>退款政策：{policy.label}</div>
                {[
                  ['退款金額', `NT$ ${refundAmount.toLocaleString()}`, isFullRefund || isPartial ? '#16a34a' : '#6b7280'],
                  ['收取費用', `NT$ ${feeAmount.toLocaleString()}`,   feeAmount > 0 ? '#dc2626' : '#6b7280'],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '0.2rem 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontWeight: 700, color }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* 退款說明 */}
              {refundAmount > 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  <i className="fi fi-rr-clock fi-xs" style={{ marginRight: 4 }} />
                  退款將於 3～5 個工作天內退回原付款方式
                </p>
              )}
              {noRefund && (
                <p style={{ fontSize: '0.8rem', color: '#dc2626', margin: 0 }}>
                  <i className="fi fi-rr-exclamation fi-xs" style={{ marginRight: 4 }} />
                  距入住不足 3 天，依政策恕無法退款
                </p>
              )}

              <div className="modal-footer">
                <button className="btn-danger" onClick={confirmCancel}>確認取消</button>
                <button className="btn-ghost" onClick={() => setCancelTarget(null)}>返回</button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
