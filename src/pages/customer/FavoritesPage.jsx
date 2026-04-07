import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import useStore from '../../store/useStore';
import { t } from '../../i18n';
import PropertyCard from '../../components/customer/PropertyCard';

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
        <h1 className="page-title"><Heart size={24} fill="#ef4444" stroke="#ef4444" /> {T('favorites.title')}</h1>
        {favProps.length === 0 ? (
          <div className="empty-state">
            <Heart size={48} className="empty-icon" />
            <p>{T('favorites.noFavorites')}</p>
            <Link to="/properties" className="btn-primary">{T('favorites.browseProperties')}</Link>
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
