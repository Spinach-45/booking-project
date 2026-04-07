import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2 } from 'lucide-react';
import useStore from '../../store/useStore';
import { t } from '../../i18n';
import { useToast } from '../../components/common/Toast';

export default function CartPage() {
  const { lang, cart, properties, removeFromCart, currentUser } = useStore();
  const addToast = useToast();
  const navigate = useNavigate();
  const T = (key) => t(lang, key);

  const myCart = cart.filter(c => c.userId === currentUser?.id);
  const total = myCart.reduce((s, c) => s + c.totalPrice, 0);

  if (!currentUser) return (
    <div className="container empty-page">
      <p>{lang === 'zh' ? '請先登入' : 'Please login first'}</p>
      <Link to="/login" className="btn-primary">{T('nav.login')}</Link>
    </div>
  );

  const handleBook = (item) => {
    const property = properties.find(p => p.id === item.propertyId);
    const room = property?.rooms.find(r => r.id === item.roomId);
    if (!property || !room) { addToast(lang === 'zh' ? '房源不可用' : 'Property unavailable', 'error'); return; }
    navigate('/booking', { state: { property, room, checkIn: item.checkIn, checkOut: item.checkOut, nights: item.nights, guests: item.guests } });
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title"><ShoppingCart size={24} /> {T('nav.cart')}</h1>
        {myCart.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={48} className="empty-icon" />
            <p>{lang === 'zh' ? '購物車是空的' : 'Your cart is empty'}</p>
            <Link to="/properties" className="btn-primary">{lang === 'zh' ? '瀏覽房源' : 'Browse Properties'}</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {myCart.map(item => (
                <div key={item.cartId} className="cart-item">
                  <div className="cart-item-info">
                    <h3>{item.propertyName}</h3>
                    <p>{item.roomType}</p>
                    <p>📅 {item.checkIn} → {item.checkOut} · 🌙 {item.nights} {T('common.nights')} · 👤 {item.guests} {T('common.persons')}</p>
                  </div>
                  <div className="cart-item-price">
                    <div className="price-per-night">NT$ {item.pricePerNight.toLocaleString()} / {T('common.night')}</div>
                    <div className="price-total-item">NT$ {item.totalPrice.toLocaleString()}</div>
                  </div>
                  <div className="cart-item-actions">
                    <button className="btn-primary btn-sm" onClick={() => handleBook(item)}>{T('property.bookNow')}</button>
                    <button className="btn-icon-sm" onClick={() => { removeFromCart(item.cartId); addToast(lang === 'zh' ? '已移除' : 'Removed', 'success'); }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary-box">
              <h3>{T('common.total')}</h3>
              <div className="cart-total">NT$ {total.toLocaleString()}</div>
              <p className="cart-note">{lang === 'zh' ? '請分別訂房，優惠券可在訂房時輸入' : 'Book each item separately, apply coupons during checkout'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
