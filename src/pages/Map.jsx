import { useState, useCallback, useRef, useEffect } from 'react'
import Map, { Marker, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import StatusBar from '../components/StatusBar'
import NavigationBar from '../components/NavigationBar'
import RegionSelectSheet from '../components/RegionSelectSheet/RegionSelectSheet'
import DateSelectSheet from '../components/DateSelectSheet/DateSelectSheet'
import TypeSelectSheet from '../components/TypeSelectSheet/TypeSelectSheet'
import { PREFECTURE_BOUNDS, JAPAN_BOUNDS } from '../data/regions'
import './Map.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

const FALLBACK_FILTERS = [
  { id: 'all', label: '전체', active: true },
  { id: 'region', label: '지역', icon: 'location' },
  { id: 'date', label: '날짜', icon: 'calendar' },
  { id: 'type', label: '종류', icon: null },
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

function formatMonth(isoDate) {
  if (!isoDate) return ""
  const d = new Date(isoDate)
  return `${d.getMonth() + 1}월`
}

function MapPage() {
  const mapRef = useRef()
  const [mapFilters, setMapFilters] = useState(FALLBACK_FILTERS)
  const [festivalMarkers, setFestivalMarkers] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [selectedPrefecture, setSelectedPrefecture] = useState(null)
  const [selectedDateRange, setSelectedDateRange] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [regionSheetOpen, setRegionSheetOpen] = useState(false)
  const [dateSheetOpen, setDateSheetOpen] = useState(false)
  const [typeSheetOpen, setTypeSheetOpen] = useState(false)

  // API에서 필터와 마커 데이터 가져오기
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchFilters = async () => {
      try {
        setLoadError('')
        const filtersRes = await fetch('http://localhost:5000/api/map/filters', { signal: controller.signal })
        
        if (!filtersRes.ok) {
          throw new Error('필터 데이터를 불러오지 못했어요.')
        }

        const filtersData = await filtersRes.json()
        if (isMounted) {
          setMapFilters(Array.isArray(filtersData) ? filtersData : FALLBACK_FILTERS)
        }
      } catch (error) {
        if (error.name === 'AbortError') return
        if (isMounted) {
          setLoadError('필터 데이터를 불러오지 못했어요.')
        }
      }
    }

    fetchFilters()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  // 필터 변경시 마커 데이터 가져오기
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchMarkers = async () => {
      try {
        setLoadError('')
        
        // 쿼리 파라미터 생성
        const params = new URLSearchParams()
        if (selectedPrefecture) params.append('prefecture', selectedPrefecture)
        
        // 날짜 필터링 - startDate와 endDate 모두 전송 (YYYY-MM-DD 형식)
        // 백엔드: start_date <= endDate AND end_date >= startDate 로 범위 필터링
        if (selectedDateRange?.startDate) {
          const d = selectedDateRange.startDate
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          const startDateStr = `${year}-${month}-${day}`
          params.append('startDate', startDateStr)
          console.log('시작 날짜:', startDateStr)
        }
        
        if (selectedDateRange?.endDate) {
          const d = selectedDateRange.endDate
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          const endDateStr = `${year}-${month}-${day}`
          params.append('endDate', endDateStr)
          console.log('종료 날짜:', endDateStr)
        }
        
        // type을 정확하게 전송 (예: "여름축제" - 공백 제거)
        if (selectedType) {
          const typeStr = (selectedType.name || selectedType).replace(/\s/g, '')
          params.append('type', typeStr)
          console.log('타입 필터:', { selectedType, typeStr })
        }
        
        const queryString = params.toString()
        const url = `http://localhost:5000/api/map/markers${queryString ? '?' + queryString : ''}`
        
        console.log('마커 요청 URL:', url)
        console.log('선택된 필터:', { selectedPrefecture, selectedDateRange, selectedType })
        
        const markersRes = await fetch(url, { signal: controller.signal })
        
        console.log('마커 응답 상태:', markersRes.status)
        
        if (!markersRes.ok) {
          const errorData = await markersRes.json().catch(() => null)
          console.error('마커 요청 실패:', errorData)
          throw new Error('마커 데이터를 불러오지 못했어요.')
        }

        const markersData = await markersRes.json()
        console.log('마커 데이터:', markersData)
        console.log('마커 데이터 타입:', typeof markersData, '길이:', Array.isArray(markersData) ? markersData.length : 'not array')
        
        if (isMounted) {
          setFestivalMarkers(Array.isArray(markersData) ? markersData : [])
        }
      } catch (error) {
        if (error.name === 'AbortError') return
        console.error('마커 조회 에러:', error)
        if (isMounted) {
          setLoadError('마커 데이터를 불러오지 못했어요.')
        }
      }
    }

    fetchMarkers()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [selectedPrefecture, selectedDateRange, selectedType])

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
          {mapFilters.map((f) => {
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
                  : f.id === 'all'
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
                    : () => setActiveFilter(f.id)
            
            const label = isRegionFilter && selectedPrefecture
              ? selectedPrefecture
              : isDateFilter && selectedDateRange
                ? selectedDateRange.label
                : isTypeFilter && selectedType
                  ? selectedType.name
                  : f.label
            
            const isActive = (f.id === 'all' && !selectedPrefecture && !selectedDateRange && !selectedType) || 
                             activeFilter === f.id || 
                             (isRegionFilter && selectedPrefecture) || 
                             (isDateFilter && selectedDateRange) || 
                             (isTypeFilter && selectedType)
            
            return (
              <button
                key={f.id}
                type="button"
                className={`map-filter-btn ${isActive ? 'map-filter-btn--active' : ''}`}
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
        {loadError ? (
          <div className="map-load-error">
            <p role="alert">{loadError}</p>
          </div>
        ) : MAPBOX_TOKEN ? (
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
              {festivalMarkers.map((m) => {
                const lon = m.longitude || m.lon
                const lat = m.latitude || m.lat
                if (!lon || !lat) return null
                return (
                  <Marker
                    key={m.id}
                    longitude={lon}
                    latitude={lat}
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
                )
              })}

              {userLocation && (
                <Marker longitude={userLocation.lon} latitude={userLocation.lat} anchor="center">
                  <div className="map-user-location" />
                </Marker>
              )}

              {selectedMarker && (() => {
                const m = festivalMarkers.find((x) => x.id === selectedMarker)
                if (!m) return null
                const lon = m.longitude || m.lon
                const lat = m.latitude || m.lat
                if (!lon || !lat) return null
                return (
                  <Popup
                    key={m.id}
                    className="map-callout-popup"
                    longitude={lon}
                    latitude={lat}
                    anchor="bottom"
                    offset={40}
                    closeButton={false}
                    closeOnClick={false}
                  >
                    <div className="map-callout-content">
                      <div className="map-callout-title">{m.name}</div>
                      <div className="map-callout-subtitle">{formatMonth(m.startDate)} · {m.location}</div>
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
        key={`region-${regionSheetOpen}`}
        isOpen={regionSheetOpen}
        onClose={() => setRegionSheetOpen(false)}
        onSelect={setSelectedPrefecture}
      />

      <DateSelectSheet
        key={`date-${dateSheetOpen}`}
        isOpen={dateSheetOpen}
        onClose={() => setDateSheetOpen(false)}
        onSelect={setSelectedDateRange}
      />

      <TypeSelectSheet
        key={`type-${typeSheetOpen}`}
        isOpen={typeSheetOpen}
        onClose={() => setTypeSheetOpen(false)}
        onSelect={setSelectedType}
      />

      <NavigationBar />
    </div>
  )
}

export default MapPage
