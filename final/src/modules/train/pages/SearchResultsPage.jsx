import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../../store/useTrainStore';
import { TRAIN_TYPES, TICKET_TYPES, formatDuration, getStopsBetween } from '../data/trainData';

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const { searchParams, searchResults, searchTrains, selectTrain } = useStore();
  const [sortKey, setSortKey] = useState('depTime');

  useEffect(() => {
    searchTrains(searchParams);
  }, []);

  const totalPassengers = Object.values(searchParams.ticketCounts).reduce((s, v) => s + v, 0);

  const sorted = [...searchResults].sort((a, b) => {
    if (sortKey === 'price')    return a.basePrice - b.basePrice;
    if (sortKey === 'duration') return a.duration - b.duration;
    return a.depTime.localeCompare(b.depTime);
  });

  const handleSelect = (train) => { selectTrain(train); navigate('/ticket/booking'); };

  const ticketSummary = TICKET_TYPES
    .filter(tt => (searchParams.ticketCounts[tt.id] ?? 0) > 0)
    .map(tt => `${tt.name}×${searchParams.ticketCounts[tt.id]}`)
    .join('、');

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button className="btn-ghost btn-sm" onClick={() => navigate('/ticket')}>
          <i className="fi fi-rr-arrow-left fi-sm" /> 修改查詢
        </button>
        <h1 className="page-title"><i className="fi fi-rr-search fi-sm" style={{ marginRight: 6 }} />車次查詢結果</h1>
      </div>

      <div className="results-summary-bar">
        <span>
          {sorted[0]?.fromName ?? searchParams.from}
          <i className="fi fi-rr-arrow-right fi-sm" style={{ display: 'inline', margin: '0 4px', verticalAlign: 'middle' }} />
          {sorted[0]?.toName ?? searchParams.to}
        </span>
        <span><i className="fi fi-rr-calendar fi-xs" style={{ marginRight: 3 }} />{searchParams.date}</span>
        <span><i className="fi fi-rr-clock fi-xs" style={{ marginRight: 3 }} />{['all','morning','afternoon','evening'].reduce((acc, id) => {
          const t = { all:'不限時段', morning:'上午', afternoon:'下午', evening:'晚上' };
          return searchParams.timeSlot === id ? t[id] : acc;
        }, '不限時段')}</span>
        <span><i className="fi fi-rr-ticket fi-xs" style={{ marginRight: 3 }} />{ticketSummary}（共 {totalPassengers} 人）</span>
        {searchParams.queryType === 'advanced' && <span className="badge badge-primary">進階查詢</span>}
      </div>

      <div className="results-sort-bar">
        <span className="sort-label">排序：</span>
        {[{ key: 'depTime', label: '出發時間' }, { key: 'duration', label: '行車時間' }, { key: 'price', label: '票價' }].map(s => (
          <button key={s.key} className={`sort-btn ${sortKey === s.key ? 'active' : ''}`} onClick={() => setSortKey(s.key)}>
            {s.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          共 {sorted.length} 班車次
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <i className="fi fi-rr-ban fi-lg" style={{ color: 'var(--secondary)' }} />
          <p>無符合條件的車次</p>
          <button className="btn-primary" onClick={() => navigate('/ticket')}>重新查詢</button>
        </div>
      ) : (
        sorted.map(train => (
          <TrainCard key={train.id} train={train} ticketCounts={searchParams.ticketCounts} onSelect={handleSelect} />
        ))
      )}
    </div>
  );
}

function TrainCard({ train, ticketCounts, onSelect }) {
  const [stopsOpen, setStopsOpen] = useState(false);
  const typeInfo = TRAIN_TYPES[train.type] ?? {};

  const totalPassengers = Object.values(ticketCounts).reduce((s, v) => s + v, 0);
  const totalPrice = TICKET_TYPES.reduce((sum, tt) =>
    sum + Math.round(train.basePrice * tt.discount) * (ticketCounts[tt.id] ?? 0), 0);

  const windowLow = train.availableWindow < totalPassengers;
  const aisleLow  = train.availableAisle  < totalPassengers;

  const stops = stopsOpen
    ? getStopsBetween(train.from, train.to, train.type, train.depTime, train.duration)
    : [];

  const delay = train.delay ?? { status: 'unknown', label: '未知', color: '#6b7280', bg: '#f1f5f9' };

  return (
    <div className="train-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Time column */}
        <div className="train-time-col">
          <span className="train-dep">{train.depTime}</span>
          <div className="train-duration-line" />
          <span className="train-arr">{train.arrTime}</span>
        </div>

        {/* Duration */}
        <div className="train-duration-col">
          <span className="train-duration-text">{formatDuration(train.duration)}</span>
        </div>

        {/* Info */}
        <div className="train-info-col">
          <div className="train-route">
            <span className="train-type-badge" style={{ background: typeInfo.bg, color: typeInfo.color }}>
              {typeInfo.icon} {typeInfo.name}
            </span>
            {train.trainNo}
            <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.9rem' }}>
              {train.fromName} → {train.toName}
            </span>
          </div>
          <div className="train-meta">
            {/* 誤點狀態 */}
            <span className="delay-badge" style={{ background: delay.bg, color: delay.color }}>
              {delay.status === 'ontime' ? <i className="fi fi-sr-check fi-xs" style={{ marginRight: 3 }} /> : delay.status === 'delayed' ? <i className="fi fi-sr-exclamation fi-xs" style={{ marginRight: 3 }} /> : '? '}{delay.label}
            </span>
            <span className={`seat-chip ${windowLow ? 'low' : ''}`}><i className="fi fi-rr-window fi-xs" style={{ marginRight: 3 }} />靠窗 {train.availableWindow}</span>
            <span className={`seat-chip ${aisleLow ? 'low' : ''}`}><i className="fi fi-rr-chair fi-xs" style={{ marginRight: 3 }} />走道 {train.availableAisle}</span>
          </div>
        </div>

        {/* Price + select */}
        <div className="train-price-col">
          <div>
            <div className="train-price-main">NT${train.basePrice.toLocaleString()}</div>
            <div className="train-price-label">全票 / 人</div>
          </div>
          {totalPassengers > 1 && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              合計約 NT${totalPrice.toLocaleString()}
            </div>
          )}
          <button className="btn-primary btn-sm" onClick={() => onSelect(train)}>
            選擇此車次 <i className="fi fi-rr-arrow-right fi-xs" />
          </button>
        </div>
      </div>

      {/* 沿途停靠站 */}
      <div style={{ borderTop: '1px dashed var(--border)', marginTop: '0.5rem', paddingTop: '0.4rem' }}>
        <button
          className="stops-toggle-btn"
          onClick={() => setStopsOpen(v => !v)}
        >
          <i className="fi fi-rr-marker fi-xs" />
          沿途停靠站
          {stopsOpen ? <i className="fi fi-rr-angle-up fi-xs" /> : <i className="fi fi-rr-angle-down fi-xs" />}
        </button>

        {stopsOpen && (
          <div className="stops-list">
            <div className="stop-item stop-item-origin">
              <span className="stop-dot origin" />
              <span className="stop-name">{train.fromName}</span>
              <span className="stop-time">{train.depTime} 出發</span>
            </div>
            {stops.map(s => (
              <div key={s.id} className="stop-item">
                <span className="stop-dot" />
                <span className="stop-name">{s.name}</span>
                <span className="stop-time">{s.arrTime}</span>
              </div>
            ))}
            <div className="stop-item stop-item-dest">
              <span className="stop-dot dest" />
              <span className="stop-name">{train.toName}</span>
              <span className="stop-time">{train.arrTime} 抵達</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
