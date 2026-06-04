import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import useHotelStore from '../../../../store/useHotelStore';
import useAuthStore from '../../../../store/useAuthStore';
import { useToast } from '../../../../components/common/Toast';

export default function HostRoomsPage() {
  const { propId } = useParams();
  const { getHostProperties, updateProperty, getHostOrders } = useHotelStore();
  const { currentUser } = useAuthStore();
  const addToast = useToast();

  const properties = useMemo(() => getHostProperties(currentUser?.id), [currentUser?.id]);
  const prop = properties.find(p => p.id === propId);

  const orders = useMemo(() => getHostOrders(currentUser?.id), [currentUser?.id]);
  const propOrders = orders.filter(o => o.propertyId === propId && o.status !== 'cancelled');

  const [quantities, setQuantities] = useState(() => {
    if (!prop) return {};
    return Object.fromEntries((prop.rooms || []).map(r => [r.id, r.quantity]));
  });

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!prop) return;
    setSaving(true);
    const updatedRooms = prop.rooms.map(r => ({
      ...r,
      quantity: quantities[r.id] ?? r.quantity,
    }));
    updateProperty(prop.id, { rooms: updatedRooms });
    addToast('庫存已更新', 'success');
    setSaving(false);
  };

  // Get booked dates per room type
  const getBookedDates = (roomId) => {
    return propOrders
      .filter(o => o.roomId === roomId)
      .map(o => ({ checkIn: o.checkIn, checkOut: o.checkOut, guestName: o.guestName || o.userName || '房客' }));
  };

  if (!prop) {
    return (
      <div className="admin-page">
        <h1 className="admin-page-title">房源不存在</h1>
        <Link to="/host/properties" className="btn-ghost">返回</Link>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fi fi-rr-tag" style={{ fontSize: 20 }} /> 庫存管理 - {prop.name}
        </h1>
        <div className="action-btns">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            <i className="fi fi-rr-check fi-sm" style={{ marginRight: 6 }} /> 儲存庫存
          </button>
          <Link to="/host/properties" className="btn-ghost" style={{ textDecoration: 'none' }}>返回</Link>
        </div>
      </div>

      {(prop.rooms || []).length === 0 ? (
        <p style={{ color: 'var(--text-light, #888)' }}>此房源沒有設定任何房型</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {(prop.rooms || []).map(room => {
            const bookedDates = getBookedDates(room.id);
            return (
              <div key={room.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{room.typeName}</h3>
                    <span style={{ fontSize: 13, color: 'var(--text-light, #888)' }}>
                      NT$ {(room.price || 0).toLocaleString()}/晚 · 最多 {room.maxGuests} 人
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label style={{ fontSize: 14, fontWeight: 500 }}>數量</label>
                    <input
                      className="form-input"
                      type="number"
                      min={0}
                      value={quantities[room.id] ?? room.quantity}
                      onChange={e => setQuantities(q => ({ ...q, [room.id]: Number(e.target.value) }))}
                      style={{ width: 80, textAlign: 'center' }}
                    />
                  </div>
                </div>

                {/* Booked dates */}
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    已預訂紀錄 ({bookedDates.length} 筆)
                  </h4>
                  {bookedDates.length === 0 ? (
                    <p style={{ color: 'var(--text-light, #888)', fontSize: 13 }}>目前無預訂</p>
                  ) : (
                    <div className="admin-table-wrap" style={{ margin: 0 }}>
                      <table className="admin-table" style={{ fontSize: 13 }}>
                        <thead>
                          <tr>
                            <th>入住日</th>
                            <th>退房日</th>
                            <th>房客</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookedDates.map((d, i) => (
                            <tr key={i}>
                              <td>{d.checkIn}</td>
                              <td>{d.checkOut}</td>
                              <td>{d.guestName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
