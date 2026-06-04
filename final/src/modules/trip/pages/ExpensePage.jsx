import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useStore from '../../../store/useTripStore';
import { useToast } from '../../../components/common/Toast';
import Modal from '../../../components/common/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { EXPENSE_CATEGORIES } from '../data/attractions';

export default function ExpensePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTrip, addExpense, deleteExpense, getCollaboratorNames, currentUser } = useStore();
  const toast = useToast();
  const trip = getTrip(id);

  const [addModal, setAddModal] = useState(false);
  const [deleteExpId, setDeleteExpId] = useState(null);

  if (!trip) return (
    <div className="container">
      <div className="empty-state" style={{ paddingTop: '6rem' }}>
        <i className="fi fi-rr-search fi-lg" style={{ color: 'var(--secondary)' }} />
        <p>找不到此行程</p>
        <button className="btn-primary" onClick={() => navigate('/trip')}>返回行程列表</button>
      </div>
    </div>
  );

  const collabNames = getCollaboratorNames(trip);
  const totalExpense = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetPct = trip.budget > 0 ? Math.min((totalExpense / trip.budget) * 100, 100) : 0;
  const overBudget = trip.budget > 0 && totalExpense > trip.budget;

  // Per-person split
  const personTotals = {};
  collabNames.forEach(c => { personTotals[c.id] = 0; });
  trip.expenses.forEach(exp => {
    if (exp.splitWith.length === 0) return;
    const share = exp.amount / exp.splitWith.length;
    exp.splitWith.forEach(uid => {
      if (personTotals[uid] === undefined) personTotals[uid] = 0;
      personTotals[uid] += share;
    });
  });

  const getCategoryInfo = (cat) => EXPENSE_CATEGORIES.find(c => c.value === cat) || EXPENSE_CATEGORIES.at(-1);

  const handleSave = (data) => {
    addExpense(id, data);
    setAddModal(false);
    if (trip.budget > 0) {
      const newTotal = trip.expenses.reduce((s, e) => s + e.amount, 0) + Number(data.amount);
      if (newTotal > trip.budget) {
        toast(`警告：總花費 NT$${newTotal.toLocaleString()} 已超出預算 NT$${trip.budget.toLocaleString()}！`, 'warning', 5000);
      }
    }
    toast('費用已記錄', 'success');
  };

  return (
    <div className="expense-page">
      <div className="container">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-ghost btn-sm" onClick={() => navigate(`/trip/${id}`)}>
              <i className="fi fi-rr-arrow-left fi-sm" /> 返回行程
            </button>
            <h1 className="page-title">
              <i className="fi fi-rr-dollar" style={{ fontSize: 20 }} /> {trip.title} — 費用管理
            </h1>
          </div>
          <button className="btn-primary" onClick={() => setAddModal(true)}>
            <i className="fi fi-rr-plus fi-sm" /> 記錄費用
          </button>
        </div>

        {/* Budget alert */}
        {overBudget && (
          <div className="expense-alert">
            <i className="fi fi-rr-exclamation" style={{ fontSize: 20 }} />
            <span>
              總花費 NT${totalExpense.toLocaleString()} 已超出預算上限 NT${trip.budget.toLocaleString()}
              （超出 NT${(totalExpense - trip.budget).toLocaleString()}）
            </span>
          </div>
        )}

        {/* Summary */}
        <div className="expense-summary">
          <div className="expense-stat">
            <div className="expense-stat-label">總花費</div>
            <div className={`expense-stat-value ${overBudget ? 'over-budget' : ''}`}>
              NT${totalExpense.toLocaleString()}
            </div>
            {trip.budget > 0 && (
              <div className="budget-bar-wrap">
                <div className="budget-bar-track">
                  <div
                    className={`budget-bar-fill ${overBudget ? 'over' : ''}`}
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
                <div className="budget-bar-label">
                  預算：NT${trip.budget.toLocaleString()} （{Math.round(budgetPct)}%）
                </div>
              </div>
            )}
          </div>
          <div className="expense-stat">
            <div className="expense-stat-label">筆數</div>
            <div className="expense-stat-value">{trip.expenses.length}</div>
          </div>
          <div className="expense-stat">
            <div className="expense-stat-label">人均花費</div>
            <div className="expense-stat-value">
              {collabNames.length > 0
                ? `NT${Math.round(totalExpense / collabNames.length).toLocaleString()}`
                : 'NT$0'}
            </div>
          </div>
        </div>

        {/* Per-person breakdown */}
        {collabNames.length > 1 && (
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}><i className="fi fi-rr-chart-histogram fi-sm" style={{ marginRight: 6 }} />分帳明細</h3>
            <table className="expense-split-table">
              <thead>
                <tr>
                  <th>旅伴</th>
                  <th>應分攤金額</th>
                  <th>實際已付</th>
                  <th>差額</th>
                </tr>
              </thead>
              <tbody>
                {collabNames.map(c => {
                  const paid = trip.expenses.filter(e => e.paidBy === c.id).reduce((s, e) => s + e.amount, 0);
                  const share = Math.round(personTotals[c.id] || 0);
                  const diff = paid - share;
                  return (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>NT${share.toLocaleString()}</td>
                      <td>NT${paid.toLocaleString()}</td>
                      <td style={{ color: diff >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {diff >= 0 ? `+NT$${diff.toLocaleString()}（待收）` : `NT$${Math.abs(diff).toLocaleString()}（待付）`}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td>合計</td>
                  <td colSpan={3} style={{ color: 'var(--primary)' }}>NT${totalExpense.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Expense List */}
        {trip.expenses.length === 0 ? (
          <div className="empty-state">
            <i className="fi fi-rr-dollar fi-lg" style={{ color: 'var(--secondary)' }} />
            <p>尚未記錄任何費用</p>
            <button className="btn-primary" onClick={() => setAddModal(true)}>
              <i className="fi fi-rr-plus fi-sm" /> 記錄第一筆費用
            </button>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}><i className="fi fi-rr-clipboard-list fi-sm" style={{ marginRight: 6 }} />費用清單</h3>
            <div className="expense-list">
              {[...trip.expenses].reverse().map(exp => {
                const catInfo = getCategoryInfo(exp.category);
                const perPerson = exp.splitWith.length > 0
                  ? Math.round(exp.amount / exp.splitWith.length)
                  : exp.amount;
                return (
                  <div key={exp.id} className="expense-item">
                    <div className="expense-item-icon">{catInfo.icon}</div>
                    <div className="expense-item-info">
                      <div className="expense-item-title">{exp.title}</div>
                      <div className="expense-item-meta">
                        <span><i className="fi fi-rr-calendar fi-xs" style={{ marginRight: 3 }} />{exp.date}</span>
                        <span>付款：{exp.paidByName}</span>
                        <span>分攤：{exp.splitWith.length} 人</span>
                        {exp.notes && <span><i className="fi fi-rr-pencil fi-xs" style={{ marginRight: 3 }} />{exp.notes}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="expense-item-amount">NT${exp.amount.toLocaleString()}</div>
                      <div className="expense-per-person">每人 NT${perPerson.toLocaleString()}</div>
                    </div>
                    <button
                      className="btn-icon-sm btn-danger-icon"
                      onClick={() => setDeleteExpId(exp.id)}
                      title="刪除"
                    >
                      <i className="fi fi-rr-trash fi-sm" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AddExpenseModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        onSave={handleSave}
        trip={trip}
        collabNames={collabNames}
        currentUser={currentUser}
      />

      <ConfirmDialog
        isOpen={!!deleteExpId}
        onClose={() => setDeleteExpId(null)}
        onConfirm={() => { deleteExpense(id, deleteExpId); toast('費用已刪除', 'success'); setDeleteExpId(null); }}
        title="刪除費用"
        message="確定要刪除此筆費用記錄嗎？"
        icon={<i className="fi fi-rr-trash fi-lg" style={{ color: 'var(--danger)' }} />}
        confirmLabel="刪除"
      />
    </div>
  );
}

// ── Add Expense Modal ──────────────────────────────────────
function AddExpenseModal({ isOpen, onClose, onSave, trip, collabNames, currentUser }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title: '', amount: '', category: 'food',
    date: today, paidBy: currentUser?.id || '',
    paidByName: currentUser?.name || '',
    splitWith: collabNames.map(c => c.id),
    notes: '',
  });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const toggleSplit = (uid) => {
    const sw = form.splitWith.includes(uid)
      ? form.splitWith.filter(id => id !== uid)
      : [...form.splitWith, uid];
    set('splitWith', sw);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.amount) return;
    onSave(form);
    setForm({ title: '', amount: '', category: 'food', date: today, paidBy: currentUser?.id || '', paidByName: currentUser?.name || '', splitWith: collabNames.map(c => c.id), notes: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="記錄共同費用" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>費用說明 *</label>
          <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="例：餐廳午餐、景點門票" />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>金額（NT$）*</label>
            <input className="form-input" type="number" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" />
          </div>
          <div className="form-group">
            <label>日期</label>
            <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>類別</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXPENSE_CATEGORIES.map(c => (
              <button
                key={c.value}
                className={`area-tab ${form.category === c.value ? 'active' : ''}`}
                onClick={() => set('category', c.value)}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>誰付款？</label>
          <select
            className="form-input"
            value={form.paidBy}
            onChange={e => {
              const c = collabNames.find(c => c.id === e.target.value);
              set('paidBy', e.target.value);
              set('paidByName', c?.name || '');
            }}
          >
            {collabNames.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>分攤旅伴（可多選）</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {collabNames.map(c => (
              <label
                key={c.id}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.3rem 0.7rem', border: '1.5px solid', borderColor: form.splitWith.includes(c.id) ? 'var(--primary)' : 'var(--border)', borderRadius: 'var(--radius)', background: form.splitWith.includes(c.id) ? 'var(--primary-light)' : 'white', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <input type="checkbox" checked={form.splitWith.includes(c.id)} onChange={() => toggleSplit(c.id)} style={{ accentColor: 'var(--primary)' }} />
                {c.name}
              </label>
            ))}
          </div>
          {form.splitWith.length > 0 && form.amount && (
            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: 4 }}>
              每人分攤：NT${Math.round(Number(form.amount) / form.splitWith.length).toLocaleString()}
            </p>
          )}
        </div>

        <div className="form-group">
          <label>備註</label>
          <input className="form-input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="額外說明（選填）" />
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={!form.title.trim() || !form.amount}>
            <i className="fi fi-rr-plus fi-sm" /> 記錄費用
          </button>
        </div>
      </div>
    </Modal>
  );
}
