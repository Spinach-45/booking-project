import { create } from 'zustand';
import useAuthStore from './useAuthStore';
import {
  SEED_PROPERTIES, SEED_COUPONS, SEED_ADS, SEED_REVIEWS,
  SEED_DISCOUNTS, SEED_PRICE_HISTORY,
} from '../modules/hotel/data/seedData';

const LS = {
  get: (key, fb) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} },
};

function initLS() {
  if (!LS.get('bk_initialized', false)) {
    LS.set('bk_properties', SEED_PROPERTIES);
    LS.set('bk_coupons', SEED_COUPONS);
    LS.set('bk_ads', SEED_ADS);
    LS.set('bk_reviews', SEED_REVIEWS);
    LS.set('bk_discounts', SEED_DISCOUNTS);
    LS.set('bk_priceHistory', SEED_PRICE_HISTORY);
    LS.set('bk_orders', []);
    LS.set('bk_chats', []);
    LS.set('bk_initialized', true);
  } else {
    // migration：更新房源圖片（替換 picsum 為 Unsplash 無人臉圖片）
    const existingProps = LS.get('bk_properties', []);
    const needsImgUpdate = existingProps.some(p => p.images?.[0]?.includes('picsum.photos'));
    if (needsImgUpdate) {
      const imgMap = Object.fromEntries(SEED_PROPERTIES.map(p => [p.id, p.images]));
      const updated = existingProps.map(p => imgMap[p.id] ? { ...p, images: imgMap[p.id] } : p);
      LS.set('bk_properties', updated);
    }
    // migration：修正 prop-008 第一張圖片失效連結
    const props008 = LS.get('bk_properties', []);
    const brokenUrl = 'photo-1463740839922-2d3b2a89b8f3';
    if (props008.some(p => p.id === 'prop-008' && p.images?.[0]?.includes(brokenUrl))) {
      const fixed = props008.map(p =>
        p.id === 'prop-008'
          ? { ...p, images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', ...p.images.slice(1)] }
          : p
      );
      LS.set('bk_properties', fixed);
    }
    // migration：補入首頁廣告（舊用戶不會有 position=landing 的廣告）
    let existing = LS.get('bk_ads', []);
    // 移除不再需要的廣告
    existing = existing.filter(a => a.id !== 'ad-005');
    const hasLanding = existing.some(a => a.position === 'landing');
    if (!hasLanding) {
      const landingAds = SEED_ADS.filter(a => a.position === 'landing');
      existing = [...existing, ...landingAds];
    } else {
      // 補入 video 欄位（舊版資料沒有 video）
      const videoMap = Object.fromEntries(SEED_ADS.map(a => [a.id, a.video]));
      existing = existing.map(a => (!a.video && videoMap[a.id]) ? { ...a, video: videoMap[a.id] } : a);
    }
    LS.set('bk_ads', existing);
  }
}
initLS();

const DEFAULT_PRICING_RULES = [
  { id: 'rule-001', maxIncreasePercent: 30, minPrice: 500, effectiveDate: '2024-01-01', createdAt: Date.now() },
];

const useHotelStore = create((set, get) => ({
  // Auth proxy
  get currentUser() { return useAuthStore.getState().currentUser; },
  get login() { return useAuthStore.getState().login; },
  get logout() { return useAuthStore.getState().logout; },
  get register() { return useAuthStore.getState().register; },

  // ── Language ──────────────────────────────────────────────
  lang: LS.get('bk_lang', 'zh'),
  setLang: (lang) => { LS.set('bk_lang', lang); set({ lang }); },

  // ── Properties ────────────────────────────────────────────
  properties: LS.get('bk_properties', []),
  getProperties: () => LS.get('bk_properties', []),
  saveProperties: (props) => { LS.set('bk_properties', props); set({ properties: props }); },
  addProperty: (prop) => {
    const props = LS.get('bk_properties', []);
    const newProp = { ...prop, id: `prop-${Date.now()}`, createdAt: new Date().toISOString() };
    props.push(newProp);
    LS.set('bk_properties', props);
    set({ properties: props });
    return newProp;
  },
  updateProperty: (id, updates) => {
    const props = LS.get('bk_properties', []).map(p => p.id === id ? { ...p, ...updates } : p);
    LS.set('bk_properties', props);
    set({ properties: props });
  },
  deleteProperty: (id) => {
    const props = LS.get('bk_properties', []).filter(p => p.id !== id);
    LS.set('bk_properties', props);
    set({ properties: props });
  },

  // ── Search / Filter ───────────────────────────────────────
  searchParams: { location: '', checkIn: '', checkOut: '', guests: 1 },
  setSearchParams: (params) => set({ searchParams: params }),
  filterParams: { priceMin: 0, priceMax: 10000, roomType: '', minRating: 0, amenities: [], distanceStation: 0, sortBy: 'rating' },
  setFilterParams: (params) => set(s => ({ filterParams: { ...s.filterParams, ...params } })),

  // ── Favorites ─────────────────────────────────────────────
  favorites: LS.get('bk_favorites', []),
  toggleFavorite: (propertyId) => {
    const favs = LS.get('bk_favorites', []);
    const idx = favs.indexOf(propertyId);
    const newFavs = idx >= 0 ? favs.filter(id => id !== propertyId) : [...favs, propertyId];
    LS.set('bk_favorites', newFavs);
    set({ favorites: newFavs });
  },
  isFavorite: (propertyId) => LS.get('bk_favorites', []).includes(propertyId),

  // ── Cart ──────────────────────────────────────────────────
  cart: LS.get('bk_cart', []),
  addToCart: (item) => {
    const cart = LS.get('bk_cart', []);
    const exists = cart.find(c => c.propertyId === item.propertyId && c.roomId === item.roomId && c.checkIn === item.checkIn && c.checkOut === item.checkOut);
    if (exists) return false;
    const newCart = [...cart, { ...item, cartId: `cart-${Date.now()}` }];
    LS.set('bk_cart', newCart);
    set({ cart: newCart });
    return true;
  },
  removeFromCart: (cartId) => {
    const newCart = LS.get('bk_cart', []).filter(c => c.cartId !== cartId);
    LS.set('bk_cart', newCart);
    set({ cart: newCart });
  },
  clearCart: () => { LS.set('bk_cart', []); set({ cart: [] }); },

  // ── Orders ────────────────────────────────────────────────
  orders: LS.get('bk_orders', []),
  createOrder: (orderData) => {
    const orders = LS.get('bk_orders', []);
    // 跨模組折扣：訂房兩晚以上享八折優惠
    const nights = orderData.nights || 1;
    let finalAmount = orderData.totalAmount;
    let discountApplied = null;
    if (nights >= 2) {
      finalAmount = Math.round(orderData.totalAmount * 0.8);
      discountApplied = { reason: '訂房兩晚以上八折優惠', percent: 20, savedAmount: orderData.totalAmount - finalAmount };
    }
    const newOrder = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      status: 'confirmed',
      paymentStatus: 'paid',
      // finalAmount 可能為 undefined（totalAmount 未傳）或 NaN（undefined * 0.8），
      // 兩者皆 falsy，安全退回 BookingPage 傳入的 finalAmount
      finalAmount: finalAmount || orderData.finalAmount || 0,
      discountApplied,
      createdAt: new Date().toISOString(),
    };

    // ── 衝突偵測：檢查同房間同日期是否已有確認訂單 ──────────────
    const conflicts = orders.filter(o =>
      o.propertyId === newOrder.propertyId &&
      o.roomId === newOrder.roomId &&
      o.status === 'confirmed' &&
      new Date(o.checkIn) < new Date(newOrder.checkOut) &&
      new Date(o.checkOut) > new Date(newOrder.checkIn)
    );

    if (conflicts.length > 0) {
      const validOrder = [...conflicts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
      const conflictOrder = {
        ...newOrder,
        status: 'conflict_cancelled',
        conflictReason: '因訂房衝突自動退款',
        refundAmount: newOrder.finalAmount ?? orderData.finalAmount ?? 0,
      };
      orders.push(conflictOrder);
      LS.set('bk_orders', orders);
      set({ orders });
      const user = useAuthStore.getState().currentUser;
      if (user) get().issueConflictCoupon(user.id, user.name, conflictOrder.id);
      get().addConflictLog({
        propertyId: newOrder.propertyId,
        propertyName: newOrder.propertyName,
        hostId: newOrder.hostId,
        validOrderId: validOrder.id,
        conflictOrderId: conflictOrder.id,
        conflictUserId: newOrder.userId,
        conflictUserName: newOrder.contactName,
        refundAmount: conflictOrder.refundAmount,
        couponIssued: !!user,
      });
      return { ...conflictOrder, isConflict: true, validOrder };
    }

    orders.push(newOrder);
    LS.set('bk_orders', orders);
    set({ orders });
    return newOrder;
  },
  cancelOrder: (orderId) => {
    const orders = LS.get('bk_orders', []);
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    const today = new Date();
    const checkIn = new Date(order.checkIn);
    const diffDays = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));
    let refundPercent = 0;
    if (diffDays >= 10) refundPercent = 100;
    else if (diffDays >= 4) refundPercent = 70;
    const refundAmount = Math.round((order.finalAmount || order.totalAmount) * refundPercent / 100);
    const updatedOrders = orders.map(o => o.id === orderId
      ? { ...o, status: 'cancelled', refundAmount, refundPercent, cancelledAt: new Date().toISOString() }
      : o
    );
    LS.set('bk_orders', updatedOrders);
    set({ orders: updatedOrders });
    return { refundAmount, refundPercent };
  },
  getUserOrders: (userId) => LS.get('bk_orders', []).filter(o => o.userId === userId),
  getAllOrders: () => LS.get('bk_orders', []),
  updateOrder: (orderId, updates) => {
    const orders = LS.get('bk_orders', []).map(o => o.id === orderId ? { ...o, ...updates } : o);
    LS.set('bk_orders', orders);
    set({ orders });
  },

  // ── Coupons ───────────────────────────────────────────────
  coupons: LS.get('bk_coupons', []),
  validateCoupon: (code, userId, amount) => {
    const coupons = LS.get('bk_coupons', []);
    const coupon = coupons.find(c => c.code === code.toUpperCase() && c.active);
    if (!coupon) return { valid: false, error: 'couponInvalid' };
    const now = new Date();
    if (new Date(coupon.endDate) < now) return { valid: false, error: 'couponExpired' };
    if (new Date(coupon.startDate) > now) return { valid: false, error: 'couponInvalid' };
    if (coupon.usedCount >= coupon.usageLimit) return { valid: false, error: 'couponUsed' };
    const usedCoupons = LS.get('bk_usedCoupons', {});
    if (usedCoupons[userId]?.includes(coupon.id)) return { valid: false, error: 'couponUsed' };
    if (amount < coupon.minAmount) return { valid: false, error: `最低消費 NT$${coupon.minAmount}` };
    if (coupon.targetUserId && coupon.targetUserId !== userId) return { valid: false, error: '此優惠券為個人專屬，無法使用' };
    const discount = coupon.type === 'percent' ? Math.round(amount * coupon.value / 100) : coupon.value;
    return { valid: true, coupon, discount };
  },
  useCoupon: (couponId, userId) => {
    const coupons = LS.get('bk_coupons', []).map(c => c.id === couponId ? { ...c, usedCount: c.usedCount + 1 } : c);
    LS.set('bk_coupons', coupons);
    set({ coupons });
    const usedCoupons = LS.get('bk_usedCoupons', {});
    usedCoupons[userId] = [...(usedCoupons[userId] || []), couponId];
    LS.set('bk_usedCoupons', usedCoupons);
    // Mark user coupon as used if it's a system-issued conflict compensation coupon
    const coupon = coupons.find(c => c.id === couponId);
    if (coupon?.isConflictCompensation) {
      const ucs = LS.get('bk_user_coupons', []).map(uc => uc.code === coupon.code ? { ...uc, status: 'used', usedAt: new Date().toISOString() } : uc);
      LS.set('bk_user_coupons', ucs);
      set({ userCoupons: ucs });
    }
  },
  addCoupon: (coupon) => {
    const coupons = LS.get('bk_coupons', []);
    const newCoupon = { ...coupon, id: `coup-${Date.now()}`, usedCount: 0 };
    coupons.push(newCoupon);
    LS.set('bk_coupons', coupons);
    set({ coupons });
    return newCoupon;
  },
  updateCoupon: (id, updates) => {
    const coupons = LS.get('bk_coupons', []).map(c => c.id === id ? { ...c, ...updates } : c);
    LS.set('bk_coupons', coupons);
    set({ coupons });
  },

  // ── Reviews ───────────────────────────────────────────────
  reviews: LS.get('bk_reviews', []),
  addReview: (review) => {
    const reviews = LS.get('bk_reviews', []);
    const newReview = { ...review, id: `rev-${Date.now()}`, createdAt: new Date().toISOString() };
    reviews.push(newReview);
    LS.set('bk_reviews', reviews);
    set({ reviews });
    return newReview;
  },
  getPropertyReviews: (propertyId) => LS.get('bk_reviews', []).filter(r => r.propertyId === propertyId),

  // ── Chat ──────────────────────────────────────────────────
  chats: LS.get('bk_chats', []),
  sendMessage: (fromUserId, toUserId, propertyId, message) => {
    const chats = LS.get('bk_chats', []);
    const chatKey = [fromUserId, toUserId, propertyId].sort().join('-');
    const existing = chats.find(c => c.key === chatKey);
    const newMsg = { id: `msg-${Date.now()}`, fromUserId, message, timestamp: new Date().toISOString() };
    if (existing) { existing.messages.push(newMsg); }
    else { chats.push({ key: chatKey, propertyId, participants: [fromUserId, toUserId], messages: [newMsg] }); }
    LS.set('bk_chats', chats);
    set({ chats: [...chats] });
  },
  getUserChats: (userId) => LS.get('bk_chats', []).filter(c => c.participants.includes(userId)),

  // ── Discounts ─────────────────────────────────────────────
  discounts: LS.get('bk_discounts', []),
  addDiscount: (discount) => {
    const discounts = LS.get('bk_discounts', []);
    const newDiscount = { ...discount, id: `disc-${Date.now()}` };
    discounts.push(newDiscount);
    LS.set('bk_discounts', discounts);
    set({ discounts });
    return newDiscount;
  },
  updateDiscount: (id, updates) => {
    const discounts = LS.get('bk_discounts', []).map(d => d.id === id ? { ...d, ...updates } : d);
    LS.set('bk_discounts', discounts);
    set({ discounts });
  },
  deleteDiscount: (id) => {
    const discounts = LS.get('bk_discounts', []).filter(d => d.id !== id);
    LS.set('bk_discounts', discounts);
    set({ discounts });
  },

  // ── Price History ─────────────────────────────────────────
  priceHistory: LS.get('bk_priceHistory', []),
  addPriceHistory: (entry) => {
    const history = LS.get('bk_priceHistory', []);
    const newEntry = { ...entry, id: `ph-${Date.now()}`, createdAt: new Date().toISOString() };
    history.push(newEntry);
    LS.set('bk_priceHistory', history);
    set({ priceHistory: history });
  },

  // ── Ads ───────────────────────────────────────────────────
  ads: LS.get('bk_ads', []),
  addAd: (ad) => {
    const ads = LS.get('bk_ads', []);
    const newAd = { ...ad, id: `ad-${Date.now()}` };
    ads.push(newAd);
    LS.set('bk_ads', ads);
    set({ ads });
    return newAd;
  },
  updateAd: (id, updates) => {
    const ads = LS.get('bk_ads', []).map(a => a.id === id ? { ...a, ...updates } : a);
    LS.set('bk_ads', ads);
    set({ ads });
  },
  deleteAd: (id) => {
    const ads = LS.get('bk_ads', []).filter(a => a.id !== id);
    LS.set('bk_ads', ads);
    set({ ads });
  },

  // ── Inventory ─────────────────────────────────────────────
  inventory: LS.get('bk_inventory', []),
  updateInventory: (propertyId, roomId, date, quantity) => {
    const inv = LS.get('bk_inventory', []);
    const idx = inv.findIndex(i => i.propertyId === propertyId && i.roomId === roomId && i.date === date);
    if (idx >= 0) inv[idx].quantity = quantity;
    else inv.push({ id: `inv-${Date.now()}`, propertyId, roomId, date, quantity });
    LS.set('bk_inventory', inv);
    set({ inventory: inv });
  },

  // ── Refund Requests ───────────────────────────────────────
  refundRequests: LS.get('bk_refund_requests', []),
  getRefundRequests: () => LS.get('bk_refund_requests', []),
  addRefundRequest: (req) => {
    const requests = LS.get('bk_refund_requests', []);
    const newReq = { ...req, id: `refund-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() };
    requests.push(newReq);
    LS.set('bk_refund_requests', requests);
    set({ refundRequests: requests });
    return newReq;
  },
  updateRefundRequest: (id, updates) => {
    const requests = LS.get('bk_refund_requests', []).map(r => r.id === id ? { ...r, ...updates } : r);
    LS.set('bk_refund_requests', requests);
    set({ refundRequests: requests });
  },

  // ── Property Approval ─────────────────────────────────────
  getPendingProperties: () => {
    const props = LS.get('bk_properties', []);
    return props.filter(p => p.status === 'pending');
  },
  approveProperty: (id) => {
    const props = LS.get('bk_properties', []).map(p => p.id === id ? { ...p, status: 'active', active: true } : p);
    LS.set('bk_properties', props);
    set({ properties: props });
  },
  rejectProperty: (id, reason) => {
    const props = LS.get('bk_properties', []).map(p => p.id === id ? { ...p, status: 'rejected', rejectReason: reason, active: false } : p);
    LS.set('bk_properties', props);
    set({ properties: props });
  },

  // ── Pricing Rules ─────────────────────────────────────────
  pricingRules: LS.get('bk_pricing_rules', DEFAULT_PRICING_RULES),
  getPricingRules: () => LS.get('bk_pricing_rules', DEFAULT_PRICING_RULES),
  savePricingRules: (rules) => {
    LS.set('bk_pricing_rules', rules);
    set({ pricingRules: rules });
  },

  // ── Host-specific ─────────────────────────────────────────
  getHostProperties: (hostId) => {
    const props = LS.get('bk_properties', []);
    return props.filter(p => p.hostId === hostId);
  },
  getHostOrders: (hostId) => {
    const props = LS.get('bk_properties', []).filter(p => p.hostId === hostId);
    const propIds = props.map(p => p.id);
    return LS.get('bk_orders', []).filter(o => propIds.includes(o.propertyId));
  },

  // ── Room Locks (in-memory, 10 分鐘) ──────────────────────
  roomLocks: {},
  lockRoom: (propertyId, roomId, checkIn, checkOut, userId) => {
    const lockId = `lock-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const expiresAt = Date.now() + 10 * 60 * 1000;
    set(s => ({ roomLocks: { ...s.roomLocks, [lockId]: { propertyId, roomId, checkIn, checkOut, userId, expiresAt } } }));
    return { lockId, expiresAt };
  },
  releaseLock: (lockId) => {
    set(s => { const l = { ...s.roomLocks }; delete l[lockId]; return { roomLocks: l }; });
  },
  isRoomLocked: (propertyId, roomId, checkIn, checkOut, excludeUserId = null) => {
    const now = Date.now();
    return Object.values(get().roomLocks).some(l =>
      l.propertyId === propertyId && l.roomId === roomId &&
      l.checkIn === checkIn && l.checkOut === checkOut &&
      l.expiresAt > now && (excludeUserId === null || l.userId !== excludeUserId)
    );
  },
  checkRoomAvailability: (propertyId, roomId, checkIn, checkOut) => {
    return !LS.get('bk_orders', []).some(o =>
      o.propertyId === propertyId && o.roomId === roomId &&
      o.status === 'confirmed' &&
      new Date(o.checkIn) < new Date(checkOut) &&
      new Date(o.checkOut) > new Date(checkIn)
    );
  },

  // ── Conflict Logs ─────────────────────────────────────────
  conflictLogs: LS.get('bk_conflict_logs', []),
  addConflictLog: (log) => {
    const logs = LS.get('bk_conflict_logs', []);
    const newLog = { ...log, id: `cfl-${Date.now()}`, occurredAt: new Date().toISOString() };
    logs.push(newLog);
    LS.set('bk_conflict_logs', logs);
    set({ conflictLogs: logs });
    return newLog;
  },
  getConflictLogs: () => LS.get('bk_conflict_logs', []),

  // ── User Coupons（系統補發，個人專屬）────────────────────
  userCoupons: LS.get('bk_user_coupons', []),
  issueConflictCoupon: (userId, userName, conflictOrderId) => {
    const code = `COMP${Date.now().toString().slice(-8)}`;
    const expiresAt = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
    const uc = {
      id: `uc-${Date.now()}`, userId, userName, conflictOrderId,
      name: '訂房衝突補償券', amount: 500, code,
      issuedAt: new Date().toISOString(), expiresAt, status: 'unused',
    };
    const list = [...LS.get('bk_user_coupons', []), uc];
    LS.set('bk_user_coupons', list);
    set({ userCoupons: list });
    // 注冊至主要折價券池，讓結帳時可套用
    const coupons = LS.get('bk_coupons', []);
    coupons.push({
      id: `coup-${Date.now()}`, code, type: 'fixed', value: 500, minAmount: 0,
      startDate: new Date().toISOString().split('T')[0], endDate: expiresAt,
      usageLimit: 1, usedCount: 0, active: true,
      isConflictCompensation: true, targetUserId: userId, conflictOrderId,
      name: '訂房衝突補償券',
    });
    LS.set('bk_coupons', coupons);
    set({ coupons });
    return uc;
  },
  getUserCoupons: (userId) => LS.get('bk_user_coupons', []).filter(c => c.userId === userId),
  getAdminUserCoupons: () => LS.get('bk_user_coupons', []),
}));

export default useHotelStore;
