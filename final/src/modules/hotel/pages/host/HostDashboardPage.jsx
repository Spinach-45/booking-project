import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useHotelStore from '../../../../store/useHotelStore';
import useAuthStore from '../../../../store/useAuthStore';

export default function HostDashboardPage() {
  const { getHostProperties, getHostOrders } = useHotelStore();
  const { currentUser } = useAuthStore();

  const hostId = currentUser?.id;

  const properties = useMemo(() => getHostProperties(hostId), [hostId]);
  const orders = useMemo(() => getHostOrders(hostId), [hostId]);

  const stats = useMemo(() => {
    const activeProps = properties.filter(p => p.status === 'active' || p.active);
    const pendingOrders = orders.filter(o => o.status === 'confirmed');
    const revenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + (o.finalAmount || o.totalAmount || 0), 0);
    return {
      totalProperties: properties.length,
      activeProperties: activeProps.length,
      pendingOrders: pendingOrders.length,
      revenue,
    };
  }, [properties, orders]);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const STATUS_LABEL = { confirmed: '待入住', completed: '已完成', cancelled: '已取消' };
  const STATUS_BADGE = { confirmed: 'badge-confirmed', completed: 'badge-completed', cancelled: 'badge-cancelled' };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">
        <i className="fi fi-rr-home" style={{ fontSize: 20 }} /> 房東總覽
        {currentUser && <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 12, color: 'var(--text-light, #888)' }}>
          歡迎，{currentUser.name}
        </span>}
      </h1>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-blue">
            <i className="fi fi-rr-building" style={{ fontSize: 24 }} />
          </div>
          <div>
            <div className="stat-value">{stats.totalProperties}</div>
            <div className="stat-label">我的房源</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-green">
            <i className="fi fi-rr-eye" style={{ fontSize: 24 }} />
          </div>
          <div>
            <div className="stat-value">{stats.activeProperties}</div>
            <div className="stat-label">上架中</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-orange">
            <i className="fi fi-rr-clipboard-list" style={{ fontSize: 24 }} />
          </div>
          <div>
            <div className="stat-value">{stats.pendingOrders}</div>
            <div className="stat-label">待入住訂單</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-purple">
            <i className="fi fi-rr-dollar" style={{ fontSize: 24 }} />
          </div>
          <div>
            <div className="stat-value">NT$ {stats.revenue.toLocaleString()}</div>
            <div className="stat-label">累計收益</div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="dashboard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 className="dashboard-card-title">最近訂單</h2>
            <Link to="/host/orders" style={{ fontSize: 13, color: 'var(--primary)' }}>查看全部</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="no-data">目前沒有訂單</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>訂單編號</th>
                  <th>房源</th>
                  <th>入住日</th>
                  <th>金額</th>
                  <th>狀態</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td className="order-id">{o.id.slice(-8)}</td>
                    <td>{o.propertyName || '-'}</td>
                    <td>{o.checkIn}</td>
                    <td>NT$ {(o.finalAmount || o.totalAmount || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[o.status] || ''}`}>
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">快速操作</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <Link to="/host/properties/new" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              <i className="fi fi-rr-plus fi-sm" style={{ marginRight: 6 }} /> 新增房源
            </Link>
            <Link to="/host/properties" className="btn-ghost" style={{ textAlign: 'center', textDecoration: 'none' }}>
              <i className="fi fi-rr-building fi-sm" style={{ marginRight: 6 }} /> 管理房源
            </Link>
            <Link to="/host/orders" className="btn-ghost" style={{ textAlign: 'center', textDecoration: 'none' }}>
              <i className="fi fi-rr-clipboard-list fi-sm" style={{ marginRight: 6 }} /> 查看訂單
            </Link>
            <Link to="/host/discounts" className="btn-ghost" style={{ textAlign: 'center', textDecoration: 'none' }}>
              <i className="fi fi-rr-percentage fi-sm" style={{ marginRight: 6 }} /> 折扣活動
            </Link>
          </div>

          {/* Properties Summary */}
          {properties.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>我的房源狀態</h3>
              {properties.slice(0, 4).map(p => (
                <div key={p.id} className="property-status-item">
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt="" className="prop-status-img" />
                  )}
                  <div className="prop-status-info">
                    <div className="prop-status-name">{p.name}</div>
                    <div className="prop-status-meta">
                      {p.rooms?.length || 0} 種房型
                    </div>
                  </div>
                  <span className={`badge ${
                    p.status === 'pending' ? 'badge-pending' :
                    p.status === 'rejected' ? 'badge-cancelled' :
                    (p.active || p.status === 'active') ? 'badge-confirmed' : 'badge-cancelled'
                  }`}>
                    {p.status === 'pending' ? '審核中' :
                     p.status === 'rejected' ? '已退回' :
                     (p.active || p.status === 'active') ? '上架中' : '下架'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
