import { useState } from 'react';
import useAuthStore from '../../../../store/useAuthStore';
import ConfirmDialog from '../../../../components/common/ConfirmDialog';
import { useToast } from '../../../../components/common/Toast';

const ROLE_LABEL = { customer: '一般用戶', host: '房東', admin: '管理員' };

export default function AdminAccountsPage() {
  const { getUsers, updateUserRole, toggleUserActive } = useAuthStore();
  const addToast = useToast();

  const [users, setUsers] = useState(() => getUsers());
  const [confirmAction, setConfirmAction] = useState(null);
  const [search, setSearch] = useState('');
  // confirmAction: { type: 'role'|'toggle', userId, newRole?, user }

  const refresh = () => setUsers(getUsers());

  const filteredUsers = search.trim()
    ? users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const handleRoleChange = (userId, newRole) => {
    updateUserRole(userId, newRole);
    refresh();
    addToast('角色已更新', 'success');
  };

  const handleToggleActive = (userId) => {
    toggleUserActive(userId);
    refresh();
    addToast('帳號狀態已更新', 'success');
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">
        <i className="fi fi-rr-users" style={{ fontSize: 20 }} /> 帳號管理
      </h1>

      {/* 搜尋列 */}
      <div style={{ marginBottom: 16, maxWidth: 360, display: 'flex', gap: 8, alignItems: 'center' }}>
        <i className="fi fi-rr-search fi-sm" style={{ color: 'var(--text-secondary, #888)' }} />
        <input
          className="form-input"
          placeholder="搜尋姓名或 Email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        {search && (
          <button className="btn-ghost btn-sm" onClick={() => setSearch('')}>
            <i className="fi fi-rr-cross fi-xs" />
          </button>
        )}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>帳號 (Email)</th>
              <th>姓名</th>
              <th>電話</th>
              <th>角色</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={6} className="no-data-row">{search ? '找不到符合的帳號' : '沒有用戶資料'}</td></tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.name}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span className={`badge ${
                      user.role === 'admin' ? 'badge-confirmed' :
                      user.role === 'host' ? 'badge-pending' : ''
                    }`}>
                      {ROLE_LABEL[user.role] || user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.active === false ? 'badge-cancelled' : 'badge-confirmed'}`}>
                      {user.active === false ? '停用' : '啟用'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <select
                        className="form-input"
                        style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}
                        value={user.role || 'customer'}
                        onChange={e => {
                          const newRole = e.target.value;
                          setConfirmAction({ type: 'role', userId: user.id, newRole, user });
                        }}
                      >
                        <option value="customer">一般用戶</option>
                        <option value="host">房東</option>
                        <option value="admin">管理員</option>
                      </select>
                      <button
                        className={`btn-sm ${user.active === false ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setConfirmAction({ type: 'toggle', userId: user.id, user })}
                      >
                        {user.active === false ? '啟用' : '停用'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction?.type === 'role') {
            handleRoleChange(confirmAction.userId, confirmAction.newRole);
          } else if (confirmAction?.type === 'toggle') {
            handleToggleActive(confirmAction.userId);
          }
        }}
        title={confirmAction?.type === 'role' ? '變更角色' : '變更帳號狀態'}
        message={
          confirmAction?.type === 'role'
            ? `確定將「${confirmAction?.user?.name}」的角色變更為「${ROLE_LABEL[confirmAction?.newRole] || confirmAction?.newRole}」？`
            : confirmAction?.user?.active === false
              ? `確定啟用帳號「${confirmAction?.user?.name}」？`
              : `確定停用帳號「${confirmAction?.user?.name}」？`
        }
        confirmLabel="確認"
        confirmClass={confirmAction?.type === 'toggle' && confirmAction?.user?.active !== false ? 'btn-danger' : 'btn-primary'}
      />
    </div>
  );
}
