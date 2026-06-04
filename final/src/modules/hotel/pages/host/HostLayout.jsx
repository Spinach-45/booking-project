import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import useAuthStore from '../../../../store/useAuthStore';

const NAV_ITEMS = [
  { path: '/host', icon: <i className="fi fi-rr-home fi-sm" />, label: '總覽', exact: true },
  { path: '/host/properties', icon: <i className="fi fi-rr-building fi-sm" />, label: '我的房源' },
  { path: '/host/orders', icon: <i className="fi fi-rr-clipboard-list fi-sm" />, label: '訂單管理' },
  { path: '/host/discounts', icon: <i className="fi fi-rr-percentage fi-sm" />, label: '折扣活動' },
];

export default function HostLayout() {
  const { currentUser } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-brand">
            <i className="fi fi-rr-home fi-sm" style={{ marginRight: 6 }} />
            {sidebarOpen && '房東後台'}
          </span>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen
              ? <i className="fi fi-rr-cross fi-sm" />
              : <i className="fi fi-rr-menu-burger fi-sm" />}
          </button>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          {sidebarOpen && currentUser && (
            <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-light, #888)', borderTop: '1px solid var(--border)' }}>
              <i className="fi fi-rr-user fi-sm" style={{ marginRight: 6 }} />
              {currentUser.name}
            </div>
          )}
          <Link to="/hotel" className="admin-nav-item">
            <i className="fi fi-rr-arrow-left fi-sm" />
            {sidebarOpen && <span>返回前台</span>}
          </Link>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
