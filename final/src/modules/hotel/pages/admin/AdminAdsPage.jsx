import { useState } from 'react';
import useStore from '../../../../store/useHotelStore';
import { t } from '../../i18n';
import Modal from '../../../../components/common/Modal';
import { useToast } from '../../../../components/common/Toast';

const emptyAd = () => ({
  title: '', titleEn: '', image: 'https://picsum.photos/seed/newad/1200/300',
  link: '#', position: 'banner',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  active: true,
});

export default function AdminAdsPage() {
  const { lang, ads, addAd, updateAd, deleteAd } = useStore();
  const addToast = useToast();
  const T = (key) => t(lang, key);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyAd());

  const openAdd = () => { setEditTarget(null); setForm(emptyAd()); setShowModal(true); };
  const openEdit = (ad) => { setEditTarget(ad); setForm({ ...ad }); setShowModal(true); };

  const handleSave = () => {
    if (!form.title) { addToast(lang === 'zh' ? '請填寫廣告標題' : 'Please enter ad title', 'error'); return; }
    if (editTarget) { updateAd(editTarget.id, form); addToast(T('common.success'), 'success'); }
    else { addAd(form); addToast(lang === 'zh' ? '廣告已新增' : 'Ad added', 'success'); }
    setShowModal(false);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title"><i className="fi fi-rr-megaphone" style={{ fontSize: 20 }} /> {T('admin.adManagement')}</h1>
        <button className="btn-primary" onClick={openAdd}><i className="fi fi-rr-plus fi-sm" /> {T('admin.ad.addAd')}</button>
      </div>

      <div className="ads-grid">
        {ads.map(ad => (
          <div key={ad.id} className={`ad-manage-card ${!ad.active ? 'ad-inactive' : ''}`}>
            <div className="ad-preview">
              <img src={ad.image} alt={ad.title} className="ad-preview-img" />
              <span className="ad-position-badge">
                {{ banner: '頂部橫幅', sidebar: '側欄', landing: '首頁廣告' }[ad.position] ?? ad.position}
              </span>
            </div>
            <div className="ad-manage-info">
              <h3>{lang === 'zh' ? ad.title : (ad.titleEn || ad.title)}</h3>
              <p><i className="fi fi-rr-calendar fi-xs" style={{ marginRight: 3 }} />{ad.startDate} → {ad.endDate}</p>
              <div className="ad-manage-actions">
                <button className={`toggle-btn ${ad.active ? 'active' : ''}`} onClick={() => updateAd(ad.id, { active: !ad.active })}>
                  {ad.active ? T('admin.ad.active') : T('admin.ad.inactive')}
                </button>
                <button className="btn-icon-sm" onClick={() => openEdit(ad)}><i className="fi fi-rr-pencil fi-sm" /></button>
                <button className="btn-icon-sm btn-danger-icon" onClick={() => { if (window.confirm('確定刪除此廣告？')) deleteAd(ad.id); }}><i className="fi fi-rr-trash fi-sm" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTarget ? T('admin.ad.editAd') : T('admin.ad.addAd')}>
        <div className="form-grid">
          <div className="form-group">
            <label>{T('admin.ad.adTitle')} (中) *</label>
            <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>{T('admin.ad.adTitle')} (EN)</label>
            <input className="form-input" value={form.titleEn} onChange={e => setForm(f => ({ ...f, titleEn: e.target.value }))} />
          </div>
          <div className="form-group form-full">
            <label>{T('admin.ad.adImage')} URL</label>
            <input className="form-input" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
            {form.image && <img src={form.image} alt="" className="ad-img-preview" />}
          </div>
          <div className="form-group">
            <label>{T('admin.ad.adLink')}</label>
            <input className="form-input" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>{T('admin.ad.adPosition')}</label>
            <select className="form-input" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
              <option value="banner">{lang === 'zh' ? '頂部橫幅' : 'Top Banner'}</option>
              <option value="sidebar">{lang === 'zh' ? '側欄' : 'Sidebar'}</option>
              <option value="landing">{lang === 'zh' ? '首頁廣告欄位' : 'Landing Page'}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{T('admin.discount.startDate')}</label>
            <input className="form-input" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>{T('admin.discount.endDate')}</label>
            <input className="form-input" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={handleSave}>{T('common.save')}</button>
          <button className="btn-ghost" onClick={() => setShowModal(false)}>{T('common.cancel')}</button>
        </div>
      </Modal>
    </div>
  );
}
