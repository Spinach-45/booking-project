import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './App.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 功能導覽按鈕 — 自行建立獨立 React root，不修改現有元件樹
import './tour/TourButton';
