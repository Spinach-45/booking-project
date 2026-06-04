import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { useToast } from '../components/common/Toast';

export default function RegisterPage() {
  const { register, loginWithOAuth } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleRegister = () => {
    setError('');
    if (!form.name.trim()) return setError('請輸入姓名');
    if (!form.email.trim()) return setError('請輸入 Email');
    if (form.password.length < 6) return setError('密碼至少 6 個字元');
    if (form.password !== form.confirm) return setError('兩次密碼不一致');
    const result = register(form.name.trim(), form.email.trim(), form.phone.trim(), form.password);
    if (result.success) {
      toast('註冊成功！歡迎加入 ' + result.user.name, 'success');
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
      toast(`已透過 ${provider === 'google' ? 'Google' : 'LINE'} 註冊並登入`, 'success');
      navigate('/');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 style={{ fontSize: '2rem', letterSpacing: '0.06em', fontWeight: 600, marginTop: 0 }}>Agent TT</h1>
          <p>建立帳號，開始你的旅程</p>
        </div>

        <div className="login-form">
          <div className="form-group">
            <label>姓名 *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="您的姓名" />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label>手機號碼（選填）</label>
            <input className="form-input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0912-345-678" />
          </div>
          <div className="form-group">
            <label>密碼 *</label>
            <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="至少 6 個字元" />
          </div>
          <div className="form-group">
            <label>確認密碼 *</label>
            <input className="form-input" type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="再次輸入密碼"
              onKeyDown={e => e.key === 'Enter' && handleRegister()} />
          </div>
          {error && <p className="text-danger" style={{ fontSize: '0.85rem' }}>{error}</p>}
          <button className="btn-primary full-width" onClick={handleRegister}>
            <i className="fi fi-rr-user-add fi-sm" /> 建立帳號
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>— 或使用第三方快速註冊 —</div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-outline full-width" onClick={() => handleOAuth('google')} style={{ flex: 1 }}>
              <i className="fi fi-rr-globe fi-sm" /> Google
            </button>
            <button className="btn-outline full-width" onClick={() => handleOAuth('line')} style={{ flex: 1, color: '#06C755', borderColor: '#06C755' }}>
              <i className="fi fi-rr-comment fi-sm" /> LINE
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          已有帳號？ <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>前往登入</Link>
        </div>
      </div>
    </div>
  );
}
