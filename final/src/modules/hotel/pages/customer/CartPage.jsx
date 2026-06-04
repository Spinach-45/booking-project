import { Link, useNavigate } from 'react-router-dom';
import useStore from '../../../../store/useHotelStore';
import { t } from '../../i18n';
import { useToast } from '../../../../components/common/Toast';

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
    navigate('/hotel/booking', { state: { property, room, checkIn: item.checkIn, checkOut: item.checkOut, nights: item.nights, guests: item.guests } });
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title"><i className="fi fi-rr-shopping-cart" style={{ fontSize: 24 }} /> {T('nav.cart')}</h1>
        {myCart.length === 0 ? (
          <div className="empty-state">
            <i className="fi fi-rr-shopping-cart fi-lg empty-icon" />
            <p>{lang === 'zh' ? '購物車是空的' : 'Your cart is empty'}</p>
            <Link to="/hotel/properties" className="btn-primary">{lang === 'zh' ? '瀏覽房源' : 'Browse Properties'}</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {myCart.map(item => (
                <div key={item.cartId} className="cart-item">
                  <div className="cart-item-info">
                    <h3>{item.propertyName}</h3>
                    <p>{item.roomType}</p>
                    <p><i className="fi fi-rr-calendar fi-xs" style={{ marginRight: 3 }} />{item.checkIn} → {item.checkOut} · <i className="fi fi-rr-moon fi-xs" style={{ margin: '0 3px' }} />{item.nights} {T('common.nights')} · <i className="fi fi-rr-user fi-xs" style={{ margin: '0 3px' }} />{item.guests} {T('common.persons')}</p>
                  </div>
                  <div className="cart-item-price">
                    <div className="price-per-night">NT$ {item.pricePerNight.toLocaleString()} / {T('common.night')}</div>
                    <div className="price-total-item">NT$ {item.totalPrice.toLocaleString()}</div>
                  </div>
                  <div className="cart-item-actions">
                    <button className="btn-primary btn-sm" onClick={() => handleBook(item)}>{T('property.bookNow')}</button>
                    <button className="btn-icon-sm" onClick={() => { removeFromCart(item.cartId); addToast(lang === 'zh' ? '已移除' : 'Removed', 'success'); }}>
                      <i className="fi fi-rr-trash fi-sm" />
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
