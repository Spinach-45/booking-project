import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Map, Train, Hotel, User, LogOut, LogIn, Menu, X,
  Home, ClipboardList, Heart, ShoppingCart, MessageSquare,
  Settings, Globe,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useHotelStore from '../../store/useHotelStore';
import { useToast } from './Toast';
import { t } from '../../modules/hotel/i18n';

export default function Navbar() {
  const { currentUser, logout } = useAuthStore();
  const { lang, setLang, cart, favorites } = useHotelStore();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  const T = (key) => t(lang, key);

  const handleLogout = () => {
    logout();
    toast('已登出', 'info');
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navCls = (path) => `nav-link${isActive(path) ? ' active' : ''}`;

  const cartCount = currentUser
    ? cart.filter(c => !c.userId || c.userId === currentUser.id).length
    : 0;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🌏</span>
          <span className="brand-text">智慧旅遊</span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links desktop-only">
          <Link to="/" className={navCls('/')} style={{ marginRight: 4 }}>
            <Home size={15} /> 首頁
          </Link>
          <Link to="/trip" className={navCls('/trip')}>
            <Map size={15} /> 行程規劃
          </Link>
          <Link to="/hotel" className={navCls('/hotel')}>
            <Hotel size={15} /> 住宿訂房
          </Link>
          <Link to="/ticket" className={navCls('/ticket')}>
            <Train size={15} /> 火車訂票
          </Link>
          {currentUser && (
            <>
              <Link to="/profile/orders-hotel" className={navCls('/profile')}>
                <ClipboardList size={15} /> 我的訂單
              </Link>
              <Link to="/hotel/favorites" className="nav-link" style={{ position: 'relative' }}>
                <Heart size={15} />
                {favorites.length > 0 && <span className="badge" style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(30%,-30%)', background: 'var(--danger)', color: 'white', minWidth: 16, height: 16, borderRadius: 8, fontSize: '0.68rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{favorites.length}</span>}
              </Link>
              <Link to="/hotel/cart" className="nav-link" style={{ position: 'relative' }}>
                <ShoppingCart size={15} />
                {cartCount > 0 && <span className="badge" style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(30%,-30%)', background: 'var(--danger)', color: 'white', minWidth: 16, height: 16, borderRadius: 8, fontSize: '0.68rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{cartCount}</span>}
              </Link>
              <Link to="/hotel/chat" className="nav-link"><MessageSquare size={15} /></Link>
              {currentUser.role === 'admin' && (
                <Link to="/admin" className="nav-link admin-link"><Settings size={15} /> 後台</Link>
              )}
            </>
          )}
        </div>

        {/* Desktop actions */}
        <div className="navbar-actions desktop-only">
          <button className="btn-ghost lang-btn" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}>
            <Globe size={15} /> {lang === 'zh' ? 'EN' : '中文'}
          </button>
          {currentUser ? (
            <div className="user-menu">
              <Link to="/profile" className="user-name">
                <User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                {currentUser.name}
              </Link>
              <button className="btn-ghost btn-sm" onClick={handleLogout}>
                <LogOut size={14} /> 登出
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary btn-sm">
              <LogIn size={14} /> 登入
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger mobile-only" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {[
            { to: '/', label: '🏠 首頁' },
            { to: '/trip', label: '🗺️ 行程規劃' },
            { to: '/hotel', label: '🏨 住宿訂房' },
            { to: '/ticket', label: '🚂 火車訂票' },
          ].map(item => (
            <Link key={item.to} to={item.to} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          {currentUser && (
            <>
              <Link to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>👤 個人中心</Link>
              <Link to="/hotel/favorites" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>❤️ 我的收藏</Link>
              <Link to="/hotel/cart" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>🛒 購物車 {cartCount > 0 ? `(${cartCount})` : ''}</Link>
              {currentUser.role === 'admin' && (
                <Link to="/admin" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>⚙️ 後台管理</Link>
              )}
            </>
          )}
          <div className="mobile-actions">
            <button className="btn-ghost" onClick={() => { setLang(lang === 'zh' ? 'en' : 'zh'); setMenuOpen(false); }}>
              <Globe size={15} /> {lang === 'zh' ? 'English' : '中文'}
            </button>
            {currentUser ? (
              <button className="btn-ghost" onClick={handleLogout}><LogOut size={15} /> 登出</button>
            ) : (
              <Link to="/login" className="btn-primary" onClick={() => setMenuOpen(false)}><LogIn size={15} /> 登入</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
