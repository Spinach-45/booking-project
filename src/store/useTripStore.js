import { create } from 'zustand';
import useAuthStore from './useAuthStore';

const LS = {
  get: (key, fb) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} },
};

const uid = (p = 'id') => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const SEED_TRIPS = [
  {
    id: 'trip-demo',
    title: '台北三日遊',
    description: '探索台北市的文化、美食與夜生活',
    area: 'taipei',
    stationId: 'sta-tp-01',
    stationName: '台北車站',
    startDate: '2026-06-15',
    endDate: '2026-06-17',
    createdBy: 'user-demo',
    collaborators: ['user-002'],
    invitedEmails: [],
    shareToken: 'share-demo-001',
    budget: 15000,
    days: [
      {
        id: 'day-d01', dayNumber: 1, date: '2026-06-15',
        items: [
          { id: 'item-d001', type: 'attraction', title: '台灣博物館', location: '台北市中正區襄陽路2號', time: '09:00', duration: 120, notes: '建議購買台博套票', status: 'planned', isCandidate: false, votes: { for: [], against: [] }, order: 0, attractionId: 'attr-tp01-01' },
          { id: 'item-d002', type: 'food', title: '鼎泰豐午餐（信義店）', location: '台北市信義區市府路45號B1', time: '12:00', duration: 90, notes: '尖峰時間需等候45分鐘', status: 'planned', isCandidate: false, votes: { for: [], against: [] }, order: 1, attractionId: null },
        ],
      },
      {
        id: 'day-d02', dayNumber: 2, date: '2026-06-16',
        items: [
          { id: 'item-d005', type: 'attraction', title: '國立故宮博物院', location: '台北市士林區至善路二段221號', time: '09:30', duration: 180, notes: '建議租語音導覽', status: 'unplanned', isCandidate: true, votes: { for: ['user-demo'], against: ['user-002'] }, order: 0, attractionId: null },
          { id: 'item-d007', type: 'food', title: '士林夜市', location: '台北市士林區基河路', time: '18:00', duration: 120, notes: '必吃：大雞排、蚵仔煎', status: 'planned', isCandidate: false, votes: { for: [], against: [] }, order: 2, attractionId: null },
        ],
      },
    ],
    expenses: [
      { id: 'exp-d001', title: '台灣博物館門票', amount: 300, category: 'attraction', date: '2026-06-15', paidBy: 'user-demo', paidByName: '示範用戶', splitWith: ['user-demo', 'user-002'], notes: '2人 x NT$150' },
    ],
    comments: [
      { id: 'cmt-d001', userId: 'user-002', userName: '林小美', message: '故宮跟陽明山時間衝突了，大家投票看看？', timestamp: '2026-05-20T10:30:00.000Z' },
    ],
    editHistory: [
      { id: 'hist-d001', userId: 'user-demo', userName: '示範用戶', action: 'create', description: '建立行程「台北三日遊」', timestamp: '2026-05-15T09:00:00.000Z' },
    ],
    createdAt: '2026-05-15T09:00:00.000Z',
  },
];

function initLS() {
  if (!LS.get('tp_initialized', false)) {
    LS.set('tp_trips', SEED_TRIPS);
    LS.set('tp_initialized', true);
  }
}
initLS();

function saveTrips(trips, set) {
  LS.set('tp_trips', trips);
  set({ trips: [...trips] });
}

