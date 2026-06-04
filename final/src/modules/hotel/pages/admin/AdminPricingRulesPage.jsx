import { useState } from 'react';
import useStore from '../../../../store/useHotelStore';
import { useToast } from '../../../../components/common/Toast';

export default function AdminPricingRulesPage() {
  const { pricingRules, getPricingRules, savePricingRules } = useStore();
  const addToast = useToast();

  const rules = getPricingRules();
  const current = rules[rules.length - 1] || { maxIncreasePercent: 30, minPrice: 500, effectiveDate: '' };

  const [form, setForm] = useState({
    maxIncreasePercent: current.maxIncreasePercent ?? 30,
    minPrice: current.minPrice ?? 500,
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  const handleSave = () => {
    if (!form.effectiveDate) {
      addToast('請填寫生效日期', 'error');
      return;
    }
    if (form.maxIncreasePercent < 0 || form.maxIncreasePercent > 100) {
      addToast('漲幅上限須介於 0~100%', 'error');
      return;
    }
    if (form.minPrice < 0) {
      addToast('最低定價不可為負數', 'error');
      return;
    }
    const existing = getPricingRules();
    const newRule = {
      id: `rule-${Date.now()}`,
      maxIncreasePercent: Number(form.maxIncreasePercent),
      minPrice: Number(form.minPrice),
      effectiveDate: form.effectiveDate,
      createdAt: Date.now(),
    };
    savePricingRules([...existing, newRule]);
    addToast('定價規則已儲存', 'success');
  };

  const allRules = [...getPricingRules()].reverse();

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">
        <i className="fi fi-rr-dollar" style={{ fontSize: 20 }} /> 定價規則
      </h1>

      {/* Current Rule Banner */}
      {current && (
        <div className="stat-card" style={{ marginBottom: 24, maxWidth: 480 }}>
          <div className="stat-icon stat-blue"><i className="fi fi-rr-shield-check" style={{ fontSize: 24 }} /></div>
          <div>
            <div className="stat-label">目前有效規則</div>
            <div style={{ marginTop: 4 }}>
              <span>漲幅上限：<strong>{current.maxIncreasePercent}%</strong></span>
              <span style={{ marginLeft: 16 }}>最低定價：<strong>NT$ {current.minPrice}</strong></span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-light, #888)', marginTop: 2 }}>
              生效日：{current.effectiveDate || '-'}
            </div>
          </div>
        </div>
      )}

      {/* New Rule Form */}
      <div className="form-section" style={{ maxWidth: 480, marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>新增定價規則</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>漲幅上限 (%)</label>
            <input
              className="form-input"
              type="number"
              min={0}
              max={100}
              value={form.maxIncreasePercent}
              onChange={e => setForm(f => ({ ...f, maxIncreasePercent: e.target.value }))}
            />
            <small className="form-hint">房東每次調漲不可超過此百分比</small>
          </div>
          <div className="form-group">
            <label>最低定價 (NT$)</label>
            <input
              className="form-input"
              type="number"
              min={0}
              value={form.minPrice}
              onChange={e => setForm(f => ({ ...f, minPrice: e.target.value }))}
            />
            <small className="form-hint">房東定價不可低於此金額</small>
          </div>
          <div className="form-group form-full">
            <label>生效日期</label>
            <input
              className="form-input"
              type="date"
              value={form.effectiveDate}
              onChange={e => setForm(f => ({ ...f, effectiveDate: e.target.value }))}
            />
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <button className="btn-primary" onClick={handleSave}>
            <i className="fi fi-rr-check fi-sm" style={{ marginRight: 6 }} /> 儲存規則
          </button>
        </div>
      </div>

      {/* History */}
      <h3 style={{ marginBottom: 12, fontWeight: 600 }}>規則變更紀錄</h3>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>生效日期</th>
              <th>漲幅上限</th>
              <th>最低定價</th>
              <th>建立時間</th>
            </tr>
          </thead>
          <tbody>
            {allRules.length === 0 ? (
              <tr><td colSpan={4} className="no-data-row">尚無規則紀錄</td></tr>
            ) : (
              allRules.map((rule, idx) => (
                <tr key={rule.id} className={idx === 0 ? 'row-highlight' : ''}>
                  <td>{rule.effectiveDate || '-'}</td>
                  <td>{rule.maxIncreasePercent}%</td>
                  <td>NT$ {(rule.minPrice || 0).toLocaleString()}</td>
                  <td>{new Date(rule.createdAt).toLocaleString('zh-TW')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
