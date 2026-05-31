import { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import useStore from '../../../../store/useHotelStore';
import { t } from '../../i18n';
import Modal from '../../../../components/common/Modal';
import { useToast } from '../../../../components/common/Toast';

const emptyDiscount = () => ({
  type: 'earlyBird', name: '', nameEn: '', propertyId: 'all',
  discountType: 'percent', value: 10, minDaysAhead: 7, minNights: 1,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  active: true,
});

const emptyCoupon = () => ({
  code: '', type: 'percent', value: 10, minAmount: 0,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  usageLimit: 100, active: true,
});

export default function AdminDiscountsPage() {
  const { lang, discounts, addDiscount, updateDiscount, deleteDiscount, coupons, addCoupon, updateCoupon } = useStore();
  const addToast = useToast();
  const T = (key) => t(lang, key);

  const [tab, setTab] = useState('discounts'); // discounts | coupons
  const [discountModal, setDiscountModal] = useState(null);
  const [couponModal, setCouponModal] = useState(null);
  const [dForm, setDForm] = useState(emptyDiscount());
  const [cForm, setCForm] = useState(emptyCoupon());

  const saveDiscount = () => {
    if (!dForm.name) { addToast(lang === 'zh' ? '請填寫名稱' : 'Please enter name', 'error'); return; }
    if (discountModal?.id) updateDiscount(discountModal.id, dForm);
    else addDiscount(dForm);
    addToast(T('common.success'), 'success');
    setDiscountModal(null);
  };

  const saveCoupon = () => {
    if (!cForm.code) { addToast(lang === 'zh' ? '請填寫優惠券代碼' : 'Please enter coupon code', 'error'); return; }
    if (couponModal?.id) updateCoupon(couponModal.id, cForm);
    else addCoupon(cForm);
    addToast(T('common.success'), 'success');
    setCouponModal(null);
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title"><Tag size={20} /> {T('admin.discountManagement')}</h1>

      <div className="filter-tabs">
        <button className={`tab-btn ${tab === 'discounts' ? 'active' : ''}`} onClick={() => setTab('discounts')}>
          {lang === 'zh' ? '折扣活動' : 'Discounts'}
        </button>
        <button className={`tab-btn ${tab === 'coupons' ? 'active' : ''}`} onClick={() => setTab('coupons')}>
          {lang === 'zh' ? '優惠券' : 'Coupons'}
        </button>
      </div>

      {tab === 'discounts' && (
        <>
          <div className="admin-page-header">
            <span>{lang === 'zh' ? `共 ${discounts.length} 個活動` : `${discounts.length} promotions`}</span>
            <button className="btn-primary" onClick={() => { setDForm(emptyDiscount()); setDiscountModal({}); }}>
              <Plus size={16} /> {T('admin.discount.addDiscount')}
            </button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{T('common.name')}</th>
                  <th>{T('admin.discount.discountType')}</th>
                  <th>{T('admin.discount.discountValue')}</th>
                  <th>{T('admin.discount.startDate')}</th>
                  <th>{T('admin.discount.endDate')}</th>
                  <th>{T('common.status')}</th>
                  <th>{lang === 'zh' ? '操作' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map(d => (
                  <tr key={d.id}>
                    <td>{lang === 'zh' ? d.name : (d.nameEn || d.name)}</td>
                    <td>{T(`admin.discount.${d.type}`)}</td>
                    <td>{d.discountType === 'percent' ? `${d.value}%` : `NT$ ${d.value}`}</td>
                    <td>{d.startDate}</td>
                    <td>{d.endDate}</td>
                    <td>
                      <button className={`toggle-btn ${d.active ? 'active' : ''}`} onClick={() => updateDiscount(d.id, { active: !d.active })}>
                        {d.active ? (lang === 'zh' ? '啟用' : 'Active') : (lang === 'zh' ? '停用' : 'Inactive')}
                      </button>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon-sm" onClick={() => { setDForm({ ...d }); setDiscountModal(d); }}><Edit size={16} /></button>
                        <button className="btn-icon-sm btn-danger-icon" onClick={() => deleteDiscount(d.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'coupons' && (
        <>
          <div className="admin-page-header">
            <span>{lang === 'zh' ? `共 ${coupons.length} 張優惠券` : `${coupons.length} coupons`}</span>
            <button className="btn-primary" onClick={() => { setCForm(emptyCoupon()); setCouponModal({}); }}>
              <Plus size={16} /> {lang === 'zh' ? '新增優惠券' : 'Add Coupon'}
            </button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{T('admin.discount.couponCode')}</th>
                  <th>{T('admin.discount.discountType')}</th>
                  <th>{T('admin.discount.discountValue')}</th>
                  <th>{lang === 'zh' ? '最低消費' : 'Min Amount'}</th>
                  <th>{T('admin.discount.usageLimit')}</th>
                  <th>{T('admin.discount.usedCount')}</th>
                  <th>{T('admin.discount.endDate')}</th>
                  <th>{T('common.status')}</th>
                  <th>{lang === 'zh' ? '操作' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id}>
                    <td><code className="coupon-code">{c.code}</code></td>
                    <td>{c.type === 'percent' ? '%' : 'NT$'}</td>
                    <td>{c.type === 'percent' ? `${c.value}%` : `NT$ ${c.value}`}</td>
                    <td>NT$ {c.minAmount}</td>
                    <td>{c.usageLimit}</td>
                    <td>{c.usedCount}</td>
                    <td>{c.endDate}</td>
                    <td>
                      <button className={`toggle-btn ${c.active ? 'active' : ''}`} onClick={() => updateCoupon(c.id, { active: !c.active })}>
                        {c.active ? (lang === 'zh' ? '啟用' : 'Active') : (lang === 'zh' ? '停用' : 'Inactive')}
                      </button>
                    </td>
                    <td>
                      <button className="btn-icon-sm" onClick={() => { setCForm({ ...c }); setCouponModal(c); }}><Edit size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Discount Modal */}
      <Modal isOpen={!!discountModal} onClose={() => setDiscountModal(null)} title={lang === 'zh' ? '折扣活動' : 'Promotion'}>
        <div className="form-grid">
          <div className="form-group">
            <label>{T('common.name')} (中) *</label>
            <input className="form-input" value={dForm.name} onChange={e => setDForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>{T('admin.discount.discountType')}</label>
            <select className="form-input" value={dForm.type} onChange={e => setDForm(f => ({ ...f, type: e.target.value }))}>
              <option value="earlyBird">{T('admin.discount.earlyBird')}</option>
              <option value="package">{T('admin.discount.packageDeal')}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{lang === 'zh' ? '折扣計算' : 'Calc Type'}</label>
            <select className="form-input" value={dForm.discountType} onChange={e => setDForm(f => ({ ...f, discountType: e.target.value }))}>
              <option value="percent">{lang === 'zh' ? '百分比' : 'Percent'}</option>
              <option value="fixed">{lang === 'zh' ? '固定金額' : 'Fixed'}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{T('admin.discount.discountValue')}</label>
            <input className="form-input" type="number" min={0} value={dForm.value} onChange={e => setDForm(f => ({ ...f, value: Number(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label>{T('admin.discount.startDate')}</label>
            <input className="form-input" type="date" value={dForm.startDate} onChange={e => setDForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>{T('admin.discount.endDate')}</label>
            <input className="form-input" type="date" value={dForm.endDate} onChange={e => setDForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={saveDiscount}>{T('common.save')}</button>
          <button className="btn-ghost" onClick={() => setDiscountModal(null)}>{T('common.cancel')}</button>
        </div>
      </Modal>

      {/* Coupon Modal */}
      <Modal isOpen={!!couponModal} onClose={() => setCouponModal(null)} title={lang === 'zh' ? '優惠券設定' : 'Coupon Settings'}>
        <div className="form-grid">
          <div className="form-group">
            <label>{T('admin.discount.couponCode')} *</label>
            <input className="form-input" value={cForm.code} onChange={e => setCForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SUMMER20" />
          </div>
          <div className="form-group">
            <label>{lang === 'zh' ? '折扣計算' : 'Calc Type'}</label>
            <select className="form-input" value={cForm.type} onChange={e => setCForm(f => ({ ...f, type: e.target.value }))}>
              <option value="percent">{lang === 'zh' ? '百分比' : 'Percent'}</option>
              <option value="fixed">{lang === 'zh' ? '固定金額' : 'Fixed'}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{T('admin.discount.discountValue')}</label>
            <input className="form-input" type="number" min={0} value={cForm.value} onChange={e => setCForm(f => ({ ...f, value: Number(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label>{lang === 'zh' ? '最低消費' : 'Min Amount'}</label>
            <input className="form-input" type="number" min={0} value={cForm.minAmount} onChange={e => setCForm(f => ({ ...f, minAmount: Number(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label>{T('admin.discount.usageLimit')}</label>
            <input className="form-input" type="number" min={1} value={cForm.usageLimit} onChange={e => setCForm(f => ({ ...f, usageLimit: Number(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label>{T('admin.discount.startDate')}</label>
            <input className="form-input" type="date" value={cForm.startDate} onChange={e => setCForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>{T('admin.discount.endDate')}</label>
            <input className="form-input" type="date" value={cForm.endDate} onChange={e => setCForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={saveCoupon}>{T('common.save')}</button>
          <button className="btn-ghost" onClick={() => setCouponModal(null)}>{T('common.cancel')}</button>
        </div>
      </Modal>
    </div>
  );
}
