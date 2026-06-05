import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import useStore from '../../../../store/useHotelStore';
import { t } from '../../i18n';

const NAV_ITEMS = [
  { path: '/admin', icon: <i className="fi fi-rr-settings fi-sm" />, key: 'admin.dashboard', exact: true },
  { path: '/admin/properties', icon: <i className="fi fi-rr-building fi-sm" />, key: 'admin.propertyManagement' },
  { path: '/admin/inventory', icon: <i className="fi fi-rr-tag fi-sm" />, key: 'admin.inventoryManagement' },
  { path: '/admin/pricing', icon: <i className="fi fi-rr-dollar fi-sm" />, key: 'admin.pricingManagement' },
  { path: '/admin/discounts', icon: <i className="fi fi-rr-percentage fi-sm" />, key: 'admin.discountManagement' },
  { path: '/admin/orders', icon: <i className="fi fi-rr-clipboard-list fi-sm" />, key: 'admin.orderManagement' },
  { path: '/admin/ads', icon: <i className="fi fi-rr-megaphone fi-sm" />, key: 'admin.adManagement' },
  { path: '/admin/refunds', icon: <i className="fi fi-rr-arrows-h fi-sm" />, label: '審核退款' },
  { path: '/admin/approval', icon: <i className="fi fi-rr-building fi-sm" />, label: '審核房源' },
  { path: '/admin/accounts', icon: <i className="fi fi-rr-users fi-sm" />, label: '帳號管理' },
  { path: '/admin/pricing-rules', icon: <i className="fi fi-rr-dollar fi-sm" />, label: '定價規則' },
  { path: '/admin/conflict-logs', icon: <i className="fi fi-rr-exclamation fi-sm" />, label: '衝突紀錄' },
];

export default function AdminLayout() {
  const { lang } = useStore();
  const location = useLocation();
  const T = (key) => t(lang, key);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-brand"><i className="fi fi-rr-settings fi-sm" style={{ marginRight: 6 }} />{T('admin.title')}</span>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <i className="fi fi-rr-cross fi-sm" /> : <i className="fi fi-rr-menu-burger fi-sm" />}
          </button>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <Link key={item.path} to={item.path} className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}>
              {item.icon}
              {sidebarOpen && <span>{item.label || T(item.key)}</span>}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/hotel" className="admin-nav-item">
            <i className="fi fi-rr-home fi-sm" /> {sidebarOpen && (lang === 'zh' ? '返回前台' : 'Back to Site')}
          </Link>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
