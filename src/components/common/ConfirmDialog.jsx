import Modal from './Modal';

export default function ConfirmDialog({
  isOpen, onClose, onConfirm,
  title = '確認操作',
  message = '確定要執行此操作嗎？',
  icon = '⚠️',
  confirmLabel = '確認',
  confirmClass = 'btn-danger',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="confirm-body">
        <div className="confirm-icon">{icon}</div>
        <p className="confirm-message">{message}</p>
      </div>
      <div className="modal-footer">
        <button className="btn-ghost" onClick={onClose}>取消</button>
        <button className={confirmClass} onClick={() => { onConfirm(); onClose(); }}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
