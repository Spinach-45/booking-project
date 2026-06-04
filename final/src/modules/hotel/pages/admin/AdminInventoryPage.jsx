import { useState } from 'react';
import useStore from '../../../../store/useHotelStore';
import { t } from '../../i18n';
import { useToast } from '../../../../components/common/Toast';

export default function AdminInventoryPage() {
  const { lang, properties, inventory, updateInventory } = useStore();
  const addToast = useToast();
  const T = (key) => t(lang, key);
  const [selectedProp, setSelectedProp] = useState(properties[0]?.id || '');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const property = properties.find(p => p.id === selectedProp);
  const room = property?.rooms.find(r => r.id === selectedRoom) || property?.rooms[0];

  const getDaysInMonth = (ym) => {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  };

  const days = getDaysInMonth(month);
  const daysArr = Array.from({ length: days }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    return `${month}-${d}`;
  });

  const getQty = (date) => {
    const item = inventory.find(inv => inv.propertyId === selectedProp && inv.roomId === (selectedRoom || room?.id) && inv.date === date);
    return item !== undefined ? item.quantity : (room?.quantity ?? 0);
  };

  const handleChange = (date, value) => {
    updateInventory(selectedProp, selectedRoom || room?.id, date, Number(value));
    addToast(lang === 'zh' ? '庫存已更新' : 'Inventory updated', 'success');
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title"><i className="fi fi-rr-layer-plus" style={{ fontSize: 20 }} /> {T('admin.inventoryManagement')}</h1>

      <div className="inventory-controls">
        <div className="form-group">
          <label>{lang === 'zh' ? '房源' : 'Property'}</label>
          <select className="form-input" value={selectedProp} onChange={e => { setSelectedProp(e.target.value); setSelectedRoom(''); }}>
            {properties.map(p => <option key={p.id} value={p.id}>{lang === 'zh' ? p.name : (p.nameEn || p.name)}</option>)}
          </select>
        </div>
        {property && (
          <div className="form-group">
            <label>{T('admin.inventory.roomType')}</label>
            <select className="form-input" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
              {property.rooms.map(r => <option key={r.id} value={r.id}>{lang === 'zh' ? r.typeName : (r.typeNameEn || r.typeName)}</option>)}
            </select>
          </div>
        )}
        <div className="form-group">
          <label>{lang === 'zh' ? '月份' : 'Month'}</label>
          <input className="form-input" type="month" value={month} onChange={e => setMonth(e.target.value)} />
        </div>
      </div>

      <div className="inventory-grid">
        {daysArr.map(date => {
          const qty = getQty(date);
          const dow = new Date(date).toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-US', { weekday: 'short' });
          return (
            <div key={date} className={`inventory-day ${qty === 0 ? 'inv-full' : ''}`}>
              <div className="inv-date">{date.slice(8)}</div>
              <div className="inv-dow">{dow}</div>
              <input
                type="number"
                min={0}
                max={99}
                value={qty}
                onChange={e => handleChange(date, e.target.value)}
                className="inv-qty-input"
              />
              <div className="inv-label">{qty === 0 ? (lang === 'zh' ? '售罄' : 'Full') : (lang === 'zh' ? '間' : 'rm')}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
