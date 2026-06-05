import { useMemo } from 'react';
import useStore from '../../../../store/useHotelStore';
import { t } from '../../i18n';

export default function DashboardPage() {
  const { lang, properties, orders } = useStore();
  const T = (key) => t(lang, key);

  const stats = useMemo(() => {
    const allOrders = orders;
    const revenue = allOrders
      .filter(o => o.status !== 'cancelled' && o.status !== 'conflict_cancelled')
      .reduce((s, o) => s + (o.finalAmount ?? 0), 0);
    const confirmed = allOrders.filter(o => o.status === 'confirmed').length;
    const totalNights = allOrders
      .filter(o => o.status !== 'cancelled' && o.status !== 'conflict_cancelled')
      .reduce((s, o) => s + (o.nights || 0), 0);
    const totalRooms = properties.reduce((s, p) => s + (p.rooms || []).reduce((r, rm) => r + (rm.quantity || 0), 0), 0);
    const occupancyRate = totalRooms > 0 ? Math.round((totalNights / (totalRooms * 30)) * 100) : 0;
    return { revenue, confirmed, occupancyRate, totalProperties: properties.filter(p => p.active).length };
  }, [properties, orders]);

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const STATUS_COLOR = { confirmed: '#10b981', cancelled: '#ef4444', completed: '#6366f1' };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">{T('admin.dashboard')}</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-blue"><i className="fi fi-rr-building" style={{ fontSize: 24 }} /></div>
          <div>
            <div className="stat-value">{stats.totalProperties}</div>
            <div className="stat-label">{T('admin.totalProperties')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-green"><i className="fi fi-rr-clipboard-list" style={{ fontSize: 24 }} /></div>
          <div>
            <div className="stat-value">{stats.confirmed}</div>
            <div className="stat-label">{T('admin.totalOrders')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-purple"><i className="fi fi-rr-dollar" style={{ fontSize: 24 }} /></div>
          <div>
            <div className="stat-value">NT$ {stats.revenue.toLocaleString()}</div>
            <div className="stat-label">{T('admin.totalRevenue')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-orange"><i className="fi fi-rr-sort" style={{ fontSize: 24 }} /></div>
          <div>
            <div className="stat-value">{stats.occupancyRate}%</div>
            <div className="stat-label">{T('admin.occupancyRate')}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">{T('admin.recentOrders')}</h2>
          {recentOrders.length === 0 ? (
            <p className="no-data">{T('common.noData')}</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{T('orders.orderNumber')}</th>
                  <th>{T('orders.propertyName')}</th>
                  <th>{T('orders.checkIn')}</th>
                  <th>{T('orders.totalAmount')}</th>
                  <th>{T('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td className="order-id">{o.id.slice(-8)}</td>
                    <td>{o.propertyName}</td>
                    <td>{o.checkIn}</td>
                    <td>NT$ {(o.finalAmount ?? 0).toLocaleString()}</td>
                    <td><span className="status-dot" style={{ background: STATUS_COLOR[o.status] }} /> {T(`orders.${o.status}`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="dashboard-card">
          <h2 className="dashboard-card-title">{lang === 'zh' ? '房源狀態' : 'Property Status'}</h2>
          <div className="property-status-list">
            {properties.slice(0, 5).map(p => (
              <div key={p.id} className="property-status-item">
                <img src={p.images[0]} alt="" className="prop-status-img" />
                <div className="prop-status-info">
                  <div className="prop-status-name">{lang === 'zh' ? p.name : (p.nameEn || p.name)}</div>
                  <div className="prop-status-meta">
                    <i className="fi fi-sr-star fi-xs" style={{ marginRight: 3, color: '#f59e0b' }} />{p.rating} · {p.reviewCount} {lang === 'zh' ? '評價' : 'reviews'}
                  </div>
                </div>
                <span className={`badge ${p.active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                  {p.active ? (lang === 'zh' ? '上架' : 'Active') : (lang === 'zh' ? '下架' : 'Inactive')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
