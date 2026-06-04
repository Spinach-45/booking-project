import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import useStore from '../../../../store/useHotelStore';
import { t } from '../../i18n';

export default function ChatPage() {
  const { lang, currentUser, chats, properties, sendMessage } = useStore();
  const location = useLocation();
  const T = (key) => t(lang, key);
  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const bottomRef = useRef(null);

  const myChats = chats.filter(c => c.participants.includes(currentUser?.id));

  useEffect(() => {
    const state = location.state;
    if (state?.hostId && state?.propertyId) {
      const chatKey = [currentUser.id, state.hostId, state.propertyId].sort().join('-');
      const existing = myChats.find(c => c.key === chatKey);
      setActiveChat(existing || { key: chatKey, propertyId: state.propertyId, participants: [currentUser.id, state.hostId], messages: [], isNew: true, toUserId: state.hostId });
    } else if (myChats.length > 0) {
      setActiveChat(myChats[0]);
    }
  }, [location.state]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages?.length]);

  const handleSend = () => {
    if (!message.trim() || !activeChat) return;
    const toUserId = activeChat.participants.find(p => p !== currentUser.id) || activeChat.toUserId;
    sendMessage(currentUser.id, toUserId, activeChat.propertyId, message.trim());
    setMessage('');
    // Refresh active chat
    const updatedChats = useStore.getState().chats;
    const chatKey = activeChat.key;
    setActiveChat(updatedChats.find(c => c.key === chatKey) || activeChat);
  };

  if (!currentUser) return (
    <div className="container empty-page">
      <p>{lang === 'zh' ? '請先登入' : 'Please login first'}</p>
      <Link to="/login" className="btn-primary">{T('nav.login')}</Link>
    </div>
  );

  const getPropName = (propertyId) => {
    const prop = properties.find(p => p.id === propertyId);
    if (!prop) return propertyId;
    return lang === 'zh' ? prop.name : (prop.nameEn || prop.name);
  };

  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p !== currentUser.id) || '房東';
  };

  return (
    <div className="chat-page">
      <div className="container">
        <h1 className="page-title"><i className="fi fi-rr-comment" style={{ fontSize: 24 }} /> {T('chat.title')}</h1>
        <div className="chat-layout">
          {/* Conversation list */}
          <div className="chat-sidebar">
            {myChats.length === 0 ? (
              <div className="chat-empty-list">
                <p>{lang === 'zh' ? '尚無對話' : 'No conversations'}</p>
                <Link to="/hotel/properties" className="btn-outline btn-sm">{lang === 'zh' ? '瀏覽房源' : 'Browse Properties'}</Link>
              </div>
            ) : (
              myChats.map(chat => (
                <div
                  key={chat.key}
                  className={`chat-list-item ${activeChat?.key === chat.key ? 'active' : ''}`}
                  onClick={() => setActiveChat(chat)}
                >
                  <div className="chat-list-icon">💬</div>
                  <div className="chat-list-info">
                    <div className="chat-list-prop">{getPropName(chat.propertyId)}</div>
                    <div className="chat-list-with">{lang === 'zh' ? '與' : 'With'}: {getOtherParticipant(chat)}</div>
                    <div className="chat-list-last">
                      {chat.messages.slice(-1)[0]?.message || ''}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat window */}
          <div className="chat-window">
            {!activeChat ? (
              <div className="chat-window-empty">
                <i className="fi fi-rr-comment fi-lg" />
                <p>{T('chat.selectConversation')}</p>
              </div>
            ) : (
              <>
                <div className="chat-window-header">
                  <span>{getPropName(activeChat.propertyId)}</span>
                </div>
                <div className="chat-messages">
                  {(!activeChat.messages || activeChat.messages.length === 0) ? (
                    <div className="chat-no-messages">{T('chat.noMessages')}</div>
                  ) : (
                    activeChat.messages.map(msg => (
                      <div key={msg.id} className={`chat-message ${msg.fromUserId === currentUser.id ? 'chat-message-me' : 'chat-message-them'}`}>
                        <div className="chat-bubble">{msg.message}</div>
                        <div className="chat-time">{new Date(msg.timestamp).toLocaleTimeString(lang === 'zh' ? 'zh-TW' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>
                <div className="chat-input-row">
                  <input
                    className="chat-input"
                    placeholder={T('chat.typeMessage')}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  />
                  <button className="btn-send" onClick={handleSend} disabled={!message.trim()}>
                    <i className="fi fi-rr-paper-plane" style={{ fontSize: 18 }} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
