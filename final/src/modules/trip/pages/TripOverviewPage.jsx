import { useParams, useNavigate, Link } from 'react-router-dom';
import useStore from '../../../store/useTripStore';
import { ITEM_TYPES, STATUS_OPTIONS } from '../data/attractions';

const DOW = ['日', '一', '二', '三', '四', '五', '六'];

export default function TripOverviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTrip } = useStore();
  const trip = getTrip(id);

  if (!trip) return (
    <div className="container">
      <div className="empty-state" style={{ paddingTop: '6rem' }}>
        <div style={{ fontSize: '3rem' }}>🔍</div>
        <p>找不到此行程</p>
        <button className="btn-primary" onClick={() => navigate('/trip')}>返回行程列表</button>
      </div>
    </div>
  );

  const formatDate = (d) => {
    const dt = new Date(d + 'T00:00:00');
    const dow = DOW[dt.getDay()];
    return `${dt.getFullYear()}年 ${dt.getMonth() + 1}月${dt.getDate()}日（${dow}）`;
  };

  const getTypeIcon = (type) => ITEM_TYPES.find(t => t.value === type)?.icon || '📍';
  const getStatusLabel = (status) => STATUS_OPTIONS.find(s => s.value === status)?.label || status;

  // summary stats
  const totalItems = trip.days.reduce((sum, d) => sum + d.items.length, 0);
  const completedItems = trip.days.reduce((sum, d) => sum + d.items.filter(i => i.status === 'completed').length, 0);
  const candidateItems = trip.days.reduce((sum, d) => sum + d.items.filter(i => i.isCandidate).length, 0);

  return (
    <div className="overview-page">
      <div className="container">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-ghost btn-sm" onClick={() => navigate(`/trip/${id}`)}>
              <i className="fi fi-rr-arrow-left fi-sm" /> 返回編輯
            </button>
            <h1 className="page-title">
              <i className="fi fi-rr-marker" style={{ fontSize: 20 }} /> {trip.title} — 行程總覽
            </h1>
          </div>
          <Link to={`/trip/${id}`} className="btn-primary btn-sm">
            編輯行程
          </Link>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'flex', gap: '1rem', margin: '0 0 1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: '總天數', value: trip.days.length, icon: '📅' },
            { label: '行程項目', value: totalItems, icon: '📍' },
            { label: '已完成', value: completedItems, icon: '✅' },
            { label: '候選中', value: candidateItems, icon: '⭐' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              padding: '0.9rem 1.25rem', flex: '1', minWidth: '100px',
            }}>
              <div style={{ fontSize: '1.4rem', marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="overview-grid">
          {trip.days.map(day => (
            <div key={day.id} className="overview-day">
              <div className="overview-day-header">
                <div>
                  <div className="overview-day-num">第 {day.dayNumber} 天</div>
                  <div className="overview-day-date">{formatDate(day.date)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>{day.items.length} 個項目</span>
                </div>
              </div>

              {day.items.length === 0 ? (
                <div className="overview-empty">尚未安排行程</div>
              ) : (
                <div className="overview-timeline">
                  {day.items.map(item => {
                    const statusInfo = STATUS_OPTIONS.find(s => s.value === item.status);
                    const dotClass = [
                      'timeline-dot',
                      `status-${item.status}`,
                      item.isCandidate ? 'is-candidate' : '',
                    ].filter(Boolean).join(' ');
                    return (
                      <div key={item.id} className="timeline-item">
                        <div className="timeline-time">
                          <i className="fi fi-rr-clock fi-xs" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                          {item.time}
                        </div>
                        <div className={dotClass} />
                        <div className="timeline-content">
                          <div className="timeline-title">
                            {getTypeIcon(item.type)} {item.title}
                            {item.isCandidate && (
                              <span className="badge badge-candidate" style={{ marginLeft: 6, fontSize: '0.7rem' }}>候選</span>
                            )}
                            <span
                              className={`badge badge-${item.status}`}
                              style={{ marginLeft: 6, fontSize: '0.7rem' }}
                            >
                              {getStatusLabel(item.status)}
                            </span>
                          </div>
                          {item.location && (
                            <div className="timeline-location">
                              <i className="fi fi-rr-marker fi-xs" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                              {item.location}
                            </div>
                          )}
                          {item.notes && (
                            <div className="timeline-notes">💬 {item.notes}</div>
                          )}
                          {item.isCandidate && (item.votes.for.length > 0 || item.votes.against.length > 0) && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                              投票：👍 {item.votes.for.length} · 👎 {item.votes.against.length}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {trip.days.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: '3rem' }}>📅</div>
            <p>行程尚未安排任何天數</p>
            <Link to={`/trip/${id}`} className="btn-primary">前往安排行程</Link>
          </div>
        )}
      </div>
    </div>
  );
}
