import { useState } from 'react';
import useStore from '../../../../store/useHotelStore';
import useTrainStore from '../../../../store/useTrainStore';
import { t } from '../../i18n';
import Modal from '../../../../components/common/Modal';
import { useToast } from '../../../../components/common/Toast';

const TRAIN_STATUS_LABEL = {
  pending: '待付款', paid: '已付款', used: '已使用',
  refunded: '已退票', cancelled: '已取消', changed: '已改票',
};
const TRAIN_STATUS_BADGE = {
  pending: 'badge-pending', paid: 'badge-confirmed', used: 'badge-completed',
  refunded: 'badge-cancelled', cancelled: 'badge-cancelled', changed: 'badge-pending',
};

export default function AdminOrdersPage() {
  const { lang, orders, updateOrder, addCoupon } = useStore();
  const trainOrders = useTrainStore(s => s.orders);
  const addToast = useToast();
  const T = (key) => t(lang, key);
  const [orderType, setOrderType] = useState('hotel'); // 'hotel' | 'train'
  const [filter, setFilter] = useState('all'); // all | conflict | confirmed | cancelled
  const [trainFilter, setTrainFilter] = useState('all');
  const [conflictModal, setConflictModal] = useState(null);
  const [voucherForm, setVoucherForm] = useState({ type: 'percent', value: 10, code: '' });
  const [trainDetail, setTrainDetail] = useState(null);

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

  const filteredTrainOrders = trainFilter === 'all'
    ? trainOrders
    : trainOrders.filter(o => o.status === trainFilter);

  return (
    <div className="admin-page">
      <h1 className="admin-page-title"><i className="fi fi-rr-clipboard-list" style={{ fontSize: 20 }} /> {T('admin.order.title')}</h1>

      {/* 訂單類型切換 */}
      <div className="filter-tabs" style={{ marginBottom: 16 }}>
        <button className={`tab-btn ${orderType === 'hotel' ? 'active' : ''}`} onClick={() => setOrderType('hotel')}>
          <i className="fi fi-rr-building fi-xs" style={{ marginRight: 4 }} />住宿訂單
          <span className="tab-badge" style={{ marginLeft: 4 }}>{orders.length}</span>
        </button>
        <button className={`tab-btn ${orderType === 'train' ? 'active' : ''}`} onClick={() => setOrderType('train')}>
          <i className="fi fi-rr-train-side fi-xs" style={{ marginRight: 4 }} />車票訂單
          <span className="tab-badge" style={{ marginLeft: 4 }}>{trainOrders.length}</span>
        </button>
      </div>

      {/* ── 車票訂單 ── */}
      {orderType === 'train' && (
        <div>
          <div className="filter-tabs">
            {['all', 'pending', 'paid', 'used', 'refunded', 'cancelled'].map(f => (
              <button key={f} className={`tab-btn ${trainFilter === f ? 'active' : ''}`} onClick={() => setTrainFilter(f)}>
                {f === 'all' ? '全部' : TRAIN_STATUS_LABEL[f]}
                {f !== 'all' && trainOrders.filter(o => o.status === f).length > 0 && (
                  <span className="tab-badge">{trainOrders.filter(o => o.status === f).length}</span>
                )}
              </button>
            ))}
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>訂單編號</th>
                  <th>票號</th>
                  <th>路線</th>
                  <th>出發日期</th>
                  <th>乘客數</th>
                  <th>金額</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrainOrders.length === 0 ? (
                  <tr><td colSpan={8} className="no-data-row">沒有符合的車票訂單</td></tr>
                ) : (
                  [...filteredTrainOrders]
                    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
                    .map(o => (
                      <tr key={o.id}>
                        <td className="order-id">{o.id.slice(-8)}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{o.bookingNo || '—'}</td>
                        <td>{o.train?.fromName} → {o.train?.toName}</td>
                        <td>{o.train?.date}<br /><span style={{ fontSize: 12, color: 'var(--text-light, #888)' }}>{o.train?.depTime}</span></td>
                        <td>{o.passengers?.length ?? 0} 位</td>
                        <td>NT$ {(o.totalAmount || 0).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${TRAIN_STATUS_BADGE[o.status] || ''}`}>
                            {TRAIN_STATUS_LABEL[o.status] || o.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn-sm btn-outline" onClick={() => setTrainDetail(o)}>
                            <i className="fi fi-rr-eye fi-sm" /> 詳情
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 住宿訂單（原有內容） ── */}
      {orderType === 'hotel' && <>

      {conflicts.length > 0 && (
        <div className="conflict-alert">
          <i className="fi fi-rr-exclamation fi-sm" />
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
                    {isConflict && <span className="badge badge-conflict"><i className="fi fi-sr-exclamation fi-xs" /></span>}
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
                          <i className="fi fi-rr-tag fi-sm" /> {T('admin.order.handleConflict')}
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

      </> /* end hotel orders section */}

      {/* Train order detail modal */}
      <Modal isOpen={!!trainDetail} onClose={() => setTrainDetail(null)} title="車票訂單詳情" size="md">
        {trainDetail && (
          <div>
            <div className="form-grid">
              {[
                ['訂單編號', trainDetail.id],
                ['票號', trainDetail.bookingNo || '—'],
                ['路線', `${trainDetail.train?.fromName} → ${trainDetail.train?.toName}`],
                ['車次', `${trainDetail.train?.type?.toUpperCase()} ${trainDetail.train?.trainNo}`],
                ['出發日期', `${trainDetail.train?.date} ${trainDetail.train?.depTime}`],
                ['乘客人數', `${trainDetail.passengers?.length ?? 0} 位`],
                ['付款方式', trainDetail.paymentMethod || '—'],
                ['訂單狀態', TRAIN_STATUS_LABEL[trainDetail.status] || trainDetail.status],
                ['金額', `NT$ ${(trainDetail.totalAmount || 0).toLocaleString()}`],
                ['建立時間', trainDetail.createdAt ? new Date(trainDetail.createdAt).toLocaleString('zh-TW') : '—'],
              ].map(([label, val]) => (
                <div key={label} className="form-group">
                  <label>{label}</label>
                  <p className="form-value">{val}</p>
                </div>
              ))}
            </div>
            {trainDetail.passengers?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <label style={{ fontWeight: 600, fontSize: 13 }}>乘客名單</label>
                <div className="admin-table-wrap" style={{ marginTop: 6 }}>
                  <table className="admin-table" style={{ fontSize: 13 }}>
                    <thead><tr><th>姓名</th><th>票種</th><th>座位</th></tr></thead>
                    <tbody>
                      {trainDetail.passengers.map((p, i) => (
                        <tr key={i}>
                          <td>{p.name}</td>
                          <td>{p.ticketTypeName}</td>
                          <td>{p.seatNo || '候補'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setTrainDetail(null)}>關閉</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
