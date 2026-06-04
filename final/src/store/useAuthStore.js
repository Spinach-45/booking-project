import { create } from 'zustand';

const LS = {
  get: (key, fb) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} },
};

const uid = () => `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

function initUsers() {
  if (!LS.get('app_initialized', false)) {
    LS.set('app_users', [
      { id: 'user-demo',  name: '示範用戶',   email: 'demo@example.com',  phone: '0912-345-678', password: 'demo123', role: 'customer' },
      { id: 'admin-001',  name: '系統管理員', email: 'admin@example.com', phone: '0900-000-000', password: 'admin123', role: 'admin' },
      { id: 'user-002',   name: '林小美',     email: 'user2@example.com', phone: '0987-654-321', password: 'demo123', role: 'customer' },
      { id: 'host-demo',  name: '示範房東',   email: 'host@example.com',  phone: '0923-456-789', password: 'host123', role: 'host' },
    ]);
    LS.set('app_initialized', true);
  } else {
    // migration: add host user if not present
    const users = LS.get('app_users', []);
    if (!users.find(u => u.id === 'host-demo')) {
      users.push({ id: 'host-demo', name: '示範房東', email: 'host@example.com', phone: '0923-456-789', password: 'host123', role: 'host' });
      LS.set('app_users', users);
    }
  }
}
initUsers();

const useAuthStore = create((set, get) => ({
  currentUser: LS.get('app_currentUser', null),

  login: (email, password) => {
    const users = LS.get('app_users', []);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, error: '帳號或密碼錯誤' };
    const safe = { id: user.id, name: user.name, email: user.email, phone: user.phone || '', role: user.role || 'customer' };
    LS.set('app_currentUser', safe);
    set({ currentUser: safe });
    return { success: true, user: safe };
  },

  loginWithPhone: (phone, password) => {
    const users = LS.get('app_users', []);
    const user = users.find(u => u.phone === phone && u.password === password);
    if (!user) return { success: false, error: '手機號碼或密碼錯誤' };
    const safe = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role || 'customer' };
    LS.set('app_currentUser', safe);
    set({ currentUser: safe });
    return { success: true, user: safe };
  },

  loginWithOAuth: (provider, profileData) => {
    const users = LS.get('app_users', []);
    let user = users.find(u => u.email === profileData.email);
    if (!user) {
      user = { id: uid(), name: profileData.name, email: profileData.email, phone: '', password: '', role: 'customer', provider };
      users.push(user);
      LS.set('app_users', users);
    }
    const safe = { id: user.id, name: user.name, email: user.email, phone: user.phone || '', role: user.role, provider };
    LS.set('app_currentUser', safe);
    set({ currentUser: safe });
    return { success: true, user: safe };
  },

  logout: () => {
    LS.set('app_currentUser', null);
    set({ currentUser: null });
  },

  register: (name, email, phone, password) => {
    const users = LS.get('app_users', []);
    if (users.find(u => u.email === email)) return { success: false, error: '此 Email 已被使用' };
    const newUser = { id: uid(), name, email, phone: phone || '', password, role: 'customer' };
    users.push(newUser);
    LS.set('app_users', users);
    const safe = { id: newUser.id, name, email, phone: phone || '', role: 'customer' };
    LS.set('app_currentUser', safe);
    set({ currentUser: safe });
    return { success: true, user: safe };
  },

  updateProfile: (updates) => {
    const cur = get().currentUser;
    if (!cur) return false;
    const users = LS.get('app_users', []);
    const idx = users.findIndex(u => u.id === cur.id);
    if (idx < 0) return false;
    users[idx] = { ...users[idx], ...updates };
    LS.set('app_users', users);
    const safe = { ...cur, ...updates };
    LS.set('app_currentUser', safe);
    set({ currentUser: safe });
    return true;
  },

  getUsers: () => LS.get('app_users', []),

  updateUserRole: (userId, role) => {
    const users = LS.get('app_users', []).map(u => u.id === userId ? { ...u, role } : u);
    LS.set('app_users', users);
    // If the current user's role changed, update session too
    const cur = LS.get('app_currentUser', null);
    if (cur && cur.id === userId) {
      const updated = { ...cur, role };
      LS.set('app_currentUser', updated);
      set({ currentUser: updated });
    }
  },

  toggleUserActive: (userId) => {
    const users = LS.get('app_users', []).map(u => u.id === userId ? { ...u, active: !u.active } : u);
    LS.set('app_users', users);
  },

  addPoints: (pts) => {
    if (!pts || pts <= 0) return;
    const cur = get().currentUser;
    if (!cur) return;
    const users = LS.get('app_users', []);
    const idx = users.findIndex(u => u.id === cur.id);
    if (idx < 0) return;
    const newPoints = (users[idx].points || 0) + pts;
    users[idx] = { ...users[idx], points: newPoints };
    LS.set('app_users', users);
    const safe = { ...cur, points: newPoints };
    LS.set('app_currentUser', safe);
    set({ currentUser: safe });
  },
}));

export default useAuthStore;
