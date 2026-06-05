import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useStore from '../../../store/useTrainStore';
import useAuthStore from '../../../store/useAuthStore';
import { STATIONS, STATION_GROUPS, STATION_MAP, TICKET_TYPES, TIME_SLOTS, CAR_TYPES, SEARCH_TRAIN_TYPES } from '../data/trainData';

export default function HomePage() {
  const navigate = useNavigate();
  const { searchParams, setSearchParams, searchTrains } = useStore();
  const { currentUser } = useAuthStore();
  const [showAdvanced, setShowAdvanced] = useState(searchParams.queryType === 'advanced');

  const today = new Date().toISOString().split('T')[0];

  const set = (k, v) => setSearchParams({ [k]: v });

  const swapStations = () => {
    setSearchParams({ from: searchParams.to, to: searchParams.from });
  };

  const setTicketCount = (typeId, delta) => {
    const cur = searchParams.ticketCounts[typeId] ?? 0;
    const next = Math.max(0, cur + delta);
    const total = Object.values({ ...searchParams.ticketCounts, [typeId]: next }).reduce((s, v) => s + v, 0);
    if (total > 6) return;
    setSearchParams({ ticketCounts: { ...searchParams.ticketCounts, [typeId]: next } });
  };

  const totalPassengers = Object.values(searchParams.ticketCounts).reduce((s, v) => s + v, 0);

  const handleSearch = () => {
    if (!searchParams.from || !searchParams.to || !searchParams.date) return;
    if (searchParams.from === searchParams.to) return;
    if (totalPassengers === 0) return;
    const type = showAdvanced ? 'advanced' : 'basic';
    searchTrains({ ...searchParams, queryType: type });
    navigate('/ticket/search');
  };

  return (
    <>
      <div className="search-hero">
        <div className="search-hero-inner">
          <div className="search-hero-title"><i className="fi fi-rr-train-side" style={{ marginRight: 8 }} />台鐵線上訂票</div>
          <div className="search-hero-sub">快速查詢車次、輕鬆完成訂票，台灣環島一票搞定</div>
        </div>
      </div>

      <div className="search-card-wrap">
        <div className="search-card">
          {/* Query type toggle */}
          <div className="query-type-bar">
            <button
              className={`query-type-btn ${!showAdvanced ? 'active' : ''}`}
              onClick={() => setShowAdvanced(false)}
            >
              基礎查詢
            </button>
            <button
              className={`query-type-btn ${showAdvanced ? 'active' : ''}`}
              onClick={() => setShowAdvanced(true)}
            >
              進階查詢
            </button>
          </div>

          {/* Stations */}
          <div className="station-row">
            <div className="form-group">
              <label>出發站</label>
              <select className="form-input" value={searchParams.from} onChange={e => set('from', e.target.value)}>
                {STATION_GROUPS.map(g => (
                  <optgroup key={g.label} label={g.label}>
                    {g.stations.map(id => {
                      const s = STATIONS.find(st => st.id === id);
                      if (!s) return null;
                      return (
                        <option key={id} value={id}>
                          {s.name}{s.transfer ? ' ⇄' : ''}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
            </div>
            <button className="swap-btn" onClick={swapStations} title="交換出發/到達站">
              <i className="fi fi-rr-arrows-h fi-sm" />
            </button>
            <div className="form-group">
              <label>到達站</label>
              <select className="form-input" value={searchParams.to} onChange={e => set('to', e.target.value)}>
                {STATION_GROUPS.map(g => (
                  <optgroup key={g.label} label={g.label}>
                    {g.stations.map(id => {
                      const s = STATIONS.find(st => st.id === id);
                      if (!s) return null;
                      return (
                        <option key={id} value={id}>
                          {s.name}{s.transfer ? ' ⇄' : ''}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Date + Time */}
          <div className="search-row-2" style={{ marginBottom: '0.75rem' }}>
            <div className="form-group">
              <label>搭乘日期</label>
              <input className="form-input" type="date" min={today} value={searchParams.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div className="form-group">
              <label>時段</label>
              <select className="form-input" value={searchParams.timeSlot} onChange={e => set('timeSlot', e.target.value)}>
                {TIME_SLOTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Advanced options */}
          {showAdvanced && (
            <div className="advanced-section">
              <div className="advanced-title">進階設定</div>
              <div className="search-row-3" style={{ marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label>車廂類型</label>
                  <select className="form-input" value={searchParams.carType} onChange={e => set('carType', e.target.value)}>
                    {CAR_TYPES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>座位偏好</label>
                  <select className="form-input" value={searchParams.seatPref} onChange={e => set('seatPref', e.target.value)}>
                    <option value="any">不指定</option>
                    <option value="window">靠窗</option>
                    <option value="aisle">靠走道</option>
                  </select>
                </div>
                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                  <label style={{ opacity: 0 }}>轉乘</label>
                  <div className="toggle-row">
                    <span className="toggle-label">允許轉乘</span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={searchParams.transferAllowed}
                        onChange={e => set('transferAllowed', e.target.checked)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
              {/* 車種類型 + 商務車廂 */}
              <div className="search-row-2" style={{ marginBottom: '0.75rem', alignItems: 'flex-end' }}>
                <div className="form-group">
                  <label>車種類型</label>
                  <select
                    className="form-input"
                    value={searchParams.trainType ?? 'any'}
                    onChange={e => {
                      const v = e.target.value;
                      setSearchParams({ trainType: v, businessClass: v === 'express' ? searchParams.businessClass : false });
                    }}
                  >
                    {SEARCH_TRAIN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                  <label style={{ opacity: 0 }}>商務</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 8, cursor: searchParams.trainType === 'express' ? 'pointer' : 'default',
                      opacity: searchParams.trainType === 'express' ? 1 : 0.45, userSelect: 'none',
                    }}>
                      <input
                        type="checkbox"
                        checked={!!searchParams.businessClass}
                        disabled={searchParams.trainType !== 'express'}
                        onChange={e => set('businessClass', e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                      />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>商務車廂</span>
                    </label>
                    {searchParams.trainType !== 'express' && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>商務車廂僅適用於自強號</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ticket counts */}
          <div className="ticket-section-label"><i className="fi fi-rr-ticket fi-sm" style={{ color: '#6e7c87', marginRight: 6 }} />票種與張數（最多 6 張）</div>
          <div className="ticket-count-grid" style={{ marginBottom: '1.25rem' }}>
            {TICKET_TYPES.map(tt => (
              <div key={tt.id} className="ticket-count-row">
                <div className="tc-info">
                  <span className="tc-name">{tt.name}</span>
                  <span className="tc-desc">{tt.desc}</span>
                </div>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => setTicketCount(tt.id, -1)} disabled={(searchParams.ticketCounts[tt.id] ?? 0) === 0}>−</button>
                  <span className="qty-value">{searchParams.ticketCounts[tt.id] ?? 0}</span>
                  <button className="qty-btn" onClick={() => setTicketCount(tt.id, 1)} disabled={totalPassengers >= 6}>＋</button>
                </div>
              </div>
            ))}
          </div>

          {/* Validation hint */}
          {(searchParams.from === searchParams.to) && (
            <p style={{ color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '0.75rem' }}><i className="fi fi-sr-exclamation fi-xs" style={{ marginRight: 4 }} />出發站與到達站不能相同</p>
          )}
          {totalPassengers === 0 && (
            <p style={{ color: 'var(--warning)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>請至少選擇 1 張票</p>
          )}

          <button
            className="btn-primary btn-lg full-width"
            onClick={handleSearch}
            disabled={!searchParams.from || !searchParams.to || searchParams.from === searchParams.to || totalPassengers === 0 || !searchParams.date}
          >
            <i className="fi fi-rr-search" style={{ fontSize: 18 }} /> 查詢車次
          </button>
        </div>
      </div>

      {currentUser && (
        <div className="features-section" style={{ paddingTop: 0 }}>
          <div style={{ padding: '1rem 1.25rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontWeight: 700 }}><i className="fi fi-rr-hand-wave fi-sm" style={{ color: '#6e7c87', marginRight: 6 }} />歡迎回來，{currentUser.name}！</span>
            <Link to="/ticket/orders" className="btn-outline btn-sm">查看我的訂單</Link>
          </div>
        </div>
      )}
    </>
  );
}
