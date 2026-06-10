import { useState, useMemo } from 'react';
import Modal from './Modal';
import useTripStore from '../../store/useTripStore';
import useAuthStore from '../../store/useAuthStore';
import { Link } from 'react-router-dom';

export default function AddToTripModal({ isOpen, onClose, itemData, suggestDate }) {
  const { getUserTrips, addItem } = useTripStore();
  const { currentUser } = useAuthStore();

  const trips = currentUser ? getUserTrips() : [];

  const [tripId, setTripId]   = useState('');
  const [dayId,  setDayId]    = useState('');
  const [done,   setDone]     = useState(false);

  const selectedTrip = useMemo(() => trips.find(t => t.id === tripId) || null, [tripId, trips]);

  const handleTripChange = (id) => {
    setTripId(id);
    // 自動選日期：找與預訂日期相符的那天
    if (suggestDate && id) {
      const trip = trips.find(t => t.id === id);
      const matched = trip?.days.find(d => d.date === suggestDate);
      setDayId(matched?.id || '');
    } else {
      setDayId('');
    }
  };

  const handleAdd = () => {
    if (!tripId || !dayId) return;
    addItem(tripId, dayId, itemData);
    setDone(true);
  };

  const handleClose = () => {
    setTripId(''); setDayId(''); setDone(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="加入行程規劃" size="sm">
      {!currentUser ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <i className="fi fi-rr-lock" style={{ fontSize: 32, color: 'var(--secondary)', display: 'block', marginBottom: 8 }} />
          <p style={{ marginBottom: 12 }}>請先登入才能加入行程</p>
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }} onClick={handleClose}>前往登入</Link>
        </div>
      ) : trips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <i className="fi fi-rr-map" style={{ fontSize: 32, color: 'var(--secondary)', display: 'block', marginBottom: 8 }} />
          <p style={{ marginBottom: 12 }}>目前沒有行程，請先建立行程</p>
          <Link to="/trip" className="btn-primary" style={{ textDecoration: 'none' }} onClick={handleClose}>前往行程規劃</Link>
        </div>
      ) : done ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <i className="fi fi-sr-check-circle" style={{ fontSize: 40, color: 'var(--success)', display: 'block', marginBottom: 10 }} />
          <p style={{ fontWeight: 700, marginBottom: 6 }}>已成功加入行程！</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            {selectedTrip?.title} · {selectedTrip?.days.find(d => d.id === dayId)?.date}
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Link to={`/trip/${tripId}`} className="btn-primary" style={{ textDecoration: 'none' }} onClick={handleClose}>
              <i className="fi fi-rr-map fi-sm" style={{ marginRight: 4 }} />查看行程
            </Link>
            <button className="btn-ghost" onClick={handleClose}>關閉</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* 預訂項目摘要 */}
          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '0.75rem 1rem', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              <i className={`fi ${itemData.type === 'transport' ? 'fi-rr-train-side' : 'fi-rr-building'} fi-xs`} style={{ marginRight: 6 }} />
              {itemData.title}
            </div>
            {itemData.notes && <div style={{ color: 'var(--text-secondary)' }}>{itemData.notes}</div>}
            {itemData.time && <div style={{ color: 'var(--text-secondary)' }}>{itemData.time}</div>}
          </div>

          {/* 選行程 */}
          <div className="form-group">
            <label>選擇行程</label>
            <select className="form-input" value={tripId} onChange={e => handleTripChange(e.target.value)}>
              <option value="">請選擇行程</option>
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.title}（{t.startDate} ～ {t.endDate}）</option>
              ))}
            </select>
          </div>

          {/* 選日期 */}
          {selectedTrip && (
            <div className="form-group">
              <label>加入哪一天</label>
              <select className="form-input" value={dayId} onChange={e => setDayId(e.target.value)}>
                <option value="">請選擇日期</option>
                {selectedTrip.days.map(d => (
                  <option key={d.id} value={d.id}>
                    第 {d.dayNumber} 天（{d.date}）{d.date === suggestDate ? ' ← 建議' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="modal-footer">
            <button className="btn-primary" onClick={handleAdd} disabled={!tripId || !dayId}>
              <i className="fi fi-rr-plus fi-sm" style={{ marginRight: 4 }} />確認加入
            </button>
            <button className="btn-ghost" onClick={handleClose}>取消</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
