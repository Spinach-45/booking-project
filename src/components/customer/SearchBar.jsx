import { useState } from 'react';
import { Search, Calendar, Users, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { t } from '../../i18n';

const AREAS = [
  { value: 'taipei', zh: '台北（含松山、台北車站）', en: 'Taipei (incl. Songshan, Main Station)' },
  { value: 'keelung', zh: '基隆', en: 'Keelung' },
  { value: 'newTaipei', zh: '新北（板橋、汐止、三重）', en: 'New Taipei (Banqiao, Xizhi, Sanchong)' },
  { value: 'taoyuan', zh: '桃園（含中壢）', en: 'Taoyuan (incl. Zhongli)' },
];

export default function SearchBar({ compact = false }) {
  const { lang, searchParams, setSearchParams } = useStore();
  const navigate = useNavigate();
  const T = (key) => t(lang, key);

  const [form, setForm] = useState({
    location: searchParams.location || '',
    checkIn: searchParams.checkIn || '',
    checkOut: searchParams.checkOut || '',
    guests: searchParams.guests || 1,
  });

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {
      location: form.location,
      checkIn: form.checkIn || today,
      checkOut: form.checkOut || tomorrow,
      guests: form.guests,
    };
    setSearchParams(params);
    navigate('/properties');
  };

  return (
    <form className={`search-bar ${compact ? 'search-bar-compact' : ''}`} onSubmit={handleSearch}>
      <div className="search-field">
        <MapPin size={18} className="field-icon" />
        <select
          value={form.location}
          onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
          className="search-input"
        >
          <option value="">{T('home.searchPlaceholder')}</option>
          {AREAS.map(a => (
            <option key={a.value} value={a.value}>
              {lang === 'zh' ? a.zh : a.en}
            </option>
          ))}
        </select>
      </div>
      <div className="search-field">
        <Calendar size={18} className="field-icon" />
        <input
          type="date"
          min={today}
          value={form.checkIn}
          onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))}
          className="search-input"
          placeholder={T('home.checkIn')}
        />
      </div>
      <div className="search-field">
        <Calendar size={18} className="field-icon" />
        <input
          type="date"
          min={form.checkIn || today}
          value={form.checkOut}
          onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))}
          className="search-input"
          placeholder={T('home.checkOut')}
        />
      </div>
      <div className="search-field search-field-sm">
        <Users size={18} className="field-icon" />
        <input
          type="number"
          min={1}
          max={10}
          value={form.guests}
          onChange={e => setForm(f => ({ ...f, guests: parseInt(e.target.value) || 1 }))}
          className="search-input"
          placeholder={T('home.guests')}
        />
      </div>
      <button type="submit" className="btn-search">
        <Search size={18} />
        {!compact && <span>{T('home.searchBtn')}</span>}
      </button>
    </form>
  );
}
