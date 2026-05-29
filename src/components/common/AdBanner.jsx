export default function AdBanner({ ad, variant = 'banner' }) {
  if (!ad || !ad.active) return null;
  return (
    <div className={`ad-banner ad-${variant}`} onClick={() => ad.link && window.open(ad.link, '_blank')}>
      <img src={ad.imageUrl} alt={ad.title} className="ad-image" style={{ cursor: ad.link ? 'pointer' : 'default' }} />
      <span className="ad-label">廣告</span>
    </div>
  );
}
