import { useState } from 'react';
import useStore from '../../../../store/useHotelStore';
import { t } from '../../i18n';
import Modal from '../../../../components/common/Modal';
import { useToast } from '../../../../components/common/Toast';

const STATIONS = ['台北車站', '松山車站', '基隆車站', '板橋車站', '汐止車站', '三重車站', '桃園車站', '中壢車站'];
const AREAS = [
  { value: 'taipei', label: '台北' },
  { value: 'keelung', label: '基隆' },
  { value: 'newTaipei', label: '新北' },
  { value: 'taoyuan', label: '桃園' },
];
const AMENITIES_LIST = ['wifi', 'parking', 'breakfast', 'aircon', 'tv', 'kitchen', 'laundry', 'gym', 'pool', 'elevator', 'petFriendly', 'balcony', 'cityView'];
const ROOM_TYPES = [
  { value: 'single', label: '單人房' },
  { value: 'double', label: '雙人房' },
  { value: 'twin', label: '雙床房' },
  { value: 'suite', label: '套房' },
  { value: 'deluxe', label: '豪華房' },
  { value: 'family', label: '家庭房' },
  { value: 'dormitory', label: '背包客床位' },
];

const emptyRoom = () => ({ id: `room-${Date.now()}`, type: 'double', typeName: '雙人房', typeNameEn: 'Double Room', price: 2000, maxGuests: 2, quantity: 2 });

const emptyProp = () => ({
  name: '', nameEn: '', description: '', descriptionEn: '',
  station: '台北車站', stationEn: 'Taipei Main Station', area: 'taipei',
  address: '', addressEn: '', distanceToStation: 200,
  hostId: `host-${Date.now()}`, hostName: '', hostAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
  hostJoined: new Date().toISOString().split('T')[0],
  hostResponseRate: 95, hostVerified: false,
  images: ['https://picsum.photos/seed/new001/800/600'],
  rooms: [emptyRoom()],
  amenities: ['wifi', 'aircon'],
  petAllowed: false, smokingAllowed: false,
  checkInTime: '15:00', checkOutTime: '11:00',
  rating: 4.0, reviewCount: 0, featured: false, active: true,
});

