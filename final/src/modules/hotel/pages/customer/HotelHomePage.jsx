import { Link } from 'react-router-dom';
import useStore from '../../../../store/useHotelStore';
import { t } from '../../i18n';
import SearchBar from '../../components/SearchBar';
import PropertyCard from '../../components/PropertyCard';
import AdBanner from '../../../../components/common/AdBanner';

const DESTINATIONS = [
  { value: 'taipei',   zh: '台北', en: 'Taipei',     icon: 'fi-sr-city',   count: 2 },
  { value: 'keelung',  zh: '基隆', en: 'Keelung',    icon: 'fi-sr-anchor', count: 1 },
  { value: 'newTaipei',zh: '新北', en: 'New Taipei', icon: 'fi-sr-bridge', count: 3 },
  { value: 'taoyuan',  zh: '桃園', en: 'Taoyuan',    icon: 'fi-sr-plane',  count: 2 },
];

export default function HomePage() {
  const { lang, properties, setSearchParams } = useStore();
  const T = (key) => t(lang, key);
  const featured = properties.filter(p => p.featured && p.active).slice(0, 4);

  const handleDestClick = (area) => {
    setSearchParams(s => ({ ...s, location: area }));
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1 className="hero-title">{T('home.title')}</h1>
          <p className="hero-subtitle">{T('home.subtitle')}</p>
          <SearchBar />
        </div>
      </section>

      {/* Ad Banner */}
      <div className="container">
        <AdBanner position="banner" />
      </div>

      {/* Popular Destinations */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">{T('home.popularDestinations')}</h2>
          <div className="destinations-grid">
            {DESTINATIONS.map(d => (
              <Link
                key={d.value}
                to="/hotel/properties"
                className="destination-card"
                onClick={() => handleDestClick(d.value)}
              >
                <i className={`fi ${d.icon}`} style={{ fontSize: '2.5rem', color: '#6e7c87', marginBottom: '0.5rem', display: 'block' }} />
                <span className="dest-name">{lang === 'zh' ? d.zh : d.en}</span>
                <span className="dest-count">{d.count} {lang === 'zh' ? '個房源' : 'properties'}</span>
                <i className="fi fi-rr-angle-right fi-sm dest-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section section-gray">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{T('home.featuredProperties')}</h2>
            <Link to="/hotel/properties" className="see-all-link">
              {lang === 'zh' ? '查看全部' : 'View All'} <i className="fi fi-rr-angle-right fi-sm" />
            </Link>
          </div>
          <div className="properties-grid">
            {featured.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">{T('home.whyUs')}</h2>
          <div className="why-grid">
            <div className="why-card">
              <i className="fi fi-rr-lock fi-lg why-icon" />
              <h3>{T('home.reason1Title')}</h3>
              <p>{T('home.reason1Desc')}</p>
            </div>
            <div className="why-card">
              <i className="fi fi-rr-arrows-h fi-lg why-icon" />
              <h3>{T('home.reason2Title')}</h3>
              <p>{T('home.reason2Desc')}</p>
            </div>
            <div className="why-card">
              <i className="fi fi-rr-comment fi-lg why-icon" />
              <h3>{T('home.reason3Title')}</h3>
              <p>{T('home.reason3Desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
