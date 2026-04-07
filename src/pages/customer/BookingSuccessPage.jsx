import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ClipboardList, Home } from 'lucide-react';
import useStore from '../../store/useStore';
import { t } from '../../i18n';

export default function BookingSuccessPage() {
  const { state } = useLocation();
  const { lang } = useStore();
  const T = (key) => t(lang, key);
  const order = state?.order;

  if (!order) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
    <p>{lang === 'zh' ? '找不到訂單資訊' : 'Order not found'}</p>
    <Link to="/" className="btn-primary">{T('nav.home')}</Link>
  </div>;

  return (
    <div className="success-page">
      <div className="success-card">
        <CheckCircle size={64} className="success-icon" />
        <h1>{T('booking.bookingSuccess')}</h1>
        <div className="order-info">
          <div className="order-row">
            <span>{T('booking.orderNumber')}</span>
            <strong>{order.id}</strong>
          </div>
          <div className="order-row">
            <span>{lang === 'zh' ? '房源' : 'Property'}</span>
            <strong>{order.propertyName}</strong>
          </div>
          <div className="order-row">
            <span>{T('orders.roomType')}</span>
            <strong>{order.roomType}</strong>
          </div>
          <div className="order-row">
            <span>{T('booking.checkIn')}</span>
            <strong>{order.checkIn}</strong>
          </div>
          <div className="order-row">
            <span>{T('booking.checkOut')}</span>
            <strong>{order.checkOut}</strong>
          </div>
          <div className="order-row">
            <span>{T('booking.paymentMethod')}</span>
            <strong>{T(`booking.${order.paymentMethod}`)}</strong>
          </div>
          <div className="order-row order-total">
            <span>{T('booking.finalPrice')}</span>
            <strong>NT$ {order.finalAmount.toLocaleString()}</strong>
          </div>
          <div className="order-row">
            <span>{T('booking.paymentStatus')}</span>
            <span className="badge-paid">{T('booking.paid')}</span>
          </div>
        </div>
        <div className="success-actions">
          <Link to="/orders" className="btn-primary"><ClipboardList size={18} /> {T('nav.orders')}</Link>
          <Link to="/" className="btn-outline"><Home size={18} /> {T('nav.home')}</Link>
        </div>
      </div>
    </div>
  );
}
