import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useStore from '../../../../store/useHotelStore';
import useAuthStore from '../../../../store/useAuthStore';
import { t } from '../../i18n';
import { useToast } from '../../../../components/common/Toast';

const LOCK_SECS = 600; // 10 分鐘

export default function BookingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { lang, createOrder, validateCoupon, useCoupon, lockRoom, releaseLock, checkRoomAvailability } = useStore();
  const { currentUser } = useAuthStore();
  const addToast = useToast();
  const T = (key) => t(lang, key);

  const { property, room, checkIn, checkOut, nights, guests } = state || {};

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    phone: '',
    email: currentUser?.email || '',
    specialRequests: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvc: '' });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ── 房間鎖定與倒數 ─────────────────────────────────────
  const lockIdRef = useRef(null);
  const timerRef = useRef(null);
  const [lockSecs, setLockSecs] = useState(LOCK_SECS);
  const [lockExpired, setLockExpired] = useState(false);

  useEffect(() => {
    if (!property || !room || !currentUser) return;
    const { lockId } = lockRoom(property.id, room.id, checkIn, checkOut, currentUser.id);
    lockIdRef.current = lockId;
    timerRef.current = setInterval(() => {
      setLockSecs(s => {
        if (s <= 1) {
          setLockExpired(true);
          clearInterval(timerRef.current);
          releaseLock(lockIdRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timerRef.current);
      if (lockIdRef.current) releaseLock(lockIdRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const timerMin = Math.floor(lockSecs / 60);
  const timerSec = String(lockSecs % 60).padStart(2, '0');

  if (!property || !room) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <p>{lang === 'zh' ? '無效的訂房資訊，請重新選擇' : 'Invalid booking info, please start over'}</p>
        <button className="btn-primary" onClick={() => navigate('/hotel')}>
          {lang === 'zh' ? '回首頁' : 'Go Home'}
        </button>
      </div>
    );
  }

  const basePrice = room.price * nights;
  const finalPrice = Math.max(0, basePrice - couponDiscount);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const result = validateCoupon(couponCode, currentUser.id, basePrice);
    if (result.valid) {
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discount);
      addToast(`${T('booking.couponApplied')} - NT$ ${result.discount}`, 'success');
    } else {
      addToast(T(`booking.${result.error}`) || result.error, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockExpired) {
      addToast('預訂保留時間已過期，請重新選擇房間', 'error');
      navigate(-1);
      return;
    }
    if (!form.name || !form.phone || !form.email) {
      addToast(lang === 'zh' ? '請填寫完整聯絡資訊' : 'Please fill in all contact info', 'error');
      return;
    }
    setSubmitting(true);
    try {
      // ── 二次驗證：送出前再確認房間是否仍有空房 ──────────
      const stillAvailable = checkRoomAvailability(property.id, room.id, checkIn, checkOut);
      if (!stillAvailable) {
        releaseLock(lockIdRef.current);
        navigate('/hotel/booking/conflict', { state: { property, room, checkIn, checkOut, nights, isPreConflict: true } });
        return;
      }

      if (appliedCoupon) useCoupon(appliedCoupon.id, currentUser.id);
      const order = createOrder({
        userId: currentUser.id,
        propertyId: property.id,
        propertyName: lang === 'zh' ? property.name : (property.nameEn || property.name),
        hostId: property.hostId,
        hostName: property.hostName,
        roomId: room.id,
        roomType: lang === 'zh' ? room.typeName : (room.typeNameEn || room.typeName),
        checkIn, checkOut, nights, guests,
        contactName: form.name,
        contactPhone: form.phone,
        contactEmail: form.email,
        specialRequests: form.specialRequests,
        paymentMethod,
        baseAmount: basePrice,
        couponDiscount,
        couponCode: appliedCoupon?.code || null,
        finalAmount: finalPrice,
      });

      // ── 建立後偵測到衝突（極少數競態條件）─────────────
      if (order.isConflict) {
        navigate('/hotel/booking/conflict', { state: { property, room, checkIn, checkOut, nights, conflictOrder: order } });
        return;
      }

      addToast(T('booking.bookingSuccess'), 'success');
      navigate('/hotel/booking/success', { state: { order } });
    } finally {
      setSubmitting(false);
    }
  };

  const propName = lang === 'zh' ? property.name : (property.nameEn || property.name);
  const roomName = lang === 'zh' ? room.typeName : (room.typeNameEn || room.typeName);

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-layout">
          {/* Form */}
          <form className="booking-form" onSubmit={handleSubmit}>
            <h1 className="page-title">{T('booking.title')}</h1>

            {/* 鎖定倒數計時器 */}
            {lockExpired ? (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fi fi-rr-exclamation fi-sm" />預訂保留時間已過期，請重新選擇房間。
              </div>
            ) : (
              <div style={{ background: lockSecs <= 60 ? '#fef3c7' : '#eff6ff', border: `1px solid ${lockSecs <= 60 ? '#fcd34d' : '#bfdbfe'}`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: lockSecs <= 60 ? '#92400e' : '#1d4ed8', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fi fi-rr-clock fi-sm" />
                您的預訂保留剩餘 <strong>{timerMin}:{timerSec}</strong>，請在時限內完成付款
              </div>
            )}

            {/* Contact Info */}
            <section className="booking-section">
              <h2 className="booking-section-title">{T('booking.contactInfo')}</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>{T('booking.contactName')} *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>{T('booking.contactPhone')} *</label>
                  <input className="form-input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
                </div>
                <div className="form-group form-full">
                  <label>{T('booking.contactEmail')} *</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="form-group form-full">
                  <label>{T('booking.specialRequests')}</label>
                  <textarea className="form-textarea" rows={3} value={form.specialRequests} onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))} />
                </div>
              </div>
            </section>

            {/* Coupon */}
            <section className="booking-section">
              <h2 className="booking-section-title"><i className="fi fi-rr-tag" style={{ fontSize: 18 }} /> {lang === 'zh' ? '優惠券' : 'Coupon'}</h2>
              <div className="coupon-row">
                <input
                  className="form-input"
                  placeholder={T('booking.couponCode')}
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                />
                <button type="button" className="btn-primary" onClick={handleApplyCoupon} disabled={!!appliedCoupon}>
                  {appliedCoupon ? <><i className="fi fi-sr-check fi-xs" style={{ marginRight: 4 }} />{T('booking.couponApplied')}</> : T('booking.applyCoupon')}
                </button>
              </div>
              {appliedCoupon && <div className="coupon-success"><i className="fi fi-sr-check-circle fi-xs" style={{ marginRight: 4, color: 'var(--success)' }} />{appliedCoupon.code}: -NT$ {couponDiscount.toLocaleString()}</div>}
            </section>

            {/* Payment */}
            <section className="booking-section">
              <h2 className="booking-section-title">{T('booking.paymentMethod')}</h2>
              <div className="payment-options">
                {[
                  { id: 'creditCard', icon: <i className="fi fi-rr-credit-card" style={{ fontSize: 20 }} />, label: T('booking.creditCard') },
                  { id: 'ePayment', icon: <i className="fi fi-rr-phone" style={{ fontSize: 20 }} />, label: T('booking.ePayment') },
                  { id: 'bankTransfer', icon: <i className="fi fi-rr-building" style={{ fontSize: 20 }} />, label: T('booking.bankTransfer') },
                ].map(p => (
                  <label key={p.id} className={`payment-option ${paymentMethod === p.id ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value={p.id} checked={paymentMethod === p.id} onChange={() => setPaymentMethod(p.id)} />
                    {p.icon} {p.label}
                  </label>
                ))}
              </div>
              {paymentMethod === 'creditCard' && (
                <div className="card-info form-grid">
                  <div className="form-group form-full">
                    <label>{T('booking.cardNumber')}</label>
                    <input className="form-input" placeholder="1234 5678 9012 3456" maxLength={19}
                      value={cardInfo.number}
                      onChange={e => setCardInfo(c => ({ ...c, number: e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim() }))} />
                  </div>
                  <div className="form-group">
                    <label>{T('booking.cardExpiry')}</label>
                    <input className="form-input" placeholder="MM/YY" maxLength={5}
                      value={cardInfo.expiry}
                      onChange={e => setCardInfo(c => ({ ...c, expiry: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>{T('booking.cardCvc')}</label>
                    <input className="form-input" placeholder="123" maxLength={4}
                      value={cardInfo.cvc}
                      onChange={e => setCardInfo(c => ({ ...c, cvc: e.target.value.replace(/\D/g, '') }))} />
                  </div>
                </div>
              )}
            </section>

            <button type="submit" className="btn-primary btn-large full-width" disabled={submitting}>
              {submitting ? T('common.loading') : T('booking.confirmBooking')} <i className="fi fi-rr-angle-right" style={{ fontSize: 18 }} />
            </button>
          </form>

          {/* Summary */}
          <aside className="booking-summary">
            <div className="summary-card">
              <img src={property.images[0]} alt={propName} className="summary-img" />
              <div className="summary-body">
                <h3 className="summary-name">{propName}</h3>
                <p className="summary-room">{roomName}</p>
                <div className="summary-dates">
                  <span><i className="fi fi-rr-calendar fi-xs" style={{ marginRight: 3 }} />{checkIn}</span>
                  <span>→</span>
                  <span>{checkOut}</span>
                </div>
                <div className="summary-meta">
                  <span><i className="fi fi-rr-moon fi-xs" style={{ marginRight: 3 }} />{nights} {T('common.nights')}</span>
                  <span><i className="fi fi-rr-user fi-xs" style={{ marginRight: 3 }} />{guests} {T('common.persons')}</span>
                </div>
              </div>
              <div className="price-breakdown">
                <h4>{T('booking.priceDetails')}</h4>
                <div className="price-row">
                  <span>{T('booking.originalPrice')}</span>
                  <span>NT$ {basePrice.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="price-row price-discount">
                    <span>{T('booking.couponDiscount')}</span>
                    <span>- NT$ {couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="price-row price-total">
                  <span>{T('booking.finalPrice')}</span>
                  <span>NT$ {finalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
