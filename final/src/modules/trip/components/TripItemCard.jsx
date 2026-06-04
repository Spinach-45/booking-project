import { useState } from 'react';
import { ITEM_TYPES, STATUS_OPTIONS, TYPE_ICONS } from '../data/attractions';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import useStore from '../../../store/useTripStore';

export default function TripItemCard({
  item, tripId, dayId,
  onEdit,
  dragHandlers,
  isDragging,
  isDragOver,
  conflictIds = [],
}) {
  const { deleteItem, updateItem, vote, currentUser } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const typeInfo = ITEM_TYPES.find(t => t.value === item.type) || ITEM_TYPES[0];
  const statusInfo = STATUS_OPTIONS.find(s => s.value === item.status) || STATUS_OPTIONS[0];
  const hasConflict = conflictIds.includes(item.id);
  const userVotedFor = item.votes.for.includes(currentUser?.id);
  const userVotedAgainst = item.votes.against.includes(currentUser?.id);

  const handleStatusChange = (newStatus) => {
    updateItem(tripId, dayId, item.id, { status: newStatus });
  };
  const handleCandidateToggle = () => {
    updateItem(tripId, dayId, item.id, { isCandidate: !item.isCandidate });
  };
  const handleVote = (choice) => {
    if (!currentUser) return;
    vote(tripId, dayId, item.id, choice);
  };

  const itemClass = [
    'trip-item',
    `status-${item.status}`,
    item.isCandidate ? 'is-candidate' : '',
    isDragging ? 'dragging' : '',
    isDragOver ? 'drag-over-indicator' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div
        className={itemClass}
        draggable
        onDragStart={dragHandlers?.onDragStart}
        onDragOver={dragHandlers?.onDragOver}
        onDrop={dragHandlers?.onDrop}
        onDragEnd={dragHandlers?.onDragEnd}
      >
        <div className="trip-item-header">
          <span className="trip-item-drag"><i className="fi fi-rr-grip-dots-vertical fi-sm" /></span>
          <span className="trip-item-time">
            <i className="fi fi-rr-clock fi-xs" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
            {item.time}
          </span>
          <span className="trip-item-title">
            <span style={{ marginRight: 4 }}>{typeInfo.icon}</span>
            {item.title}
          </span>
          <div className="trip-item-actions">
            <button
              className="btn-icon-sm"
              title="設為候選"
              onClick={handleCandidateToggle}
              style={item.isCandidate ? { background: '#fef3c7', borderColor: '#fde68a', color: '#d97706' } : {}}
            >
              <i className="fi fi-rr-star fi-xs" />
            </button>
            <button className="btn-icon-sm" title="編輯" onClick={onEdit}><i className="fi fi-rr-pencil fi-xs" /></button>
            <button className="btn-icon-sm btn-danger-icon" title="刪除" onClick={() => setConfirmDelete(true)}><i className="fi fi-rr-trash fi-xs" /></button>
          </div>
        </div>

        <div className="trip-item-meta">
          {item.location && (
            <span className="trip-item-location">
              <i className="fi fi-rr-marker fi-xs" /> {item.location}
            </span>
          )}
          <span
            className={`badge badge-${item.status}`}
            style={{ cursor: 'pointer' }}
            title="點擊切換狀態"
            onClick={() => {
              const opts = STATUS_OPTIONS.map(s => s.value);
              const idx = opts.indexOf(item.status);
              handleStatusChange(opts[(idx + 1) % opts.length]);
            }}
          >
            {statusInfo.label}
          </span>
          {item.isCandidate && (
            <span className="badge badge-candidate">候選</span>
          )}
          {hasConflict && (
            <span className="badge badge-conflict">⚡ 時間衝突</span>
          )}
          {item.duration > 0 && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {item.duration >= 60
                ? `${Math.floor(item.duration / 60)}h${item.duration % 60 > 0 ? `${item.duration % 60}m` : ''}`
                : `${item.duration}m`}
            </span>
          )}
        </div>

        {item.notes && (
          <div className="trip-item-notes">
            <i className="fi fi-rr-info fi-xs" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {item.notes}
          </div>
        )}

        {item.isCandidate && (hasConflict || item.votes.for.length > 0 || item.votes.against.length > 0) && (
          <div className="trip-item-votes">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginRight: 4 }}>投票：</span>
            <button
              className={`vote-btn vote-btn-for ${userVotedFor ? 'voted' : ''}`}
              onClick={() => handleVote('for')}
              disabled={!currentUser}
            >
              <i className="fi fi-rr-check fi-xs" />
              <span className="vote-count">{item.votes.for.length}</span>
            </button>
            <button
              className={`vote-btn vote-btn-against ${userVotedAgainst ? 'voted' : ''}`}
              onClick={() => handleVote('against')}
              disabled={!currentUser}
            >
              <i className="fi fi-rr-cross fi-xs" />
              <span className="vote-count">{item.votes.against.length}</span>
            </button>
            {item.votes.for.length > item.votes.against.length && item.votes.for.length > 0 && (
              <span style={{ fontSize: '0.72rem', color: 'var(--success)', marginLeft: 4 }}>多數保留</span>
            )}
            {item.votes.against.length > item.votes.for.length && (
              <span style={{ fontSize: '0.72rem', color: 'var(--danger)', marginLeft: 4 }}>多數取消</span>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteItem(tripId, dayId, item.id)}
        title="刪除行程項目"
        message={`確定要刪除「${item.title}」嗎？此操作無法復原。`}
        icon="🗑️"
        confirmLabel="刪除"
      />
    </>
  );
}
