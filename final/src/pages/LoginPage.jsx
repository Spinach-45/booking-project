import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Phone, Mail, Globe2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useToast } from '../components/common/Toast';

export default function LoginPage() {
  const { login, loginWithPhone, loginWithOAuth } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [method, setMethod] = useState('email');
  const [form, setForm] = useState({ email: '', phone: '', password: '' });
  const [error, setError] = useState('');

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleLogin = () => {
    setError('');
    let result;
    if (method === 'email') {
      result = login(form.email, form.password);
    } else {
      result = loginWithPhone(form.phone, form.password);
    }
    if (result.success) {
      toast('登入成功！歡迎回來 ' + result.user.name, 'success');
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const handleOAuth = (provider) => {
    const mockProfile = {
      google: { name: 'Google 用戶', email: 'google-user@gmail.com' },
      line: { name: 'LINE 用戶', email: 'line-user@example.com' },
    }[provider];
    const result = loginWithOAuth(provider, mockProfile);
    if (result.success) {
      toast(`已透過 ${provider === 'google' ? 'Google' : 'LINE'} 登入`, 'success');
      navigate('/');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div style={{ fontSize: '3rem' }}>🌏</div>
          <h1>智慧旅遊整合平台</h1>
          <p>登入以使用完整功能</p>
        </div>

        <div className="login-tabs">
          <button className={`login-tab ${method === 'email' ? 'active' : ''}`} onClick={() => { setMethod('email'); setError(''); }}>
            <Mail size={14} /> Email
          </button>
          <button className={`login-tab ${method === 'phone' ? 'active' : ''}`} onClick={() => { setMethod('phone'); setError(''); }}>
            <Phone size={14} /> 手機號碼
          </button>
        </div>

        <div className="login-form">
          {method === 'email' ? (
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" autoComplete="email" />
            </div>
          ) : (
            <div className="form-group">
              <label>手機號碼</label>
              <input className="form-input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0912-345-678" />
            </div>
          )}
          <div className="form-group">
            <label>密碼</label>
            <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="請輸入密碼"
              onKeyDown={e => e.key === 'Enter' && handleLogin()} autoComplete="current-password" />
          </div>
          {error && <p className="text-danger" style={{ fontSize: '0.85rem' }}>{error}</p>}
          <button className="btn-primary full-width" onClick={handleLogin}>
            <LogIn size={16} /> 登入
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>— 或使用第三方登入 —</div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-outline full-width" onClick={() => handleOAuth('google')} style={{ flex: 1 }}>
              <Globe2 size={16} /> Google
            </button>
            <button className="btn-outline full-width" onClick={() => handleOAuth('line')} style={{ flex: 1, color: '#06C755', borderColor: '#06C755' }}>
              💬 LINE
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          還沒有帳號？ <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>立即註冊</Link>
        </div>

        <div className="login-demo">
          <p>測試帳號（點擊快速填入）：</p>
          <div className="demo-accounts">
            <button className="demo-btn" onClick={() => { setMethod('email'); set('email', 'demo@example.com'); set('password', 'demo123'); }}>
              👤 示範用戶 — demo@example.com / demo123
            </button>
            <button className="demo-btn" onClick={() => { setMethod('email'); set('email', 'admin@example.com'); set('password', 'admin123'); }}>
              ⚙️ 系統管理員 — admin@example.com / admin123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
