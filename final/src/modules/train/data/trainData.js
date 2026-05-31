export const STATIONS = [
  { id: 'keelung',    name: '基隆' },
  { id: 'taipei',     name: '台北' },
  { id: 'banqiao',    name: '板橋' },
  { id: 'taoyuan',    name: '桃園' },
  { id: 'zhongli',    name: '中壢' },
  { id: 'hsinchu',    name: '新竹' },
  { id: 'zhunan',     name: '竹南' },
  { id: 'miaoli',     name: '苗栗' },
  { id: 'taichung',   name: '台中' },
  { id: 'changhua',   name: '彰化' },
  { id: 'yuanlin',    name: '員林' },
  { id: 'douliu',     name: '斗六' },
  { id: 'chiayi',     name: '嘉義' },
  { id: 'sinying',    name: '新營' },
  { id: 'tainan',     name: '台南' },
  { id: 'kaohsiung',  name: '高雄' },
  { id: 'pingtung',   name: '屏東' },
];

export const STATION_MAP = Object.fromEntries(STATIONS.map(s => [s.id, s.name]));
const STATION_IDX = Object.fromEntries(STATIONS.map((s, i) => [s.id, i]));

export const TRAIN_TYPES = {
  taroko:  { name: '太魯閣', color: '#dc2626', bg: '#fef2f2', icon: '🚄', mult: 1.4, speed: 0.7  },
  puyuma:  { name: '普悠瑪', color: '#d97706', bg: '#fffbeb', icon: '🚅', mult: 1.4, speed: 0.75 },
  express: { name: '自強',   color: '#2563eb', bg: '#eff6ff', icon: '🚂', mult: 1.2, speed: 0.9  },
  juguang: { name: '莒光',   color: '#16a34a', bg: '#f0fdf4', icon: '🚃', mult: 1.0, speed: 1.1  },
  local:   { name: '區間',   color: '#6b7280', bg: '#f9fafb', icon: '🚋', mult: 0.75, speed: 1.4 },
};

export const TICKET_TYPES = [
  { id: 'adult',      name: '全票',   discount: 1.0, desc: '一般成人' },
  { id: 'child',      name: '孩童票', discount: 0.5, desc: '身高115~150cm' },
  { id: 'senior',     name: '敬老票', discount: 0.5, desc: '65歲以上長者' },
  { id: 'disability', name: '愛心票', discount: 0.5, desc: '持身心障礙手冊' },
  { id: 'student',    name: '學生票', discount: 0.8, desc: '持有效學生證' },
];

export const TIME_SLOTS = [
  { id: 'all',       name: '不限時段',              start: 0,  end: 24 },
  { id: 'morning',   name: '上午（06:00-12:00）',   start: 6,  end: 12 },
  { id: 'afternoon', name: '下午（12:00-18:00）',   start: 12, end: 18 },
  { id: 'evening',   name: '晚上（18:00-24:00）',   start: 18, end: 24 },
];

export const CAR_TYPES = [
  { id: 'any',      name: '不限車廂' },
  { id: 'standard', name: '標準車廂' },
  { id: 'business', name: '商務車廂' },
];

export const PAYMENT_METHODS = [
  { id: 'credit',  name: '信用卡',    icon: '💳', desc: 'Visa / Master / JCB' },
  { id: 'linepay', name: 'LINE Pay', icon: '📱', desc: '手機快速付款' },
  { id: 'cvs',     name: '超商付款',  icon: '🏪', desc: '7-11 / 全家 / 萊爾富' },
  { id: 'bank',    name: '銀行轉帳',  icon: '🏦', desc: '各銀行網路銀行' },
];

export const ORDER_STATUSES = {
  pending:   { label: '待付款', color: '#d97706', bg: '#fffbeb' },
  paid:      { label: '已付款', color: '#2563eb', bg: '#eff6ff' },
  used:      { label: '已使用', color: '#16a34a', bg: '#f0fdf4' },
  refunded:  { label: '已退票', color: '#6b7280', bg: '#f9fafb' },
  cancelled: { label: '已取消', color: '#ef4444', bg: '#fef2f2' },
  changed:   { label: '已改票', color: '#7c3aed', bg: '#f5f3ff' },
};

export const REFUND_RULES = [
  { condition: '乘車前 25 日（含）以上', fee: '票價 1%',  note: '退還票價 99%' },
  { condition: '乘車前 3–24 日',         fee: '票價 3%',  note: '退還票價 97%' },
  { condition: '乘車前 1–2 日',          fee: '票價 5%',  note: '退還票價 95%' },
  { condition: '乘車當日（列車過站前）', fee: '票價 10%', note: '退還票價 90%' },
];

export function getBasePrice(fromId, toId, typeId) {
  const fi = STATION_IDX[fromId] ?? 0;
  const ti = STATION_IDX[toId] ?? 0;
  const gaps = Math.abs(ti - fi);
  const mult = TRAIN_TYPES[typeId]?.mult ?? 1.0;
  return Math.max(50, Math.round(gaps * 52 * mult / 10) * 10);
}

export function getDurationMins(fromId, toId, typeId) {
  const fi = STATION_IDX[fromId] ?? 0;
  const ti = STATION_IDX[toId] ?? 0;
  const gaps = Math.abs(ti - fi);
  const speed = TRAIN_TYPES[typeId]?.speed ?? 1.0;
  return Math.max(20, Math.round(gaps * 18 * speed / 5) * 5);
}

export function addMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
}

function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(1664525, s) + 1013904223 >>> 0;
    return s / 0x100000000;
  };
}

const TYPE_IDS = Object.keys(TRAIN_TYPES);
const PREFIXES = { taroko: 'TR', puyuma: 'PY', express: 'ZQ', juguang: 'JG', local: 'QJ' };

export function generateTrains({ from, to, date, timeSlot = 'all' }) {
  const slot = TIME_SLOTS.find(s => s.id === timeSlot) ?? TIME_SLOTS[0];
  const seed = (from + to + date).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRand(seed);

  const count = 10 + Math.floor(rand() * 5);
  const spanMins = (slot.end - slot.start) * 60;
  const step = Math.floor(spanMins / count);

  const trains = [];
  for (let i = 0; i < count; i++) {
    const typeId = TYPE_IDS[Math.floor(rand() * TYPE_IDS.length)];
    const offsetMins = Math.floor(rand() * step);
    const depTotalMins = slot.start * 60 + i * step + offsetMins;
    const depH = Math.floor(depTotalMins / 60) % 24;
    const depM = Math.floor((depTotalMins % 60) / 5) * 5;
    const depTime = `${String(depH).padStart(2, '0')}:${String(depM).padStart(2, '0')}`;
    const duration = getDurationMins(from, to, typeId);
    const arrTime = addMinutes(depTime, duration);
    const basePrice = getBasePrice(from, to, typeId);
    const windowSeats = 8 + Math.floor(rand() * 44);
    const aisleSeats = 8 + Math.floor(rand() * 44);
    const trainNo = Math.floor(rand() * 9000) + 1000;

    trains.push({
      id: `${typeId}-${from}-${to}-${date}-${i}`,
      trainNo: `${PREFIXES[typeId] ?? 'TR'}${trainNo}`,
      type: typeId,
      from, to, date,
      fromName: STATION_MAP[from] ?? from,
      toName: STATION_MAP[to] ?? to,
      depTime, arrTime, duration,
      basePrice,
      availableWindow: windowSeats,
      availableAisle: aisleSeats,
    });
  }
  return trains.sort((a, b) => a.depTime.localeCompare(b.depTime));
}
