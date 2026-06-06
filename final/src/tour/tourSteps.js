import introJs from 'intro.js';
import 'intro.js/introjs.css';

const STEP_DEFS = [
  {
    title: '歡迎使用 Agent TT！',
    intro:
      '這是一站式旅遊預訂平台，整合 <strong>住宿訂房</strong>、<strong>台鐵訂票</strong> 與 <strong>行程規劃</strong> 三大功能。<br/><br/>讓我帶您快速認識各項功能！',
  },
  {
    selector: 'nav.navbar, .navbar',
    title: '頂部導覽列',
    intro:
      '從這裡切換各功能模組。<br/><br/>登入後可看到「我的訂單」、收藏清單、購物車；<strong>房東</strong>帳號可進入房東後台，<strong>管理員</strong>帳號可進入管理後台。',
  },
  {
    selector: '.hero-content, .hero, .search-hero-inner',
    title: '首頁快速搜尋',
    intro:
      '輸入目的地、入住／退房日期與人數，快速查詢可預訂的住宿。<br/><br/>火車訂票首頁可選擇出發站、到達站、日期與票種，最多同時購買 6 張票。',
  },
  {
    selector: '.destinations-grid',
    title: '熱門目的地',
    intro:
      '點擊台北、基隆、新北、桃園等城市卡片，可直接篩選顯示該城市的上架住宿房源，數量即時反映目前可訂房源。',
  },
  {
    selector: '.properties-grid, .featured-properties .properties-grid',
    title: '精選房源',
    intro:
      '首頁精選推薦的熱門住宿。<br/><br/>點擊任一房源可查看詳細資訊、設備設施、其他旅客評價，並選擇入住日期與房型後直接訂房或加入購物車。',
  },
  {
    selector: '.property-card',
    title: '房源卡片',
    intro:
      '每張卡片顯示：<br/>• 房源名稱與評分<br/>• 距最近車站距離<br/>• 最低房價<br/><br/>點擊愛心可加入收藏；點擊購物車可加入待結帳清單。',
  },
  {
    selector: '.search-card, .search-card-wrap .search-card',
    title: '火車訂票查詢',
    intro:
      '選擇出發站與到達站後，點擊中間箭頭可快速交換。<br/><br/>切換至<strong>進階查詢</strong>可選擇車種類型（自強號、普悠瑪等）及商務車廂（自強號專屬，票價 ×1.3）。',
  },
  {
    selector: '.train-card',
    title: '車次選擇',
    intro:
      '搜尋結果依出發時間排列，顯示車種標籤、行車時間、餘票與票價。<br/><br/>可依<strong>出發時間、行車時間、票價</strong>重新排序，展開可查看沿途停靠站。',
  },
  {
    selector: '.ticket-card',
    title: '電子票',
    intro:
      '付款完成後可於「取票」頁面取得：<br/>• 線上電子票 QR Code<br/>• 超商取票代碼<br/>• 車站機台取票碼<br/><br/>支援「分票」功能，可轉讓給其他平台用戶。',
  },
  {
    selector: '.trip-list, .trips-grid, [class*="trip"]',
    title: '行程規劃',
    intro:
      '建立個人或多人共享行程，<br/>加入景點、交通、住宿等項目並安排日期時間。<br/><br/>支援費用分帳，旅行結束後一鍵計算各人應付金額。',
  },
  {
    selector: '.hotel-cart, .cart-page, .cart-section',
    title: '住宿購物車',
    intro:
      '將多個感興趣的住宿加入購物車統一比較，準備好後再一一結帳，不必每次重新搜尋。',
  },
  {
    selector: '.order-card, .orders-list',
    title: '我的訂單',
    intro:
      '在「個人中心」可查看所有訂單：<br/>• 住宿訂單支援取消退款（依入住天數計算退款比例）<br/>• 火車票支援改票、退票、分票給他人<br/>• 系統自動偵測衝突並補發折價券',
  },
  {
    selector: '.admin-page, .admin-layout',
    title: '管理後台 / 房東後台',
    intro:
      '管理員可審核房源、管理訂單與退款、設定定價規則、查看衝突紀錄。<br/><br/>房東可新增管理房源、設定折扣、調整定價，房源須通過管理員審核後上架。',
  },
  {
    title: '導覽完成！',
    intro:
      '您已了解 Agent TT 的主要功能。<br/><br/>如需再次查看，請點擊畫面右下角的<strong>「功能導覽」</strong>按鈕隨時重新啟動。祝旅途愉快！',
  },
];

function buildSteps() {
  return STEP_DEFS.map(def => {
    if (!def.selector) return { title: def.title, intro: def.intro };
    const el = document.querySelector(def.selector);
    return el
      ? { element: el, title: def.title, intro: def.intro }
      : { title: def.title, intro: def.intro };
  });
}

export function startTour() {
  introJs()
    .setOptions({
      steps: buildSteps(),
      nextLabel: '下一步 &rarr;',
      prevLabel: '&larr; 上一步',
      skipLabel: '跳過',
      doneLabel: '完成 ✓',
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: true,
      scrollToElement: true,
      scrollPadding: 80,
      disableInteraction: false,
      tooltipPosition: 'auto',
    })
    .start();
}
