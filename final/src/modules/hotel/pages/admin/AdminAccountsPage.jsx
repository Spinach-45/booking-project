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
  // confirmAction: { type: 'role'|'toggle', userId, newRole?, user }

  const refresh = () => setUsers(getUsers());

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
            {users.length === 0 ? (
              <tr><td colSpan={6} className="no-data-row">沒有用戶資料</td></tr>
            ) : (
              users.map(user => (
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
