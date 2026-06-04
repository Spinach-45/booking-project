import { Link } from 'react-router-dom';
import useStore from '../../../../store/useHotelStore';
import { t } from '../../i18n';
import PropertyCard from '../../components/PropertyCard';

export default function FavoritesPage() {
  const { lang, favorites, properties, currentUser } = useStore();
  const T = (key) => t(lang, key);

  if (!currentUser) return (
    <div className="container empty-page">
      <p>{lang === 'zh' ? '請先登入' : 'Please login first'}</p>
      <Link to="/login" className="btn-primary">{T('nav.login')}</Link>
    </div>
  );

  const favProps = properties.filter(p => favorites.includes(p.id));

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title"><i className="fi fi-sr-heart" style={{ fontSize: 24, color: '#ef4444' }} /> {T('favorites.title')}</h1>
        {favProps.length === 0 ? (
          <div className="empty-state">
            <i className="fi fi-rr-heart fi-lg empty-icon" />
            <p>{T('favorites.noFavorites')}</p>
            <Link to="/hotel/properties" className="btn-primary">{T('favorites.browseProperties')}</Link>
          </div>
        ) : (
          <div className="properties-grid">
            {favProps.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
