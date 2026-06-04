import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useStore from '../../../store/useTripStore';
import { useToast } from '../../../components/common/Toast';
import Modal from '../../../components/common/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { AREAS, STATIONS } from '../data/attractions';


export default function HomePage() {
  const { currentUser, getUserTrips, createTrip, deleteTrip } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [createModal, setCreateModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState('');

  const trips = currentUser ? getUserTrips() : [];

  const handleCreate = (data) => {
    const trip = createTrip(data);
    setCreateModal(false);
    toast('行程建立成功！', 'success');
    navigate(`/trip/${trip.id}`);
  };

  const handleDelete = (id, title) => {
    setDeleteId(id);
    setDeleteTitle(title);
  };

  const formatDate = (d) => {
    const dt = new Date(d + 'T00:00:00');
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
  };

  const getDays = (trip) => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1 className="hero-title"><i className="fi fi-rr-map" /> 旅行行程規劃</h1>
          <p className="hero-subtitle">以火車站為核心，規劃精彩行程，與旅伴協作共遊</p>
          {currentUser ? (
            <button className="btn-primary btn-large" onClick={() => setCreateModal(true)}>
              <i className="fi fi-rr-plus" style={{ fontSize: 20 }} /> 建立新行程
            </button>
          ) : (
            <Link to="/login" className="btn-primary btn-large">
              <i className="fi fi-rr-sign-in-alt" style={{ fontSize: 20 }} /> 登入開始規劃
            </Link>
          )}
        </div>
      </div>

      {/* Trip List */}
      <div className="container">
        <div className="page" style={{ paddingTop: '2rem' }}>
          {!currentUser ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ fontSize: '4rem' }}>🔐</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>請先登入</h3>
              <p className="empty-hint">登入後即可建立、管理您的行程</p>
              <Link to="/login" className="btn-primary">
                <i className="fi fi-rr-sign-in-alt fi-sm" /> 前往登入
              </Link>
            </div>
          ) : (
            <>
              <div className="page-header">
                <h2 className="page-title">
                  <i className="fi fi-rr-marker" style={{ fontSize: 22 }} /> 我的行程
                  <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8 }}>
                    {trips.length} 筆
                  </span>
                </h2>
                <button className="btn-primary" onClick={() => setCreateModal(true)}>
                  <i className="fi fi-rr-plus fi-sm" /> 建立行程
                </button>
              </div>

              {trips.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: '4rem' }}>✈️</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>還沒有行程</h3>
                  <p className="empty-hint">點擊「建立行程」開始規劃您的旅程</p>
                  <button className="btn-primary" onClick={() => setCreateModal(true)}>
                    <i className="fi fi-rr-plus fi-sm" /> 建立第一個行程
                  </button>
                </div>
              ) : (
                <div className="trips-grid">
                  {trips.map(trip => (
                    <div key={trip.id} className="trip-card">
                      <div className="trip-card-cover">
                        <i className="fi fi-sr-map" style={{ fontSize: '3rem', color: '#6e7c87' }} />
                      </div>
                      <div className="trip-card-body">
                        <div className="trip-card-title">{trip.title}</div>
                        <div className="trip-card-meta">
                          <span><i className="fi fi-rr-marker fi-xs" /> {trip.stationName}</span>
                          <span>
                            <i className="fi fi-rr-calendar fi-xs" />
                            {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                          </span>
                          {trip.collaborators.length > 0 && (
                            <span>👥 {trip.collaborators.length + 1} 位旅伴</span>
                          )}
                        </div>
                        {trip.description && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {trip.description}
                          </p>
                        )}
                        <div className="trip-card-footer">
                          <span className="trip-days-badge">{getDays(trip)} 天</span>
                          <div className="trip-card-actions">
                            <Link to={`/trip/${trip.id}/expenses`} className="btn-icon-sm" title="費用管理">
                              <i className="fi fi-rr-dollar fi-sm" />
                            </Link>
                            <Link to={`/trip/${trip.id}/overview`} className="btn-icon-sm" title="行程總覽">
                              <i className="fi fi-rr-eye fi-sm" />
                            </Link>
                            <button
                              className="btn-icon-sm btn-danger-icon"
                              title="刪除行程"
                              onClick={() => handleDelete(trip.id, trip.title)}
                            >
                              <i className="fi fi-rr-trash fi-sm" />
                            </button>
                            <Link to={`/trip/${trip.id}`} className="btn-primary btn-sm">
                              開始規劃
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CreateTripModal isOpen={createModal} onClose={() => setCreateModal(false)} onSave={handleCreate} />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteTrip(deleteId); toast('行程已刪除', 'success'); setDeleteId(null); }}
        title="刪除行程"
        message={`確定要刪除「${deleteTitle}」嗎？所有資料將無法恢復。`}
        icon="🗑️"
        confirmLabel="刪除"
      />
    </div>
  );
}

// ── Create Trip Modal ──────────────────────────────────────
function CreateTripModal({ isOpen, onClose, onSave }) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    title: '', description: '', area: 'taipei',
    stationId: '', stationName: '',
    startDate: today, endDate: tomorrow, budget: '',
  });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const stations = STATIONS[form.area] || [];

  const handleAreaChange = (area) => {
    set('area', area);
    set('stationId', '');
    set('stationName', '');
  };

  const handleStationSelect = (sta) => {
    set('stationId', sta.id);
    set('stationName', sta.name);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (!form.stationId) return;
    if (!form.startDate || !form.endDate) return;
    onSave(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="建立新行程" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>行程名稱 *</label>
          <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="例：台北三日輕旅行" />
        </div>

        <div className="form-group">
          <label>簡介</label>
          <input className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="簡短描述這次旅行（選填）" />
        </div>

        <div className="form-group">
          <label>出發城市 *</label>
          <div className="station-select-wrap">
            <div className="area-tabs">
              {AREAS.map(a => (
                <button
                  key={a.id}
                  className={`area-tab ${form.area === a.id ? 'active' : ''}`}
                  onClick={() => handleAreaChange(a.id)}
                >
                  {a.name}
                </button>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>選擇主要火車站：</div>
              <div className="station-list">
                {stations.map(sta => (
                  <button
                    key={sta.id}
                    className={`station-btn ${form.stationId === sta.id ? 'active' : ''}`}
                    onClick={() => handleStationSelect(sta)}
                  >
                    🚉 {sta.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>出發日期 *</label>
            <input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label>返回日期 *</label>
            <input
              className="form-input" type="date" value={form.endDate}
              min={form.startDate}
              onChange={e => set('endDate', e.target.value)}
            />
          </div>
          <div className="form-group form-full">
            <label>預算上限（NT$）</label>
            <input className="form-input" type="number" min="0" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="0 表示不設上限" />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>取消</button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!form.title.trim() || !form.stationId}
          >
            <i className="fi fi-rr-plus fi-sm" /> 建立行程
          </button>
        </div>
      </div>
    </Modal>
  );
}