export default function AdminPropertiesPage() {
  const { lang, properties, addProperty, updateProperty, deleteProperty } = useStore();
  const addToast = useToast();
  const T = (key) => t(lang, key);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyProp());

  const openAdd = () => { setEditTarget(null); setForm(emptyProp()); setShowModal(true); };
  const openEdit = (prop) => { setEditTarget(prop); setForm({ ...prop }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.hostName) { addToast(lang === 'zh' ? '請填寫必要欄位' : 'Please fill required fields', 'error'); return; }
    if (editTarget) {
      updateProperty(editTarget.id, form);
      addToast(T('common.success'), 'success');
    } else {
      addProperty(form);
      addToast(lang === 'zh' ? '房源已新增' : 'Property added', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm(lang === 'zh' ? '確定刪除此房源？' : 'Delete this property?')) {
      deleteProperty(id);
      addToast(lang === 'zh' ? '已刪除' : 'Deleted', 'success');
    }
  };

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }));
  };

  const updateRoom = (idx, field, value) => {
    const rooms = [...form.rooms];
    rooms[idx] = { ...rooms[idx], [field]: value };
    // Auto-set typeName when type changes
    if (field === 'type') {
      const found = ROOM_TYPES.find(rt => rt.value === value);
      if (found) rooms[idx].typeName = found.label;
    }
    setForm(f => ({ ...f, rooms }));
  };

  const addRoom = () => setForm(f => ({ ...f, rooms: [...f.rooms, emptyRoom()] }));
  const removeRoom = (idx) => setForm(f => ({ ...f, rooms: f.rooms.filter((_, i) => i !== idx) }));

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">{T('admin.propertyManagement')}</h1>
        <button className="btn-primary" onClick={openAdd}><i className="fi fi-rr-plus fi-sm" /> {T('admin.addProperty')}</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{lang === 'zh' ? '房源' : 'Property'}</th>
              <th>{lang === 'zh' ? '地點/車站' : 'Location/Station'}</th>
              <th>{lang === 'zh' ? '房型數' : 'Room Types'}</th>
              <th>{lang === 'zh' ? '最低價' : 'Min Price'}</th>
              <th>{lang === 'zh' ? '評分' : 'Rating'}</th>
              <th>{T('admin.hostVerification')}</th>
              <th>{T('common.status')}</th>
              <th>{lang === 'zh' ? '操作' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="prop-cell">
                    <img src={p.images[0]} alt="" className="prop-thumb" />
                    <div>
                      <div className="prop-cell-name">{lang === 'zh' ? p.name : (p.nameEn || p.name)}</div>
                      <div className="prop-cell-sub">{p.hostName}</div>
                    </div>
                  </div>
                </td>
                <td>{lang === 'zh' ? p.station : p.stationEn}<br /><small>{p.distanceToStation}m</small></td>
                <td>{p.rooms.length} {T('common.rooms')}</td>
                <td>NT$ {Math.min(...p.rooms.map(r => r.price)).toLocaleString()}</td>
                <td><i className="fi fi-sr-star fi-xs" style={{ marginRight: 3, color: '#f59e0b' }} />{p.rating}</td>
                <td>
                  {p.hostVerified
                    ? <span className="badge badge-confirmed"><i className="fi fi-rr-check fi-sm" /> {T('admin.verified')}</span>
                    : <span className="badge badge-cancelled"><i className="fi fi-rr-cross fi-sm" /> {T('admin.unverified')}</span>
                  }
                </td>
                <td>
                  <button
                    className={`toggle-btn ${p.active ? 'active' : ''}`}
                    onClick={() => updateProperty(p.id, { active: !p.active })}
                  >
                    {p.active ? <i className="fi fi-rr-eye fi-sm" /> : <i className="fi fi-rr-eye-crossed fi-sm" />}
                    {p.active ? (lang === 'zh' ? '上架' : 'Active') : (lang === 'zh' ? '下架' : 'Inactive')}
                  </button>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="btn-icon-sm" onClick={() => openEdit(p)}><i className="fi fi-rr-pencil fi-sm" /></button>
                    <button className="btn-icon-sm btn-danger-icon" onClick={() => handleDelete(p.id)}><i className="fi fi-rr-trash fi-sm" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editTarget ? T('admin.editProperty') : T('admin.addProperty')} size="lg">
        <div className="prop-form">
          <div className="form-grid">
            <div className="form-group">
              <label>{T('admin.propertyName')} (中) *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{T('admin.propertyName')} (EN)</label>
              <input className="form-input" value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))} />
            </div>
            <div className="form-group form-full">
              <label>{T('common.description')} (中)</label>
              <textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{T('admin.nearStation')}</label>
              <select className="form-input" value={form.station} onChange={e => setForm(f => ({ ...f, station: e.target.value }))}>
                {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{lang === 'zh' ? '地區' : 'Area'}</label>
              <select className="form-input" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
                {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{T('common.address')}</label>
              <input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{lang === 'zh' ? '距車站(公尺)' : 'Distance to Station (m)'}</label>
              <input className="form-input" type="number" min={0} value={form.distanceToStation} onChange={e => setForm(f => ({ ...f, distanceToStation: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>{lang === 'zh' ? '房東姓名' : 'Host Name'} *</label>
              <input className="form-input" value={form.hostName} onChange={e => setForm(f => ({ ...f, hostName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{lang === 'zh' ? '入住時間' : 'Check-in'}</label>
              <input className="form-input" type="time" value={form.checkInTime} onChange={e => setForm(f => ({ ...f, checkInTime: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{lang === 'zh' ? '退房時間' : 'Check-out'}</label>
              <input className="form-input" type="time" value={form.checkOutTime} onChange={e => setForm(f => ({ ...f, checkOutTime: e.target.value }))} />
            </div>
          </div>

          {/* Policies */}
          <div className="form-row">
            <label className="checkbox-label">
              <input type="checkbox" checked={form.petAllowed} onChange={e => setForm(f => ({ ...f, petAllowed: e.target.checked }))} />
              {T('property.petAllowed')}
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.smokingAllowed} onChange={e => setForm(f => ({ ...f, smokingAllowed: e.target.checked }))} />
              {T('property.smokingAllowed')}
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.hostVerified} onChange={e => setForm(f => ({ ...f, hostVerified: e.target.checked }))} />
              {T('admin.hostVerification')}
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
              {lang === 'zh' ? '精選房源' : 'Featured'}
            </label>
          </div>

          {/* Amenities */}
          <div className="form-group">
            <label>{T('property.facilities')}</label>
            <div className="amenity-checks">
              {AMENITIES_LIST.map(a => (
                <label key={a} className="amenity-check">
                  <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                  {T(`amenities.${a}`)}
                </label>
              ))}
            </div>
          </div>

          {/* Rooms */}
          <div className="form-group">
            <div className="rooms-header">
              <label>{lang === 'zh' ? '房型設定' : 'Room Types'}</label>
              <button type="button" className="btn-outline btn-sm" onClick={addRoom}><i className="fi fi-rr-plus fi-sm" /> {lang === 'zh' ? '新增房型' : 'Add Room'}</button>
            </div>
            {form.rooms.map((room, idx) => (
              <div key={room.id} className="room-form-row">
                <select className="form-input" value={room.type} onChange={e => updateRoom(idx, 'type', e.target.value)}>
                  {ROOM_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                </select>
                <input className="form-input" type="number" min={0} placeholder={lang === 'zh' ? '價格' : 'Price'} value={room.price} onChange={e => updateRoom(idx, 'price', Number(e.target.value))} />
                <input className="form-input" type="number" min={1} placeholder={lang === 'zh' ? '最多人數' : 'Max Guests'} value={room.maxGuests} onChange={e => updateRoom(idx, 'maxGuests', Number(e.target.value))} />
                <input className="form-input" type="number" min={0} placeholder={lang === 'zh' ? '數量' : 'Qty'} value={room.quantity} onChange={e => updateRoom(idx, 'quantity', Number(e.target.value))} />
                <button type="button" className="btn-icon-sm btn-danger-icon" onClick={() => removeRoom(idx)}><i className="fi fi-rr-trash fi-sm" /></button>
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button className="btn-primary" onClick={handleSave}>{T('common.save')}</button>
            <button className="btn-ghost" onClick={() => setShowModal(false)}>{T('common.cancel')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
