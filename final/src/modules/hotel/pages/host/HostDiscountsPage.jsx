import { useState, useMemo } from 'react';
import useHotelStore from '../../../../store/useHotelStore';
import useAuthStore from '../../../../store/useAuthStore';
import Modal from '../../../../components/common/Modal';
import ConfirmDialog from '../../../../components/common/ConfirmDialog';
import { useToast } from '../../../../components/common/Toast';

const DISCOUNT_TYPES = [
  { value: 'earlyBird', label: '早鳥優惠' },
  { value: 'longStay', label: '長住優惠' },
  { value: 'seasonal', label: '季節優惠' },
];

const emptyForm = (propId = 'all') => ({
  name: '',
  type: 'earlyBird',
  discountType: 'percent',
  value: 10,
  minNights: 1,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  propertyId: propId,
  active: true,
});

export default function HostDiscountsPage() {
  const { discounts, addDiscount, updateDiscount, deleteDiscount, getHostProperties } = useHotelStore();
  const { currentUser } = useAuthStore();
  const addToast = useToast();

  const hostId = currentUser?.id;
  const hostProperties = useMemo(() => getHostProperties(hostId), [hostId]);
  const propIds = hostProperties.map(p => p.id);

  // Only show discounts for host's properties, or 'all' discounts they created
  const hostDiscounts = discounts.filter(d =>
    d.propertyId === 'all' || propIds.includes(d.propertyId) ||
    (d.hostId && d.hostId === hostId)
  );

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm(hostProperties[0]?.id || 'all'));
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditTarget(d);
    setForm({ ...d });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { addToast('請填寫折扣名稱', 'error'); return; }
    if (editTarget) {
      updateDiscount(editTarget.id, form);
      addToast('折扣已更新', 'success');
    } else {
      addDiscount({ ...form, hostId });
      addToast('折扣已新增', 'success');
    }
    setShowModal(false);
  };

  const getPropName = (propId) => {
    if (propId === 'all') return '全部房源';
    const p = hostProperties.find(p => p.id === propId);
    return p?.name || propId;
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fi fi-rr-percentage" style={{ fontSize: 20 }} /> 折扣活動
        </h1>
        <button className="btn-primary" onClick={openAdd}>
          <i className="fi fi-rr-plus fi-sm" /> 新增折扣
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>折扣名稱</th>
              <th>類型</th>
              <th>折扣值</th>
              <th>最低晚數</th>
              <th>適用房源</th>
              <th>期間</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {hostDiscounts.length === 0 ? (
              <tr><td colSpan={8} className="no-data-row">尚無折扣活動</td></tr>
            ) : (
              hostDiscounts.map(d => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{DISCOUNT_TYPES.find(t => t.value === d.type)?.label || d.type}</td>
                  <td>{d.discountType === 'percent' ? `${d.value}%` : `NT$ ${d.value}`}</td>
                  <td>{d.minNights || 1} 晚</td>
                  <td>{getPropName(d.propertyId)}</td>
                  <td style={{ fontSize: 12 }}>{d.startDate}<br />{d.endDate}</td>
                  <td>
                    <button
                      className={`toggle-btn ${d.active ? 'active' : ''}`}
                      onClick={() => updateDiscount(d.id, { active: !d.active })}
                    >
                      {d.active ? '啟用' : '停用'}
                    </button>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon-sm" onClick={() => openEdit(d)}>
                        <i className="fi fi-rr-pencil fi-sm" />
                      </button>
                      <button className="btn-icon-sm btn-danger-icon" onClick={() => setDeleteConfirm(d)}>
                        <i className="fi fi-rr-trash fi-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editTarget ? '編輯折扣' : '新增折扣'}
        size="md"
      >
        <div className="form-grid">
          <div className="form-group form-full">
            <label>折扣名稱 *</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="例：暑期早鳥優惠"
            />
          </div>
          <div className="form-group">
            <label>折扣類型</label>
            <select
              className="form-input"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              {DISCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>計算方式</label>
            <select
              className="form-input"
              value={form.discountType}
              onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
            >
              <option value="percent">百分比折扣</option>
              <option value="fixed">固定金額折扣</option>
            </select>
          </div>
          <div className="form-group">
            <label>折扣值 ({form.discountType === 'percent' ? '%' : 'NT$'})</label>
            <input
              className="form-input"
              type="number"
              min={0}
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group">
            <label>最低住宿晚數</label>
            <input
              className="form-input"
              type="number"
              min={1}
              value={form.minNights}
              onChange={e => setForm(f => ({ ...f, minNights: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group form-full">
            <label>適用房源</label>
            <select
              className="form-input"
              value={form.propertyId}
              onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))}
            >
              <option value="all">全部房源</option>
              {hostProperties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>開始日期</label>
            <input
              className="form-input"
              type="date"
              value={form.startDate}
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>結束日期</label>
            <input
              className="form-input"
              type="date"
              value={form.endDate}
              onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={handleSave}>儲存</button>
          <button className="btn-ghost" onClick={() => setShowModal(false)}>取消</button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          deleteDiscount(deleteConfirm.id);
          addToast('折扣已刪除', 'success');
        }}
        title="刪除折扣"
        message={`確定刪除折扣「${deleteConfirm?.name}」？`}
        confirmLabel="確認刪除"
        confirmClass="btn-danger"
      />
    </div>
  );
}
