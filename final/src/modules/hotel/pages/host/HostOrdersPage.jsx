import { useState, useMemo } from 'react';
import useHotelStore from '../../../../store/useHotelStore';
import useAuthStore from '../../../../store/useAuthStore';
import Modal from '../../../../components/common/Modal';

const STATUS_LABEL = {
  confirmed:          '待入住',
  completed:          '已完成',
  cancelled:          '已取消',
  checkedIn:          '已入住',
  cancelling_full:    '全額退款中',
  cancelling_partial: '部分退款中',
  cancelled_no_refund:'已取消（不退款）',
  refunded:           '退款完成',
  conflict_cancelled: '衝突取消',
};
const STATUS_BADGE = {
  confirmed:          'badge-confirmed',
  completed:          'badge-completed',
  cancelled:          'badge-cancelled',
  checkedIn:          'badge-pending',
  cancelling_full:    'badge-paid',
  cancelling_partial: 'badge-pending',
  cancelled_no_refund:'badge-cancelled',
  refunded:           'badge-confirmed',
  conflict_cancelled: 'badge-cancelled',
};

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'confirmed', label: '待入住' },
  { key: 'checkedIn', label: '已入住' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

export default function HostOrdersPage() {
  const { getHostOrders } = useHotelStore();
  const { currentUser } = useAuthStore();

  const [tab, setTab] = useState('all');
  const [detailModal, setDetailModal] = useState(null);

  const orders = useMemo(() => getHostOrders(currentUser?.id), [currentUser?.id]);

  const filtered = tab === 'all' ? orders : orders.filter(o => o.status === tab);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">
        <i className="fi fi-rr-clipboard-list" style={{ fontSize: 20 }} /> 訂單管理
      </h1>

      <div className="filter-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.key !== 'all' && orders.filter(o => o.status === t.key).length > 0 && (
              <span className="tab-badge">{orders.filter(o => o.status === t.key).length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>訂單編號</th>
              <th>房源名稱</th>
              <th>房客姓名</th>
              <th>入住日</th>
              <th>退房日</th>
              <th>金額</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={8} className="no-data-row">目前沒有訂單</td></tr>
            ) : (
              sorted.map(order => (
                <tr key={order.id}>
                  <td className="order-id">{order.id.slice(-8)}</td>
                  <td>{order.propertyName || '-'}</td>
                  <td>{order.guestName || order.userName || '-'}</td>
                  <td>{order.checkIn}</td>
                  <td>{order.checkOut}</td>
                  <td>NT$ {(order.finalAmount || order.totalAmount || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[order.status] || ''}`}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-sm btn-outline" onClick={() => setDetailModal(order)}>
                      <i className="fi fi-rr-eye fi-sm" /> 詳情
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="訂單詳情" size="md">
        {detailModal && (
          <div>
            <div className="form-grid">
              <div className="form-group">
                <label>訂單編號</label>
                <p className="form-value">{detailModal.id}</p>
              </div>
              <div className="form-group">
                <label>狀態</label>
                <p className="form-value">
                  <span className={`badge ${STATUS_BADGE[detailModal.status] || ''}`}>
                    {STATUS_LABEL[detailModal.status] || detailModal.status}
                  </span>
                </p>
              </div>
              <div className="form-group">
                <label>房源</label>
                <p className="form-value">{detailModal.propertyName || '-'}</p>
              </div>
              <div className="form-group">
                <label>房型</label>
                <p className="form-value">{detailModal.roomType || '-'}</p>
              </div>
              <div className="form-group">
                <label>房客</label>
                <p className="form-value">{detailModal.guestName || detailModal.userName || '-'}</p>
              </div>
              <div className="form-group">
                <label>入住人數</label>
                <p className="form-value">{detailModal.guests || '-'} 人</p>
              </div>
              <div className="form-group">
                <label>入住日期</label>
                <p className="form-value">{detailModal.checkIn}</p>
              </div>
              <div className="form-group">
                <label>退房日期</label>
                <p className="form-value">{detailModal.checkOut}</p>
              </div>
              <div className="form-group">
                <label>住宿晚數</label>
                <p className="form-value">{detailModal.nights || '-'} 晚</p>
              </div>
              <div className="form-group">
                <label>訂單金額</label>
                <p className="form-value">NT$ {(detailModal.finalAmount || detailModal.totalAmount || 0).toLocaleString()}</p>
              </div>
              <div className="form-group">
                <label>建立時間</label>
                <p className="form-value">
                  {detailModal.createdAt ? new Date(detailModal.createdAt).toLocaleString('zh-TW') : '-'}
                </p>
              </div>
              {detailModal.discountApplied && (
                <div className="form-group form-full">
                  <label>折扣資訊</label>
                  <p className="form-value">{detailModal.discountApplied.reason} (省 NT$ {detailModal.discountApplied.savedAmount?.toLocaleString()})</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setDetailModal(null)}>關閉</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
