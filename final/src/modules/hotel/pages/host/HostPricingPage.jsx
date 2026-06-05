import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import useHotelStore from '../../../../store/useHotelStore';
import useAuthStore from '../../../../store/useAuthStore';
import { useToast } from '../../../../components/common/Toast';

export default function HostPricingPage() {
  const { propId } = useParams();
  const {
    getHostProperties, updateProperty, addPriceHistory, priceHistory,
    getPricingRules,
  } = useHotelStore();
  const { currentUser } = useAuthStore();
  const addToast = useToast();

  const [tab, setTab] = useState('pricing');

  const properties = useMemo(() => getHostProperties(currentUser?.id), [currentUser?.id]);
  const prop = properties.find(p => p.id === propId);

  const rules = getPricingRules();
  const activeRule = rules[rules.length - 1] || { maxIncreasePercent: 30, minPrice: 500 };

  // Per-room price forms
  const [prices, setPrices] = useState(() => {
    if (!prop) return {};
    return Object.fromEntries((prop.rooms || []).map(r => [r.id, {
      weekday: r.price,
      weekend: r.weekendPrice || Math.round(r.price * 1.2),
      holiday: r.holidayPrice || Math.round(r.price * 1.5),
    }]));
  });

  const [errors, setErrors] = useState({});

  const validatePrice = (roomId, field, value, oldPrice) => {
    const errs = { ...errors };
    const key = `${roomId}-${field}`;
    if (value < activeRule.minPrice) {
      errs[key] = `低於最低定價 NT$ ${activeRule.minPrice}`;
    } else if (oldPrice > 0 && field === 'weekday') {
      const pct = ((value - oldPrice) / oldPrice) * 100;
      if (pct > activeRule.maxIncreasePercent) {
        errs[key] = `漲幅 ${pct.toFixed(1)}% 超過上限 ${activeRule.maxIncreasePercent}%`;
      } else {
        delete errs[key];
      }
    } else {
      delete errs[key];
    }
    setErrors(errs);
  };

  const handlePriceChange = (roomId, field, value, oldPrice) => {
    const n = value === '' ? '' : Number(value);
    setPrices(p => ({ ...p, [roomId]: { ...p[roomId], [field]: n } }));
    if (n !== '') {
      validatePrice(roomId, field, n, oldPrice);
    } else {
      const errs = { ...errors };
      delete errs[`${roomId}-${field}`];
      setErrors(errs);
    }
  };

  const handleSave = () => {
    if (Object.keys(errors).length > 0) {
      addToast('請修正定價錯誤後再儲存', 'error');
      return;
    }
    const toNum = (val, fallback) => (val === '' || val === undefined) ? fallback : val;
    const updatedRooms = prop.rooms.map(room => {
      const p = prices[room.id] || {};
      const oldPrice = room.price;
      const newPrice = toNum(p.weekday, room.price);
      if (newPrice !== oldPrice) {
        addPriceHistory({
          propertyId: prop.id,
          roomId: room.id,
          oldPrice,
          newPrice,
          reason: '房東調價',
          modifier: currentUser?.name || 'host',
        });
      }
      return {
        ...room,
        price: toNum(p.weekday, room.price),
        weekendPrice: toNum(p.weekend, room.weekendPrice),
        holidayPrice: toNum(p.holiday, room.holidayPrice),
      };
    });
    updateProperty(prop.id, { rooms: updatedRooms });
    addToast('定價已更新', 'success');
  };

  const propHistory = priceHistory.filter(h => h.propertyId === propId);

  if (!prop) {
    return (
      <div className="admin-page">
        <h1 className="admin-page-title">房源不存在</h1>
        <Link to="/host/properties" className="btn-ghost">返回</Link>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fi fi-rr-dollar" style={{ fontSize: 20 }} /> 定價管理 - {prop.name}
        </h1>
        <Link to="/host/properties" className="btn-ghost" style={{ textDecoration: 'none' }}>返回</Link>
      </div>

      {/* Rule info */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: 'var(--text-light, #888)' }}>
        <i className="fi fi-rr-info fi-sm" style={{ marginRight: 6 }} />
        管理員規則：每次漲幅上限 <strong>{activeRule.maxIncreasePercent}%</strong>，
        最低定價 <strong>NT$ {activeRule.minPrice}</strong>
        （生效日：{activeRule.effectiveDate || '未設定'}）
      </div>

      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        <button className={`tab-btn ${tab === 'pricing' ? 'active' : ''}`} onClick={() => setTab('pricing')}>定價設定</button>
        <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>歷史紀錄</button>
      </div>

      {tab === 'pricing' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {(prop.rooms || []).map(room => {
              const p = prices[room.id] || { weekday: room.price, weekend: room.weekendPrice || room.price, holiday: room.holidayPrice || room.price };
              return (
                <div key={room.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                  <h3 style={{ fontWeight: 600, marginBottom: 16 }}>{room.typeName}</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>平日價格 (NT$/晚)</label>
                      <input
                        className={`form-input ${errors[`${room.id}-weekday`] ? 'input-error' : ''}`}
                        type="number"
                        min={0}
                        value={p.weekday ?? ''}
                        onChange={e => handlePriceChange(room.id, 'weekday', e.target.value, room.price)}
                      />
                      {errors[`${room.id}-weekday`] && (
                        <small style={{ color: '#ef4444' }}>{errors[`${room.id}-weekday`]}</small>
                      )}
                    </div>
                    <div className="form-group">
                      <label>週末價格 (NT$/晚)</label>
                      <input
                        className="form-input"
                        type="number"
                        min={0}
                        value={p.weekend ?? ''}
                        onChange={e => handlePriceChange(room.id, 'weekend', e.target.value, room.weekendPrice || room.price)}
                      />
                    </div>
                    <div className="form-group">
                      <label>假日價格 (NT$/晚)</label>
                      <input
                        className="form-input"
                        type="number"
                        min={0}
                        value={p.holiday ?? ''}
                        onChange={e => handlePriceChange(room.id, 'holiday', e.target.value, room.holidayPrice || room.price)}
                      />
                    </div>
                    <div className="form-group" style={{ alignSelf: 'flex-end' }}>
                      <p style={{ fontSize: 12, color: 'var(--text-light, #888)' }}>
                        原始定價：NT$ {(room.price || 0).toLocaleString()}
                      </p>
                      {p.weekday !== room.price && (
                        <p style={{ fontSize: 12, color: p.weekday > room.price ? '#ef4444' : '#10b981' }}>
                          {p.weekday > room.price ? '▲' : '▼'}{' '}
                          {Math.abs(((p.weekday - room.price) / room.price) * 100).toFixed(1)}% 變動
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={Object.keys(errors).length > 0}>
            <i className="fi fi-rr-check fi-sm" style={{ marginRight: 6 }} /> 儲存定價
          </button>
        </>
      )}

      {tab === 'history' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>房型</th>
                <th>原價</th>
                <th>新價</th>
                <th>原因</th>
                <th>操作人</th>
                <th>時間</th>
              </tr>
            </thead>
            <tbody>
              {propHistory.length === 0 ? (
                <tr><td colSpan={6} className="no-data-row">尚無定價紀錄</td></tr>
              ) : (
                [...propHistory]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map(h => {
                    const room = prop.rooms?.find(r => r.id === h.roomId);
                    return (
                      <tr key={h.id}>
                        <td>{room?.typeName || h.roomId}</td>
                        <td>NT$ {(h.oldPrice || 0).toLocaleString()}</td>
                        <td>NT$ {(h.newPrice || 0).toLocaleString()}</td>
                        <td>{h.reason || '-'}</td>
                        <td>{h.modifier || '-'}</td>
                        <td>{new Date(h.createdAt).toLocaleString('zh-TW')}</td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
