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
      finalAmount,
      discountApplied,
      createdAt: new Date().toISOString(),
    };
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
}));

export default useHotelStore;
