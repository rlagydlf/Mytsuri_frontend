import { useState, useCallback, useRef, useEffect } from 'react'
import Map, { Marker, Popup } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import StatusBar from '../components/StatusBar'
import NavigationBar from '../components/NavigationBar'
import RegionSelectSheet from '../components/RegionSelectSheet/RegionSelectSheet'
import DateSelectSheet from '../components/DateSelectSheet/DateSelectSheet'
import TypeSelectSheet from '../components/TypeSelectSheet/TypeSelectSheet'
import { PREFECTURE_BOUNDS, JAPAN_BOUNDS } from '../data/regions'
import './Map.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

const MAP_FILTERS = [
  { id: 'all', label: '전체', active: true },
  { id: 'region', label: '지역', icon: 'location' },
  { id: 'date', label: '날짜', icon: 'calendar' },
  { id: 'type', label: '종류', icon: null },
]

const FESTIVAL_MARKERS = [
  { id: 1, name: '기후 타카야마 축제', date: '8월', location: '기후현 타카야마시', lon: 137.2522, lat: 36.146 },
  { id: 2, name: '교토 기온 마츠리', date: '7월', location: '교토부 교토시', lon: 135.7681, lat: 35.0116 },
  { id: 3, name: '아오모리 네부타', date: '8월', location: '아오모리현 아오모리시', lon: 140.7474, lat: 40.8221 },
  { id: 4, name: '센다이 다나바타', date: '8월', location: '미야기현 센다이시', lon: 140.8694, lat: 38.2688 },
]

function SearchIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
}

function NotificationIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
}

function LocationIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
}

function CalendarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}

