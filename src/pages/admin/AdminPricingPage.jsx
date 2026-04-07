import { useState } from 'react';
import { DollarSign, History } from 'lucide-react';
import useStore from '../../store/useStore';
import { t } from '../../i18n';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

export default function AdminPricingPage() {
  const { lang, properties, updateProperty, addPriceHistory, priceHistory } = useStore();
  const addToast = useToast();
  const T = (key) => t(lang, key);

  const [adjustModal, setAdjustModal] = useState(null); // { property, room }
  const [historyModal, setHistoryModal] = useState(null);
  const [form, setForm] = useState({ newPrice: 0, reason: '', changeLimit: 50 });

  const openAdjust = (property, room) => {
    setAdjustModal({ property, room });
    setForm({ newPrice: room.price, reason: '', changeLimit: 50 });
  };

  const handleSave = () => {
    const { property, room } = adjustModal;
    const pct = Math.abs((form.newPrice - room.price) / room.price * 100);
    if (pct > form.changeLimit) {
      addToast(lang === 'zh' ? `超過漲跌幅上限 ${form.changeLimit}%` : `Exceeds change limit ${form.changeLimit}%`, 'error');
      return;
    }
    addPriceHistory({
      propertyId: property.id,
      roomId: room.id,
      oldPrice: room.price,
      newPrice: form.newPrice,
      reason: form.reason,
      modifier: useStore.getState().currentUser?.name || 'admin',
    });
    const updatedRooms = property.rooms.map(r => r.id === room.id ? { ...r, price: form.newPrice } : r);
    updateProperty(property.id, { rooms: updatedRooms });
    addToast(lang === 'zh' ? '價格已更新' : 'Price updated', 'success');
    setAdjustModal(null);
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title"><DollarSign size={20} /> {T('admin.pricingManagement')}</h1>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{lang === 'zh' ? '房源' : 'Property'}</th>
              <th>{T('admin.inventory.roomType')}</th>
              <th>{T('admin.pricing.currentPrice')}</th>
              <th>{lang === 'zh' ? '操作' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {properties.flatMap(p => p.rooms.map(room => (
              <tr key={`${p.id}-${room.id}`}>
                <td>{lang === 'zh' ? p.name : (p.nameEn || p.name)}</td>
                <td>{lang === 'zh' ? room.typeName : (room.typeNameEn || room.typeName)}</td>
                <td>NT$ {room.price.toLocaleString()}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn-sm btn-primary" onClick={() => openAdjust(p, room)}>
                      {T('admin.pricing.adjustPrice')}
                    </button>
                    <button className="btn-sm btn-outline" onClick={() => setHistoryModal({ propertyId: p.id, roomId: room.id, propName: lang === 'zh' ? p.name : p.nameEn, roomName: lang === 'zh' ? room.typeName : room.typeNameEn })}>
                      <History size={14} /> {T('admin.pricing.history')}
                    </button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Adjust Modal */}
      <Modal isOpen={!!adjustModal} onClose={() => setAdjustModal(null)} title={T('admin.pricing.adjustPrice')}>
        {adjustModal && (
          <div className="price-form">
            <div className="current-price-display">
              <span>{T('admin.pricing.currentPrice')}:</span>
              <strong>NT$ {adjustModal.room.price.toLocaleString()}</strong>
            </div>
            <div className="form-group">
              <label>{T('admin.pricing.newPrice')}</label>
              <input className="form-input" type="number" min={0} value={form.newPrice}
                onChange={e => setForm(f => ({ ...f, newPrice: Number(e.target.value) }))} />
              <small className="form-hint">
                {form.newPrice !== adjustModal.room.price && (
                  <span className={form.newPrice > adjustModal.room.price ? 'text-danger' : 'text-success'}>
                    {form.newPrice > adjustModal.room.price ? '▲' : '▼'}
                    {Math.abs(((form.newPrice - adjustModal.room.price) / adjustModal.room.price * 100)).toFixed(1)}%
                  </span>
                )}
              </small>
            </div>
            <div className="form-group">
              <label>{T('admin.pricing.changeLimit')} (%)</label>
              <input className="form-input" type="number" min={1} max={100} value={form.changeLimit}
                onChange={e => setForm(f => ({ ...f, changeLimit: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>{T('admin.pricing.reason')}</label>
              <input className="form-input" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder={lang === 'zh' ? '例如：旺季調價' : 'e.g., Peak season adjustment'} />
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={handleSave}>{T('common.save')}</button>
              <button className="btn-ghost" onClick={() => setAdjustModal(null)}>{T('common.cancel')}</button>
            </div>
          </div>
        )}
      </Modal>

      {/* History Modal */}
      <Modal isOpen={!!historyModal} onClose={() => setHistoryModal(null)} title={T('admin.pricing.history')} size="md">
        {historyModal && (
          <div className="price-history">
            <p className="history-prop">{historyModal.propName} - {historyModal.roomName}</p>
            {priceHistory.filter(h => h.propertyId === historyModal.propertyId && h.roomId === historyModal.roomId).length === 0 ? (
              <p>{T('common.noData')}</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{lang === 'zh' ? '原價' : 'Old Price'}</th>
                    <th>{lang === 'zh' ? '新價' : 'New Price'}</th>
                    <th>{T('admin.pricing.reason')}</th>
                    <th>{T('admin.pricing.modifier')}</th>
                    <th>{lang === 'zh' ? '時間' : 'Time'}</th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistory.filter(h => h.propertyId === historyModal.propertyId && h.roomId === historyModal.roomId)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map(h => (
                      <tr key={h.id}>
                        <td>NT$ {h.oldPrice.toLocaleString()}</td>
                        <td>NT$ {h.newPrice.toLocaleString()}</td>
                        <td>{h.reason}</td>
                        <td>{h.modifier}</td>
                        <td>{new Date(h.createdAt).toLocaleString('zh-TW')}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
