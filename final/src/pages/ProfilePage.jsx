import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Train, Hotel, Map, Heart, Share2, Edit2, Save, X, Star } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useHotelStore from '../store/useHotelStore';
import useTrainStore from '../store/useTrainStore';
import useTripStore from '../store/useTripStore';
import { useToast } from '../components/common/Toast';
import { TRAIN_TYPES, ORDER_STATUSES } from '../modules/train/data/trainData';

const TABS = [
  { id: 'info',          label: '個人資料',   icon: <User size={15} /> },
  { id: 'orders-train',  label: '火車票訂單', icon: <Train size={15} /> },
  { id: 'orders-hotel',  label: '住宿訂單',   icon: <Hotel size={15} /> },
  { id: 'trips',         label: '我的行程',   icon: <Map size={15} /> },
  { id: 'favorites',     label: '收藏清單',   icon: <Heart size={15} /> },
  { id: 'shares',        label: '分享連結',   icon: <Share2 size={15} /> },
];

export default function ProfilePage() {
  const { currentUser, updateProfile, logout } = useAuthStore();
  const hotelStore = useHotelStore();
  const trainStore = useTrainStore();
  const tripStore = useTripStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: currentUser?.name || '', phone: currentUser?.phone || '' });

  if (!currentUser) {
    return (
      <div className="container" style={{ paddingTop: '4rem' }}>
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>🔐</div>
          <p>請先登入才能查看個人中心</p>
          <Link to="/login" className="btn-primary">前往登入</Link>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!form.name.trim()) return;
    updateProfile({ name: form.name.trim(), phone: form.phone.trim() });
    toast('個人資料已更新', 'success');
    setEditing(false);
  };

  const trainOrders = trainStore.getUserOrders();
  const hotelOrders = hotelStore.getUserOrders(currentUser.id);
  const trips = tripStore.getUserTrips();
  const favoriteIds = hotelStore.favorites;
  const allProperties = hotelStore.getProperties();
  const favoriteProps = allProperties.filter(p => favoriteIds.includes(p.id));
  const myTrips = tripStore.getUserTrips().filter(t => t.createdBy === currentUser.id);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
          {currentUser.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{currentUser.name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentUser.email}</div>
          {currentUser.phone && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentUser.phone}</div>}
          {currentUser.role === 'admin' && <span className="badge badge-primary" style={{ marginTop: 4 }}>管理員</span>}
        </div>
        <button className="btn-danger btn-sm" onClick={() => { logout(); navigate('/'); }}>登出</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: '行程', value: trips.length, icon: '🗺️' },
          { label: '火車票訂單', value: trainOrders.length, icon: '🚂' },
          { label: '住宿訂單', value: hotelOrders.length, icon: '🏨' },
          { label: '收藏房源', value: favoriteIds.length, icon: '❤️' },
          { label: '累積點數', value: currentUser.points ?? 0, icon: '⭐' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="order-tabs" style={{ marginBottom: '1.5rem' }}>
        {TABS.map(t => (
          <button key={t.id} className={`order-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'info' && (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', maxWidth: 480 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700 }}>個人資料</h3>
            {!editing ? (
              <button className="btn-outline btn-sm" onClick={() => setEditing(true)}><Edit2 size={14} /> 編輯</button>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={14} /> 取消</button>
                <button className="btn-primary btn-sm" onClick={handleSave}><Save size={14} /> 儲存</button>
              </div>
            )}
          </div>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label>姓名</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-group"><label>手機號碼</label><input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="0912-345-678" /></div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              {[['姓名', currentUser.name], ['Email', currentUser.email], ['手機', currentUser.phone || '未設定'], ['帳號角色', currentUser.role === 'admin' ? '管理員' : '一般用戶'], ['累積點數', `${currentUser.points ?? 0} 點`]].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders-train' && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>火車票訂單（{trainOrders.length} 筆）</h3>
          {trainOrders.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: '2rem' }}>🎫</div><p>尚無火車票訂單</p><Link to="/ticket" className="btn-primary">查詢車次</Link></div>
          ) : (
            trainOrders.slice().reverse().map(o => {
              const typeInfo = TRAIN_TYPES[o.train.type] ?? {};
              const statusInfo = ORDER_STATUSES[o.status] ?? {};
              return (
                <div key={o.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="train-type-badge" style={{ background: typeInfo.bg, color: typeInfo.color }}>{typeInfo.icon} {typeInfo.name} {o.train.trainNo}</span>
                    <span style={{ background: statusInfo.bg, color: statusInfo.color, padding: '2px 8px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>{statusInfo.label}</span>
                  </div>
                  <div style={{ fontWeight: 700 }}>{o.train.fromName} → {o.train.toName}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{o.train.date} {o.train.depTime} – {o.train.arrTime}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>票號：{o.bookingNo || '未付款'}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>NT${o.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'orders-hotel' && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>住宿訂單（{hotelOrders.length} 筆）</h3>
          {hotelOrders.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: '2rem' }}>🏨</div><p>尚無住宿訂單</p><Link to="/hotel" className="btn-primary">搜尋住宿</Link></div>
          ) : (
            hotelOrders.slice().reverse().map(o => (
              <div key={o.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>{o.propertyName}</span>
                  <span className={`badge badge-${o.status === 'confirmed' ? 'success' : 'danger'}`}>{o.status === 'confirmed' ? '已確認' : '已取消'}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{o.roomTypeName} · {o.checkIn} – {o.checkOut}</div>
                {o.discountApplied && <div style={{ fontSize: '0.82rem', color: 'var(--success)', marginTop: 2 }}>🎁 {o.discountApplied.reason} 省 NT${o.discountApplied.savedAmount}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>訂單：{o.id}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>NT${(o.finalAmount || o.totalAmount)?.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'trips' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700 }}>我的行程（{trips.length} 筆）</h3>
            <Link to="/trip" className="btn-primary btn-sm">+ 新行程</Link>
          </div>
          {trips.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: '2rem' }}>✈️</div><p>尚無行程</p><Link to="/trip" className="btn-primary">建立行程</Link></div>
          ) : (
            trips.map(trip => (
              <div key={trip.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>{trip.title}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{trip.days.length} 天</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>{trip.startDate} – {trip.endDate} · {trip.stationName}</div>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: 6 }}>
                  <Link to={`/trip/${trip.id}`} className="btn-primary btn-sm">編輯</Link>
                  <Link to={`/trip/${trip.id}/overview`} className="btn-outline btn-sm">總覽</Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>收藏房源（{favoriteProps.length} 筆）</h3>
          {favoriteProps.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: '2rem' }}>❤️</div><p>尚無收藏</p><Link to="/hotel/properties" className="btn-primary">搜尋房源</Link></div>
          ) : (
            <div className="properties-grid">
              {favoriteProps.map(p => (
                <Link key={p.id} to={`/hotel/property/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                    <div style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{p.station}</div>
                      <div style={{ color: 'var(--primary)', fontWeight: 700, marginTop: 4 }}>NT${Math.min(...p.rooms.map(r => r.price)).toLocaleString()} 起</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'shares' && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>我建立的行程分享連結</h3>
          {myTrips.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: '2rem' }}>🔗</div><p>尚無分享連結</p></div>
          ) : (
            myTrips.map(trip => (
              <div key={trip.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{trip.title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'monospace', background: 'var(--bg)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius)', marginBottom: 6 }}>
                  {window.location.origin}/trip/share/{trip.shareToken}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  旅伴：{trip.collaborators.length} 人 · 邀請中：{trip.invitedEmails.length} 人
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
