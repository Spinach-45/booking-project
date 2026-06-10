import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import useStore from '../../../../store/useHotelStore';
import { t } from '../../i18n';
import AddToTripModal from '../../../../components/common/AddToTripModal';

export default function BookingSuccessPage() {
  const { state } = useLocation();
  const { lang } = useStore();
  const T = (key) => t(lang, key);
  const order = state?.order;
  const [showTripModal, setShowTripModal] = useState(false);

  if (!order) return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <div className="empty-state">
        <i className="fi fi-rr-question fi-lg" style={{ color: 'var(--secondary)' }} />
        <p>{lang === 'zh' ? '找不到訂單資訊' : 'Order not found'}</p>
        <Link to="/hotel" className="btn-primary">{T('nav.home')}</Link>
      </div>
    </div>
  );

  const pmLabels = {
    creditCard:   lang === 'zh' ? '信用卡' : 'Credit Card',
    ePayment:     'LINE Pay / 電子支付',
    bankTransfer: lang === 'zh' ? '銀行轉帳' : 'Bank Transfer',
  };

  const rows = [
    ['訂單編號', order.id],
    ['房源名稱', order.propertyName],
    ['房型',     order.roomType],
    ['入住日期', order.checkIn],
    ['退房日期', order.checkOut],
    ['住宿晚數', `${order.nights ?? 1} 晚`],
    ['入住人數', `${order.guests ?? 1} 位`],
    ['付款方式', pmLabels[order.paymentMethod] ?? order.paymentMethod ?? '—'],
  ];

  const baseAmount  = order.baseAmount  ?? order.finalAmount ?? 0;
  const finalAmount = order.finalAmount ?? 0;
  const discount    = order.couponDiscount ?? 0;
  const multiDisc   = order.discountApplied;

  return (
    <div className="container">
      <div className="result-page">
        {/* 成功圖示 */}
        <div className="result-icon">
          <i className="fi fi-sr-check-circle fi-lg" style={{ color: 'var(--success)' }} />
        </div>
        <div className="result-title" style={{ color: 'var(--success)' }}>
          {lang === 'zh' ? '訂房成功！' : 'Booking Confirmed!'}
        </div>
        <div className="result-sub">
          {lang === 'zh' ? '訂房完成，確認信已寄至您的 Email' : 'Booking complete. A confirmation email has been sent.'}
        </div>

        {/* 訂單編號大卡 */}
        <div className="booking-no-card">
          <div className="booking-no-label">{lang === 'zh' ? '訂單編號' : 'Order ID'}</div>
          <div className="booking-no" style={{ fontSize: '1rem', letterSpacing: 1 }}>{order.id}</div>
        </div>

        {/* 多晚折扣 banner */}
        {multiDisc && (
          <div className="points-earned-banner">
            <i className="fi fi-rr-gift fi-sm" style={{ color: '#f59e0b' }} />
            {multiDisc.reason}，省下 NT$ {multiDisc.savedAmount?.toLocaleString()}！
          </div>
        )}

        {/* 訂單明細 */}
        <div className="result-detail-card">
          {rows.map(([label, val]) => (
            <div key={label} className="result-detail-row">
              <span className="result-detail-label">{label}</span>
              <span className="result-detail-value">{val}</span>
            </div>
          ))}

          {/* 金額明細 */}
          {discount > 0 && (
            <div className="result-detail-row">
              <span className="result-detail-label">原始金額</span>
              <span className="result-detail-value">NT$ {baseAmount.toLocaleString()}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="result-detail-row">
              <span className="result-detail-label">優惠券折抵</span>
              <span className="result-detail-value" style={{ color: 'var(--success)' }}>
                - NT$ {discount.toLocaleString()}
              </span>
            </div>
          )}
          <div className="result-detail-row" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
            <span className="result-detail-label" style={{ fontWeight: 700 }}>
              {lang === 'zh' ? '實付金額' : 'Total Paid'}
            </span>
            <span className="result-detail-value" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.1rem' }}>
              NT$ {finalAmount.toLocaleString()}
            </span>
          </div>

          {/* 付款狀態 */}
          <div className="result-detail-row">
            <span className="result-detail-label">{lang === 'zh' ? '付款狀態' : 'Payment'}</span>
            <span className="result-detail-value">
              <span style={{ padding: '2px 10px', borderRadius: 20, background: '#dcfce7', color: '#16a34a', fontWeight: 700, fontSize: '0.82rem' }}>
                <i className="fi fi-sr-check fi-xs" style={{ marginRight: 3 }} />
                {lang === 'zh' ? '已付款' : 'Paid'}
              </span>
            </span>
          </div>
        </div>

        {/* 通知提示 */}
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center', lineHeight: 1.7 }}>
          <i className="fi fi-rr-envelope fi-xs" style={{ marginRight: 3 }} />訂房確認通知已發送至您的 Email
          <br />
          <i className="fi fi-rr-bell fi-xs" style={{ marginRight: 3 }} />入住前一天將以簡訊提醒
        </p>

        {/* 加入行程 */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e40af' }}>
              <i className="fi fi-rr-map fi-sm" style={{ marginRight: 6 }} />加入行程規劃
            </div>
            <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: 2 }}>
              將這次住宿加入您的旅遊行程中統一管理
            </div>
          </div>
          <button className="btn-primary btn-sm" onClick={() => setShowTripModal(true)}>
            加入行程
          </button>
        </div>

        {/* 操作按鈕 */}
        <div className="result-actions">
          <Link to="/hotel/orders" className="btn-primary">
            <i className="fi fi-rr-clipboard-list fi-sm" style={{ marginRight: 4 }} />
            {lang === 'zh' ? '查看我的訂單' : 'My Orders'}
          </Link>
          <Link to="/hotel/properties" className="btn-outline">
            <i className="fi fi-rr-search fi-sm" style={{ marginRight: 4 }} />
            {lang === 'zh' ? '繼續瀏覽房源' : 'Browse More'}
          </Link>
          <Link to="/hotel" className="btn-ghost">
            <i className="fi fi-rr-home fi-sm" style={{ marginRight: 4 }} />
            {lang === 'zh' ? '返回首頁' : 'Home'}
          </Link>
        </div>

        <AddToTripModal
          isOpen={showTripModal}
          onClose={() => setShowTripModal(false)}
          suggestDate={order.checkIn}
          itemData={{
            type: 'other',
            title: order.propertyName,
            location: '',
            time: '15:00',
            duration: 60,
            notes: `${order.roomType}，入住 ${order.nights ?? 1} 晚`,
          }}
        />
      </div>
    </div>
  );
}
