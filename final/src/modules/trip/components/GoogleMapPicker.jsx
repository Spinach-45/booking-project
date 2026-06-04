import { useEffect, useRef, useState } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let _mapsPromise = null;

function loadMapsAPI() {
  if (_mapsPromise) return _mapsPromise;
  if (window.google?.maps?.places) {
    _mapsPromise = Promise.resolve(window.google);
    return _mapsPromise;
  }
  _mapsPromise = new Promise((resolve, reject) => {
    const cbName = `__gmInit_${Date.now()}`;
    window[cbName] = () => { resolve(window.google); delete window[cbName]; };
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=${cbName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => { _mapsPromise = null; reject(new Error('地圖腳本載入失敗')); };
    document.head.appendChild(script);
  });
  return _mapsPromise;
}

function inferItemType(types = []) {
  if (types.some(t => ['restaurant', 'food', 'bakery', 'cafe', 'bar', 'meal_takeaway', 'meal_delivery'].includes(t))) return 'food';
  if (types.some(t => ['transit_station', 'bus_station', 'train_station', 'subway_station', 'airport'].includes(t))) return 'transport';
  return 'attraction';
}

function infoContent(place) {
  return `<div style="font-family:sans-serif;max-width:200px;padding:2px">
    <b style="font-size:.88rem">${place.name}</b>
    <p style="font-size:.78rem;color:#555;margin:3px 0 0">${place.vicinity || ''}</p>
    ${place.rating ? `<span style="font-size:.78rem;color:#f59e0b">⭐ ${place.rating}</span>` : ''}
  </div>`;
}

export default function GoogleMapPicker({ stationLat, stationLng, stationName, onPlaceSelect }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const googleRef = useRef(null);
  const serviceRef = useRef(null);
  const infoWinRef = useRef(null);
  const markersRef = useRef(new Map());

  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [places, setPlaces] = useState([]);
  const [searching, setSearching] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!API_KEY) return;
    if (mapRef.current) return;

    loadMapsAPI()
      .then(google => {
        if (!mapDivRef.current || mapRef.current) return;

        const center = { lat: stationLat, lng: stationLng };
        const map = new google.maps.Map(mapDivRef.current, {
          center,
          zoom: 15,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          clickableIcons: false,
        });
        mapRef.current = map;
        googleRef.current = google;

        const service = new google.maps.places.PlacesService(map);
        serviceRef.current = service;

        const infoWin = new google.maps.InfoWindow();
        infoWinRef.current = infoWin;

        new google.maps.Marker({
          position: center,
          map,
          title: stationName,
          icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          zIndex: 999,
        });

        setReady(true);

        service.nearbySearch(
          { location: center, radius: 1000, type: 'tourist_attraction' },
          (results, status) => {
            if (status !== google.maps.places.PlacesServiceStatus.OK || !results?.length) return;
            const slice = results.slice(0, 15);
            setPlaces(slice);
            slice.forEach(place => {
              const marker = new google.maps.Marker({
                position: place.geometry.location,
                map,
                title: place.name,
              });
              marker.addListener('click', () => {
                setSelected(place);
                infoWin.setContent(infoContent(place));
                infoWin.open(map, marker);
              });
              markersRef.current.set(place.place_id, marker);
            });
          }
        );
      })
      .catch(e => setLoadError(e.message));

    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current.clear();
      mapRef.current = null;
      googleRef.current = null;
      serviceRef.current = null;
      infoWinRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    const google = googleRef.current;
    const map = mapRef.current;
    const service = serviceRef.current;
    const infoWin = infoWinRef.current;
    if (!google || !map || !service) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current.clear();
    setPlaces([]);
    setSelected(null);
    setSearching(true);
    infoWin?.close();

    const center = { lat: stationLat, lng: stationLng };
    const req = keyword.trim()
      ? { location: center, radius: 2000, keyword: keyword.trim() }
      : { location: center, radius: 1000, type: 'tourist_attraction' };

    service.nearbySearch(req, (results, status) => {
      setSearching(false);
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results?.length) return;
      const slice = results.slice(0, 15);
      setPlaces(slice);
      slice.forEach(place => {
        const marker = new google.maps.Marker({
          position: place.geometry.location,
          map,
          title: place.name,
        });
        marker.addListener('click', () => {
          setSelected(place);
          infoWin?.setContent(infoContent(place));
          infoWin?.open(map, marker);
        });
        markersRef.current.set(place.place_id, marker);
      });
    });
  };

  const handleListClick = (place) => {
    const map = mapRef.current;
    const infoWin = infoWinRef.current;
    setSelected(place);
    if (map && place.geometry?.location) {
      map.panTo(place.geometry.location);
      const marker = markersRef.current.get(place.place_id);
      if (marker && infoWin) {
        infoWin.setContent(infoContent(place));
        infoWin.open(map, marker);
      }
    }
  };

  const handleConfirm = () => {
    if (!selected) return;
    onPlaceSelect({
      name: selected.name,
      address: selected.vicinity || '',
      itemType: inferItemType(selected.types),
    });
  };

  if (!API_KEY) {
    return (
      <div style={{ padding: '1rem', background: '#fef9c3', borderRadius: 8, border: '1px solid #fde68a', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: 6 }}><i className="fi fi-rr-map fi-lg" /></div>
        <p style={{ fontSize: '0.82rem', color: '#78350f', margin: 0 }}>
          請在專案根目錄建立 <code style={{ background: '#fef08a', padding: '1px 4px', borderRadius: 3 }}>.env</code> 並設定：
          <br />
          <code style={{ background: '#fef08a', padding: '2px 6px', borderRadius: 3, display: 'inline-block', marginTop: 4 }}>
            VITE_GOOGLE_MAPS_API_KEY=你的API金鑰
          </code>
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: 8, textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#dc2626', margin: 0 }}>地圖載入失敗：{loadError}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Search bar */}
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          className="form-input"
          style={{ flex: 1, fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder={`搜尋 ${stationName} 周邊（如：咖啡廳、夜市、景點）`}
        />
        <button
          className="btn-primary btn-sm"
          onClick={handleSearch}
          disabled={searching || !ready}
          style={{ flexShrink: 0, minWidth: 64 }}
        >
          {searching ? '搜尋中…' : <><i className="fi fi-rr-search fi-xs" /> 搜尋</>}
        </button>
      </div>

      {/* Map */}
      <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {!ready && (
          <div style={{
            position: 'absolute', inset: 0, background: '#f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', color: '#64748b', zIndex: 1,
          }}>
            <i className="fi fi-rr-map fi-sm" style={{ marginRight: 4 }} />地圖載入中…
          </div>
        )}
        <div ref={mapDivRef} style={{ height: 260 }} />
      </div>

      {/* Results list */}
      {places.length > 0 && (
        <div className="map-places-list">
          {places.map(place => (
            <button
              key={place.place_id}
              className={`attraction-chip${selected?.place_id === place.place_id ? ' selected' : ''}`}
              style={{ width: '100%', textAlign: 'left', gap: 8 }}
              onClick={() => handleListClick(place)}
            >
              <i className="fi fi-rr-marker fi-xs" style={{ flexShrink: 0, color: 'var(--primary)' }} />
              <span className="attraction-info" style={{ flex: 1, minWidth: 0 }}>
                <span className="attraction-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {place.name}
                </span>
                <span className="attraction-dist" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {place.vicinity}
                </span>
              </span>
              {place.rating != null && (
                <span style={{ fontSize: '0.72rem', color: '#f59e0b', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <i className="fi fi-sr-star fi-xs" style={{ color: '#f59e0b' }} /> {place.rating}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Confirm selection bar */}
      {selected && (
        <div className="map-selection-bar">
          <i className="fi fi-rr-marker fi-sm" style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selected.name}
            </div>
            {selected.vicinity && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selected.vicinity}
              </div>
            )}
          </div>
          <button className="btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={handleConfirm}>
            填入表單 →
          </button>
        </div>
      )}
    </div>
  );
}
