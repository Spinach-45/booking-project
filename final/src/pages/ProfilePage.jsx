import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Train, Hotel, Map, Heart, Share2, Edit2, Save, X, Star, Ticket, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useHotelStore from '../store/useHotelStore';
import useTrainStore from '../store/useTrainStore';
import useTripStore from '../store/useTripStore';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import { TRAIN_TYPES, ORDER_STATUSES, getDelayStatus } from '../modules/train/data/trainData';

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
  const [ticketDetail, setTicketDetail] = useState(null); // { order, passenger }
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700 }}>火車票訂單（{trainOrders.length} 筆）</h3>
            <Link to="/ticket/orders" className="btn-outline btn-sm">前往票務管理</Link>
          </div>
          {trainOrders.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: '2rem' }}>🎫</div><p>尚無火車票訂單</p><Link to="/ticket" className="btn-primary">查詢車次</Link></div>
          ) : (
            trainOrders.slice().reverse().map(o => {
              const typeInfo = TRAIN_TYPES[o.train.type] ?? {};
              const statusInfo = ORDER_STATUSES[o.status] ?? {};
              const delay = o.train.delay ?? getDelayStatus(o.train.id ?? o.train.trainNo);
              const canTicket = o.status === 'paid' || o.status === 'used' || o.status === 'changed';
              return (
                <div key={o.id} className="order-card">
                  {/* Top: train badge + status */}
                  <div className="order-card-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="train-type-badge" style={{ background: typeInfo.bg, color: typeInfo.color }}>
                        {typeInfo.icon} {typeInfo.name}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.train.trainNo}</span>
                    </div>
                    <span className="order-status-badge" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Route + delay */}
                  <div className="order-route">
                    {o.train.fromName}
                    <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 4px' }} />
                    {o.train.toName}
                    <span style={{ marginLeft: 8, padding: '1px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700, background: delay.bg, color: delay.color }}>
                      {delay.status === 'ontime' ? '✓ 準時' : delay.status === 'delayed' ? `⚠ ${delay.label}` : `? ${delay.label}`}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="order-meta">
                    <span>📅 {o.train.date}</span>
                    <span>🕐 {o.train.depTime} – {o.train.arrTime}</span>
                    <span>💺 {o.seatPref === 'window' ? '靠窗' : o.seatPref === 'aisle' ? '靠走道' : '不指定'}</span>
                    {o.bookingNo && <span style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>票號：{o.bookingNo}</span>}
                  </div>

                  {/* Per-ticket rows */}
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                      車票明細（點擊查看詳情）
                    </div>
                    {(o.passengers ?? []).map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setTicketDetail({ order: o, passenger: p })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%',
                          padding: '0.4rem 0.6rem', marginBottom: '0.25rem',
                          background: 'var(--bg)', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
                      >
                        <Ticket size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.83rem', fontWeight: 600, flex: 1 }}>{p.name}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.ticketTypeName}</span>
                        {p.seatNo
                          ? <span className="seat-badge">{p.seatNo}</span>
                          : <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>候補</span>
                        }
                        <ArrowRight size={12} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>

                  {/* Bottom: price + actions */}
                  <div className="order-card-bottom">
                    <span className="order-total-price">NT${o.totalAmount?.toLocaleString()}</span>
                    <div className="order-actions">
                      {o.status === 'pending' && (
                        <Link to={`/ticket/payment/${o.id}`} className="btn-primary btn-sm">前往付款</Link>
                      )}
                      {canTicket && (
                        <Link to={`/ticket/ticket/${o.id}`} className="btn-outline btn-sm">🎟️ 取票</Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {ticketDetail && (
            <ProfileTicketDetailModal
              order={ticketDetail.order}
              passenger={ticketDetail.passenger}
              onClose={() => setTicketDetail(null)}
            />
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

function ProfileTicketDetailModal({ order, passenger, onClose }) {
  const typeInfo = TRAIN_TYPES[order.train.type] ?? {};
  const delay = order.train.delay ?? getDelayStatus(order.train.id ?? order.train.trainNo);

  const rows = [
    ['乘客姓名', passenger.name],
    ['票種',     passenger.ticketTypeName],
    ['座位號碼', passenger.seatNo ?? '候補（未分配）'],
    ['車次號',   `${typeInfo.icon ?? ''} ${typeInfo.name ?? ''} ${order.train.trainNo}`],
    ['起點',     order.train.fromName],
    ['目的地',   order.train.toName],
    ['發車時間', `${order.train.date} ${order.train.depTime}`],
    ['抵達時間', `${order.train.date} ${order.train.arrTime}`],
    ['票號',     order.bookingNo ?? '（未付款）'],
    ['訂票時間', new Date(order.createdAt).toLocaleString('zh-TW')],
  ];

  return (
    <Modal isOpen onClose={onClose} title="車票詳細資料" size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>
          <span style={{ padding: '4px 16px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700, background: delay.bg, color: delay.color }}>
            {delay.status === 'ontime' ? '✓ 列車準時' : delay.status === 'delayed' ? `⚠ ${delay.label}` : `? ${delay.label}`}
          </span>
        </div>
        {rows.map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
            <span style={{ fontWeight: 600, textAlign: 'right', marginLeft: '1rem' }}>{val}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
