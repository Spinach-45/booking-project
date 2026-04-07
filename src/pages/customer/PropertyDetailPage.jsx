import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, MapPin, Train, Star, Check, X, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import useStore from '../../store/useStore';
import { t } from '../../i18n';
import StarRating from '../../components/common/StarRating';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { lang, properties, favorites, toggleFavorite, addToCart, currentUser, searchParams, reviews, addReview } = useStore();
  const navigate = useNavigate();
  const addToast = useToast();
  const T = (key) => t(lang, key);

  const property = properties.find(p => p.id === id);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', anonymous: false, cleanliness: 5, comfort: 5, location: 5, facilities: 5, service: 5, valueForMoney: 5 });

  if (!property) return <div className="container" style={{ padding: '4rem 1rem' }}><p>找不到房源 / Property not found</p></div>;

  const isFav = favorites.includes(id);
  const propName = lang === 'zh' ? property.name : (property.nameEn || property.name);
  const propReviews = reviews.filter(r => r.propertyId === id);
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const checkIn = searchParams.checkIn || today;
  const checkOut = searchParams.checkOut || tomorrow;
  const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
  const distText = property.distanceToStation >= 1000
    ? `${(property.distanceToStation / 1000).toFixed(1)}km`
    : `${property.distanceToStation}m`;

  const handleBookNow = (room) => {
    if (!currentUser) { addToast('請先登入', 'error'); navigate('/login'); return; }
    navigate('/booking', { state: { property, room, checkIn, checkOut, nights, guests: searchParams.guests || 1 } });
  };

  const handleAddToCart = (room) => {
    if (!currentUser) { addToast('請先登入', 'error'); return; }
    const ok = addToCart({
      userId: currentUser.id,
      propertyId: property.id,
      propertyName: propName,
      roomId: room.id,
      roomType: lang === 'zh' ? room.typeName : (room.typeNameEn || room.typeName),
      checkIn, checkOut, nights,
      guests: searchParams.guests || 1,
      pricePerNight: room.price,
      totalPrice: room.price * nights,
    });
    addToast(ok ? T('property.addedToCart') : '此項目已在購物車中', ok ? 'success' : 'warning');
  };

  const handleSubmitReview = () => {
    if (!currentUser) { addToast(T('review.loginRequired'), 'error'); return; }
    addReview({
      propertyId: id,
      userId: currentUser.id,
      userName: reviewForm.anonymous ? '匿名用戶' : currentUser.name,
      ...reviewForm,
    });
    addToast(T('review.submitted'), 'success');
    setShowReviewModal(false);
    setReviewForm({ rating: 5, comment: '', anonymous: false, cleanliness: 5, comfort: 5, location: 5, facilities: 5, service: 5, valueForMoney: 5 });
  };

  const handleChat = () => {
    if (!currentUser) { addToast('請先登入', 'error'); navigate('/login'); return; }
    navigate('/chat', { state: { hostId: property.hostId, propertyId: id } });
  };

  return (
    <div className="property-detail">
      <div className="container">
        {/* Gallery */}
        <div className="gallery">
          <div className="gallery-main">
            <img src={property.images[activeImg]} alt={propName} className="gallery-main-img" />
            <button className="gallery-nav gallery-prev" onClick={() => setActiveImg(i => (i - 1 + property.images.length) % property.images.length)}>
              <ChevronLeft size={24} />
            </button>
            <button className="gallery-nav gallery-next" onClick={() => setActiveImg(i => (i + 1) % property.images.length)}>
              <ChevronRight size={24} />
            </button>
          </div>
          <div className="gallery-thumbs">
            {property.images.map((img, i) => (
              <img key={i} src={img} alt="" className={`gallery-thumb ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)} />
            ))}
          </div>
        </div>

        <div className="detail-layout">
          {/* Left: info */}
          <div className="detail-main">
            <div className="detail-header">
              <h1 className="detail-name">{propName}</h1>
              <div className="detail-meta">
                <span className="detail-rating"><Star size={16} fill="#f59e0b" stroke="#f59e0b" /> {property.rating} ({property.reviewCount})</span>
                <span className="detail-location"><MapPin size={14} /> {lang === 'zh' ? property.address : property.addressEn}</span>
                <span className="detail-distance"><Train size={14} /> {lang === 'zh' ? property.station : property.stationEn} · {distText}</span>
              </div>
              <div className="detail-actions">
                <button className={`btn-icon ${isFav ? 'btn-fav-active' : ''}`} onClick={() => { toggleFavorite(id); addToast(isFav ? T('property.removeFromFavorites') : T('property.addedToFavorites')); }}>
                  <Heart size={20} fill={isFav ? '#ef4444' : 'none'} stroke={isFav ? '#ef4444' : 'currentColor'} />
                  {isFav ? T('property.removeFromFavorites') : T('property.addToFavorites')}
                </button>
                <button className="btn-icon" onClick={handleChat}>
                  <MessageSquare size={20} /> {lang === 'zh' ? '聯繫房東' : 'Contact Host'}
                </button>
              </div>
            </div>

            {/* Description */}
            <section className="detail-section">
              <p className="detail-desc">{lang === 'zh' ? property.description : (property.descriptionEn || property.description)}</p>
            </section>

            {/* Facilities */}
            <section className="detail-section">
              <h2 className="section-subtitle">{T('property.facilities')}</h2>
              <div className="amenities-grid">
                {property.amenities.map(a => (
                  <div key={a} className="amenity-item"><Check size={16} className="check-icon" /> {T(`amenities.${a}`)}</div>
                ))}
              </div>
            </section>

            {/* Policies */}
            <section className="detail-section">
              <h2 className="section-subtitle">{T('property.policies')}</h2>
              <div className="policies-grid">
                <div className={`policy-item ${property.petAllowed ? 'policy-ok' : 'policy-no'}`}>
                  {property.petAllowed ? <Check size={16} /> : <X size={16} />}
                  {T(`property.${property.petAllowed ? 'petAllowed' : 'petNotAllowed'}`)}
                </div>
                <div className={`policy-item ${property.smokingAllowed ? 'policy-ok' : 'policy-no'}`}>
                  {property.smokingAllowed ? <Check size={16} /> : <X size={16} />}
                  {T(`property.${property.smokingAllowed ? 'smokingAllowed' : 'smokingNotAllowed'}`)}
                </div>
                <div className="policy-item policy-info">
                  <span>{T('property.checkInTime')}: {property.checkInTime}</span>
                </div>
                <div className="policy-item policy-info">
                  <span>{T('property.checkOutTime')}: {property.checkOutTime}</span>
                </div>
              </div>
            </section>

            {/* Host */}
            <section className="detail-section">
              <h2 className="section-subtitle">{T('property.hostInfo')}</h2>
              <div className="host-card">
                <img src={property.hostAvatar} alt={property.hostName} className="host-avatar" />
                <div className="host-info">
                  <div className="host-name">{property.hostName} {property.hostVerified && <span className="badge-verified">✓ {T('admin.verified')}</span>}</div>
                  <div className="host-meta">{T('property.hostJoined')}: {property.hostJoined}</div>
                  <div className="host-meta">{T('property.hostResponse')}: {property.hostResponseRate}%</div>
                </div>
                <button className="btn-outline" onClick={handleChat}><MessageSquare size={16} /> {lang === 'zh' ? '發送訊息' : 'Send Message'}</button>
              </div>
            </section>

            {/* Reviews */}
            <section className="detail-section">
              <div className="reviews-header">
                <h2 className="section-subtitle">{T('property.reviews')} ({propReviews.length})</h2>
                <button className="btn-outline" onClick={() => setShowReviewModal(true)}>{T('property.writeReview')}</button>
              </div>
              {propReviews.length === 0 ? (
                <p className="no-reviews">{lang === 'zh' ? '尚無評價' : 'No reviews yet'}</p>
              ) : (
                <div className="reviews-list">
                  {propReviews.map(r => (
                    <div key={r.id} className="review-item">
                      <div className="review-header">
                        <span className="reviewer-name">{r.anonymous ? (lang === 'zh' ? '匿名用戶' : 'Anonymous') : r.userName}</span>
                        <StarRating rating={r.rating} size={14} />
                        <span className="review-date">{new Date(r.createdAt).toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-US')}</span>
                      </div>
                      {r.comment && <p className="review-comment">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right: room selection */}
          <aside className="detail-sidebar">
            <div className="rooms-card">
              <h3 className="rooms-card-title">{lang === 'zh' ? '選擇房型' : 'Select Room Type'}</h3>
              <div className="date-summary">
                <span>📅 {checkIn} → {checkOut}</span>
                <span>🌙 {nights} {T('common.nights')}</span>
              </div>
              {property.rooms.map(room => (
                <div key={room.id} className={`room-option ${selectedRoom?.id === room.id ? 'room-selected' : ''}`}
                  onClick={() => setSelectedRoom(room)}>
                  <div className="room-info">
                    <span className="room-type-name">{lang === 'zh' ? room.typeName : (room.typeNameEn || room.typeName)}</span>
                    <span className="room-guests">👤 {lang === 'zh' ? `最多${room.maxGuests}人` : `Max ${room.maxGuests} guests`}</span>
                  </div>
                  <div className="room-price-wrap">
                    <span className="room-price">NT$ {room.price.toLocaleString()}</span>
                    <span className="room-price-unit">/{T('common.night')}</span>
                  </div>
                  {selectedRoom?.id === room.id && (
                    <div className="room-total">
                      {lang === 'zh' ? '共' : 'Total'} NT$ {(room.price * nights).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
              {selectedRoom && (
                <div className="room-actions">
                  <button className="btn-primary full-width" onClick={() => handleBookNow(selectedRoom)}>
                    {T('property.bookNow')}
                  </button>
                  <button className="btn-outline full-width" onClick={() => handleAddToCart(selectedRoom)}>
                    <ShoppingCart size={16} /> {T('property.addToCart')}
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title={T('review.title')} size="md">
        <div className="review-form">
          <div className="form-group">
            <label>{T('review.rating')}</label>
            <StarRating rating={reviewForm.rating} interactive onChange={r => setReviewForm(f => ({ ...f, rating: r }))} size={28} />
          </div>
          {['cleanliness', 'comfort', 'location', 'facilities', 'service', 'valueForMoney'].map(field => (
            <div key={field} className="form-group form-group-inline">
              <label>{T(`review.${field}`)}</label>
              <StarRating rating={reviewForm[field]} interactive onChange={r => setReviewForm(f => ({ ...f, [field]: r }))} size={20} />
            </div>
          ))}
          <div className="form-group">
            <label>{T('review.comment')}</label>
            <textarea
              value={reviewForm.comment}
              onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              className="form-textarea"
              rows={4}
              placeholder={lang === 'zh' ? '分享您的住宿體驗...' : 'Share your experience...'}
            />
          </div>
          <label className="checkbox-label">
            <input type="checkbox" checked={reviewForm.anonymous} onChange={e => setReviewForm(f => ({ ...f, anonymous: e.target.checked }))} />
            {T('review.anonymous')}
          </label>
          <div className="modal-footer">
            <button className="btn-primary" onClick={handleSubmitReview}>{T('review.submit')}</button>
            <button className="btn-ghost" onClick={() => setShowReviewModal(false)}>{T('common.cancel')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