function MapPage() {
  const mapRef = useRef()
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [regionSheetOpen, setRegionSheetOpen] = useState(false)
  const [selectedPrefecture, setSelectedPrefecture] = useState(null)
  const [dateSheetOpen, setDateSheetOpen] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState(null)
  const [typeSheetOpen, setTypeSheetOpen] = useState(false)
  const [selectedType, setSelectedType] = useState(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lon: pos.coords.longitude, lat: pos.coords.latitude }),
        () => {},
      )
    }
  }, [])

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({ center: [userLocation.lon, userLocation.lat], zoom: 14 })
    }
  }, [userLocation])

  useEffect(() => {
    if (!selectedPrefecture || !mapRef.current) return
    const bounds = PREFECTURE_BOUNDS[selectedPrefecture]
    if (bounds) {
      mapRef.current.fitBounds(bounds, { padding: 48, duration: 800 })
    }
  }, [selectedPrefecture])

  const handleCurrentLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({ center: [userLocation.lon, userLocation.lat], zoom: 14 })
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lon = pos.coords.longitude
          const lat = pos.coords.latitude
          setUserLocation({ lon, lat })
          if (mapRef.current) {
            mapRef.current.flyTo({ center: [lon, lat], zoom: 14 })
          }
        },
        () => {},
      )
    }
  }, [userLocation])

  return (
    <div className="map-page">
      <div className="map-top-fixed">
        <StatusBar />
        <header className="map-header">
          <h1 className="map-title">지도</h1>
          <div className="map-header-actions">
            <button type="button" className="icon-btn map-icon-btn" aria-label="검색"><SearchIcon /></button>
            <button type="button" className="icon-btn map-icon-btn" aria-label="알림"><NotificationIcon /></button>
          </div>
        </header>
        <div className="map-filters">
          {MAP_FILTERS.map((f) => {
            const isRegionFilter = f.id === 'region'
            const isDateFilter = f.id === 'date'
            const isTypeFilter = f.id === 'type'
            const handleClick = isRegionFilter
              ? () => {
                  if (regionSheetOpen) {
                    setSelectedPrefecture(null)
                    setRegionSheetOpen(false)
                  } else {
                    setActiveFilter('region')
                    setRegionSheetOpen(true)
                  }
                }
              : isDateFilter
                ? () => {
                    if (dateSheetOpen) {
                      setSelectedDateRange(null)
                      setDateSheetOpen(false)
                    } else {
                      setActiveFilter('date')
                      setDateSheetOpen(true)
                    }
                  }
                : isTypeFilter
                  ? () => {
                      if (typeSheetOpen) {
                        setSelectedType(null)
                        setTypeSheetOpen(false)
                      } else {
                        setActiveFilter('type')
                        setTypeSheetOpen(true)
                      }
                    }
                  : (f.id === 'all'
                    ? () => {
                        setActiveFilter('all')
                        setSelectedPrefecture(null)
                        setSelectedDateRange(null)
                        setSelectedType(null)
                        setRegionSheetOpen(false)
                        setDateSheetOpen(false)
                        setTypeSheetOpen(false)
                        if (mapRef.current) {
                          mapRef.current.fitBounds(JAPAN_BOUNDS, { padding: 48, duration: 800 })
                        }
                      }
                    : () => setActiveFilter(f.id))
            const label = isRegionFilter && selectedPrefecture
              ? selectedPrefecture
              : isDateFilter && selectedDateRange
                ? selectedDateRange.label
                : isTypeFilter && selectedType
                  ? selectedType.name
                  : f.label
            return (
              <button
                key={f.id}
                type="button"
                className={`map-filter-btn ${(f.id === 'all' && !selectedPrefecture && !selectedDateRange && !selectedType) || activeFilter === f.id || (isRegionFilter && selectedPrefecture) || (isDateFilter && selectedDateRange) || (isTypeFilter && selectedType) ? 'map-filter-btn--active' : ''}`}
                onClick={handleClick}
              >
                {f.icon === 'location' && <LocationIcon />}
                {f.icon === 'calendar' && <CalendarIcon />}
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="map-container">
        {MAPBOX_TOKEN ? (
          <>
            <Map
              ref={mapRef}
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={{
                longitude: 139.6917,
                latitude: 35.6895,
                zoom: 6,
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
            >
              {FESTIVAL_MARKERS.map((m) => (
                <Marker
                  key={m.id}
                  longitude={m.lon}
                  latitude={m.lat}
                  anchor="bottom"
                  onClick={() => setSelectedMarker(selectedMarker === m.id ? null : m.id)}
                >
                  <img
                    src={selectedMarker === m.id ? '/assets/map/marker_active.svg' : '/assets/map/marker_inactive.svg'}
                    alt=""
                    className="map-marker-img"
                    width={48}
                    height={48}
                  />
                </Marker>
              ))}

              {userLocation && (
                <Marker longitude={userLocation.lon} latitude={userLocation.lat} anchor="center">
                  <div className="map-user-location" />
                </Marker>
              )}

              {selectedMarker && (() => {
                const m = FESTIVAL_MARKERS.find((x) => x.id === selectedMarker)
                if (!m) return null
                return (
                  <Popup
                    key={m.id}
                    className="map-callout-popup"
                    longitude={m.lon}
                    latitude={m.lat}
                    anchor="bottom"
                    offset={40}
                    closeButton={false}
                    closeOnClick={false}
                  >
                    <div className="map-callout-content">
                      <div className="map-callout-title">{m.name}</div>
                      <div className="map-callout-subtitle">{m.date} · {m.location}</div>
                    </div>
                  </Popup>
                )
              })()}
            </Map>

            <button
              type="button"
              className="map-location-btn"
              onClick={handleCurrentLocation}
              aria-label="현재 위치로 이동"
            >
              <img src="/assets/map/now.svg" alt="" width={48} height={48} />
            </button>
          </>
        ) : (
          <div className="map-token-message">
            <p>Mapbox 토큰이 필요합니다.</p>
            <p>.env에 VITE_MAPBOX_ACCESS_TOKEN을 추가해주세요.</p>
            <p>
              <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer">
                Mapbox 토큰 발급
              </a>
            </p>
          </div>
        )}
      </div>

      <RegionSelectSheet
        isOpen={regionSheetOpen}
        onClose={() => setRegionSheetOpen(false)}
        onSelect={setSelectedPrefecture}
      />

      <DateSelectSheet
        isOpen={dateSheetOpen}
        onClose={() => setDateSheetOpen(false)}
        onSelect={setSelectedDateRange}
      />

      <TypeSelectSheet
        isOpen={typeSheetOpen}
        onClose={() => setTypeSheetOpen(false)}
        onSelect={setSelectedType}
      />

      <NavigationBar />
    </div>
  )
}

export default MapPage
