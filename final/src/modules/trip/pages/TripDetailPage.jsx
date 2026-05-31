import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Calendar, Users, Plus, Share2, Mail, Eye,
  DollarSign, History, MessageSquare, Copy, CheckCheck,
} from 'lucide-react';
import useStore from '../../../store/useTripStore';
import { useToast } from '../../../components/common/Toast';
import DayBlock from '../components/DayBlock';
import Modal from '../../../components/common/Modal';

const TABS = [
  { id: 'days',     label: '行程安排', icon: <Calendar size={15} /> },
  { id: 'comments', label: '留言討論', icon: <MessageSquare size={15} /> },
  { id: 'history',  label: '編輯紀錄', icon: <History size={15} /> },
];

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTrip, addDay, addComment, inviteCollaborator, getCollaboratorNames, currentUser, trips } = useStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('days');
  const [commentText, setCommentText] = useState('');
  const [inviteModal, setInviteModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [copied, setCopied] = useState(false);

  // read fresh from store so renders reflect updates
  const trip = getTrip(id);
  if (!trip) return (
    <div className="container">
      <div className="empty-state" style={{ paddingTop: '6rem' }}>
        <div style={{ fontSize: '3rem' }}>🔍</div>
        <p>找不到此行程</p>
        <button className="btn-primary" onClick={() => navigate('/trip')}>返回行程列表</button>
      </div>
    </div>
  );

  const collabNames = getCollaboratorNames(trip);
  const shareUrl = `${window.location.origin}/?share=${trip.shareToken}`;

  const formatDate = (d) => {
    const dt = new Date(d + 'T00:00:00');
    return `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()}`;
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment(id, commentText);
    setCommentText('');
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const ok = inviteCollaborator(id, inviteEmail.trim());
    if (ok) {
      toast(`已發送邀請給 ${inviteEmail}`, 'success');
      setInviteEmail('');
      setInviteModal(false);
    } else {
      toast('此 Email 已受邀或已是旅伴', 'warning');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast('分享連結已複製！', 'success');
    });
  };

  const formatTs = (ts) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const ACTION_ICONS = {
    create: '🎉', add_item: '➕', edit_item: '✏️', delete_item: '🗑️',
    vote: '🗳️', invite: '✉️', join: '👋', add_expense: '💰',
  };

  return (
    <div className="trip-detail-page">
      <div className="container">
        {/* Header */}
        <div className="trip-detail-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="trip-detail-title">{trip.title}</h1>
              <div className="trip-detail-meta">
                <span><MapPin size={14} /> {trip.stationName}</span>
                <span><Calendar size={14} /> {formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span>
                <span>🗓️ {trip.days.length} 天</span>
                <span><Users size={14} /> {collabNames.length} 位旅伴</span>
                {trip.budget > 0 && <span>💰 預算 NT${trip.budget.toLocaleString()}</span>}
              </div>
              {trip.description && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{trip.description}</p>
              )}
            </div>
            <div className="trip-detail-actions">
              <Link to={`/trip/${id}/overview`} className="btn-outline btn-sm">
                <Eye size={14} /> 總覽
              </Link>
              <Link to={`/trip/${id}/expenses`} className="btn-outline btn-sm">
                <DollarSign size={14} /> 費用
              </Link>
              <button className="btn-outline btn-sm" onClick={() => setInviteModal(true)}>
                <Mail size={14} /> 邀請
              </button>
              <button className="btn-outline btn-sm" onClick={() => setShareModal(true)}>
                <Share2 size={14} /> 分享
              </button>
              <button className="btn-primary btn-sm" onClick={() => addDay(id)}>
                <Plus size={14} /> 新增一天
              </button>
            </div>
          </div>
        </div>

        <div className="trip-layout">
          {/* Main: Days */}
          <div className="trip-main">
            <div className="tabs">
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'days' && (
              <div>
                {trip.days.length === 0 ? (
                  <div className="empty-state">
                    <div style={{ fontSize: '3rem' }}>📅</div>
                    <p>尚未安排任何天數</p>
                    <button className="btn-primary" onClick={() => addDay(id)}>
                      <Plus size={16} /> 新增第一天
                    </button>
                  </div>
                ) : (
                  trip.days.map(day => (
                    <DayBlock key={day.id} day={day} trip={trip} />
                  ))
                )}
                <button
                  className="btn-outline full-width"
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => addDay(id)}
                >
                  <Plus size={16} /> 新增一天
                </button>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="sidebar-panel" style={{ width: '100%' }}>
                <div className="sidebar-panel-body">
                  <div className="comments-list" style={{ maxHeight: '500px' }}>
                    {trip.comments.length === 0 && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                        還沒有留言，第一個發言吧！
                      </p>
                    )}
                    {[...trip.comments].reverse().map(c => (
                      <div key={c.id} className="comment-item">
                        <div className="comment-header">
                          <span className="comment-author">{c.userName}</span>
                          <span className="comment-time">{formatTs(c.timestamp)}</span>
                        </div>
                        <p className="comment-text">{c.message}</p>
                      </div>
                    ))}
                  </div>
                  {currentUser ? (
                    <div className="comment-input-row">
                      <input
                        className="comment-input"
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                        placeholder="輸入留言…"
                      />
                      <button className="btn-primary btn-sm" onClick={handleAddComment} disabled={!commentText.trim()}>
                        發送
                      </button>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                      <Link to="/login" style={{ color: 'var(--primary)' }}>登入</Link> 後才能留言
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="sidebar-panel" style={{ width: '100%' }}>
                <div className="history-list" style={{ maxHeight: '600px' }}>
                  {[...trip.editHistory].reverse().map(h => (
                    <div key={h.id} className="history-item">
                      <span className="history-dot" />
                      <div className="history-content">
                        <span className="history-action">
                          {ACTION_ICONS[h.action] || '📝'} {h.description}
                        </span>
                        <span className="history-time">
                          {h.userName} · {formatTs(h.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {trip.editHistory.length === 0 && (
                    <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>尚無編輯紀錄</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Collaborators */}
          <div className="trip-sidebar">
            <div className="sidebar-panel">
              <div className="sidebar-panel-header">
                <Users size={15} /> 旅伴清單
              </div>
              <div className="sidebar-panel-body">
                <div className="collab-list">
                  {collabNames.map((c, i) => (
                    <div key={c.id} className="collab-item">
                      <div className="collab-avatar">{c.name[0]}</div>
                      <span className="collab-name">{c.name}</span>
                      <span className="collab-role">{i === 0 ? '建立者' : '旅伴'}</span>
                    </div>
                  ))}
                  {trip.invitedEmails.map(email => (
                    <div key={email} className="collab-item">
                      <div className="collab-avatar" style={{ background: '#fef3c7', color: '#d97706' }}>?</div>
                      <span className="collab-name" style={{ fontSize: '0.8rem' }}>{email}</span>
                      <span className="invited-tag">邀請中</span>
                    </div>
                  ))}
                </div>
                <button className="btn-outline btn-sm full-width" onClick={() => setInviteModal(true)}>
                  <Mail size={14} /> 邀請旅伴
                </button>
              </div>
            </div>

            {/* Quick Comments sidebar */}
            <div className="sidebar-panel">
              <div className="sidebar-panel-header">
                <MessageSquare size={15} /> 最新留言
              </div>
              <div className="sidebar-panel-body">
                <div className="comments-list" style={{ maxHeight: '200px' }}>
                  {trip.comments.length === 0 ? (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center' }}>暫無留言</p>
                  ) : (
                    [...trip.comments].reverse().slice(0, 3).map(c => (
                      <div key={c.id} className="comment-item">
                        <div className="comment-header">
                          <span className="comment-author">{c.userName}</span>
                          <span className="comment-time">{formatTs(c.timestamp)}</span>
                        </div>
                        <p className="comment-text">{c.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <button className="btn-ghost btn-sm full-width" style={{ marginTop: 6 }} onClick={() => setActiveTab('comments')}>
                  查看全部留言
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal isOpen={inviteModal} onClose={() => setInviteModal(false)} title="邀請旅伴" size="sm">
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          輸入旅伴的 Gmail 地址，將會透過 Email 通知對方加入行程。
        </p>
        <div className="form-group">
          <label>旅伴 Email</label>
          <input
            className="form-input"
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
            placeholder="friend@gmail.com"
          />
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={() => setInviteModal(false)}>取消</button>
          <button className="btn-primary" onClick={handleInvite} disabled={!inviteEmail.trim()}>
            <Mail size={15} /> 發送邀請
          </button>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal isOpen={shareModal} onClose={() => setShareModal(false)} title="分享行程" size="sm">
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          複製下方連結，分享給您的旅伴，對方可透過連結加入或檢視此行程。
        </p>
        <div className="share-link-box">
          <span className="share-link-url">{shareUrl}</span>
          <button
            className="btn-primary btn-sm"
            onClick={handleCopyLink}
            style={{ flexShrink: 0 }}
          >
            {copied ? <><CheckCheck size={14} /> 已複製</> : <><Copy size={14} /> 複製</>}
          </button>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 12 }}>
          旅伴登入後點擊連結，系統會自動加入為旅伴。
        </p>
      </Modal>
    </div>
  );
}
