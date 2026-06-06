/**
 * TourButton — 功能導覽懸浮按鈕
 *
 * 採用 createRoot 自行掛載，不依賴現有元件樹。
 * 在 main.jsx 末尾以 side-effect import 載入即可自動掛載：
 *   import './tour/TourButton';
 */
import { createRoot } from 'react-dom/client';
import { startTour } from './tourSteps';
import './tour.css';

function TourButtonUI() {
  return (
    <button
      className="tour-fab"
      onClick={startTour}
      title="開始功能導覽"
      aria-label="開始功能導覽"
    >
      <i className="fi fi-rr-map-marker" style={{ fontSize: 15 }} />
      功能導覽
    </button>
  );
}

function mount() {
  if (document.getElementById('tour-root')) return; // 防止重複掛載
  const container = document.createElement('div');
  container.id = 'tour-root';
  document.body.appendChild(container);
  createRoot(container).render(<TourButtonUI />);
}

// DOM 就緒後自動掛載
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}

export default TourButtonUI;
