import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Map, Hotel, Train, ArrowRight, Search, MapPin, Calendar, Users, Star } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useTrainStore from '../store/useTrainStore';
import useHotelStore from '../store/useHotelStore';
import { STATIONS } from '../modules/train/data/trainData';
import { SEED_PROPERTIES } from '../modules/hotel/data/seedData';

// ── Haversine 距離公式（公尺）──────────────────────────────
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── TRA 車站座標表（北北基桃範圍，不修改 trainData.js）──────
const STATION_COORDS = {
  keelung:  { lat: 25.1277, lng: 121.7398 },
  sanken:   { lat: 25.1096, lng: 121.7213 },
  badu:     { lat: 25.0946, lng: 121.7101 },
  qidu:     { lat: 25.0810, lng: 121.7025 },
  baifu:    { lat: 25.0729, lng: 121.6889 },
  wudu:     { lat: 25.0690, lng: 121.6813 },
  xizhi:    { lat: 25.0657, lng: 121.6571 },
  xike:     { lat: 25.0582, lng: 121.6479 },
  nangang:  { lat: 25.0538, lng: 121.6066 },
  songshan: { lat: 25.0498, lng: 121.5776 },
  taipei:   { lat: 25.0478, lng: 121.5170 },
  wanhua:   { lat: 25.0346, lng: 121.4987 },
  banqiao:  { lat: 25.0143, lng: 121.4629 },
  fuzhou:   { lat: 25.0046, lng: 121.4438 },
  shulin:   { lat: 24.9893, lng: 121.4191 },
  shanjia:  { lat: 24.9743, lng: 121.3996 },
  yingge:   { lat: 24.9540, lng: 121.3499 },
  taoyuan:  { lat: 24.9893, lng: 121.3136 },
  neili:    { lat: 24.9698, lng: 121.2769 },
  zhongli:  { lat: 24.9533, lng: 121.2255 },
  ruifang:  { lat: 25.1094, lng: 121.8018 },
};

// ── 找最近車站（回傳 null 表示無合理距離的車站）─────────────
function getNearestStation(lat, lng) {
  let nearest = null;
  let minDist = Infinity;
  for (const station of STATIONS) {
    const coords = STATION_COORDS[station.id];
    if (!coords) continue;
    const dist = getDistance(lat, lng, coords.lat, coords.lng);
    if (dist < minDist) { minDist = dist; nearest = station; }
  }
  if (!nearest) return null;
  const walkMins = Math.round(minDist / 80);
  return { ...nearest, distanceM: Math.round(minDist), walkMins };
}

// ── 推薦住宿：先找 2km 內，不足 3 筆再擴展到 15km ──────────
function getNearbyHotels(lat, lng) {
  const scored = SEED_PROPERTIES
    .filter(p => p.lat != null && p.lng != null && p.active !== false)
    .map(p => ({
      id: p.id,
      name: p.name,
      rating: p.rating,
      minPrice: Math.min(...p.rooms.map(r => r.price)),
      distance: Math.round(getDistance(lat, lng, p.lat, p.lng)),
    }))
    .sort((a, b) => a.distance - b.distance || b.rating - a.rating || a.minPrice - b.minPrice);

  const near = scored.filter(p => p.distance <= 2000);
  if (near.length >= 3) return near.slice(0, 3);
  // 不足 3 筆則擴展至 15km
  return scored.filter(p => p.distance <= 15000).slice(0, 3);
}

