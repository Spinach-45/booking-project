import { useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useStore from '../../../../store/useHotelStore';

export default function BookingConflictPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { properties, getProperties, lang } = useStore();

  const { property, room, checkIn, checkOut, nights, isPreConflict, conflictOrder } = state || {};

  const alternatives = useMemo(() => {
    if (!property) return [];
    return getProperties()
      .filter(p =>
        p.id !== property.id &&
        (p.active || p.status === 'active') &&
        p.area === property.area &&
        p.rooms?.some(r => r.price <= (room?.price ?? 0) * 1.4)
      )
      .slice(0, 3);
  }, [property, room]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!property) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <p>無效頁面，請重新查詢。</p>
        <button className="btn-primary" onClick={() => navigate('/hotel')}>返回住宿首頁</button>
      </div>
    );
  }

  const isRaceConflict = !!conflictOrder;
  const couponCode = conflictOrder?.code;

  return (
    <div className="container" style={{ maxWidth: 680, paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* 衝突通知卡 */}
      <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 12, padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        <i className="fi fi-rr-exclamation" style={{ fontSize: 48, color: '#dc2626', display: 'block', marginBottom: 12 }} />
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626', marginBottom: 8 }}>
          {isRaceConflict ? '訂房衝突通知' : '很抱歉，此房間已被預訂'}
        </h1>

        {isRaceConflict ? (
          <p style={{ color: '#7f1d1d', lineHeight: 1.8, fontSize: '0.95rem' }}>
            您好，非常抱歉，您於 {checkIn} 訂購的<br />
            <strong>【{lang === 'zh' ? property.name : (property.nameEn || property.name)}】</strong> 因系統同步問題發生訂房衝突。<br />
            您的訂單已自動取消，款項將於 3–5 個工作天內全額退回。<br />
            為表達誠摯歉意，我們已發送一張折價券至您的帳戶。
          </p>
        ) : (
          <p style={{ color: '#7f1d1d', lineHeight: 1.8, fontSize: '0.95rem' }}>
            您查詢的 <strong>{lang === 'zh' ? property.name : (property.nameEn || property.name)}</strong><br />
            {checkIn} ~ {checkOut} 的 <strong>{lang === 'zh' ? room?.typeName : (room?.typeNameEn || room?.typeName)}</strong><br />
            已被其他旅客搶先預訂，非常抱歉！
          </p>
        )}

        {/* 衝突補償資訊 */}
        {isRaceConflict && (
          <div style={{ background: 'white', border: '1px solid #fca5a5', borderRadius: 8, padding: '1rem', marginTop: '1.25rem', textAlign: 'left' }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>
              <i className="fi fi-rr-tag fi-sm" style={{ marginRight: 6, color: '#16a34a' }} />補償方案
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>退款金額</span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>NT$ {(conflictOrder?.refundAmount ?? 0).toLocaleString()}（全額退款）</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>補償折價券</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>NT$500 訂房衝突補償券（90天內有效）</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>退款方式</span>
                <span>依原付款方式全額退回，不收手續費</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 替代房源推薦 */}
      {alternatives.length > 0 && (
        <div>
          <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.1rem' }}>
            <i className="fi fi-rr-building fi-sm" style={{ marginRight: 8 }} />同城市替代房源推薦
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {alternatives.map(alt => {
              const minPrice = alt.rooms?.length ? Math.min(...alt.rooms.map(r => r.price)) : 0;
              return (
                <Link
                  key={alt.id}
                  to={`/hotel/property/${alt.id}`}
                  style={{ display: 'flex', gap: '1rem', background: 'white', border: '1px solid var(--border)', borderRadius: 10, padding: '0.85rem', textDecoration: 'none', color: 'inherit', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
                >
                  {alt.images?.[0] && (
                    <img src={alt.images[0]} alt={alt.name} style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 7, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 3 }}>{lang === 'zh' ? alt.name : (alt.nameEn || alt.name)}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{alt.address}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.78rem', background: '#eff6ff', color: '#2563eb', borderRadius: 6, padding: '1px 8px', fontWeight: 600 }}>
                        NT$ {minPrice.toLocaleString()}/晚起
                      </span>
                      {alt.rating && (
                        <span style={{ fontSize: '0.78rem', color: '#f59e0b' }}>
                          <i className="fi fi-sr-star fi-xs" style={{ marginRight: 2 }} />{alt.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  <i className="fi fi-rr-arrow-right fi-sm" style={{ color: 'var(--text-secondary)', alignSelf: 'center', flexShrink: 0 }} />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => navigate('/hotel')}>
          <i className="fi fi-rr-search fi-sm" style={{ marginRight: 6 }} />重新搜尋房源
        </button>
        {isRaceConflict && (
          <Link to="/profile/orders-hotel" className="btn-outline" style={{ textDecoration: 'none' }}>
            <i className="fi fi-rr-receipt fi-sm" style={{ marginRight: 6 }} />查看訂單紀錄
          </Link>
        )}
        <button className="btn-ghost" onClick={() => navigate(-1)}>返回</button>
      </div>
    </div>
  );
}
