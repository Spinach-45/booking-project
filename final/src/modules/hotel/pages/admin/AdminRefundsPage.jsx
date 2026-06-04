import { useState } from 'react';
import useStore from '../../../../store/useHotelStore';
import Modal from '../../../../components/common/Modal';
import ConfirmDialog from '../../../../components/common/ConfirmDialog';
import { useToast } from '../../../../components/common/Toast';

export default function AdminRefundsPage() {
  const { refundRequests, updateRefundRequest } = useStore();
  const addToast = useToast();

  const [filter, setFilter] = useState('all');
  const [detailModal, setDetailModal] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  // confirmAction: { type: 'approve'|'reject', request }

  const filtered = filter === 'all' ? refundRequests : refundRequests.filter(r => r.status === filter);

  const handleApprove = (req) => {
    updateRefundRequest(req.id, { status: 'approved', resolvedAt: new Date().toISOString() });
    addToast('退款已核准', 'success');
    setDetailModal(null);
  };

  const handleReject = (req) => {
    updateRefundRequest(req.id, { status: 'rejected', resolvedAt: new Date().toISOString() });
    addToast('退款已拒絕', 'info');
    setDetailModal(null);
  };

  const STATUS_LABEL = { pending: '待審核', approved: '已核准', rejected: '已拒絕' };
  const STATUS_BADGE = { pending: 'badge-pending', approved: 'badge-confirmed', rejected: 'badge-cancelled' };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">
        <i className="fi fi-rr-arrows-h" style={{ fontSize: 20 }} /> 審核退款
      </h1>

      <div className="filter-tabs">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            className={`tab-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '全部' : STATUS_LABEL[f]}
            {f === 'pending' && refundRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="tab-badge">{refundRequests.filter(r => r.status === 'pending').length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>退款編號</th>
              <th>訂單編號</th>
              <th>申請人</th>
              <th>退款金額</th>
              <th>申請時間</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="no-data-row">目前沒有退款申請</td></tr>
            ) : (
              filtered
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(req => (
                  <tr key={req.id}>
                    <td className="order-id">{req.id.slice(-8)}</td>
                    <td className="order-id">{req.orderId ? req.orderId.slice(-8) : '-'}</td>
                    <td>{req.userName || req.userId || '-'}</td>
                    <td>NT$ {(req.amount || 0).toLocaleString()}</td>
                    <td>{new Date(req.createdAt).toLocaleDateString('zh-TW')}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[req.status] || ''}`}>
                        {STATUS_LABEL[req.status] || req.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-sm btn-outline" onClick={() => setDetailModal(req)}>
                          <i className="fi fi-rr-eye fi-sm" /> 詳情
                        </button>
                        {req.status === 'pending' && (
                          <>
                            <button
                              className="btn-sm btn-primary"
                              onClick={() => setConfirmAction({ type: 'approve', request: req })}
                            >
                              核准
                            </button>
                            <button
                              className="btn-sm btn-danger"
                              onClick={() => setConfirmAction({ type: 'reject', request: req })}
                            >
                              拒絕
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="退款申請詳情" size="md">
        {detailModal && (
          <div>
            <div className="form-grid">
              <div className="form-group">
                <label>退款編號</label>
                <p className="form-value">{detailModal.id}</p>
              </div>
              <div className="form-group">
                <label>訂單編號</label>
                <p className="form-value">{detailModal.orderId || '-'}</p>
              </div>
              <div className="form-group">
                <label>申請人</label>
                <p className="form-value">{detailModal.userName || detailModal.userId || '-'}</p>
              </div>
              <div className="form-group">
                <label>退款金額</label>
                <p className="form-value">NT$ {(detailModal.amount || 0).toLocaleString()}</p>
              </div>
              <div className="form-group">
                <label>申請原因</label>
                <p className="form-value">{detailModal.reason || '無說明'}</p>
              </div>
              <div className="form-group">
                <label>申請時間</label>
                <p className="form-value">{new Date(detailModal.createdAt).toLocaleString('zh-TW')}</p>
              </div>
              <div className="form-group">
                <label>狀態</label>
                <p className="form-value">
                  <span className={`badge ${STATUS_BADGE[detailModal.status] || ''}`}>
                    {STATUS_LABEL[detailModal.status] || detailModal.status}
                  </span>
                </p>
              </div>
            </div>
            {detailModal.status === 'pending' && (
              <div className="modal-footer">
                <button
                  className="btn-primary"
                  onClick={() => { setDetailModal(null); setConfirmAction({ type: 'approve', request: detailModal }); }}
                >
                  核准退款
                </button>
                <button
                  className="btn-danger"
                  onClick={() => { setDetailModal(null); setConfirmAction({ type: 'reject', request: detailModal }); }}
                >
                  拒絕退款
                </button>
                <button className="btn-ghost" onClick={() => setDetailModal(null)}>關閉</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction?.type === 'approve') handleApprove(confirmAction.request);
          else if (confirmAction?.type === 'reject') handleReject(confirmAction.request);
        }}
        title={confirmAction?.type === 'approve' ? '核准退款' : '拒絕退款'}
        message={
          confirmAction?.type === 'approve'
            ? `確定核准此退款申請（NT$ ${(confirmAction?.request?.amount || 0).toLocaleString()}）？`
            : '確定拒絕此退款申請？'
        }
        confirmLabel={confirmAction?.type === 'approve' ? '確認核准' : '確認拒絕'}
        confirmClass={confirmAction?.type === 'approve' ? 'btn-primary' : 'btn-danger'}
        icon={
          confirmAction?.type === 'approve'
            ? <i className="fi fi-sr-check-circle fi-lg" style={{ color: 'var(--success, #10b981)' }} />
            : <i className="fi fi-sr-exclamation fi-lg" style={{ color: 'var(--warning, #f59e0b)' }} />
        }
      />
    </div>
  );
}
