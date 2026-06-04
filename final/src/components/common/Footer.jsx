import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand" style={{ letterSpacing: '0.05em' }}>Agent TT</div>
            <p className="footer-desc">行程規劃 × 住宿訂房 × 火車訂票，一站搞定您的旅遊需求</p>
          </div>
          <div>
            <div className="footer-heading">功能模組</div>
            <div className="footer-links">
              <Link to="/trip">行程規劃</Link>
              <Link to="/hotel">住宿訂房</Link>
              <Link to="/ticket">火車訂票</Link>
            </div>
          </div>
          <div>
            <div className="footer-heading">會員服務</div>
            <div className="footer-links">
              <Link to="/profile">個人中心</Link>
              <Link to="/login">登入 / 註冊</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Agent TT. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
