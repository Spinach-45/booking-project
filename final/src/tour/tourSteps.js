import introJs from 'intro.js';
import 'intro.js/introjs.css';

// ── 導航工具 ─────────────────────────────────────────────────────
// 使用 pushState + popstate 讓 React Router 感知頁面切換，
// 不造成整頁重整；callback 在 React 重新渲染完成後執行。
function navigateTo(path, callback) {
  const base = window.location.pathname.includes('/booking-project')
    ? '/booking-project'
    : '';
  const target = base + path;
  if (window.location.pathname === target) {
    setTimeout(callback, 100);
    return;
  }
  window.history.pushState({}, '', target);
  window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
  setTimeout(callback, 450); // 等 React re-render
}

// 查找元素，找不到回傳 null（步驟自動退化為純文字）
function q(selector) {
  if (!selector) return null;
  return document.querySelector(selector) || null;
}

function makeStep(selector, title, intro) {
  const el = q(selector);
  return el
    ? { element: el, title, intro }
    : { title, intro };
}

// ── intro.js 公用設定 ─────────────────────────────────────────────
const OPTS = {
  nextLabel: '下一步 →',
  prevLabel: '← 上一步',
  skipLabel: '跳過導覽',
  doneLabel: '完成 ✓',
  showProgress: true,
  showBullets: true,
  exitOnOverlayClick: false,
  scrollToElement: true,
  scrollPadding: 80,
  disableInteraction: false,
  tooltipPosition: 'auto',
  highlightClass: 'introjs-custom-highlight',
};

// ════════════════════════════════════════════════════════════════
//  第一段：住宿首頁 /hotel
// ════════════════════════════════════════════════════════════════
function hotelHomeSteps() {
  return [
    {
      title: '歡迎使用 Agent TT！',
      intro:
        '這是一站式旅遊預訂平台，整合 <strong>住宿訂房</strong>、<strong>台鐵訂票</strong> 與 <strong>行程規劃</strong> 三大功能。<br/><br/>導覽共分三個頁面，帶您快速認識各項功能！',
    },
    makeStep(
      'nav.navbar, .navbar',
      '頂部導覽列',
      '從這裡切換三大功能模組。<br/><br/>登入後顯示我的訂單、收藏、購物車；<br/><strong>房東</strong>帳號顯示「房東後台」；<br/><strong>管理員</strong>帳號同時顯示「管理後台」。',
    ),
    makeStep(
      '.hero, .hero-content',
      '住宿快速搜尋',
      '輸入目的地城市、入住／退房日期和人數，按查詢後進入房源列表。<br/><br/>支援篩選價格區間、評分、設施（Wi-Fi、停車、早餐等）和距車站距離。',
    ),
    makeStep(
      '.destinations-grid',
      '熱門目的地',
      '點擊城市卡片（台北、基隆、新北、桃園）直接篩選該城市的所有上架房源。<br/><br/>數字是即時計算的，房東新增房源且通過審核後自動更新。',
    ),
    makeStep(
      '.properties-grid',
      '精選房源',
      '首頁精選推薦的熱門住宿。<br/><br/>點擊任一房源可查看相片、設施、政策、房東資訊和旅客評價，選好日期與房型後直接訂房。',
    ),
    makeStep(
      '.property-card',
      '房源卡片',
      '每張卡片顯示：<br/>• 房源名稱與評分<br/>• 距最近車站距離<br/>• 每晚最低房價<br/><br/>可點愛心加入收藏，或點購物車圖示加入待結帳清單，不需立刻做決定。',
    ),
  ];
}

// ════════════════════════════════════════════════════════════════
//  第二段：台鐵首頁 /ticket
// ════════════════════════════════════════════════════════════════
function trainHomeSteps() {
  return [
    {
      title: '台鐵線上訂票',
      intro:
        '現在切換到台鐵訂票功能。<br/><br/>選擇出發站和到達站，中間的箭頭按鈕可一鍵交換兩站；接著設定日期、時段和票種張數，最多同時購買 6 張。',
    },
    makeStep(
      '.search-card, .search-card-wrap .search-card',
      '查詢表單',
      '出發站和到達站依路線分組顯示（縱貫線北、縱貫線南、深澳線、平溪線），方便快速找到正確的站名。',
    ),
    makeStep(
      '.query-type-bar',
      '基礎 / 進階查詢',
      '切換到<strong>進階查詢</strong>可設定：<br/>• 車種類型（普悠瑪、自強號、莒光號、區間車、區間快）<br/>• 商務車廂（限自強號，票價 ×1.3）<br/>• 座位偏好（靠窗 / 靠走道）<br/>• 是否允許轉乘',
    ),
    makeStep(
      '.ticket-section-label, .ticket-count-grid',
      '票種與張數',
      '支援全票、孩童票、敬老票、愛心票、學生票，各自設定張數。<br/><br/><strong>多張自動折扣：</strong><br/>• 3 張（含）以上 → 九五折<br/>• 5 張（含）以上 → 九折',
    ),
    makeStep(
      '.search-hero, .search-hero-inner',
      '搜尋結果',
      '搜尋後進入車次列表，顯示：<br/>• 車種標籤與即時誤點狀態<br/>• 出發／到達時間、行車時長<br/>• 靠窗和走道的剩餘座位數<br/><br/>可依出發時間、行車時間或票價排序；展開可查看沿途停靠站。',
    ),
  ];
}

