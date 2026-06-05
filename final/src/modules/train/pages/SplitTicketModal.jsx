import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import useAuthStore from '../../../store/useAuthStore';

export default function SplitTicketModal({ order, passenger, passengerIdx, onClose, onConfirm }) {
  const { currentUser, getUsers } = useAuthStore();
  const [input, setInput] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState(1); // 1=input, 2=confirm

  const handleSearch = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const users = getUsers();
    const found = users.find(u =>
      (u.name === trimmed || u.phone === trimmed || u.email === trimmed) &&
      u.id !== currentUser?.id
    );
    if (found) {
      setFoundUser({ id: found.id, name: found.name, email: found.email });
      setNotFound(false);
      setStep(2);
    } else {
      setNotFound(true);
      setFoundUser(null);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="分票" size="sm">
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* 票券資訊 */}
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>分票票券</div>
            <div style={{ color: 'var(--text-secondary)' }}>
              {order.train.fromName} → {order.train.toName}　{order.train.date} {order.train.depTime}
            </div>
            <div style={{ marginTop: 4 }}>
              <span style={{ fontWeight: 600 }}>{passenger.name}</span>
              <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>{passenger.ticketTypeName}</span>
              {passenger.seatNo && (
                <span style={{ marginLeft: 8, padding: '1px 7px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700 }}>
                  {passenger.seatNo}
                </span>
              )}
            </div>
          </div>

          {/* 輸入接收方 */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              接收方資訊（平台帳號名稱／手機號碼／Email）
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="form-input"
                placeholder="輸入姓名、手機或 Email"
                value={input}
                onChange={e => { setInput(e.target.value); setNotFound(false); }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                style={{ flex: 1 }}
              />
              <button className="btn-primary btn-sm" onClick={handleSearch}>查詢</button>
            </div>
            {notFound && (
              <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: 6 }}>
                <i className="fi fi-sr-exclamation fi-xs" style={{ marginRight: 4 }} />查無此帳號，請確認輸入資訊
              </p>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn-ghost" onClick={onClose}>取消</button>
          </div>
        </div>
      )}

      {step === 2 && foundUser && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* 票券資訊 */}
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>轉移票券資訊</div>
            <div style={{ color: 'var(--text-secondary)' }}>
              車次：{order.train.trainNo}　{order.train.fromName} → {order.train.toName}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              {order.train.date} {order.train.depTime}
            </div>
            <div style={{ marginTop: 4 }}>
              座位：<span style={{ fontWeight: 600 }}>{passenger.seatNo ?? '候補'}</span>
              <span style={{ marginLeft: 12 }}>票種：{passenger.ticketTypeName}</span>
            </div>
          </div>

          {/* 接收方確認 */}
          <div style={{ background: '#eff6ff', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', border: '1px solid #bfdbfe', fontSize: '0.88rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: 4 }}>接收方</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
              <i className="fi fi-rr-user fi-xs" style={{ marginRight: 6 }} />{foundUser.name}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>{foundUser.email}</div>
          </div>

          {/* 警告 */}
          <div style={{ background: '#fef3c7', borderRadius: 'var(--radius)', padding: '0.65rem 0.9rem', border: '1px solid #fcd34d', fontSize: '0.82rem', color: '#92400e' }}>
            <i className="fi fi-rr-exclamation fi-xs" style={{ marginRight: 4 }} />分票後無法撤回，請確認接收方資訊正確
          </div>

          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => { setStep(1); setFoundUser(null); }}>返回</button>
            <button className="btn-primary" onClick={() => onConfirm(foundUser)}>
              <i className="fi fi-rr-share fi-xs" style={{ marginRight: 5 }} />確認分票
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
