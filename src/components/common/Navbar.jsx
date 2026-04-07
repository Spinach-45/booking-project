import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, MessageSquare, ClipboardList, Settings, LogOut, LogIn, Globe, Menu, X, Home } from 'lucide-react';
import useStore from '../../store/useStore';
import { t } from '../../i18n';

export default function Navbar() {
  const { lang, setLang, currentUser, logout, cart, favorites } = useStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const T = (key) => t(lang, key);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const cartCount = cart.filter(c => !currentUser || c.userId === currentUser.id).length;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏨</span>
          <span className="brand-text">BookingTW</span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links desktop-only">
          <Link to="/" className="nav-link">
            <Home size={16} /> {T('nav.home')}
          </Link>
          <Link to="/properties" className="nav-link">
            {T('nav.properties')}
          </Link>
          {currentUser && (
            <>
              <Link to="/orders" className="nav-link">
                <ClipboardList size={16} /> {T('nav.orders')}
              </Link>
              <Link to="/favorites" className="nav-link">
                <Heart size={16} />
                {favorites.length > 0 && <span className="badge">{favorites.length}</span>}
              </Link>
              <Link to="/cart" className="nav-link">
                <ShoppingCart size={16} />
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>
              <Link to="/chat" className="nav-link">
                <MessageSquare size={16} />
              </Link>
              {currentUser.role === 'admin' && (
                <Link to="/admin" className="nav-link admin-link">
                  <Settings size={16} /> {T('nav.admin')}
                </Link>
              )}
            </>
          )}
        </div>

        <div className="navbar-actions desktop-only">
          <button
            className="btn-ghost lang-btn"
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          >
            <Globe size={16} />
            {lang === 'zh' ? 'EN' : '中文'}
          </button>
          {currentUser ? (
            <div className="user-menu">
              <span className="user-name">👤 {currentUser.name}</span>
              <button className="btn-ghost" onClick={handleLogout}>
                <LogOut size={16} /> {T('nav.logout')}
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary">
              <LogIn size={16} /> {T('nav.login')}
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
          <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>{T('nav.home')}</Link>
          <Link to="/properties" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>{T('nav.properties')}</Link>
          {currentUser && (
            <>
              <Link to="/orders" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>{T('nav.orders')}</Link>
              <Link to="/favorites" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>{T('nav.favorites')}</Link>
              <Link to="/cart" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>{T('nav.cart')} {cartCount > 0 && `(${cartCount})`}</Link>
              <Link to="/chat" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>{T('nav.chat')}</Link>
              {currentUser.role === 'admin' && (
                <Link to="/admin" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>{T('nav.admin')}</Link>
              )}
            </>
          )}
          <div className="mobile-actions">
            <button className="btn-ghost" onClick={() => { setLang(lang === 'zh' ? 'en' : 'zh'); setMenuOpen(false); }}>
              <Globe size={16} /> {lang === 'zh' ? 'English' : '中文'}
            </button>
            {currentUser ? (
              <button className="btn-ghost" onClick={handleLogout}><LogOut size={16} /> {T('nav.logout')}</button>
            ) : (
              <Link to="/login" className="btn-primary" onClick={() => setMenuOpen(false)}>{T('nav.login')}</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
