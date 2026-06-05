import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import useHotelStore from '../../../../store/useHotelStore';
import useAuthStore from '../../../../store/useAuthStore';
import { useToast } from '../../../../components/common/Toast';
import Modal from '../../../../components/common/Modal';

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
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth()); // 0-indexed
  const [editDayModal, setEditDayModal] = useState(null); // { dateStr, room, currentQty }
  const [editQty, setEditQty] = useState(0);

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

  // Calendar helpers
  const formatDate = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const getBookedCount = (roomId, dateStr) =>
    propOrders.filter(o => o.roomId === roomId && o.checkIn <= dateStr && o.checkOut > dateStr).length;

  const getRoomAvailableOnDate = (room, dateStr) => {
    const override = (room.dailyOverrides || {})[dateStr];
    const base = override !== undefined ? override : (quantities[room.id] ?? room.quantity ?? 0);
    return Math.max(0, base - getBookedCount(room.id, dateStr));
  };

  const hasAnyBookingOnDate = (dateStr) =>
    (prop.rooms || []).some(r => getBookedCount(r.id, dateStr) > 0);

  const handleSaveDailyOverride = (room, dateStr, qty) => {
    const updatedRooms = (prop.rooms || []).map(r => {
      if (r.id !== room.id) return r;
      const dailyOverrides = { ...(r.dailyOverrides || {}), [dateStr]: Number(qty) };
      return { ...r, dailyOverrides };
    });
    updateProperty(prop.id, { rooms: updatedRooms });
    addToast(`${dateStr} 庫存已更新`, 'success');
    setEditDayModal(null);
  };

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];
  const todayStr = new Date().toISOString().split('T')[0];

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
          {viewMode === 'list' && (
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              <i className="fi fi-rr-check fi-sm" style={{ marginRight: 6 }} /> 儲存庫存
            </button>
          )}
          <Link to="/host/properties" className="btn-ghost" style={{ textDecoration: 'none' }}>返回</Link>
        </div>
      </div>

      {/* 視圖切換 */}
      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        <button className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
          <i className="fi fi-rr-list fi-xs" style={{ marginRight: 4 }} />庫存設定
        </button>
        <button className={`tab-btn ${viewMode === 'calendar' ? 'active' : ''}`} onClick={() => setViewMode('calendar')}>
          <i className="fi fi-rr-calendar fi-xs" style={{ marginRight: 4 }} />月曆視圖
        </button>
      </div>

      {/* ── 月曆視圖 ── */}
      {viewMode === 'calendar' && (prop.rooms || []).length > 0 && (
        <div>
          {/* 月份導覽 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <button className="btn-ghost btn-sm" onClick={() => {
              if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
              else setCalMonth(m => m - 1);
            }}>
              <i className="fi fi-rr-angle-left fi-sm" />
            </button>
            <span style={{ fontWeight: 700, fontSize: 16, minWidth: 80, textAlign: 'center' }}>
              {calYear} 年 {MONTH_NAMES[calMonth]}
            </span>
            <button className="btn-ghost btn-sm" onClick={() => {
              if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
              else setCalMonth(m => m + 1);
            }}>
              <i className="fi fi-rr-angle-right fi-sm" />
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-light, #888)', marginLeft: 8 }}>
              點擊日期可調整當日庫存
            </span>
          </div>

          {/* 圖例 */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#dcfce7', border: '1px solid #86efac', display: 'inline-block' }} />充足
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#fef3c7', border: '1px solid #fcd34d', display: 'inline-block' }} />少量
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#fee2e2', border: '1px solid #fca5a5', display: 'inline-block' }} />已售完/無庫存
            </span>
          </div>

          {/* 日曆格 */}
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(90px, 1fr))', gap: 2, minWidth: 630 }}>
              {/* 星期標題 */}
              {DAY_NAMES.map(d => (
                <div key={d} style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, padding: '6px 0', color: 'var(--text-light, #888)', background: 'var(--bg)' }}>{d}</div>
              ))}
              {/* 空白前置 */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} style={{ background: 'transparent' }} />
              ))}
              {/* 日期格 */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = formatDate(calYear, calMonth, day);
                const isPast = dateStr < todayStr;
                const isBooked = hasAnyBookingOnDate(dateStr);
                const rooms = prop.rooms || [];

                return (
                  <div
                    key={dateStr}
                    onClick={() => {
                      if (isPast) return;
                      setEditDayModal({ dateStr, rooms });
                    }}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      padding: '6px 8px',
                      minHeight: 70,
                      cursor: isPast ? 'default' : 'pointer',
                      background: isPast ? '#f9fafb' : 'white',
                      opacity: isPast ? 0.6 : 1,
                      transition: 'box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { if (!isPast) e.currentTarget.style.boxShadow = '0 0 0 2px var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: isBooked ? '#dc2626' : 'inherit' }}>
                      {day}
                    </div>
                    {rooms.map(room => {
                      const avail = getRoomAvailableOnDate(room, dateStr);
                      const total = quantities[room.id] ?? room.quantity ?? 0;
                      const pct = total > 0 ? avail / total : 0;
                      const bg = avail === 0 ? '#fee2e2' : pct <= 0.3 ? '#fef3c7' : '#dcfce7';
                      const border = avail === 0 ? '#fca5a5' : pct <= 0.3 ? '#fcd34d' : '#86efac';
                      return (
                        <div key={room.id} style={{
                          fontSize: 10, marginBottom: 2, padding: '1px 4px',
                          borderRadius: 3, background: bg, border: `1px solid ${border}`,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {room.typeName}：{avail}/{total}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 庫存設定（原有列表） ── */}
      {viewMode === 'list' && (prop.rooms || []).length === 0 ? (
        <p style={{ color: 'var(--text-light, #888)' }}>此房源沒有設定任何房型</p>
      ) : viewMode === 'list' && (
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

      {/* ── 每日庫存編輯 Modal ── */}
      <Modal
        isOpen={!!editDayModal}
        onClose={() => setEditDayModal(null)}
        title={`調整庫存 — ${editDayModal?.dateStr}`}
        size="sm"
      >
        {editDayModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-light, #888)' }}>
              設定當日各房型可用數量（覆蓋預設值）
            </p>
            {editDayModal.rooms.map(room => {
              const override = (room.dailyOverrides || {})[editDayModal.dateStr];
              const base = override !== undefined ? override : (quantities[room.id] ?? room.quantity ?? 0);
              const booked = getBookedCount(room.id, editDayModal.dateStr);
              const isBooked = booked > 0;
              return (
                <div key={room.id} style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, background: isBooked ? '#fef2f2' : 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{room.typeName}</div>
                      {isBooked && (
                        <div style={{ fontSize: 12, color: '#dc2626', marginTop: 2 }}>
                          <i className="fi fi-rr-exclamation fi-xs" style={{ marginRight: 3 }} />已訂出 {booked} 間，無法低於此數量
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <label style={{ fontSize: 13 }}>數量</label>
                      <input
                        className="form-input"
                        type="number"
                        min={booked}
                        max={room.quantity}
                        defaultValue={base}
                        id={`qty-${room.id}`}
                        style={{ width: 70, textAlign: 'center' }}
                        disabled={isBooked && booked >= (room.quantity ?? 0)}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <button
                      className="btn-primary btn-sm"
                      disabled={isBooked && booked >= (room.quantity ?? 0)}
                      onClick={() => {
                        const input = document.getElementById(`qty-${room.id}`);
                        const qty = Number(input?.value ?? base);
                        handleSaveDailyOverride(room, editDayModal.dateStr, Math.max(booked, qty));
                      }}
                    >
                      <i className="fi fi-rr-check fi-xs" style={{ marginRight: 4 }} />儲存此房型
                    </button>
                    {override !== undefined && (
                      <button
                        className="btn-ghost btn-sm"
                        style={{ marginLeft: 6 }}
                        onClick={() => handleSaveDailyOverride(room, editDayModal.dateStr, room.quantity)}
                      >
                        重設為預設值
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setEditDayModal(null)}>關閉</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
