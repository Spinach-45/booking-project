import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import useStore from '../../../store/useTrainStore';
import { TRAIN_TYPES, TICKET_TYPES, formatDuration } from '../data/trainData';

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const { searchParams, searchResults, searchTrains, selectTrain } = useStore();
  const [sortKey, setSortKey] = useState('depTime');

  useEffect(() => {
    if (searchResults.length === 0) {
      searchTrains(searchParams);
    }
  }, []);

  const totalPassengers = Object.values(searchParams.ticketCounts).reduce((s, v) => s + v, 0);

  const sorted = [...searchResults].sort((a, b) => {
    if (sortKey === 'price') return a.basePrice - b.basePrice;
    if (sortKey === 'duration') return a.duration - b.duration;
    return a.depTime.localeCompare(b.depTime);
  });

  const stationName = (id) => {
    const { STATION_MAP } = require ? null : null;
    return searchParams.from === id ? (sorted[0]?.fromName ?? id) : (sorted[0]?.toName ?? id);
  };

  const handleSelect = (train) => {
    selectTrain(train);
    navigate('/ticket/booking');
  };

  const ticketSummary = TICKET_TYPES
    .filter(tt => (searchParams.ticketCounts[tt.id] ?? 0) > 0)
    .map(tt => `${tt.name}×${searchParams.ticketCounts[tt.id]}`)
    .join('、');

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button className="btn-ghost btn-sm" onClick={() => navigate('/ticket')}>
          <ArrowLeft size={14} /> 修改查詢
        </button>
        <h1 className="page-title">🔍 車次查詢結果</h1>
      </div>

      {/* Summary bar */}
      <div className="results-summary-bar">
        <span>
          {sorted[0]?.fromName ?? searchParams.from}
          <ArrowRight size={14} style={{ display: 'inline', margin: '0 4px', verticalAlign: 'middle' }} />
          {sorted[0]?.toName ?? searchParams.to}
        </span>
        <span>📅 {searchParams.date}</span>
        <span>🕐 {['all','morning','afternoon','evening'].reduce((acc, id) => {
          const t = { all:'不限時段', morning:'上午', afternoon:'下午', evening:'晚上' };
          return searchParams.timeSlot === id ? t[id] : acc;
        }, '不限時段')}</span>
        <span>🎫 {ticketSummary}（共 {totalPassengers} 人）</span>
        {searchParams.queryType === 'advanced' && (
          <span className="badge badge-primary">進階查詢</span>
        )}
      </div>

      {/* Sort bar */}
      <div className="results-sort-bar">
        <span className="sort-label">排序：</span>
        {[
          { key: 'depTime', label: '出發時間' },
          { key: 'duration', label: '行車時間' },
          { key: 'price', label: '票價' },
        ].map(s => (
          <button
            key={s.key}
            className={`sort-btn ${sortKey === s.key ? 'active' : ''}`}
            onClick={() => setSortKey(s.key)}
          >
            {s.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          共 {sorted.length} 班車次
        </span>
      </div>

      {/* Train list */}
      {sorted.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>🚫</div>
          <p>無符合條件的車次</p>
          <button className="btn-primary" onClick={() => navigate('/ticket')}>重新查詢</button>
        </div>
      ) : (
        sorted.map(train => <TrainCard key={train.id} train={train} ticketCounts={searchParams.ticketCounts} onSelect={handleSelect} />)
      )}
    </div>
  );
}

function TrainCard({ train, ticketCounts, onSelect }) {
  const typeInfo = TRAIN_TYPES[train.type] ?? {};
  const adultPrice = train.basePrice;

  const totalPassengers = Object.values(ticketCounts).reduce((s, v) => s + v, 0);
  const totalPrice = TICKET_TYPES.reduce((sum, tt) => {
    return sum + Math.round(adultPrice * tt.discount) * (ticketCounts[tt.id] ?? 0);
  }, 0);

  const windowLow = train.availableWindow < totalPassengers;
  const aisleLow  = train.availableAisle  < totalPassengers;

  return (
    <div className="train-card">
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
          <span
            className="train-type-badge"
            style={{ background: typeInfo.bg, color: typeInfo.color }}
          >
            {typeInfo.icon} {typeInfo.name}
          </span>
          {train.trainNo}
          <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.9rem' }}>
            {train.fromName} → {train.toName}
          </span>
        </div>
        <div className="train-meta">
          <span>🕐 {train.depTime} – {train.arrTime}</span>
          <span className={`seat-chip ${windowLow ? 'low' : ''}`}>
            🪟 靠窗 {train.availableWindow}
          </span>
          <span className={`seat-chip ${aisleLow ? 'low' : ''}`}>
            💺 走道 {train.availableAisle}
          </span>
        </div>
      </div>

      {/* Price + select */}
      <div className="train-price-col">
        <div>
          <div className="train-price-main">NT${adultPrice.toLocaleString()}</div>
          <div className="train-price-label">全票 / 人</div>
        </div>
        {totalPassengers > 1 && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            合計約 NT${totalPrice.toLocaleString()}
          </div>
        )}
        <button className="btn-primary btn-sm" onClick={() => onSelect(train)}>
          選擇此車次 <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
