import { create } from 'zustand';
import useAuthStore from './useAuthStore';
import { generateTrains, STATION_MAP, TICKET_TYPES, POINTS_RATE } from '../modules/train/data/trainData';

function assignSeats(passengers, seatPref, seed) {
  if (!passengers.length) return passengers;
  let s = seed >>> 0;
  const rand = () => { s = Math.imul(1664525, s) + 1013904223 >>> 0; return s / 0x100000000; };
  const allLetters = ['A', 'B', 'C', 'D', 'F'];
  const carNo  = 1 + Math.floor(rand() * 12);
  const rowNo  = 1 + Math.floor(rand() * Math.max(1, 68 - passengers.length));
  if (passengers.length === 1) {
    const prefL = seatPref === 'window' ? ['A','F'] : seatPref === 'aisle' ? ['C','D'] : allLetters;
    return [{ ...passengers[0], seatNo: `${carNo}車${rowNo}${prefL[Math.floor(rand() * prefL.length)]}` }];
  }
  // 多人：同車廂、同排號、連續字母（連號優先於偏好）
  const startIdx = seatPref === 'aisle' ? 2 : 0; // C=2, A=0
  return passengers.map((p, i) => ({
    ...p,
    seatNo: `${carNo}車${rowNo}${allLetters[(startIdx + i) % allLetters.length]}`,
  }));
}

const LS = {
  get: (key, fb) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} },
};

const uid = (p = 'id') => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const tomorrow  = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const nextWeek  = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

const SEED_ORDERS = [
  {
    id: 'ORD-DEMO-001',
    userId: 'user-demo',
    bookingNo: 'TR8821039401',
    train: { id: 'express-taipei-kaohsiung-demo', trainNo: 'ZQ1035', type: 'express', from: 'taipei', fromName: '台北', to: 'kaohsiung', toName: '高雄', date: yesterday, depTime: '08:30', arrTime: '12:15', duration: 225, basePrice: 650 },
    tickets: [{ typeId: 'adult', typeName: '全票', count: 2, unitPrice: 650, subtotal: 1300 }],
    passengers: [{ name: '示範用戶', phone: '0912-345-678', idNo: 'A123456789', ticketType: 'adult', ticketTypeName: '全票' }],
    seatPref: 'window', paymentMethod: 'credit', totalAmount: 1300,
    status: 'used', createdAt: Date.now() - 2 * 86400000, paidAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'ORD-DEMO-002',
    userId: 'user-demo',
    bookingNo: 'TR9932087612',
    train: { id: 'taroko-taipei-tainan-demo', trainNo: 'TR0223', type: 'taroko', from: 'taipei', fromName: '台北', to: 'tainan', toName: '台南', date: nextWeek, depTime: '09:00', arrTime: '11:40', duration: 160, basePrice: 738 },
    tickets: [{ typeId: 'adult', typeName: '全票', count: 1, unitPrice: 738, subtotal: 738 }, { typeId: 'child', typeName: '孩童票', count: 1, unitPrice: 369, subtotal: 369 }],
    passengers: [{ name: '示範用戶', phone: '0912-345-678', idNo: 'A123456789', ticketType: 'adult', ticketTypeName: '全票' }],
    seatPref: 'window', paymentMethod: 'linepay', totalAmount: 1107,
    status: 'paid', createdAt: Date.now() - 3600000, paidAt: Date.now() - 3600000,
  },
];

function init() {
  if (!LS.get('tr_initialized', false)) {
    LS.set('tr_orders', SEED_ORDERS);
    LS.set('tr_initialized', true);
  }
}
init();

const DEFAULT_SEARCH = {
  queryType: 'basic', from: 'taipei', to: 'kaohsiung', date: tomorrow,
  timeSlot: 'all', carType: 'any', trainType: 'any', businessClass: false,
  transferAllowed: false, seatPref: 'any',
  ticketCounts: { adult: 1, child: 0, senior: 0, disability: 0, student: 0 },
};

