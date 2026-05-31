import { useState } from 'react';
import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, Package, DollarSign, Tag, ClipboardList, Megaphone, Menu, X } from 'lucide-react';
import useStore from '../../../../store/useHotelStore';
import { t } from '../../i18n';

const NAV_ITEMS = [
  { path: '/admin', icon: <LayoutDashboard size={18} />, key: 'admin.dashboard', exact: true },
  { path: '/admin/properties', icon: <Building2 size={18} />, key: 'admin.propertyManagement' },
  { path: '/admin/inventory', icon: <Package size={18} />, key: 'admin.inventoryManagement' },
  { path: '/admin/pricing', icon: <DollarSign size={18} />, key: 'admin.pricingManagement' },
  { path: '/admin/discounts', icon: <Tag size={18} />, key: 'admin.discountManagement' },
  { path: '/admin/orders', icon: <ClipboardList size={18} />, key: 'admin.orderManagement' },
  { path: '/admin/ads', icon: <Megaphone size={18} />, key: 'admin.adManagement' },
];

export default function AdminLayout() {
  const { currentUser, lang } = useStore();
  const location = useLocation();
  const T = (key) => t(lang, key);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-brand">⚙️ {T('admin.title')}</span>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <Link key={item.path} to={item.path} className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}>
              {item.icon}
              {sidebarOpen && <span>{T(item.key)}</span>}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/hotel" className="admin-nav-item">
            🏠 {sidebarOpen && (lang === 'zh' ? '返回前台' : 'Back to Site')}
          </Link>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