// ── 景點資料（含座標，用於自動比對）────────────────────────
const DESTINATIONS = [
  {
    name: '九份老街',
    city: '新北市',
    description: '依山而建的懷舊山城，石階小路與紅燈籠交織成迷人夜景',
    image: 'https://newtaipei.travel/content/images/attractions/25418/1024x768_attractions-image-mxrxcdtkr0-dbbkaky8rpw.jpg',
    lat: 25.1093,
    lng: 121.8450,
  },
  {
    name: '台北101',
    city: '台北市',
    description: '台灣最高地標建築，觀景台可360度俯瞰台北盆地全景',
    image: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=600',
    lat: 25.0340,
    lng: 121.5645,
  },
  {
    name: '野柳地質公園',
    city: '新北市',
    description: '奇特海蝕地形景觀，女王頭為台灣最具代表性的天然奇石',
    image: 'https://th.bing.com/th/id/R.e0c6a620c1061f831e72289c71d95a6d?rik=xYJRhA%2bZx6b9og&pid=ImgRaw&r=0',
    lat: 25.2072,
    lng: 121.6893,
  },
  {
    name: '正濱漁港',
    city: '基隆市',
    description: '繽紛彩色建築倒映於港面，是基隆最具特色的網美打卡景點',
    image: 'https://s.newtalk.tw/album/news/188/5c275cbf2e90e.jpg',
    lat: 25.1538,
    lng: 121.7697,
  },
  {
    name: '淡水老街',
    city: '新北市',
    description: '百年歷史的河岸老街，夕陽西下時漁人碼頭景色令人難忘',
    image: 'https://img.fun-life.com.tw/new-taipei/freshwater-oldstreet/DSC09395.jpg',
    lat: 25.1700,
    lng: 121.4378,
  },
  {
    name: '基隆廟口夜市',
    city: '基隆市',
    description: '全台最著名夜市之一，滷肉飯、天婦羅等在地小吃應有盡有',
    image: 'https://live.staticflickr.com/65535/31040793885_7774a38454_b.jpg',
    lat: 25.1283,
    lng: 121.7406,
  },
  {
    name: '大溪老街',
    city: '桃園市',
    description: '保存完整的巴洛克式牌樓建築，豆腐與木藝工藝聞名全台',
    image: 'https://tyenews.com/wp-content/uploads/2023/04/%E5%A4%A7%E6%BA%AA%E8%80%81%E8%A1%97.jpg',
    lat: 24.8790,
    lng: 121.2882,
  },
  {
    name: '國立故宮博物院',
    city: '台北市',
    description: '收藏逾69萬件中華文物珍寶，翠玉白菜為鎮館之寶',
    image: 'https://motto.tw/assets/img/taipei/pic_national-palace-museum01.jpg',
    lat: 25.1023,
    lng: 121.5484,
  },
];

const MODULES = [
  { to: '/trip',   icon: <Map size={26} />,   title: '行程規劃', desc: '多人協作規劃行程，支援候選投票、衝突檢測、費用分帳，讓旅遊更順暢',   cta: '開始規劃' },
  { to: '/hotel',  icon: <Hotel size={26} />,  title: '住宿訂房', desc: '台灣各地火車站周邊住宿一鍵訂房，訂兩晚以上享八折優惠，並自動同步行程', cta: '搜尋住宿' },
  { to: '/ticket', icon: <Train size={26} />,  title: '火車訂票', desc: '太魯閣、普悠瑪、自強等各車種一次查詢，訂票完成自動加入旅遊行程',   cta: '查詢車次' },
];

// ── 景點卡片（含 hover 展開）────────────────────────────────
function DestCard({ dest, station, hotels }) {
  const navigate = useNavigate();
  const { setSearchParams } = useTrainStore();

  const handleStationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchParams({ to: station.id });
    navigate('/ticket');
  };

  return (
    <div className="dest-photo-card">
      <img src={dest.image} alt={dest.name} loading="lazy" />
      <div className="dest-photo-overlay" />

      {/* 一般狀態：名稱 + 城市 */}
      <div className="dest-photo-info">
        <div className="dest-photo-name">{dest.name}</div>
        <div className="dest-photo-region">{dest.city}</div>
      </div>

      {/* Hover 展開 */}
      <div className="dest-hover-overlay">
        <div className="dest-hover-name">{dest.name}</div>
        <div className="dest-hover-city">{dest.city}</div>
        <p className="dest-hover-desc">{dest.description}</p>

        <hr className="dest-hover-divider" />

        {/* 最近車站 */}
        <div className="dest-hover-label">最近車站</div>
        {station ? (
          <button className="dest-hover-station" onClick={handleStationClick}>
            <Train size={12} />
            {station.name}站（約 {station.walkMins} 分鐘步行）
          </button>
        ) : (
          <div className="dest-no-data">請參考附近站點</div>
        )}

        <hr className="dest-hover-divider" />

        {/* 推薦住宿 */}
        <div className="dest-hover-label">推薦住宿</div>
        {hotels.length > 0 ? hotels.map(h => (
          <Link key={h.id} to={`/hotel/property/${h.id}`} className="dest-hotel-item">
            <div className="dest-hotel-name">{h.name}</div>
            <div className="dest-hotel-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Star size={9} fill="rgba(255,200,50,0.9)" stroke="none" />
                {h.rating}
              </span>
              <span>NT${h.minPrice.toLocaleString()}/晚</span>
              <span>{h.distance < 1000 ? `${h.distance}m` : `${(h.distance / 1000).toFixed(1)}km`}</span>
            </div>
          </Link>
        )) : (
          <div className="dest-no-data">附近暫無房源</div>
        )}
      </div>
    </div>
  );
}

