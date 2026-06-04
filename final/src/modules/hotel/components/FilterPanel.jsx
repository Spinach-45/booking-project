import { useState } from 'react';
import useStore from '../../../store/useHotelStore';
import { t } from '../i18n';

const ROOM_TYPES = ['single', 'double', 'twin', 'suite', 'deluxe', 'family', 'dormitory'];
const AMENITIES_LIST = ['wifi', 'parking', 'breakfast', 'aircon', 'tv', 'kitchen', 'laundry', 'gym', 'pool', 'petFriendly'];
const DISTANCES = [
  { value: 500, labelZh: '500公尺內', labelEn: 'Within 500m' },
  { value: 1000, labelZh: '1公里內', labelEn: 'Within 1km' },
  { value: 2000, labelZh: '2公里內', labelEn: 'Within 2km' },
  { value: 5000, labelZh: '5公里內', labelEn: 'Within 5km' },
];

export default function FilterPanel() {
  const { lang, filterParams, setFilterParams } = useStore();
  const T = (key) => t(lang, key);
  const [expanded, setExpanded] = useState(true);
  const [local, setLocal] = useState({ ...filterParams });

  const toggleAmenity = (a) => {
    setLocal(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }));
  };

  const apply = () => setFilterParams(local);
  const reset = () => {
    const def = { priceMin: 0, priceMax: 10000, roomType: '', minRating: 0, amenities: [], distanceStation: 0, sortBy: 'rating' };
    setLocal(def);
    setFilterParams(def);
  };

  return (
    <div className="filter-panel">
      <div className="filter-header" onClick={() => setExpanded(!expanded)}>
        <span><i className="fi fi-rr-filter fi-sm" /> {T('search.filter')}</span>
        {expanded ? <i className="fi fi-rr-angle-up fi-sm" /> : <i className="fi fi-rr-angle-down fi-sm" />}
      </div>
      {expanded && (
        <div className="filter-body">
          {/* Sort */}
          <div className="filter-section">
            <label className="filter-label">{T('search.sortBy')}</label>
            <select className="filter-select" value={local.sortBy} onChange={e => setLocal(f => ({ ...f, sortBy: e.target.value }))}>
              <option value="rating">{T('search.sortRating')}</option>
              <option value="priceAsc">{T('search.sortPrice')}</option>
              <option value="priceDesc">{T('search.sortPriceDesc')}</option>
              <option value="distance">{T('search.sortDistance')}</option>
            </select>
          </div>
          {/* Price */}
          <div className="filter-section">
            <label className="filter-label">{T('search.priceRange')}</label>
            <div className="range-inputs">
              <input type="number" min={0} max={local.priceMax} value={local.priceMin}
                onChange={e => setLocal(f => ({ ...f, priceMin: Number(e.target.value) }))}
                className="filter-input" placeholder="Min" />
              <span>—</span>
              <input type="number" min={local.priceMin} value={local.priceMax}
                onChange={e => setLocal(f => ({ ...f, priceMax: Number(e.target.value) }))}
                className="filter-input" placeholder="Max" />
            </div>
          </div>
          {/* Room type */}
          <div className="filter-section">
            <label className="filter-label">{T('search.roomType')}</label>
            <select className="filter-select" value={local.roomType} onChange={e => setLocal(f => ({ ...f, roomType: e.target.value }))}>
              <option value="">{T('common.all')}</option>
              {ROOM_TYPES.map(rt => (
                <option key={rt} value={rt}>{T(`roomTypes.${rt}`)}</option>
              ))}
            </select>
          </div>
          {/* Rating */}
          <div className="filter-section">
            <label className="filter-label">{T('search.minRating')}</label>
            <div className="rating-btns">
              {[0, 3, 3.5, 4, 4.5].map(r => (
                <button key={r} className={`rating-btn ${local.minRating === r ? 'active' : ''}`}
                  onClick={() => setLocal(f => ({ ...f, minRating: r }))}>
                  {r === 0 ? T('common.all') : `${r}+`}
                </button>
              ))}
            </div>
          </div>
          {/* Distance */}
          <div className="filter-section">
            <label className="filter-label">{T('search.distanceStation')}</label>
            <div className="rating-btns">
              <button className={`rating-btn ${local.distanceStation === 0 ? 'active' : ''}`}
                onClick={() => setLocal(f => ({ ...f, distanceStation: 0 }))}>{T('common.all')}</button>
              {DISTANCES.map(d => (
                <button key={d.value} className={`rating-btn ${local.distanceStation === d.value ? 'active' : ''}`}
                  onClick={() => setLocal(f => ({ ...f, distanceStation: d.value }))}>
                  {lang === 'zh' ? d.labelZh : d.labelEn}
                </button>
              ))}
            </div>
          </div>
          {/* Amenities */}
          <div className="filter-section">
            <label className="filter-label">{T('search.amenities')}</label>
            <div className="amenity-checks">
              {AMENITIES_LIST.map(a => (
                <label key={a} className="amenity-check">
                  <input type="checkbox" checked={local.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                  {T(`amenities.${a}`)}
                </label>
              ))}
            </div>
          </div>
          <div className="filter-actions">
            <button className="btn-primary" onClick={apply}>{T('search.applyFilter')}</button>
            <button className="btn-ghost" onClick={reset}>{T('search.resetFilter')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