const useTrainStore = create((set, get) => ({
  // Auth proxy
  get currentUser() { return useAuthStore.getState().currentUser; },
  get login() { return useAuthStore.getState().login; },
  get logout() { return useAuthStore.getState().logout; },
  get register() { return useAuthStore.getState().register; },

  searchParams: DEFAULT_SEARCH,
  searchResults: [],
  selectedTrain: null,
  orders: LS.get('tr_orders', SEED_ORDERS),
  paymentResult: null,

  // ── Search ────────────────────────────────────────────────
  setSearchParams: (p) => set(s => ({ searchParams: { ...s.searchParams, ...p } })),
  searchTrains: (params) => {
    const merged = { ...get().searchParams, ...params };
    const results = generateTrains(merged);
    set({ searchResults: results, searchParams: merged });
    return results;
  },
  selectTrain: (train) => set({ selectedTrain: train }),

  // ── Orders ────────────────────────────────────────────────
  createOrder: ({ train, tickets, passengers, seatPref, multiDiscount = null, businessClass = false, origBaseAmount = 0, businessSurcharge = 0 }) => {
    const user = useAuthStore.getState().currentUser;
    if (!user) return null;
    const baseAmount = tickets.reduce((s, t) => s + t.subtotal, 0);
    const discountAmount = multiDiscount ? Math.round(baseAmount * multiDiscount.percent / 100) : 0;
    const orderId = uid('ORD');
    const seatSeed = orderId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) ^ (Date.now() & 0xffff);
    const passengersWithSeats = assignSeats(passengers, seatPref, seatSeed);
    const order = {
      id: orderId,
      userId: user.id,
      bookingNo: null,
      train: { ...train, fromName: STATION_MAP[train.from] ?? train.from, toName: STATION_MAP[train.to] ?? train.to },
      tickets, passengers: passengersWithSeats, seatPref,
      paymentMethod: null,
      baseAmount,
      discountAmount,
      multiDiscount,
      businessClass,
      origBaseAmount: businessClass ? origBaseAmount : baseAmount,
      businessSurcharge,
      totalAmount: baseAmount - discountAmount,
      status: 'pending',
      createdAt: Date.now(), paidAt: null,
    };
    const orders = [...get().orders, order];
    LS.set('tr_orders', orders);
    set({ orders });
    return order.id;
  },

  processPayment: (orderId, method, cardNumber = '', pointsToUse = 0) => {
    const orders = get().orders;
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, reason: '找不到訂單' };
    const fail = method === 'credit' && cardNumber.replace(/\s/g, '').startsWith('0000');
    if (fail) {
      const result = { success: false, reason: '信用卡授權失敗，請確認卡號是否正確', orderId };
      set({ paymentResult: result });
      return result;
    }
    const bookingNo = `TR${Date.now().toString().slice(-10)}`;
    const cvsPickupCode = `CV${Date.now().toString().slice(-8)}`;
    const stationPickupCode = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
    const finalAmount = order.totalAmount - (pointsToUse || 0);
    const pointsEarned = Math.floor(finalAmount / (100 / POINTS_RATE));
    if (pointsToUse > 0) useAuthStore.getState().addPoints(-pointsToUse);
    useAuthStore.getState().addPoints(pointsEarned);
    const updated = {
      ...order,
      status: 'paid',
      paymentMethod: method,
      bookingNo,
      paidAt: Date.now(),
      cvsPickupCode,
      stationPickupCode,
      pointsEarned,
      pointsUsed: pointsToUse || 0,
      finalAmount,
    };
    const newOrders = orders.map(o => o.id === orderId ? updated : o);
    LS.set('tr_orders', newOrders);
    const result = { success: true, bookingNo, orderId, pointsEarned };
    set({ orders: newOrders, paymentResult: result });
    return result;
  },

  cancelOrder: (orderId) => {
    const orders = get().orders.map(o =>
      o.id === orderId ? { ...o, status: 'cancelled', cancelledAt: Date.now() } : o
    );
    LS.set('tr_orders', orders);
    set({ orders });
  },

  requestRefund: (orderId) => {
    const orders = get().orders.map(o =>
      o.id === orderId ? { ...o, status: 'refunded', refundedAt: Date.now() } : o
    );
    LS.set('tr_orders', orders);
    set({ orders });
    return true;
  },

  changeTicket: (orderId, newTrain, priceDiff) => {
    const orders = get().orders;
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;
    const updated = {
      ...order, status: 'changed',
      train: { ...newTrain, fromName: STATION_MAP[newTrain.from] ?? newTrain.from, toName: STATION_MAP[newTrain.to] ?? newTrain.to },
      totalAmount: order.totalAmount + priceDiff, changedAt: Date.now(),
    };
    const newOrders = orders.map(o => o.id === orderId ? updated : o);
    LS.set('tr_orders', newOrders);
    set({ orders: newOrders });
    return true;
  },

  splitTicket: (orderId, passengerIdx, receiverUser) => {
    const orders = get().orders;
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, reason: '找不到訂單' };
    const passenger = order.passengers[passengerIdx];
    if (!passenger || passenger.splitStatus === 'transferred') return { success: false, reason: '票券不可分票' };
    const senderUser = useAuthStore.getState().currentUser;
    const updatedPassengers = order.passengers.map((p, i) =>
      i === passengerIdx ? { ...p, splitStatus: 'transferred', splitTo: receiverUser.name } : p
    );
    const newOrderId = uid('ORD');
    const ticketInfo = order.tickets?.find(t => t.typeId === passenger.ticketType) ?? {};
    const newOrder = {
      id: newOrderId,
      userId: receiverUser.id,
      bookingNo: `TR${Date.now().toString().slice(-10)}`,
      train: { ...order.train },
      tickets: [{ typeId: passenger.ticketType, typeName: passenger.ticketTypeName, count: 1, unitPrice: ticketInfo.unitPrice ?? 0, subtotal: ticketInfo.unitPrice ?? 0 }],
      passengers: [{ ...passenger, splitStatus: 'received', splitFrom: senderUser?.name ?? '' }],
      seatPref: order.seatPref,
      paymentMethod: 'split',
      totalAmount: 0,
      baseAmount: 0,
      discountAmount: 0,
      status: 'paid',
      isFromSplit: true,
      splitFromOrderId: orderId,
      splitFromUserName: senderUser?.name ?? '',
      cvsPickupCode: order.cvsPickupCode,
      stationPickupCode: order.stationPickupCode,
      createdAt: Date.now(),
      paidAt: Date.now(),
    };
    const updatedOrders = orders
      .map(o => o.id === orderId ? { ...o, passengers: updatedPassengers } : o)
      .concat(newOrder);
    LS.set('tr_orders', updatedOrders);
    set({ orders: updatedOrders });
    return { success: true };
  },

  getOrder: (id) => get().orders.find(o => o.id === id),
  getUserOrders: () => {
    const user = useAuthStore.getState().currentUser;
    return user ? get().orders.filter(o => o.userId === user.id) : [];
  },
  clearPaymentResult: () => set({ paymentResult: null }),
}));

export default useTrainStore;