// ── 主頁面 ──────────────────────────────────────────────────
export default function LandingPage() {
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const { ads } = useHotelStore();
  const [guests, setGuests] = useState('2');

  const today = new Date().toISOString().split('T')[0];
  const landingAds = ads.filter(a => a.active && a.position === 'landing' && a.endDate >= today);

  // 預先計算每個景點的最近車站與推薦住宿（只算一次）
  const enrichedDests = useMemo(() =>
    DESTINATIONS.map(dest => ({
      dest,
      station: getNearestStation(dest.lat, dest.lng),
      hotels: getNearbyHotels(dest.lat, dest.lng),
    })),
  []);

  return (
    <div>
      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-content container">
          <p className="hero-eyebrow">智慧旅遊平台</p>
          <h1 className="hero-title">旅行，<strong>由你定義</strong></h1>
          <p className="hero-subtitle">行程規劃 × 住宿訂房 × 火車訂票，三大功能整合於一站</p>

          <div className="hero-search">
            <div className="hero-search-field">
              <MapPin size={16} />
              <input className="hero-search-input" placeholder="目的地" />
            </div>
            <div className="hero-search-field">
              <Calendar size={16} />
              <input className="hero-search-input" type="date" />
            </div>
            <div className="hero-search-field">
              <Calendar size={16} />
              <input className="hero-search-input" type="date" />
            </div>
            <div className="hero-search-field">
              <Users size={16} />
              <input
                className="hero-search-input"
                type="number" min="1" max="10"
                value={guests}
                onChange={e => setGuests(e.target.value)}
                placeholder="旅客人數"
                style={{ width: 80 }}
              />
            </div>
            <button className="hero-search-btn" onClick={() => navigate('/hotel')}>
              <Search size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 三大模組 ── */}
      <div className="modules-section" style={{ background: 'white' }}>
        <div className="container">
          <div className="modules-grid">
            {MODULES.map(m => (
              <Link key={m.to} to={m.to} className="module-card">
                <div className="module-card-icon">{m.icon}</div>
                <div className="module-card-title">{m.title}</div>
                <div className="module-card-desc">{m.desc}</div>
                <div className="module-card-link">{m.cta} <ArrowRight size={14} /></div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── 熱門目的地 ── */}
      <div className="destinations-section">
        <div className="container">
          <div className="destinations-header">
            <div>
              <div className="destinations-title">熱門目的地</div>
              <div className="destinations-subtitle">探索北北基桃精選景點，自動比對最近車站與住宿</div>
            </div>
            <Link to="/hotel" style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              查看全部 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="destinations-scroll">
            {enrichedDests.map(({ dest, station, hotels }) => (
              <DestCard key={dest.name} dest={dest} station={station} hotels={hotels} />
            ))}
          </div>
        </div>
      </div>

      {/* ── 首頁廣告欄位（由後台管理） ── */}
      {landingAds.length > 0 && (
        <div style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {landingAds.map(ad => (
                <Link
                  key={ad.id}
                  to={ad.link && ad.link !== '#' ? ad.link : '/hotel'}
                  style={{ flex: 1, minWidth: 0, display: 'block', textDecoration: 'none', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}
                >
                  {ad.video ? (
                    <video
                      src={ad.video}
                      poster={ad.image}
                      autoPlay muted loop playsInline
                      style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <img
                      src={ad.image}
                      alt={ad.title}
                      style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  )}
                  <span style={{ position: 'absolute', top: 6, right: 8, background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: '0.6rem', padding: '1px 5px', borderRadius: 3 }}>廣告</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
