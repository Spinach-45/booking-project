import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useHotelStore from '../../../../store/useHotelStore';
import useAuthStore from '../../../../store/useAuthStore';
import { useToast } from '../../../../components/common/Toast';

const AREAS = [
  { value: 'taipei', label: '台北' },
  { value: 'keelung', label: '基隆' },
  { value: 'newTaipei', label: '新北' },
  { value: 'taoyuan', label: '桃園' },
];

const PROPERTY_TYPES = [
  { value: 'hotel', label: '飯店' },
  { value: 'guesthouse', label: '民宿' },
  { value: 'hostel', label: '背包客棧' },
  { value: 'apartment', label: '公寓' },
  { value: 'villa', label: '別墅' },
];

const AMENITIES_LIST = [
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'aircon', label: '冷氣' },
  { key: 'tv', label: '電視' },
  { key: 'parking', label: '停車場' },
  { key: 'breakfast', label: '早餐' },
  { key: 'elevator', label: '電梯' },
  { key: 'pool', label: '游泳池' },
  { key: 'gym', label: '健身房' },
  { key: 'kitchen', label: '廚房' },
  { key: 'laundry', label: '洗衣設備' },
  { key: 'balcony', label: '陽台' },
  { key: 'cityView', label: '城市景觀' },
];

const ROOM_TYPES = [
  { value: 'single', label: '單人房' },
  { value: 'double', label: '雙人房' },
  { value: 'twin', label: '雙床房' },
  { value: 'suite', label: '套房' },
  { value: 'deluxe', label: '豪華房' },
  { value: 'family', label: '家庭房' },
  { value: 'dormitory', label: '背包客床位' },
];

const emptyRoom = () => ({
  id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
  type: 'double',
  typeName: '雙人房',
  price: 1500,
  maxGuests: 2,
  quantity: 1,
});

const emptyForm = (hostId, hostName) => ({
  name: '',
  address: '',
  area: 'taipei',
  stationDistance: 500,
  propertyType: 'hotel',
  amenities: ['wifi', 'aircon'],
  petAllowed: false,
  smokingAllowed: false,
  checkInTime: '15:00',
  checkOutTime: '11:00',
  cancellationPolicy: '入住前10天取消可全額退款，入住前4-9天退款70%，其餘不退款。',
  rooms: [emptyRoom()],
  description: '',
  images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'],
  hostId,
  hostName: hostName || '',
  rating: 4.0,
  reviewCount: 0,
  active: false,
  status: 'pending',
});