// ════════════════════════════════════════════════════════════════
//  第三段：我的票務 /ticket/orders
// ════════════════════════════════════════════════════════════════
function ticketOrderSteps() {
  return [
    {
      title: '電子票（三種取票方式）',
      intro:
        '付款完成後可在「取票」頁面切換三種取票方式：<br/><br/>① <strong>線上電子票</strong>：顯示 QR Code，閘門直接掃描<br/>② <strong>超商取票</strong>：顯示代碼，至 7-11、全家、萊爾富繳費取票<br/>③ <strong>車站機台取票</strong>：顯示六位取票碼（XXX-XXX），至自動售票機取票，出發前 30 分鐘截止',
    },
    makeStep(
      '.order-tabs, .filter-tabs',
      '訂單狀態篩選',
      '可依狀態快速篩選：全部、待付款、已付款、已使用、已退票、已取消。<br/><br/>每個分類右側顯示筆數，方便快速掌握訂單狀況。',
    ),
    makeStep(
      '.order-card',
      '分票功能',
      '每張票右側有「分票」按鈕（分享圖示）：<br/><br/>1. 輸入接收方的帳號名稱、手機或 Email<br/>2. 系統查詢確認對方為平台用戶<br/>3. 顯示接收方姓名確認後執行轉移<br/><br/>分票後對方帳號的訂單紀錄會出現「來自分票」藍色標籤，您的訂單則顯示「已分票」灰色標籤。',
    ),
  ];
}

// ════════════════════════════════════════════════════════════════
//  第四段：結語（純文字，不需特定頁面）
// ════════════════════════════════════════════════════════════════
function finalSteps() {
  return [
    {
      title: '住宿訂單管理',
      intro:
        '在「個人中心 → 住宿訂單」可查看所有住宿訂單。<br/><br/><strong>取消退款規則：</strong><br/>• 入住前 10 天以上 → 全額退款<br/>• 入住前 4～9 天 → 退款 70%，收 30% 手續費<br/>• 入住前 3 天以內 → 不予退款<br/><br/>取消前系統會顯示詳細的退款金額和手續費確認視窗。',
    },
    {
      title: '行程規劃',
      intro:
        '點 Navbar「行程規劃」可建立個人或多人共享行程。<br/><br/>• 按天加入景點、住宿、交通等項目<br/>• 支援地圖選點標記位置<br/>• 內建費用記帳，旅途後自動計算多人分帳結果',
    },
    {
      title: '房東後台（房東帳號限定）',
      intro:
        '以房東帳號登入後，Navbar 顯示「房東後台」入口：<br/><br/>• 新增房源並送審（管理員核准才上架）<br/>• 設定平日、週末、假日三種房價<br/>• 月曆視圖管理每日庫存<br/>• 設定早鳥、長住、季節等折扣活動',
    },
    {
      title: '訂房衝突補償機制',
      intro:
        '訂房時系統自動鎖定房間 10 分鐘；送出前再次驗證是否仍有空房。<br/><br/>若發生衝突（極罕見），後建立的訂單自動取消，受影響用戶收到：<br/>• <strong>全額退款</strong>（3～5 個工作天）<br/>• <strong>NT$500 折價券</strong>（有效 90 天，可在個人中心 → 我的優惠券查看）',
    },
    {
      title: '導覽完成！',
      intro:
        '您已了解 Agent TT 的主要功能。<br/><br/>隨時點擊畫面右下角的 <strong>「功能導覽」</strong> 藍色按鈕可重新啟動。<br/><br/>祝旅途愉快！',
    },
  ];
}

// ════════════════════════════════════════════════════════════════
//  主入口：依序執行各段導覽
// ════════════════════════════════════════════════════════════════
export function startTour() {
  // 第一段：導航至住宿首頁
  navigateTo('/hotel', () => {
    introJs()
      .setOptions({ ...OPTS, steps: hotelHomeSteps() })
      .oncomplete(() => {
        // 第二段：導航至台鐵首頁
        navigateTo('/ticket', () => {
          introJs()
            .setOptions({ ...OPTS, steps: trainHomeSteps() })
            .oncomplete(() => {
              // 第三段：導航至票務訂單（需登入，若未登入退化為純文字）
              navigateTo('/ticket/orders', () => {
                introJs()
                  .setOptions({ ...OPTS, steps: ticketOrderSteps() })
                  .oncomplete(() => {
                    // 第四段：結語（停留在目前頁面）
                    introJs()
                      .setOptions({ ...OPTS, steps: finalSteps() })
                      .start();
                  })
                  .start();
              });
            })
            .start();
        });
      })
      .start();
  });
}
