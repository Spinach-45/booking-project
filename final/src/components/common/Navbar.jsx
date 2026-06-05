import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

  const isHome = location.pathname === '/';

  return (
    <nav className={`navbar${isHome ? ' navbar-transparent' : ''}`}>
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="brand-text" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>Agent TT</span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links desktop-only">
          <Link to="/" className={navCls('/')} style={{ marginRight: 4 }}>
            <i className="fi fi-rr-home fi-sm" /> 首頁
          </Link>
          <Link to="/trip" className={navCls('/trip')}>
            <i className="fi fi-rr-map fi-sm" /> 行程規劃
          </Link>
          <Link to="/hotel" className={navCls('/hotel')}>
            <i className="fi fi-rr-bed fi-sm" /> 住宿訂房
          </Link>
          <Link to="/ticket" className={navCls('/ticket')}>
            <i className="fi fi-rr-train-side fi-sm" /> 火車訂票
          </Link>
          {currentUser && (
            <>
              <Link to="/profile/orders-hotel" className={navCls('/profile')}>
                <i className="fi fi-rr-clipboard-list fi-sm" /> 我的訂單
              </Link>
              <Link to="/hotel/favorites" className="nav-link" style={{ position: 'relative' }}>
                <i className="fi fi-rr-heart fi-sm" />
                {favorites.length > 0 && <span className="badge" style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(30%,-30%)', background: 'var(--danger)', color: 'white', minWidth: 16, height: 16, borderRadius: 8, fontSize: '0.68rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{favorites.length}</span>}
              </Link>
              <Link to="/hotel/cart" className="nav-link" style={{ position: 'relative' }}>
                <i className="fi fi-rr-shopping-cart fi-sm" />
                {cartCount > 0 && <span className="badge" style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(30%,-30%)', background: 'var(--danger)', color: 'white', minWidth: 16, height: 16, borderRadius: 8, fontSize: '0.68rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{cartCount}</span>}
              </Link>
              <Link to="/hotel/chat" className="nav-link"><i className="fi fi-rr-comment fi-sm" /></Link>
              {(currentUser.role === 'host' || currentUser.role === 'admin') && (
                <Link to="/host" className="nav-link admin-link"><i className="fi fi-rr-home fi-sm" /> 房東後台</Link>
              )}
              {currentUser.role === 'admin' && (
                <Link to="/admin" className="nav-link admin-link"><i className="fi fi-rr-settings fi-sm" /> 管理後台</Link>
              )}
            </>
          )}
        </div>

        {/* Desktop actions */}
        <div className="navbar-actions desktop-only">
          <button className="btn-ghost lang-btn" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}>
            <i className="fi fi-rr-globe fi-sm" /> {lang === 'zh' ? 'EN' : '中文'}
          </button>
          {currentUser ? (
            <div className="user-menu">
              <Link to="/profile" className="user-name">
                <i className="fi fi-rr-user" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                {currentUser.name}
              </Link>
              <button className="btn-ghost btn-sm" onClick={handleLogout}>
                <i className="fi fi-rr-sign-out-alt fi-sm" /> 登出
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary btn-sm">
              <i className="fi fi-rr-sign-in-alt fi-sm" /> 登入
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger mobile-only" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <i className="fi fi-rr-cross" style={{ fontSize: 24 }} /> : <i className="fi fi-rr-menu-burger" style={{ fontSize: 24 }} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {[
            { to: '/', icon: 'fi-rr-home', label: '首頁' },
            { to: '/trip', icon: 'fi-rr-map', label: '行程規劃' },
            { to: '/hotel', icon: 'fi-rr-bed', label: '住宿訂房' },
            { to: '/ticket', icon: 'fi-rr-train-side', label: '火車訂票' },
          ].map(item => (
            <Link key={item.to} to={item.to} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              <i className={`fi ${item.icon} fi-sm`} style={{ marginRight: 6 }} />{item.label}
            </Link>
          ))}
          {currentUser && (
            <>
              <Link to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}><i className="fi fi-rr-user fi-sm" style={{ marginRight: 6 }} />個人中心</Link>
              <Link to="/hotel/favorites" className="mobile-nav-link" onClick={() => setMenuOpen(false)}><i className="fi fi-sr-heart fi-sm" style={{ marginRight: 6 }} />我的收藏</Link>
              <Link to="/hotel/cart" className="mobile-nav-link" onClick={() => setMenuOpen(false)}><i className="fi fi-rr-shopping-cart fi-sm" style={{ marginRight: 6 }} />購物車 {cartCount > 0 ? `(${cartCount})` : ''}</Link>
              {(currentUser.role === 'host' || currentUser.role === 'admin') && (
                <Link to="/host" className="mobile-nav-link" onClick={() => setMenuOpen(false)}><i className="fi fi-rr-home fi-sm" style={{ marginRight: 6 }} />房東後台</Link>
              )}
              {currentUser.role === 'admin' && (
                <Link to="/admin" className="mobile-nav-link" onClick={() => setMenuOpen(false)}><i className="fi fi-rr-settings fi-sm" style={{ marginRight: 6 }} />管理後台</Link>
              )}
            </>
          )}
          <div className="mobile-actions">
            <button className="btn-ghost" onClick={() => { setLang(lang === 'zh' ? 'en' : 'zh'); setMenuOpen(false); }}>
              <i className="fi fi-rr-globe fi-sm" /> {lang === 'zh' ? 'English' : '中文'}
            </button>
            {currentUser ? (
              <button className="btn-ghost" onClick={handleLogout}><i className="fi fi-rr-sign-out-alt fi-sm" /> 登出</button>
            ) : (
              <Link to="/login" className="btn-primary" onClick={() => setMenuOpen(false)}><i className="fi fi-rr-sign-in-alt fi-sm" /> 登入</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
