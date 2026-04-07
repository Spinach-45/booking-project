import { Heart, ShoppingCart, MapPin, Star, Train } from 'lucide-react';
import { Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import { t } from '../../i18n';
import { useToast } from '../common/Toast';

export default function PropertyCard({ property }) {
  const { lang, favorites, toggleFavorite, addToCart, currentUser, searchParams } = useStore();
  const addToast = useToast();
  const T = (key) => t(lang, key);
  const isFav = favorites.includes(property.id);

  const minPrice = Math.min(...property.rooms.map(r => r.price));
  const name = lang === 'zh' ? property.name : (property.nameEn || property.name);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(property.id);
    addToast(isFav ? T('property.removeFromFavorites') : T('property.addedToFavorites'), 'success');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      addToast('請先登入', 'error');
      return;
    }
    const room = property.rooms[0];
    const checkIn = searchParams.checkIn || new Date().toISOString().split('T')[0];
    const checkOut = searchParams.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
    const ok = addToCart({
      userId: currentUser.id,
      propertyId: property.id,
      propertyName: name,
      roomId: room.id,
      roomType: lang === 'zh' ? room.typeName : (room.typeNameEn || room.typeName),
      checkIn,
      checkOut,
      nights,
      guests: searchParams.guests || 1,
      pricePerNight: room.price,
      totalPrice: room.price * nights,
    });
    addToast(ok ? T('property.addedToCart') : '此項目已在購物車中', ok ? 'success' : 'warning');
  };

  const distanceText = property.distanceToStation >= 1000
    ? `${(property.distanceToStation / 1000).toFixed(1)}km`
    : `${property.distanceToStation}m`;

  return (
    <Link to={`/property/${property.id}`} className="property-card">
      <div className="property-card-image-wrap">
        <img
          src={property.images[0]}
          alt={name}
          className="property-card-image"
          loading="lazy"
        />
        <button className={`fav-btn ${isFav ? 'fav-active' : ''}`} onClick={handleFavorite}>
          <Heart size={20} fill={isFav ? '#ef4444' : 'none'} stroke={isFav ? '#ef4444' : 'white'} />
        </button>
        {property.featured && <span className="badge-featured">{lang === 'zh' ? '精選' : 'Featured'}</span>}
      </div>
      <div className="property-card-body">
        <h3 className="property-card-name">{name}</h3>
        <div className="property-card-location">
          <MapPin size={14} />
          <span>{lang === 'zh' ? property.station : property.stationEn}</span>
          <span className="distance">
            <Train size={12} /> {distanceText}
          </span>
        </div>
        <div className="property-card-rating">
          <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
          <span className="rating-value">{property.rating.toFixed(1)}</span>
          <span className="review-count">({property.reviewCount})</span>
        </div>
        <div className="property-card-amenities">
          {property.amenities.slice(0, 4).map(a => (
            <span key={a} className="amenity-tag">{T(`amenities.${a}`)}</span>
          ))}
        </div>
        <div className="property-card-footer">
          <div className="price-info">
            <span className="price-from">{lang === 'zh' ? '起' : 'from'}</span>
            <span className="price-value">NT$ {minPrice.toLocaleString()}</span>
            <span className="price-unit">/ {T('common.night')}</span>
          </div>
          <button className="btn-cart" onClick={handleAddToCart}>
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
