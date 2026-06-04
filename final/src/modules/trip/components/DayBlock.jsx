import { useState, useRef } from 'react';
import TripItemCard from './TripItemCard';
import AddItemModal from './AddItemModal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import useStore from '../../../store/useTripStore';

const DOW = ['日', '一', '二', '三', '四', '五', '六'];

export default function DayBlock({ day, trip }) {
  const { addItem, updateItem, deleteDay, reorderItems, detectConflicts } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmDelDay, setConfirmDelDay] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const date = new Date(day.date + 'T00:00:00');
  const dow = DOW[date.getDay()];
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}（${dow}）`;

  const conflicts = detectConflicts(day);
  const conflictIds = conflicts.flat();

  const handleDragStart = (index) => (e) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (index) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };
  const handleDrop = (index) => (e) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newItems = [...day.items];
    const [dragged] = newItems.splice(dragIndex, 1);
    newItems.splice(index, 0, dragged);
    reorderItems(trip.id, day.id, newItems);
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveItem = (formData) => {
    if (editItem) {
      updateItem(trip.id, day.id, editItem.id, formData);
      setEditItem(null);
    } else {
      addItem(trip.id, day.id, formData);
    }
  };

  return (
    <div className="day-block">
      <div className="day-header">
        <span className="day-header-num">第 {day.dayNumber} 天</span>
        <span className="day-header-date">{dateStr}</span>
        {conflicts.length > 0 && (
          <span className="badge badge-conflict" style={{ fontSize: '0.72rem' }}>
            <i className="fi fi-sr-exclamation fi-xs" style={{ color: '#ff9800', marginRight: 3 }} />{conflicts.length} 個衝突
          </span>
        )}
        <div className="day-header-actions">
          <button
            className="btn-icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? '展開' : '收合'}
          >
            {collapsed ? <i className="fi fi-rr-angle-down fi-sm" /> : <i className="fi fi-rr-angle-up fi-sm" />}
          </button>
          <button
            className="btn-icon-sm btn-danger-icon"
            onClick={() => setConfirmDelDay(true)}
            title="刪除此天"
          >
            <i className="fi fi-rr-trash fi-sm" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="day-items">
            {day.items.length === 0 && (
              <div className="day-empty">尚未安排行程，點擊下方按鈕新增</div>
            )}
            {day.items.map((item, index) => (
              <TripItemCard
                key={item.id}
                item={item}
                tripId={trip.id}
                dayId={day.id}
                onEdit={() => setEditItem(item)}
                isDragging={dragIndex === index}
                isDragOver={dragOverIndex === index}
                conflictIds={conflictIds}
                dragHandlers={{
                  onDragStart: handleDragStart(index),
                  onDragOver: handleDragOver(index),
                  onDrop: handleDrop(index),
                  onDragEnd: handleDragEnd,
                }}
              />
            ))}
          </div>

          <button className="day-add-btn" onClick={() => setAddModal(true)}>
            <i className="fi fi-rr-plus fi-sm" /> 新增行程項目
          </button>
        </>
      )}

      <AddItemModal
        isOpen={addModal || !!editItem}
        onClose={() => { setAddModal(false); setEditItem(null); }}
        onSave={handleSaveItem}
        initialData={editItem}
        stationId={trip.stationId}
      />

      <ConfirmDialog
        isOpen={confirmDelDay}
        onClose={() => setConfirmDelDay(false)}
        onConfirm={() => deleteDay(trip.id, day.id)}
        title="刪除此天行程"
        message={`確定要刪除「第 ${day.dayNumber} 天（${dateStr}）」及其所有項目嗎？`}
        icon={<i className="fi fi-rr-trash fi-lg" style={{ color: 'var(--danger)' }} />}
        confirmLabel="刪除"
      />
    </div>
  );
}
