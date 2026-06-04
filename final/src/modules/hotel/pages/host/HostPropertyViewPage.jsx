import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import useHotelStore from '../../../../store/useHotelStore';
import useAuthStore from '../../../../store/useAuthStore';

const AMENITY_LABEL = {
  wifi: 'Wi-Fi', aircon: '冷氣', tv: '電視', parking: '停車場',
  breakfast: '早餐', elevator: '電梯', pool: '游泳池', gym: '健身房',
  kitchen: '廚房', laundry: '洗衣設備', balcony: '陽台', cityView: '城市景觀',
};

export default function HostPropertyViewPage() {
  const { id } = useParams();
  const { getHostProperties } = useHotelStore();
  const { currentUser } = useAuthStore();

  const properties = useMemo(() => getHostProperties(currentUser?.id), [currentUser?.id]);
  const prop = properties.find(p => p.id === id);

  if (!prop) {
    return (
      <div className="admin-page">
        <h1 className="admin-page-title">房源不存在</h1>
        <Link to="/host/properties" className="btn-ghost">返回房源列表</Link>
      </div>
    );
  }

  const statusInfo = () => {
    if (prop.status === 'pending') return { label: '審核中', cls: 'badge-pending' };
    if (prop.status === 'rejected') return { label: '已退回', cls: 'badge-cancelled' };
    if (prop.active || prop.status === 'active') return { label: '上架中', cls: 'badge-confirmed' };
    return { label: '下架', cls: 'badge-cancelled' };
  };
  const status = statusInfo();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fi fi-rr-building" style={{ fontSize: 20 }} /> {prop.name}
        </h1>
        <div className="action-btns">
          <Link to={`/host/properties/${prop.id}/edit`} className="btn-primary" style={{ textDecoration: 'none' }}>
            <i className="fi fi-rr-pencil fi-sm" style={{ marginRight: 6 }} /> 編輯
          </Link>
          <Link to="/host/properties" className="btn-ghost" style={{ textDecoration: 'none' }}>返回</Link>
        </div>
      </div>

      {/* Images */}
      {prop.images?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto' }}>
          {prop.images.slice(0, 4).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${prop.name} ${i + 1}`}
              style={{ width: 200, height: 140, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
            />
          ))}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Basic Info */}
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">基本資訊</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>狀態</label>
              <span className={`badge ${status.cls}`}>{status.label}</span>
            </div>
            <div className="form-group">
              <label>地區</label>
              <p>{prop.area || '-'}</p>
            </div>
            <div className="form-group form-full">
              <label>地址</label>
              <p>{prop.address || '-'}</p>
            </div>
            <div className="form-group">
              <label>最近車站</label>
              <p>{prop.station || '-'}</p>
            </div>
            <div className="form-group">
              <label>距車站</label>
              <p>{prop.distanceToStation || prop.stationDistance || '-'} 公尺</p>
            </div>
            <div className="form-group">
              <label>入住時間</label>
              <p>{prop.checkInTime || '-'}</p>
            </div>
            <div className="form-group">
              <label>退房時間</label>
              <p>{prop.checkOutTime || '-'}</p>
            </div>
            <div className="form-group">
              <label>評分</label>
              <p><i className="fi fi-sr-star fi-xs" style={{ color: '#f59e0b', marginRight: 4 }} />{prop.rating || '-'} ({prop.reviewCount || 0} 評價)</p>
            </div>
          </div>
          {prop.description && (
            <div style={{ marginTop: 12 }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>描述</label>
              <p style={{ marginTop: 4, color: 'var(--text-light, #666)', lineHeight: 1.6 }}>{prop.description}</p>
            </div>
          )}
        </div>

        {/* Amenities & Policy */}
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">設施與政策</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 8 }}>設施</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(prop.amenities || []).map(a => (
                <span key={a} className="badge" style={{ fontSize: 12 }}>
                  {AMENITY_LABEL[a] || a}
                </span>
              ))}
              {prop.petAllowed && <span className="badge" style={{ fontSize: 12 }}>允許寵物</span>}
              {prop.smokingAllowed && <span className="badge" style={{ fontSize: 12 }}>允許吸煙</span>}
            </div>
          </div>
          {prop.cancellationPolicy && (
            <div>
              <label style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 8 }}>取消政策</label>
              <p style={{ color: 'var(--text-light, #666)', lineHeight: 1.6, fontSize: 14 }}>{prop.cancellationPolicy}</p>
            </div>
          )}
          {prop.status === 'rejected' && prop.rejectReason && (
            <div style={{ marginTop: 16, padding: 12, background: '#fee', borderRadius: 8, border: '1px solid #fcc' }}>
              <strong style={{ color: '#c00' }}>退回原因：</strong>
              <p style={{ marginTop: 4, color: '#c00' }}>{prop.rejectReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Rooms */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 12 }}>房型設定</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>房型名稱</th>
                <th>類型</th>
                <th>價格 (NT$/晚)</th>
                <th>最多人數</th>
                <th>數量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {(prop.rooms || []).map(room => (
                <tr key={room.id}>
                  <td>{room.typeName || '-'}</td>
                  <td>{room.type || '-'}</td>
                  <td>NT$ {(room.price || 0).toLocaleString()}</td>
                  <td>{room.maxGuests || '-'}</td>
                  <td>{room.quantity || '-'}</td>
                  <td>
                    <Link
                      to={`/host/pricing/${prop.id}`}
                      className="btn-sm btn-outline"
                      style={{ textDecoration: 'none' }}
                    >
                      <i className="fi fi-rr-dollar fi-sm" /> 定價
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
