import { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import { ITEM_TYPES, STATUS_OPTIONS, getStationById } from '../data/attractions';

export default function AddItemModal({ isOpen, onClose, onSave, initialData, stationId }) {
  const [form, setForm] = useState({
    type: 'attraction',
    title: '',
    location: '',
    time: '09:00',
    duration: 60,
    notes: '',
    status: 'planned',
    isCandidate: false,
    attractionId: null,
  });
  const [selectedAttr, setSelectedAttr] = useState(null);

  const station = stationId ? getStationById(stationId) : null;

  useEffect(() => {
    if (initialData) {
      setForm({
        type: initialData.type || 'attraction',
        title: initialData.title || '',
        location: initialData.location || '',
        time: initialData.time || '09:00',
        duration: initialData.duration || 60,
        notes: initialData.notes || '',
        status: initialData.status || 'planned',
        isCandidate: initialData.isCandidate || false,
        attractionId: initialData.attractionId || null,
      });
      setSelectedAttr(initialData.attractionId);
    } else {
      setForm({ type: 'attraction', title: '', location: '', time: '09:00', duration: 60, notes: '', status: 'planned', isCandidate: false, attractionId: null });
      setSelectedAttr(null);
    }
  }, [initialData, isOpen]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleAttrSelect = (attr) => {
    if (selectedAttr === attr.id) {
      setSelectedAttr(null);
      set('title', '');
      set('location', '');
      set('attractionId', null);
    } else {
      setSelectedAttr(attr.id);
      set('title', attr.name);
      set('location', attr.address);
      set('attractionId', attr.id);
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? '編輯行程項目' : '新增行程項目'} size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Station recommendations */}
        {station && !initialData && (
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              📍 {station.name} 周邊推薦景點（1km 內）
            </label>
            <div className="attractions-grid">
              {station.attractions.map(attr => (
                <button
                  key={attr.id}
                  className={`attraction-chip ${selectedAttr === attr.id ? 'selected' : ''}`}
                  onClick={() => handleAttrSelect(attr)}
                >
                  <span className="attraction-type-icon">
                    {ITEM_TYPES.find(t => t.value === 'attraction')?.icon || '📍'}
                  </span>
                  <span className="attraction-info">
                    <span className="attraction-name">{attr.name}</span>
                    <span className="attraction-dist">{attr.distance}m</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="form-grid">
          <div className="form-group form-full">
            <label>類型</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ITEM_TYPES.map(t => (
                <button
                  key={t.value}
                  className={`area-tab ${form.type === t.value ? 'active' : ''}`}
                  onClick={() => set('type', t.value)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group form-full">
            <label>名稱 *</label>
            <input
              className="form-input"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="輸入景點、餐廳或活動名稱"
            />
          </div>

          <div className="form-group form-full">
            <label>地點</label>
            <input
              className="form-input"
              value={form.location}
              onChange={e => set('location', e.target.value)}
              placeholder="地址或地點說明"
            />
          </div>

          <div className="form-group">
            <label>時間</label>
            <input
              className="form-input"
              type="time"
              value={form.time}
              onChange={e => set('time', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>預計時長（分鐘）</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="15"
              value={form.duration}
              onChange={e => set('duration', Number(e.target.value))}
            />
          </div>

          <div className="form-group form-full">
            <label>狀態</label>
            <div className="status-select-row">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s.value}
                  className={`status-opt ${s.value} ${form.status === s.value ? 'active' : ''}`}
                  onClick={() => set('status', s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group form-full">
            <label>備註</label>
            <textarea
              className="form-textarea"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="輸入提醒、建議或注意事項"
            />
          </div>

          <div className="form-group form-full">
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={form.isCandidate}
                onChange={e => set('isCandidate', e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
              />
              <span>設為「候選」項目（需旅伴投票決定）</span>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>取消</button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!form.title.trim()}
          >
            {initialData ? '儲存變更' : '新增項目'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
