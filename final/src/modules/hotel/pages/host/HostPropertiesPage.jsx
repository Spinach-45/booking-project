import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useHotelStore from '../../../../store/useHotelStore';
import useAuthStore from '../../../../store/useAuthStore';
import ConfirmDialog from '../../../../components/common/ConfirmDialog';
import { useToast } from '../../../../components/common/Toast';

function PropStatusBadge({ prop }) {
  if (prop.status === 'pending') return <span className="badge badge-pending">審核中</span>;
  if (prop.status === 'rejected') return <span className="badge badge-cancelled">已退回</span>;
  if (prop.active || prop.status === 'active') return <span className="badge badge-confirmed">上架中</span>;
  return <span className="badge badge-cancelled">下架</span>;
}

export default function HostPropertiesPage() {
  const { getHostProperties, updateProperty } = useHotelStore();
  const { currentUser } = useAuthStore();
  const addToast = useToast();

  const properties = useMemo(() => getHostProperties(currentUser?.id), [currentUser?.id]);

  const [toggleConfirm, setToggleConfirm] = useState(null); // property

  const handleToggle = (prop) => {
    const newActive = !(prop.active || prop.status === 'active');
    updateProperty(prop.id, { active: newActive, status: newActive ? 'active' : 'inactive' });
    addToast(newActive ? `「${prop.name}」已上架` : `「${prop.name}」已下架`, 'success');
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fi fi-rr-building" style={{ fontSize: 20 }} /> 我的房源
        </h1>
        <Link to="/host/properties/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          <i className="fi fi-rr-plus fi-sm" style={{ marginRight: 6 }} /> 新增房源
        </Link>
      </div>

      {properties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-light, #888)' }}>
          <i className="fi fi-rr-building" style={{ fontSize: 48, display: 'block', marginBottom: 16 }} />
          <p>您還沒有任何房源</p>
          <Link to="/host/properties/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: 12 }}>
            立即新增房源
          </Link>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>房源</th>
                <th>地點</th>
                <th>房型數</th>
                <th>最低價</th>
                <th>評分</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(prop => (
                <tr key={prop.id}>
                  <td>
                    <div className="prop-cell">
                      {prop.images?.[0] && (
                        <img src={prop.images[0]} alt="" className="prop-thumb" />
                      )}
                      <div>
                        <div className="prop-cell-name">{prop.name}</div>
                        <div className="prop-cell-sub">{prop.address}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {prop.station || prop.area || '-'}
                    {prop.distanceToStation && (
                      <div style={{ fontSize: 12, color: 'var(--text-light, #888)' }}>
                        {prop.distanceToStation}m
                      </div>
                    )}
                  </td>
                  <td>{prop.rooms?.length || 0} 種</td>
                  <td>
                    {prop.rooms?.length > 0
                      ? `NT$ ${Math.min(...prop.rooms.map(r => r.price)).toLocaleString()}`
                      : '-'}
                  </td>
                  <td>
                    <i className="fi fi-sr-star fi-xs" style={{ marginRight: 3, color: '#f59e0b' }} />
                    {prop.rating || '-'}
                  </td>
                  <td><PropStatusBadge prop={prop} /></td>
                  <td>
                    <div className="action-btns">
                      <Link
                        to={`/host/properties/${prop.id}/view`}
                        className="btn-icon-sm"
                        title="檢視"
                        style={{ textDecoration: 'none' }}
                      >
                        <i className="fi fi-rr-eye fi-sm" />
                      </Link>
                      <Link
                        to={`/host/properties/${prop.id}/edit`}
                        className="btn-icon-sm"
                        title="編輯"
                        style={{ textDecoration: 'none' }}
                      >
                        <i className="fi fi-rr-pencil fi-sm" />
                      </Link>
                      <Link
                        to={`/host/rooms/${prop.id}`}
                        className="btn-icon-sm"
                        title="管理庫存"
                        style={{ textDecoration: 'none' }}
                      >
                        <i className="fi fi-rr-tag fi-sm" />
                      </Link>
                      <Link
                        to={`/host/pricing/${prop.id}`}
                        className="btn-icon-sm"
                        title="定價"
                        style={{ textDecoration: 'none' }}
                      >
                        <i className="fi fi-rr-dollar fi-sm" />
                      </Link>
                      {prop.status !== 'pending' && (
                        <button
                          className={`toggle-btn ${(prop.active || prop.status === 'active') ? 'active' : ''}`}
                          onClick={() => setToggleConfirm(prop)}
                          title={(prop.active || prop.status === 'active') ? '下架' : '上架'}
                        >
                          {(prop.active || prop.status === 'active')
                            ? <><i className="fi fi-rr-eye fi-sm" /> 上架</>
                            : <><i className="fi fi-rr-eye-crossed fi-sm" /> 下架</>}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!toggleConfirm}
        onClose={() => setToggleConfirm(null)}
        onConfirm={() => handleToggle(toggleConfirm)}
        title={(toggleConfirm?.active || toggleConfirm?.status === 'active') ? '下架房源' : '上架房源'}
        message={
          (toggleConfirm?.active || toggleConfirm?.status === 'active')
            ? `確定將「${toggleConfirm?.name}」下架？`
            : `確定將「${toggleConfirm?.name}」上架？`
        }
        confirmLabel="確認"
        confirmClass={(toggleConfirm?.active || toggleConfirm?.status === 'active') ? 'btn-danger' : 'btn-primary'}
      />
    </div>
  );
}
