import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Map, Hotel, Train, ArrowRight, Search, MapPin, Calendar, Users } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const MODULES = [
  {
    to: '/trip',
    icon: <Map size={26} />,
    title: '行程規劃',
    desc: '多人協作規劃行程，支援候選投票、衝突檢測、費用分帳，讓旅遊更順暢',
    cta: '開始規劃',
  },
  {
    to: '/hotel',
    icon: <Hotel size={26} />,
    title: '住宿訂房',
    desc: '台灣各地火車站周邊住宿一鍵訂房，訂兩晚以上享八折優惠，並自動同步行程',
    cta: '搜尋住宿',
  },
  {
    to: '/ticket',
    icon: <Train size={26} />,
    title: '火車訂票',
    desc: '太魯閣、普悠瑪、自強等各車種一次查詢，訂票完成自動加入旅遊行程',
    cta: '查詢車次',
  },
];

const DESTINATIONS = [
  { name: '台北', region: '北台灣', img: 'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=400&q=80&fit=crop' },
  { name: '花蓮', region: '東台灣', img: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400&q=80&fit=crop' },
  { name: '台南', region: '南台灣', img: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80&fit=crop' },
  { name: '九份', region: '新北市', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80&fit=crop' },
  { name: '墾丁', region: '屏東縣', img: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=400&q=80&fit=crop' },
];

export default function LandingPage() {
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [guests, setGuests] = useState('2');

  return (
    <div>
      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-content container">
          <p className="hero-eyebrow">智慧旅遊平台</p>
          <h1 className="hero-title">
            旅行，<strong>由你定義</strong>
          </h1>
          <p className="hero-subtitle">
            行程規劃 × 住宿訂房 × 火車訂票，三大功能整合於一站
          </p>

          {/* Search bar */}
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
                type="number"
                min="1"
                max="10"
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
                <div className="module-card-link">
                  {m.cta} <ArrowRight size={14} />
                </div>
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
              <div className="destinations-subtitle">探索台灣各地精選旅遊景點</div>
            </div>
            <Link to="/hotel" style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              查看全部 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="destinations-scroll">
            {DESTINATIONS.map(d => (
              <Link key={d.name} to="/hotel" className="dest-photo-card">
                <img src={d.img} alt={d.name} loading="lazy" />
                <div className="dest-photo-overlay" />
                <div className="dest-photo-info">
                  <div className="dest-photo-name">{d.name}</div>
                  <div className="dest-photo-region">{d.region}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── 跨模組亮點 ── */}
      <div style={{ background: 'white', padding: '3rem 0 4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)' }}>跨模組整合亮點</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 300, color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              三大功能無縫串接，打造最順暢的旅遊體驗
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: '🔗', title: '訂房自動入行程', desc: '訂房成功後，住宿資訊自動加入對應行程天數' },
              { icon: '🎫', title: '訂票自動入行程', desc: '車次時間與票券資訊自動同步至行程交通安排' },
              { icon: '⚡', title: '衝突智慧提醒', desc: '系統自動偵測車班時間與行程安排是否衝突' },
              { icon: '🎁', title: '兩晚八折優惠', desc: '訂房兩晚以上自動享八折優惠，折扣明細清楚呈現' },
            ].map(f => (
              <div key={f.title} style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text)' }}>{f.title}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
