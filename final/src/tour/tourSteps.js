import introJs from 'intro.js';
import 'intro.js/introjs.css';

// ── 導航工具 ─────────────────────────────────────────────────────
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
  setTimeout(callback, 450);
}

function q(selector) {
  return selector ? document.querySelector(selector) : null;
}

function makeStep(selector, title, intro) {
  const el = q(selector);
  return el ? { element: el, title, intro } : { title, intro };
}

// ── intro.js 公用設定 ─────────────────────────────────────────────
const OPTS = {
  nextLabel: '下一步 →',
  prevLabel: '← 上一步',
  skipLabel: '跳過導覽',
  doneLabel: '繼續 →',
  showProgress: true,
  showBullets: true,
  exitOnOverlayClick: false,
  scrollToElement: true,
  scrollPadding: 80,
  disableInteraction: false,
  tooltipPosition: 'auto',
};

// 最後一段完成按鈕顯示「完成」
const OPTS_FINAL = { ...OPTS, doneLabel: '完成 ✓' };

// ════════════════════════════════════════════════════════════════
//  第一段：住宿首頁 /hotel
// ════════════════════════════════════════════════════════════════
function hotelHomeSteps() {
  return [
    {
      title: '歡迎使用 Agent TT！',
      intro:
        '這是一站式旅遊預訂平台，整合 <strong>住宿訂房</strong>、<strong>台鐵訂票</strong> 與 <strong>行程規劃</strong> 三大功能。<br/><br/>導覽共分五個頁面，帶您快速認識各項功能！',
    },
    makeStep(
      'nav.navbar, .navbar',
      '頂部導覽列',
      '從這裡切換三大功能模組。<br/><br/>登入後顯示我的訂單、收藏、購物車；<br/><strong>房東</strong>帳號顯示「房東後台」；<br/><strong>管理員</strong>帳號顯示「管理後台」。',
    ),
    makeStep(
      '.hero, .hero-content',
      '住宿快速搜尋',
      '輸入目的地城市、入住／退房日期和人數，按查詢後進入房源列表。<br/><br/>支援篩選價格區間、評分、設施和距車站距離。',
    ),
    makeStep(
      '.destinations-grid',
      '熱門目的地',
      '點擊城市卡片（台北、基隆、新北、桃園）直接篩選該城市的所有上架房源。<br/><br/>數字是即時計算的，不是寫死的固定值。',
    ),
    makeStep(
      '.properties-grid',
      '精選房源',
      '首頁精選推薦的熱門住宿。<br/><br/>點擊任一房源可查看相片、設施、政策、房東資訊和旅客評價，選好日期與房型後直接訂房。',
    ),
    makeStep(
      '.property-card',
      '房源卡片',
      '每張卡片顯示：<br/>• 房源名稱與評分<br/>• 距最近車站距離<br/>• 每晚最低房價<br/><br/>可點愛心加入收藏，或點購物車加入待結帳清單。',
    ),
  ];
}

// ════════════════════════════════════════════════════════════════
//  第二段：台鐵首頁 /ticket
// ════════════════════════════════════════════════════════════════
function trainHomeSteps() {
  return [
    makeStep(
      '.search-hero, .search-hero-inner',
      '台鐵線上訂票',
      '選擇出發站和到達站，中間的箭頭按鈕可一鍵交換兩站；接著設定日期、時段和票種張數，最多同時購買 6 張。',
    ),
    makeStep(
      '.search-card, .search-card-wrap .search-card',
      '查詢表單',
      '出發站和到達站依路線分組顯示（縱貫線北、縱貫線南、深澳線、平溪線），方便快速找到正確站名。',
    ),
    makeStep(
      '.query-type-bar',
      '基礎 / 進階查詢',
      '切換到<strong>進階查詢</strong>可設定：<br/>• 車種類型（普悠瑪、自強號、莒光號、區間車、區間快）<br/>• 商務車廂（限自強號，票價 ×1.3）<br/>• 座位偏好（靠窗 / 靠走道）<br/>• 是否允許轉乘',
    ),
    makeStep(
      '.ticket-section-label, .ticket-count-grid',
      '票種與張數',
      '支援全票、孩童票（5折）、敬老票（5折）、愛心票（5折）、學生票（8折）。<br/><br/><strong>多張自動折扣：</strong><br/>• 3 張（含）以上 → 九五折<br/>• 5 張（含）以上 → 九折',
    ),
  ];
}

