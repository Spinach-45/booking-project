import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import useStore from '../../store/useStore';
import { t } from '../../i18n';
import { useToast } from '../../components/common/Toast';

export default function LoginPage() {
  const { lang, login, register, currentUser } = useStore();
  const navigate = useNavigate();
  const addToast = useToast();
  const T = (key) => t(lang, key);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (currentUser) { navigate('/'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const result = login(form.email, form.password);
        if (result.success) {
          addToast(lang === 'zh' ? `歡迎回來，${result.user.name}！` : `Welcome back, ${result.user.name}!`, 'success');
          navigate(result.user.role === 'admin' ? '/admin' : '/');
        } else {
          addToast(result.error, 'error');
        }
      } else {
        if (!form.name) { addToast(lang === 'zh' ? '請輸入姓名' : 'Please enter name', 'error'); return; }
        const result = register(form.name, form.email, form.password);
        if (result.success) {
          addToast(lang === 'zh' ? '註冊成功！' : 'Registered successfully!', 'success');
          navigate('/');
        } else {
          addToast(result.error, 'error');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="brand-icon-lg">🏨</span>
          <h1>BookingTW</h1>
        </div>

        <div className="login-tabs">
          <button className={`tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
            <LogIn size={16} /> {T('nav.login')}
          </button>
          <button className={`tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
            <UserPlus size={16} /> {lang === 'zh' ? '註冊' : 'Register'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="form-group">
              <label>{T('common.name')}</label>
              <input className="form-input" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
          )}
          <div className="form-group">
            <label>{T('common.email')}</label>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>{lang === 'zh' ? '密碼' : 'Password'}</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn-primary full-width btn-large" disabled={loading}>
            {loading ? T('common.loading') : (mode === 'login' ? T('nav.login') : (lang === 'zh' ? '註冊' : 'Register'))}
          </button>
        </form>

        <div className="login-demo">
          <p>{lang === 'zh' ? '示範帳號' : 'Demo Accounts'}:</p>
          <div className="demo-accounts">
            <button className="demo-btn" onClick={() => setForm({ name: '', email: 'demo@example.com', password: 'demo123' })}>
              👤 {lang === 'zh' ? '一般用戶' : 'Customer'}: demo@example.com / demo123
            </button>
            <button className="demo-btn" onClick={() => setForm({ name: '', email: 'admin@example.com', password: 'admin123' })}>
              ⚙️ {lang === 'zh' ? '管理員' : 'Admin'}: admin@example.com / admin123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
