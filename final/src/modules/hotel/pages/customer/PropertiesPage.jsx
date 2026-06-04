import { useMemo } from 'react';
import useStore from '../../../../store/useHotelStore';
import { t } from '../../i18n';
import PropertyCard from '../../components/PropertyCard';
import FilterPanel from '../../components/FilterPanel';
import SearchBar from '../../components/SearchBar';
import AdBanner from '../../../../components/common/AdBanner';

export default function PropertiesPage() {
  const { lang, properties, searchParams, filterParams } = useStore();
  const T = (key) => t(lang, key);

  const filtered = useMemo(() => {
    let list = properties.filter(p => p.active);

    // Location filter
    if (searchParams.location) {
      list = list.filter(p => p.area === searchParams.location);
    }

    // Guest capacity
    if (searchParams.guests > 1) {
      list = list.filter(p => p.rooms.some(r => r.maxGuests >= searchParams.guests));
    }

    // Price range
    list = list.filter(p => {
      const minPrice = Math.min(...p.rooms.map(r => r.price));
      return minPrice >= filterParams.priceMin && minPrice <= filterParams.priceMax;
    });

    // Room type
    if (filterParams.roomType) {
      list = list.filter(p => p.rooms.some(r => r.type === filterParams.roomType));
    }

    // Rating
    if (filterParams.minRating > 0) {
      list = list.filter(p => p.rating >= filterParams.minRating);
    }

    // Amenities
    if (filterParams.amenities.length > 0) {
      list = list.filter(p =>
        filterParams.amenities.every(a => {
          if (a === 'petFriendly') return p.petAllowed;
          if (a === 'smokingAllowed') return p.smokingAllowed;
          return p.amenities.includes(a);
        })
      );
    }

    // Distance
    if (filterParams.distanceStation > 0) {
      list = list.filter(p => p.distanceToStation <= filterParams.distanceStation);
    }

    // Sort
    switch (filterParams.sortBy) {
      case 'priceAsc':
        list = [...list].sort((a, b) => Math.min(...a.rooms.map(r => r.price)) - Math.min(...b.rooms.map(r => r.price)));
        break;
      case 'priceDesc':
        list = [...list].sort((a, b) => Math.min(...b.rooms.map(r => r.price)) - Math.min(...a.rooms.map(r => r.price)));
        break;
      case 'distance':
        list = [...list].sort((a, b) => a.distanceToStation - b.distanceToStation);
        break;
      default:
        list = [...list].sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [properties, searchParams, filterParams]);

  const countText = T('search.found').replace('{count}', filtered.length);

  return (
    <div className="properties-page">
      <div className="properties-search-bar">
        <div className="container">
          <SearchBar compact />
        </div>
      </div>
      <div className="container">
        <div className="properties-layout">
          <aside className="properties-sidebar">
            <FilterPanel />
            <AdBanner position="sidebar" />
          </aside>
          <main className="properties-main">
            <div className="results-header">
              <h2 className="results-title">{T('search.results')}</h2>
              <span className="results-count">{countText}</span>
            </div>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <i className="fi fi-rr-search fi-lg empty-icon" />
                <p>{T('search.noResults')}</p>
                <p className="empty-hint">{T('search.tryAdjust')}</p>
              </div>
            ) : (
              <div className="properties-grid">
                {filtered.map(p => <PropertyCard key={p.id} property={p} />)}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
