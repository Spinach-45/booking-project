import { useState } from 'react';
import useStore from '../../../../store/useHotelStore';
import useAuthStore from '../../../../store/useAuthStore';
import { useToast } from '../../../../components/common/Toast';
import Modal from '../../../../components/common/Modal';
import ConfirmDialog from '../../../../components/common/ConfirmDialog';

export default function ConflictLogsPage() {
  const { getConflictLogs, getAdminUserCoupons, issueConflictCoupon } = useStore();
  const { getUsers } = useAuthStore();
  const addToast = useToast();

  const logs = getConflictLogs().slice().sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
  const userCoupons = getAdminUserCoupons().slice().sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  const users = getUsers();

  const [tab, setTab] = useState('logs'); // 'logs' | 'coupons'
  const [issueModal, setIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ email: '', amount: 500 });
  const [issueConfirm, setIssueConfirm] = useState(null); // { user, amount }

  // 同一房源短期衝突警示（7 天內同房源出現 2+ 次衝突）
  const warningProps = (() => {
    const cutoff = new Date(Date.now() - 7 * 86400000).toISOString();
    const recent = logs.filter(l => l.occurredAt >= cutoff);
    const counts = {};
    recent.forEach(l => { counts[l.propertyId] = (counts[l.propertyId] || 0) + 1; });
    return Object.entries(counts).filter(([, c]) => c >= 2).map(([id]) => id);
  })();

  const handleIssueConfirm = () => {
    const user = users.find(u => u.email === issueForm.email.trim());
    if (!user) { addToast('找不到此帳號', 'error'); return; }
    setIssueModal(false);
    setIssueConfirm({ user, amount: issueForm.amount });
  };

  const handleIssue = () => {
    issueConflictCoupon(issueConfirm.user.id, issueConfirm.user.name, 'MANUAL');
    addToast(`已對 ${issueConfirm.user.name} 補發折價券`, 'success');
    setIssueConfirm(null);
    setIssueForm({ email: '', amount: 500 });
  };

  const STATUS_BADGE = { unused: 'badge-pending', used: 'badge-confirmed', expired: 'badge-cancelled' };
  const STATUS_LABEL = { unused: '未使用', used: '已使用', expired: '已過期' };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fi fi-rr-exclamation" style={{ fontSize: 20 }} /> 衝突事件紀錄
        </h1>
        <button className="btn-primary" onClick={() => setIssueModal(true)}>
          <i className="fi fi-rr-tag fi-sm" style={{ marginRight: 4 }} />手動補發折價券
        </button>
      </div>

      {warningProps.length > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="fi fi-rr-exclamation fi-sm" />
          警示：{warningProps.length} 個房源在近 7 天內重複發生衝突，請檢查其庫存設定。
        </div>
      )}

      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        <button className={`tab-btn ${tab === 'logs' ? 'active' : ''}`} onClick={() => setTab('logs')}>
          衝突事件 <span className="tab-badge">{logs.length}</span>
        </button>
        <button className={`tab-btn ${tab === 'coupons' ? 'active' : ''}`} onClick={() => setTab('coupons')}>
          補償折價券紀錄 <span className="tab-badge">{userCoupons.length}</span>
        </button>
      </div>

      {tab === 'logs' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>發生時間</th>
                <th>房源名稱</th>
                <th>有效訂單</th>
                <th>衝突訂單</th>
                <th>衝突用戶</th>
                <th>退款金額</th>
                <th>折價券</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={7} className="no-data-row">目前沒有衝突紀錄</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} style={warningProps.includes(log.propertyId) ? { background: '#fffbeb' } : {}}>
                  <td style={{ fontSize: 13 }}>
                    {new Date(log.occurredAt).toLocaleString('zh-TW')}
                    {warningProps.includes(log.propertyId) && (
                      <span style={{ marginLeft: 4, color: '#d97706' }}><i className="fi fi-sr-exclamation fi-xs" /></span>
                    )}
                  </td>
                  <td>{log.propertyName || log.propertyId}</td>
                  <td className="order-id">{log.validOrderId?.slice(-8)}</td>
                  <td className="order-id">{log.conflictOrderId?.slice(-8)}</td>
                  <td>{log.conflictUserName || log.conflictUserId || '-'}</td>
                  <td>NT$ {(log.refundAmount || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${log.couponIssued ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {log.couponIssued ? '已發放' : '未發放'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'coupons' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>發放時間</th>
                <th>接收帳號</th>
                <th>原衝突訂單</th>
                <th>面額</th>
                <th>有效期限</th>
                <th>使用狀態</th>
              </tr>
            </thead>
            <tbody>
              {userCoupons.length === 0 ? (
                <tr><td colSpan={6} className="no-data-row">目前沒有補償折價券紀錄</td></tr>
              ) : userCoupons.map(uc => {
                const expired = new Date(uc.expiresAt) < new Date() && uc.status === 'unused';
                const displayStatus = expired ? 'expired' : uc.status;
                return (
                  <tr key={uc.id}>
                    <td style={{ fontSize: 13 }}>{new Date(uc.issuedAt).toLocaleString('zh-TW')}</td>
                    <td>{uc.userName || uc.userId}</td>
                    <td className="order-id">{uc.conflictOrderId === 'MANUAL' ? '手動補發' : uc.conflictOrderId?.slice(-8)}</td>
                    <td>NT$ {uc.amount.toLocaleString()}</td>
                    <td>{uc.expiresAt}</td>
                    <td><span className={`badge ${STATUS_BADGE[displayStatus] || ''}`}>{STATUS_LABEL[displayStatus] || displayStatus}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 手動補發折價券 Modal */}
      <Modal isOpen={issueModal} onClose={() => setIssueModal(false)} title="手動補發折價券" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label>接收方 Email</label>
            <input
              className="form-input"
              placeholder="user@example.com"
              value={issueForm.email}
              onChange={e => setIssueForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>面額（NT$）</label>
            <input
              className="form-input"
              type="number"
              min={1}
              value={issueForm.amount}
              onChange={e => setIssueForm(f => ({ ...f, amount: e.target.value === '' ? '' : Number(e.target.value) }))}
            />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            折價券將以「NT$500 訂房衝突補償券」規格發放，有效期 90 天。
          </p>
          <div className="modal-footer">
            <button className="btn-primary" onClick={handleIssueConfirm}>查詢並發放</button>
            <button className="btn-ghost" onClick={() => setIssueModal(false)}>取消</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!issueConfirm}
        onClose={() => setIssueConfirm(null)}
        onConfirm={handleIssue}
        title="確認補發折價券"
        message={`確定對「${issueConfirm?.user?.name}」（${issueConfirm?.user?.email}）補發 NT$500 訂房衝突補償券？`}
        confirmLabel="確認補發"
        confirmClass="btn-primary"
        icon={<i className="fi fi-rr-tag fi-lg" style={{ color: 'var(--primary)' }} />}
      />
    </div>
  );
}
