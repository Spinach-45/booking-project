import useStore from '../../store/useStore';

export default function AdBanner({ position = 'banner' }) {
  const { ads } = useStore();
  const now = new Date();
  const activeAds = ads.filter(ad =>
    ad.active &&
    ad.position === position &&
    new Date(ad.startDate) <= now &&
    new Date(ad.endDate) >= now
  );
  if (!activeAds.length) return null;
  const ad = activeAds[0];
  return (
    <div className={`ad-banner ad-${position}`}>
      <a href={ad.link || '#'} target="_blank" rel="noopener noreferrer">
        <img src={ad.image} alt={ad.title} className="ad-image" />
        <div className="ad-label">廣告</div>
      </a>
    </div>
  );
}
