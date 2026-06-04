import { useState } from 'react';
import useStore from '../../../../store/useHotelStore';
import Modal from '../../../../components/common/Modal';
import ConfirmDialog from '../../../../components/common/ConfirmDialog';
import { useToast } from '../../../../components/common/Toast';

export default function AdminPropertiesApprovalPage() {
  const { properties, approveProperty, rejectProperty } = useStore();
  const addToast = useToast();

  const pendingProperties = properties.filter(p => p.status === 'pending');

  const [confirmApprove, setConfirmApprove] = useState(null); // property
  const [rejectModal, setRejectModal] = useState(null); // property
  const [rejectReason, setRejectReason] = useState('');
  const [confirmReject, setConfirmReject] = useState(null); // { prop, reason }

  const handleApprove = (prop) => {
    approveProperty(prop.id);
    addToast(`「${prop.name}」已核准上架`, 'success');
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      return;
    }
    setRejectModal(null);
    setConfirmReject({ prop: rejectModal, reason: rejectReason });
  };

  const handleRejectConfirm = () => {
    rejectProperty(confirmReject.prop.id, confirmReject.reason);
    addToast(`「${confirmReject.prop.name}」已退回`, 'info');
    setRejectReason('');
    setConfirmReject(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fi fi-rr-building" style={{ fontSize: 20 }} /> 審核房源
        </h1>
        <span style={{ color: 'var(--text-light, #888)', fontSize: 14 }}>
          共 {pendingProperties.length} 筆待審核
        </span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>房源名稱</th>
              <th>房東帳號</th>
              <th>地點</th>
              <th>房型數</th>
              <th>送審時間</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {pendingProperties.length === 0 ? (
              <tr><td colSpan={7} className="no-data-row">目前沒有待審核的房源</td></tr>
            ) : (
              pendingProperties.map(prop => (
                <tr key={prop.id}>
                  <td>
                    <div className="prop-cell">
                      {prop.images?.[0] && (
                        <img src={prop.images[0]} alt="" className="prop-thumb" />
                      )}
                      <div>
                        <div className="prop-cell-name">{prop.name}</div>
                        <div className="prop-cell-sub">{prop.address}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{prop.hostName || '-'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light, #888)' }}>{prop.hostId}</div>
                  </td>
                  <td>{prop.station || prop.area || '-'}</td>
                  <td>{prop.rooms?.length || 0} 種</td>
                  <td>
                    {prop.createdAt
                      ? new Date(prop.createdAt).toLocaleDateString('zh-TW')
                      : '-'}
                  </td>
                  <td>
                    <span className="badge badge-pending">待審核</span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn-sm btn-primary"
                        onClick={() => setConfirmApprove(prop)}
                      >
                        <i className="fi fi-rr-check fi-sm" /> 核准
                      </button>
                      <button
                        className="btn-sm btn-danger"
                        onClick={() => { setRejectReason(''); setRejectModal(prop); }}
                      >
                        <i className="fi fi-rr-cross fi-sm" /> 退回
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Approve Confirm */}
      <ConfirmDialog
        isOpen={!!confirmApprove}
        onClose={() => setConfirmApprove(null)}
        onConfirm={() => handleApprove(confirmApprove)}
        title="核准房源"
        message={`確定核准「${confirmApprove?.name}」上架？`}
        confirmLabel="確認核准"
        confirmClass="btn-primary"
        icon={<i className="fi fi-sr-check-circle fi-lg" style={{ color: 'var(--success, #10b981)' }} />}
      />

      {/* Reject Reason Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="退回原因" size="sm">
        {rejectModal && (
          <div>
            <p style={{ marginBottom: 12, color: 'var(--text-light, #888)' }}>
              房源：<strong>{rejectModal.name}</strong>
            </p>
            <div className="form-group">
              <label>退回原因 *</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="請說明退回原因，房東將收到此說明..."
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-danger"
                onClick={handleRejectSubmit}
                disabled={!rejectReason.trim()}
              >
                確認退回
              </button>
              <button className="btn-ghost" onClick={() => setRejectModal(null)}>取消</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Confirm */}
      <ConfirmDialog
        isOpen={!!confirmReject}
        onClose={() => setConfirmReject(null)}
        onConfirm={handleRejectConfirm}
        title="確認退回房源"
        message={`確定退回「${confirmReject?.prop?.name}」？此操作將通知房東。`}
        confirmLabel="確認退回"
        confirmClass="btn-danger"
      />
    </div>
  );
}