export default function HostPropertyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getHostProperties, addProperty, updateProperty } = useHotelStore();
  const { currentUser } = useAuthStore();
  const addToast = useToast();

  const isEdit = !!id;

  const [form, setForm] = useState(() => {
    if (isEdit) {
      const allProps = getHostProperties(currentUser?.id);
      const existing = allProps.find(p => p.id === id);
      return existing ? { ...existing } : emptyForm(currentUser?.id, currentUser?.name);
    }
    return emptyForm(currentUser?.id, currentUser?.name);
  });

  const [activeSection, setActiveSection] = useState('basic');

  const toggleAmenity = (key) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(key)
        ? f.amenities.filter(a => a !== key)
        : [...f.amenities, key],
    }));
  };

  const updateRoom = (idx, field, value) => {
    const rooms = [...form.rooms];
    rooms[idx] = { ...rooms[idx], [field]: value };
    if (field === 'type') {
      const found = ROOM_TYPES.find(rt => rt.value === value);
      if (found) rooms[idx].typeName = found.label;
    }
    setForm(f => ({ ...f, rooms }));
  };

  const addRoom = () => setForm(f => ({ ...f, rooms: [...f.rooms, emptyRoom()] }));
  const removeRoom = (idx) => {
    if (form.rooms.length <= 1) { addToast('至少需要一種房型', 'error'); return; }
    setForm(f => ({ ...f, rooms: f.rooms.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { addToast('請填寫房源名稱', 'error'); return; }
    if (!form.address.trim()) { addToast('請填寫地址', 'error'); return; }
    if (form.rooms.length === 0) { addToast('請至少設定一種房型', 'error'); return; }

    if (isEdit) {
      updateProperty(id, { ...form, status: 'pending', active: false });
      addToast('房源已更新，等待重新審核', 'success');
    } else {
      addProperty({ ...form, hostId: currentUser?.id, hostName: currentUser?.name, status: 'pending', active: false });
      addToast('房源已送出，等待審核', 'success');
    }
    navigate('/host/properties');
  };

  const sections = [
    { key: 'basic', label: '基本資訊' },
    { key: 'amenities', label: '設施' },
    { key: 'policy', label: '政策' },
    { key: 'rooms', label: '房型設定' },
    { key: 'description', label: '描述' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fi fi-rr-building" style={{ fontSize: 20 }} />
          {isEdit ? ' 編輯房源' : ' 新增房源'}
        </h1>
      </div>

      {/* Section Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 24 }}>
        {sections.map(s => (
          <button
            key={s.key}
            className={`tab-btn ${activeSection === s.key ? 'active' : ''}`}
            onClick={() => setActiveSection(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {activeSection === 'basic' && (
        <div className="form-section">
          <h3 className="form-section-title">基本資訊</h3>
          <div className="form-grid">
            <div className="form-group form-full">
              <label>房源名稱 *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="例：台北車站旁精品套房"
              />
            </div>
            <div className="form-group form-full">
              <label>地址 *</label>
              <input
                className="form-input"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="例：台北市中正區忠孝西路一段"
              />
            </div>
            <div className="form-group">
              <label>地區</label>
              <select
                className="form-input"
                value={form.area}
                onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
              >
                {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>房源類型</label>
              <select
                className="form-input"
                value={form.propertyType || 'hotel'}
                onChange={e => setForm(f => ({ ...f, propertyType: e.target.value }))}
              >
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>距最近車站 (公尺)</label>
              <input
                className="form-input"
                type="number"
                min={0}
                value={form.stationDistance ?? form.distanceToStation ?? 500}
                onChange={e => {
                  const n = e.target.value === '' ? '' : Number(e.target.value);
                  setForm(f => ({ ...f, stationDistance: n, distanceToStation: n }));
                }}
              />
            </div>
            <div className="form-group form-full">
              <label>封面圖片 URL</label>
              <input
                className="form-input"
                value={form.images?.[0] || ''}
                onChange={e => setForm(f => ({ ...f, images: [e.target.value] }))}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Amenities */}
      {activeSection === 'amenities' && (
        <div className="form-section">
          <h3 className="form-section-title">設施</h3>
          <div className="amenity-checks">
            {AMENITIES_LIST.map(a => (
              <label key={a.key} className="amenity-check">
                <input
                  type="checkbox"
                  checked={form.amenities.includes(a.key)}
                  onChange={() => toggleAmenity(a.key)}
                />
                {a.label}
              </label>
            ))}
          </div>
          <div className="form-row" style={{ marginTop: 16 }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.petAllowed}
                onChange={e => setForm(f => ({ ...f, petAllowed: e.target.checked }))}
              />
              允許攜帶寵物
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.smokingAllowed}
                onChange={e => setForm(f => ({ ...f, smokingAllowed: e.target.checked }))}
              />
              允許吸煙
            </label>
          </div>
        </div>
      )}

      {/* Policy */}
      {activeSection === 'policy' && (
        <div className="form-section">
          <h3 className="form-section-title">政策</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>入住時間</label>
              <input
                className="form-input"
                type="time"
                value={form.checkInTime}
                onChange={e => setForm(f => ({ ...f, checkInTime: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>退房時間</label>
              <input
                className="form-input"
                type="time"
                value={form.checkOutTime}
                onChange={e => setForm(f => ({ ...f, checkOutTime: e.target.value }))}
              />
            </div>
            <div className="form-group form-full">
              <label>取消政策</label>
              <textarea
                className="form-textarea"
                rows={5}
                value={form.cancellationPolicy || ''}
                onChange={e => setForm(f => ({ ...f, cancellationPolicy: e.target.value }))}
                placeholder="說明取消及退款政策..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Rooms */}
      {activeSection === 'rooms' && (
        <div className="form-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="form-section-title" style={{ margin: 0 }}>房型設定</h3>
            <button type="button" className="btn-outline btn-sm" onClick={addRoom}>
              <i className="fi fi-rr-plus fi-sm" /> 新增房型
            </button>
          </div>
          {form.rooms.map((room, idx) => (
            <div key={room.id} className="room-form-row" style={{ marginBottom: 12, padding: '12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>房型</label>
                  <select
                    className="form-input"
                    value={room.type}
                    onChange={e => updateRoom(idx, 'type', e.target.value)}
                  >
                    {ROOM_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>自訂名稱</label>
                  <input
                    className="form-input"
                    value={room.typeName || ''}
                    onChange={e => updateRoom(idx, 'typeName', e.target.value)}
                    placeholder="房型顯示名稱"
                  />
                </div>
                <div className="form-group">
                  <label>價格 (NT$/晚)</label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    value={room.price}
                    onChange={e => updateRoom(idx, 'price', Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>最多人數</label>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={room.maxGuests}
                    onChange={e => updateRoom(idx, 'maxGuests', Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>數量</label>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={room.quantity}
                    onChange={e => updateRoom(idx, 'quantity', Number(e.target.value))}
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn-icon-sm btn-danger-icon"
                    onClick={() => removeRoom(idx)}
                    title="刪除此房型"
                  >
                    <i className="fi fi-rr-trash fi-sm" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {activeSection === 'description' && (
        <div className="form-section">
          <h3 className="form-section-title">房源描述</h3>
          <div className="form-group">
            <label>描述</label>
            <textarea
              className="form-textarea"
              rows={8}
              value={form.description || ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="詳細描述您的房源特色、周邊環境、服務..."
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="btn-primary" onClick={handleSubmit}>
          <i className="fi fi-rr-check fi-sm" style={{ marginRight: 6 }} />
          {isEdit ? '儲存並送審' : '送出審核'}
        </button>
        <button className="btn-ghost" onClick={() => navigate('/host/properties')}>
          取消
        </button>
      </div>

      {isEdit && (
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-light, #888)' }}>
          <i className="fi fi-rr-info fi-sm" style={{ marginRight: 4 }} />
          編輯後需重新送審，審核通過前房源將暫時下架。
        </p>
      )}
    </div>
  );
}
