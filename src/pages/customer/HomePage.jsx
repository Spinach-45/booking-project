import { Link } from 'react-router-dom';
import { Shield, RefreshCw, Headphones, ChevronRight } from 'lucide-react';
import useStore from '../../store/useStore';
import { t } from '../../i18n';
import SearchBar from '../../components/customer/SearchBar';
import PropertyCard from '../../components/customer/PropertyCard';
import AdBanner from '../../components/common/AdBanner';

const DESTINATIONS = [
  { value: 'taipei', zh: '台北', en: 'Taipei', emoji: '🏙️', count: 2 },
  { value: 'keelung', zh: '基隆', en: 'Keelung', emoji: '⚓', count: 1 },
  { value: 'newTaipei', zh: '新北', en: 'New Taipei', emoji: '🌉', count: 3 },
  { value: 'taoyuan', zh: '桃園', en: 'Taoyuan', emoji: '✈️', count: 2 },
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
                to="/properties"
                className="destination-card"
                onClick={() => handleDestClick(d.value)}
              >
                <span className="dest-emoji">{d.emoji}</span>
                <span className="dest-name">{lang === 'zh' ? d.zh : d.en}</span>
                <span className="dest-count">{d.count} {lang === 'zh' ? '個房源' : 'properties'}</span>
                <ChevronRight size={16} className="dest-arrow" />
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
            <Link to="/properties" className="see-all-link">
              {lang === 'zh' ? '查看全部' : 'View All'} <ChevronRight size={16} />
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
              <Shield size={40} className="why-icon" />
              <h3>{T('home.reason1Title')}</h3>
              <p>{T('home.reason1Desc')}</p>
            </div>
            <div className="why-card">
              <RefreshCw size={40} className="why-icon" />
              <h3>{T('home.reason2Title')}</h3>
              <p>{T('home.reason2Desc')}</p>
            </div>
            <div className="why-card">
              <Headphones size={40} className="why-icon" />
              <h3>{T('home.reason3Title')}</h3>
              <p>{T('home.reason3Desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