const useTripStore = create((set, get) => ({
  trips: LS.get('tp_trips', []),

  get currentUser() { return useAuthStore.getState().currentUser; },
  get login() { return useAuthStore.getState().login; },
  get logout() { return useAuthStore.getState().logout; },
  get register() { return useAuthStore.getState().register; },

  getUserTrips() {
    const user = useAuthStore.getState().currentUser;
    if (!user) return [];
    return LS.get('tp_trips', []).filter(t =>
      t.createdBy === user.id || t.collaborators.includes(user.id)
    );
  },

  getTrip(id) { return LS.get('tp_trips', []).find(t => t.id === id) || null; },
  getTripByShare(token) { return LS.get('tp_trips', []).find(t => t.shareToken === token) || null; },

  createTrip(data) {
    const user = useAuthStore.getState().currentUser;
    const startD = new Date(data.startDate);
    const endD = new Date(data.endDate);
    const days = [];
    let cur = new Date(startD), num = 1;
    while (cur <= endD) {
      days.push({ id: uid('day'), dayNumber: num++, date: cur.toISOString().split('T')[0], items: [] });
      cur.setDate(cur.getDate() + 1);
    }
    const trip = {
      id: uid('trip'), title: data.title, description: data.description || '',
      area: data.area, stationId: data.stationId, stationName: data.stationName,
      startDate: data.startDate, endDate: data.endDate,
      createdBy: user?.id || 'guest', collaborators: [], invitedEmails: [],
      shareToken: Math.random().toString(36).slice(2, 12),
      budget: Number(data.budget) || 0, days, expenses: [], comments: [],
      editHistory: [{ id: uid('hist'), userId: user?.id, userName: user?.name || '訪客', action: 'create', description: `建立行程「${data.title}」`, timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    };
    const trips = LS.get('tp_trips', []);
    trips.unshift(trip);
    saveTrips(trips, set);
    return trip;
  },

  updateTrip(id, updates) {
    const trips = LS.get('tp_trips', []).map(t => t.id === id ? { ...t, ...updates } : t);
    saveTrips(trips, set);
  },

  deleteTrip(id) {
    const trips = LS.get('tp_trips', []).filter(t => t.id !== id);
    saveTrips(trips, set);
  },

  addDay(tripId) {
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const last = trip.days[trip.days.length - 1];
    const lastDate = last ? new Date(last.date) : new Date(trip.startDate || Date.now());
    const next = new Date(lastDate);
    next.setDate(next.getDate() + 1);
    trip.days.push({ id: uid('day'), dayNumber: trip.days.length + 1, date: next.toISOString().split('T')[0], items: [] });
    saveTrips(trips, set);
  },

  deleteDay(tripId, dayId) {
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    trip.days = trip.days.filter(d => d.id !== dayId);
    trip.days.forEach((d, i) => { d.dayNumber = i + 1; });
    saveTrips(trips, set);
  },

  addItem(tripId, dayId, itemData) {
    const user = useAuthStore.getState().currentUser;
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return null;
    const day = trip.days.find(d => d.id === dayId);
    if (!day) return null;
    const item = { id: uid('item'), type: itemData.type || 'attraction', title: itemData.title, location: itemData.location || '', time: itemData.time || '09:00', duration: Number(itemData.duration) || 60, notes: itemData.notes || '', status: 'planned', isCandidate: itemData.isCandidate || false, votes: { for: [], against: [] }, order: day.items.length, attractionId: itemData.attractionId || null };
    day.items.push(item);
    day.items.sort((a, b) => a.time.localeCompare(b.time));
    trip.editHistory.push({ id: uid('hist'), userId: user?.id, userName: user?.name || '訪客', action: 'add_item', description: `新增「${item.title}」到第${day.dayNumber}天${item.isCandidate ? '（候選）' : ''}`, timestamp: new Date().toISOString() });
    saveTrips(trips, set);
    return item;
  },

  updateItem(tripId, dayId, itemId, updates) {
    const user = useAuthStore.getState().currentUser;
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const day = trip.days.find(d => d.id === dayId);
    if (!day) return;
    const idx = day.items.findIndex(i => i.id === itemId);
    if (idx < 0) return;
    day.items[idx] = { ...day.items[idx], ...updates };
    if (updates.time !== undefined) day.items.sort((a, b) => a.time.localeCompare(b.time));
    trip.editHistory.push({ id: uid('hist'), userId: user?.id, userName: user?.name || '訪客', action: 'edit_item', description: `編輯「${day.items.find(i => i.id === itemId)?.title || '項目'}」`, timestamp: new Date().toISOString() });
    saveTrips(trips, set);
  },

  deleteItem(tripId, dayId, itemId) {
    const user = useAuthStore.getState().currentUser;
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const day = trip.days.find(d => d.id === dayId);
    if (!day) return;
    const item = day.items.find(i => i.id === itemId);
    day.items = day.items.filter(i => i.id !== itemId);
    trip.editHistory.push({ id: uid('hist'), userId: user?.id, userName: user?.name || '訪客', action: 'delete_item', description: `刪除「${item?.title || '項目'}」`, timestamp: new Date().toISOString() });
    saveTrips(trips, set);
  },

  reorderItems(tripId, dayId, newItems) {
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const day = trip.days.find(d => d.id === dayId);
    if (!day) return;
    day.items = newItems;
    saveTrips(trips, set);
  },

  vote(tripId, dayId, itemId, choice) {
    const user = useAuthStore.getState().currentUser;
    if (!user) return;
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const day = trip.days.find(d => d.id === dayId);
    if (!day) return;
    const item = day.items.find(i => i.id === itemId);
    if (!item) return;
    item.votes.for = item.votes.for.filter(id => id !== user.id);
    item.votes.against = item.votes.against.filter(id => id !== user.id);
    item.votes[choice].push(user.id);
    trip.editHistory.push({ id: uid('hist'), userId: user.id, userName: user.name, action: 'vote', description: `對「${item.title}」投票${choice === 'for' ? '保留✅' : '取消❌'}`, timestamp: new Date().toISOString() });
    saveTrips(trips, set);
  },

  inviteCollaborator(tripId, email) {
    const user = useAuthStore.getState().currentUser;
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return false;
    if (trip.invitedEmails.includes(email)) return false;
    trip.invitedEmails.push(email);
    trip.editHistory.push({ id: uid('hist'), userId: user?.id, userName: user?.name || '訪客', action: 'invite', description: `邀請 ${email} 加入行程`, timestamp: new Date().toISOString() });
    const users = useAuthStore.getState().getUsers();
    const invitedUser = users.find(u => u.email === email);
    if (invitedUser && !trip.collaborators.includes(invitedUser.id)) trip.collaborators.push(invitedUser.id);
    saveTrips(trips, set);
    return true;
  },

  joinTrip(shareToken) {
    const user = useAuthStore.getState().currentUser;
    if (!user) return null;
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.shareToken === shareToken);
    if (!trip) return null;
    if (!trip.collaborators.includes(user.id) && trip.createdBy !== user.id) {
      trip.collaborators.push(user.id);
      trip.editHistory.push({ id: uid('hist'), userId: user.id, userName: user.name, action: 'join', description: `${user.name} 透過分享連結加入行程`, timestamp: new Date().toISOString() });
      saveTrips(trips, set);
    }
    return trip;
  },

  addComment(tripId, message) {
    const user = useAuthStore.getState().currentUser;
    if (!user || !message.trim()) return;
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    trip.comments.push({ id: uid('cmt'), userId: user.id, userName: user.name, message: message.trim(), timestamp: new Date().toISOString() });
    saveTrips(trips, set);
  },

  addExpense(tripId, data) {
    const user = useAuthStore.getState().currentUser;
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return null;
    const expense = { id: uid('exp'), title: data.title, amount: Number(data.amount), category: data.category || 'other', date: data.date || new Date().toISOString().split('T')[0], paidBy: data.paidBy || user?.id || '', paidByName: data.paidByName || user?.name || '', splitWith: data.splitWith || [user?.id].filter(Boolean), notes: data.notes || '' };
    trip.expenses.push(expense);
    trip.editHistory.push({ id: uid('hist'), userId: user?.id, userName: user?.name || '訪客', action: 'add_expense', description: `新增費用「${expense.title}」NT$${expense.amount}`, timestamp: new Date().toISOString() });
    saveTrips(trips, set);
    return expense;
  },

  updateExpense(tripId, expenseId, updates) {
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    trip.expenses = trip.expenses.map(e => e.id === expenseId ? { ...e, ...updates } : e);
    saveTrips(trips, set);
  },

  deleteExpense(tripId, expenseId) {
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    trip.expenses = trip.expenses.filter(e => e.id !== expenseId);
    saveTrips(trips, set);
  },

  getCollaboratorNames(trip) {
    const users = useAuthStore.getState().getUsers();
    const ids = [trip.createdBy, ...trip.collaborators];
    return ids.map(id => { const u = users.find(u => u.id === id); return u ? { id: u.id, name: u.name } : { id, name: id }; });
  },

  detectConflicts(day) {
    const candidates = day.items.filter(i => i.isCandidate);
    const conflicts = [];
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const a = candidates[i], b = candidates[j];
        const [ah, am] = a.time.split(':').map(Number);
        const [bh, bm] = b.time.split(':').map(Number);
        if (Math.abs((ah * 60 + am) - (bh * 60 + bm)) < 60) conflicts.push([a.id, b.id]);
      }
    }
    return conflicts;
  },

  // ── 跨模組整合：將訂房/訂票加入行程 ─────────────────────────
  addBookingToTrip(tripId, dayId, bookingInfo) {
    const user = useAuthStore.getState().currentUser;
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return false;
    const day = trip.days.find(d => d.id === dayId);
    if (!day) return false;
    const item = {
      id: uid('item'), type: 'accommodation',
      title: `🏨 ${bookingInfo.propertyName}`,
      location: bookingInfo.location || '',
      time: bookingInfo.checkInTime || '14:00',
      duration: 0, notes: `入住：${bookingInfo.checkIn} 退房：${bookingInfo.checkOut}`,
      status: 'planned', isCandidate: false, votes: { for: [], against: [] },
      order: day.items.length, attractionId: null,
      bookingRef: bookingInfo.orderId,
    };
    day.items.push(item);
    trip.editHistory.push({ id: uid('hist'), userId: user?.id, userName: user?.name || '系統', action: 'add_booking', description: `自動加入住宿「${bookingInfo.propertyName}」`, timestamp: new Date().toISOString() });
    saveTrips(trips, set);
    return true;
  },

  addTrainToTrip(tripId, dayId, trainInfo) {
    const user = useAuthStore.getState().currentUser;
    const trips = LS.get('tp_trips', []);
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return false;
    const day = trip.days.find(d => d.id === dayId);
    if (!day) return false;
    const item = {
      id: uid('item'), type: 'transport',
      title: `🚂 ${trainInfo.fromName} → ${trainInfo.toName} (${trainInfo.trainNo})`,
      location: `${trainInfo.fromName}站`,
      time: trainInfo.depTime,
      duration: trainInfo.duration || 0,
      notes: `抵達時間：${trainInfo.arrTime}，票號：${trainInfo.bookingNo || ''}`,
      status: 'planned', isCandidate: false, votes: { for: [], against: [] },
      order: day.items.length, attractionId: null,
      trainRef: trainInfo.orderId,
    };
    day.items.push(item);
    day.items.sort((a, b) => a.time.localeCompare(b.time));
    trip.editHistory.push({ id: uid('hist'), userId: user?.id, userName: user?.name || '系統', action: 'add_train', description: `自動加入車次「${trainInfo.fromName}→${trainInfo.toName}」`, timestamp: new Date().toISOString() });
    saveTrips(trips, set);
    return true;
  },

  checkConflictsWithBooking(tripId, date, newItem) {
    const trip = get().getTrip(tripId);
    if (!trip) return [];
    const day = trip.days.find(d => d.date === date);
    if (!day) return [];
    const conflicts = [];
    const [nh, nm] = newItem.time.split(':').map(Number);
    const newStart = nh * 60 + nm;
    const newEnd = newStart + (newItem.duration || 60);
    day.items.forEach(item => {
      const [ih, im] = item.time.split(':').map(Number);
      const iStart = ih * 60 + im;
      const iEnd = iStart + (item.duration || 60);
      if (newStart < iEnd && newEnd > iStart) {
        conflicts.push({ existingItem: item, newItem, type: 'time_overlap' });
      }
    });
    return conflicts;
  },
}));

export default useTripStore;