// ════════════════════════════════════════════════════════════════
//  第三段：台鐵票務管理 /ticket/orders
// ════════════════════════════════════════════════════════════════
function trainOrderSteps() {
  return [
    makeStep(
      '.order-tabs, .filter-tabs',
      '訂單狀態篩選',
      '可依狀態快速篩選：全部、待付款、已付款、已使用、已退票、已取消。<br/><br/>每個分類右側顯示筆數，方便掌握訂單狀況。',
    ),
    makeStep(
      '.order-card',
      '電子票與分票',
      '點擊票券紀錄可查看電子票，支援三種取票方式：<br/>① <strong>線上 QR Code</strong> — 閘門掃描<br/>② <strong>超商取票</strong> — 代碼至 7-11 / 全家繳費<br/>③ <strong>車站機台取票</strong> — 六位數取票碼（XXX-XXX），出發前 30 分鐘截止<br/><br/>每張票右側的分享圖示可執行<strong>分票</strong>，轉讓給其他平台用戶。',
    ),
  ];
}

// ════════════════════════════════════════════════════════════════
//  第四段：住宿訂單管理 /hotel/orders
// ════════════════════════════════════════════════════════════════
function hotelOrderSteps() {
  return [
    makeStep(
      '.order-card, .orders-list',
      '住宿訂單管理',
      '這裡顯示所有住宿訂單，依建立時間排列。<br/><br/>狀態標籤顏色區分：<br/>• 藍色 → 待入住<br/>• 綠色 → 全額退款中<br/>• 橘色 → 部分退款中<br/>• 灰色 → 已取消（不退款）<br/>• 紅色 → 已取消',
    ),
    makeStep(
      '.btn-danger-outline, .order-card-footer',
      '取消訂單與退款規則',
      '點「取消訂單」前系統顯示退款計算確認視窗：<br/><br/>• 入住前 10 天以上 → <strong>全額退款</strong><br/>• 入住前 4～9 天 → <strong>退款 70%</strong>，收 30% 手續費<br/>• 入住前 3 天以內 → <strong>不予退款</strong><br/><br/>視窗中清楚顯示退款金額（綠色）和手續費（紅色）。',
    ),
  ];
}

// ════════════════════════════════════════════════════════════════
//  第五段：結語（停留原頁，純文字說明）
// ════════════════════════════════════════════════════════════════
function finalSteps() {
  return [
    {
      title: '行程規劃',
      intro:
        '點 Navbar「行程規劃」可建立個人或多人共享行程。<br/><br/>• 按天加入景點、住宿、交通等項目並安排時間<br/>• 支援地圖選點標記位置<br/>• 內建費用記帳，旅途後自動計算多人分帳結果',
    },
    {
      title: '房東後台',
      intro:
        '以<strong>房東帳號</strong>登入後，Navbar 顯示「房東後台」入口：<br/><br/>• 新增房源並送審（管理員核准才上架）<br/>• 設定平日、週末、假日三種房價（受管理員漲幅上限保護）<br/>• 月曆視圖管理每日庫存<br/>• 設定早鳥、長住、季節等折扣活動',
    },
    {
      title: '管理員後台',
      intro:
        '以<strong>管理員帳號</strong>登入後可進入完整後台：<br/><br/>• 審核房源上架申請<br/>• 管理住宿與火車訂單<br/>• 審核退款申請<br/>• 帳號角色管理（升級房東 / 停用帳號）<br/>• 設定全平台的定價漲幅上限與最低定價',
    },
    {
      title: '我的優惠券',
      intro:
        '訂房遇到衝突時，系統自動補發 <strong>NT$500 折價券</strong>至您的帳戶。<br/><br/>個人中心 → 我的優惠券 可查看每張券的代碼、有效期限和使用狀態，訂房時輸入代碼即可折抵。',
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
  // 段 1：住宿首頁
  navigateTo('/hotel', () => {
    introJs()
      .setOptions({ ...OPTS, steps: hotelHomeSteps() })
      .oncomplete(() => {
        // 段 2：台鐵首頁
        navigateTo('/ticket', () => {
          introJs()
            .setOptions({ ...OPTS, steps: trainHomeSteps() })
            .oncomplete(() => {
              // 段 3：台鐵票務
              navigateTo('/ticket/orders', () => {
                introJs()
                  .setOptions({ ...OPTS, steps: trainOrderSteps() })
                  .oncomplete(() => {
                    // 段 4：住宿訂單
                    navigateTo('/hotel/orders', () => {
                      introJs()
                        .setOptions({ ...OPTS, steps: hotelOrderSteps() })
                        .oncomplete(() => {
                          // 段 5：結語（停留原頁）
                          introJs()
                            .setOptions({ ...OPTS_FINAL, steps: finalSteps() })
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
      })
      .start();
  });
}
