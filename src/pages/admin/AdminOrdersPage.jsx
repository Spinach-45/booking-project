import { useState } from 'react';
import { ClipboardList, AlertTriangle, Gift } from 'lucide-react';
import useStore from '../../store/useStore';
import { t } from '../../i18n';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

export default function AdminOrdersPage() {
  const { lang, orders, updateOrder, addCoupon } = useStore();
  const addToast = useToast();
  const T = (key) => t(lang, key);
  const [filter, setFilter] = useState('all'); // all | conflict | confirmed | cancelled
  const [conflictModal, setConflictModal] = useState(null);
  const [voucherForm, setVoucherForm] = useState({ type: 'percent', value: 10, code: '' });

  // Detect conflicting orders: same property + room + overlapping dates
  const conflicts = [];
  const active = orders.filter(o => o.status === 'confirmed');
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
      if (a.propertyId === b.propertyId && a.roomId === b.roomId) {
        const aIn = new Date(a.checkIn), aOut = new Date(a.checkOut);
        const bIn = new Date(b.checkIn), bOut = new Date(b.checkOut);
        if (aIn < bOut && aOut > bIn) {
          if (!conflicts.find(c => c.ids.includes(a.id) && c.ids.includes(b.id))) {
            conflicts.push({ ids: [a.id, b.id], orders: [a, b] });
          }
        }
      }
    }
  }

  const filtered = filter === 'all' ? orders
    : filter === 'conflict' ? orders.filter(o => conflicts.some(c => c.ids.includes(o.id)))
    : orders.filter(o => o.status === filter);

  const handleIssueVoucher = () => {
    const code = voucherForm.code || `ADMIN${Date.now()}`;
    addCoupon({
      code: code.toUpperCase(),
      type: voucherForm.type,
      value: voucherForm.value,
      minAmount: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      usageLimit: 1,
      active: true,
    });
    addToast(lang === 'zh' ? `折價券 ${code.toUpperCase()} 已發放` : `Voucher ${code.toUpperCase()} issued`, 'success');
    setConflictModal(null);
  };

  const handleAutoConfirm = (orderId) => {
    updateOrder(orderId, { status: 'confirmed', paymentStatus: 'paid' });
    addToast(lang === 'zh' ? '訂單已確認' : 'Order confirmed', 'success');
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title"><ClipboardList size={20} /> {T('admin.order.title')}</h1>

      {conflicts.length > 0 && (
        <div className="conflict-alert">
          <AlertTriangle size={18} />
          {lang === 'zh' ? `發現 ${conflicts.length} 組重疊訂單，需要處理！` : `Found ${conflicts.length} conflicting orders!`}
          <button className="btn-sm btn-warning" onClick={() => setFilter('conflict')}>
            {T('admin.order.conflictOrders')}
          </button>
        </div>
      )}

      <div className="filter-tabs">
        {['all', 'confirmed', 'cancelled', 'conflict'].map(f => (
          <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? T('admin.order.allOrders')
              : f === 'confirmed' ? T('orders.confirmed')
              : f === 'cancelled' ? T('orders.cancelled')
              : T('admin.order.conflictOrders')}
            {f === 'conflict' && conflicts.length > 0 && <span className="tab-badge">{conflicts.length}</span>}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{T('orders.orderNumber')}</th>
              <th>{T('orders.propertyName')}</th>
              <th>{T('orders.roomType')}</th>
              <th>{T('orders.checkIn')} / {T('orders.checkOut')}</th>
              <th>{T('orders.guests')}</th>
              <th>{T('orders.totalAmount')}</th>
              <th>{T('common.status')}</th>
              <th>{lang === 'zh' ? '操作' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(order => {
              const isConflict = conflicts.some(c => c.ids.includes(order.id));
              return (
                <tr key={order.id} className={isConflict ? 'row-conflict' : ''}>
                  <td className="order-id">{order.id.slice(-8)}</td>
                  <td>{order.propertyName}</td>
                  <td>{order.roomType}</td>
                  <td>{order.checkIn}<br />{order.checkOut}</td>
                  <td>{order.guests}</td>
                  <td>NT$ {order.finalAmount?.toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${order.status}`}>{T(`orders.${order.status}`)}</span>
                    {isConflict && <span className="badge badge-conflict">⚠️</span>}
                  </td>
                  <td>
                    <div className="action-btns">
                      {order.status !== 'confirmed' && (
                        <button className="btn-sm btn-primary" onClick={() => handleAutoConfirm(order.id)}>
                          {T('admin.order.autoConfirm')}
                        </button>
                      )}
                      {isConflict && (
                        <button className="btn-sm btn-warning" onClick={() => {
                          const conflictGroup = conflicts.find(c => c.ids.includes(order.id));
                          setConflictModal({ order, conflictGroup });
                        }}>
                          <Gift size={14} /> {T('admin.order.handleConflict')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="no-data-row">{T('common.noData')}</p>}
      </div>

      {/* Conflict Modal */}
      <Modal isOpen={!!conflictModal} onClose={() => setConflictModal(null)} title={T('admin.order.handleConflict')} size="md">
        {conflictModal && (
          <div className="conflict-modal">
            <div className="conflict-info">
              <p>{lang === 'zh' ? '重疊的訂單：' : 'Conflicting orders:'}</p>
              {conflictModal.conflictGroup.orders.map(o => (
                <div key={o.id} className="conflict-order-item">
                  <span className="order-id">#{o.id.slice(-8)}</span>
                  <span>{o.propertyName}</span>
                  <span>{o.checkIn} - {o.checkOut}</span>
                </div>
              ))}
            </div>
            <div className="voucher-form">
              <h4>{T('admin.order.issueVoucher')}</h4>
              <div className="form-group">
                <label>{lang === 'zh' ? '優惠券代碼' : 'Coupon Code'}</label>
                <input className="form-input" value={voucherForm.code} onChange={e => setVoucherForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="自動產生" />
              </div>
              <div className="form-group">
                <label>{lang === 'zh' ? '折扣類型' : 'Discount Type'}</label>
                <select className="form-input" value={voucherForm.type} onChange={e => setVoucherForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="percent">{lang === 'zh' ? '百分比' : 'Percent'}</option>
                  <option value="fixed">{lang === 'zh' ? '固定金額' : 'Fixed Amount'}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{lang === 'zh' ? '折扣值' : 'Value'}</label>
                <input className="form-input" type="number" min={0} value={voucherForm.value} onChange={e => setVoucherForm(f => ({ ...f, value: Number(e.target.value) }))} />
              </div>
              <div className="modal-footer">
                <button className="btn-primary" onClick={handleIssueVoucher}>{T('admin.order.issueVoucher')}</button>
                <button className="btn-ghost" onClick={() => setConflictModal(null)}>{T('common.cancel')}</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
