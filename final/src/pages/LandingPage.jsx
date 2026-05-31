import { Link } from 'react-router-dom';
import { Map, Hotel, Train, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function LandingPage() {
  const { currentUser } = useAuthStore();

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1 className="hero-title">🌏 智慧旅遊整合平台</h1>
          <p className="hero-subtitle">行程規劃 × 住宿訂房 × 火車訂票，一站搞定您的旅遊需求</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {currentUser ? (
              <Link to="/trip" className="btn-primary btn-large">開始規劃行程</Link>
            ) : (
              <>
                <Link to="/login" className="btn-primary btn-large">立即登入</Link>
                <Link to="/register" className="btn-outline btn-large" style={{ color: 'white', borderColor: 'white' }}>免費註冊</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="container">
        <div className="section">
          <div className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>三大核心功能</div>
          <div className="why-grid">
            <Link to="/trip" className="why-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <Map size={40} className="why-icon" style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
              <h3>🗺️ 行程規劃</h3>
              <p>多人協作規劃行程，支援候選投票、衝突檢測、費用分帳，讓旅遊更順暢</p>
              <div style={{ marginTop: '1rem', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                開始規劃 <ArrowRight size={14} />
              </div>
            </Link>
            <Link to="/hotel" className="why-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <Hotel size={40} className="why-icon" style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
              <h3>🏨 住宿訂房</h3>
              <p>台灣各地火車站周邊住宿一鍵訂房，訂兩晚以上享八折優惠，並自動同步行程</p>
              <div style={{ marginTop: '1rem', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                搜尋住宿 <ArrowRight size={14} />
              </div>
            </Link>
            <Link to="/ticket" className="why-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <Train size={40} className="why-icon" style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
              <h3>🚂 火車訂票</h3>
              <p>太魯閣、普悠瑪、自強等各車種一次查詢，訂票完成自動加入旅遊行程</p>
              <div style={{ marginTop: '1rem', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                查詢車次 <ArrowRight size={14} />
              </div>
            </Link>
          </div>
        </div>

        {/* Cross-module features */}
        <div className="section section-gray" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '3rem' }}>
          <div className="section-title" style={{ textAlign: 'center' }}>跨模組整合亮點</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            {[
              { icon: '🔗', title: '訂房自動入行程', desc: '訂房成功後，住宿資訊自動加入對應行程天數' },
              { icon: '🎫', title: '訂票自動入行程', desc: '車次時間與票券資訊自動同步至行程交通安排' },
              { icon: '⚡', title: '衝突智慧提醒', desc: '系統自動偵測車班時間與行程安排是否衝突' },
              { icon: '🎁', title: '兩晚八折優惠', desc: '訂房兩晚以上自動享八折優惠，折扣明細清楚呈現' },
            ].map(f => (
              <div key={f.title} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{f.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
