import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import RegionSelectSheet from '../components/RegionSelectSheet/RegionSelectSheet'
import DateSelectSheet from '../components/DateSelectSheet/DateSelectSheet'
import TypeSelectSheet from '../components/TypeSelectSheet/TypeSelectSheet'
import './Search.css'

const FALLBACK_FILTERS = [
  { id: 'all', label: '전체', active: true },
  { id: 'region', label: '지역', icon: 'location' },
  { id: 'date', label: '날짜', icon: 'calendar' },
  { id: 'type', label: '종류', icon: null },
]

const RECENT_SEARCHES = ['기후', '빙수', '유카타', '주변', '구마모토', '야키소바', '교토', '불꽃']

const POPULAR_FESTIVALS = [
  { id: 1, image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400', title: '타카야마 여름 축제', location: '기후현 타카야마시', date: '2026년 7월', rating: 4.8, reviewCount: 231, bookmarkCount: 124 },
  { id: 2, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', title: '타카야마 여름 축제', location: '기후현 타카야마시', date: '2026년 7월', rating: 4.8, reviewCount: 231, bookmarkCount: 124 },
  { id: 3, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', title: '타카야마 여름 축제', location: '기후현 타카야마시', date: '2026년 7월', rating: 4.8, reviewCount: 231, bookmarkCount: 124 },
]

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function LocationIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
}

function CalendarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function Search() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState(FALLBACK_FILTERS)
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedPrefecture, setSelectedPrefecture] = useState(null)
  const [selectedDateRange, setSelectedDateRange] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [regionSheetOpen, setRegionSheetOpen] = useState(false)
  const [dateSheetOpen, setDateSheetOpen] = useState(false)
  const [typeSheetOpen, setTypeSheetOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setShowFilters(true)
    }
  }

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    const fetchFilters = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/map/filters', { signal: controller.signal })
        if (!res.ok) return
        const data = await res.json()
        if (isMounted && Array.isArray(data)) setSearchFilters(data)
      } catch (e) {
        if (e.name !== 'AbortError') return
      }
    }
    fetchFilters()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  return (
    <div className="search-page">
      <div className={`search-top-fixed ${showFilters ? 'search-top-fixed--with-filters' : ''}`}>
        <StatusBar />
        <div className="search-bar-row">
          <button type="button" className="search-back-btn" onClick={() => navigate(-1)} aria-label="이전으로">
            <BackIcon />
          </button>
          <div className="search-bar-wrap">
          <input
            type="search"
            className="search-input"
            placeholder=""
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            aria-label="검색"
          />
          <span className="search-input-icon" aria-hidden>
            <SearchIcon />
          </span>
          </div>
        </div>
        {showFilters && (
          <div className="search-filters">
            {searchFilters.map((f) => {
              const isRegion = f.id === 'region'
              const isDate = f.id === 'date'
              const isType = f.id === 'type'
              const handleClick = isRegion
                ? () => {
                    if (regionSheetOpen) {
                      setSelectedPrefecture(null)
                      setRegionSheetOpen(false)
                    } else {
                      setActiveFilter('region')
                      setRegionSheetOpen(true)
                    }
                  }
                : isDate
                  ? () => {
                      if (dateSheetOpen) {
                        setSelectedDateRange(null)
                        setDateSheetOpen(false)
                      } else {
                        setActiveFilter('date')
                        setDateSheetOpen(true)
                      }
                    }
                  : isType
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
                        }
                      : () => setActiveFilter(f.id)
              const label = isRegion && selectedPrefecture
                ? selectedPrefecture
                : isDate && selectedDateRange
                  ? selectedDateRange.label
                  : isType && selectedType
                    ? selectedType.name
                    : f.label
              const isActive =
                (f.id === 'all' && !selectedPrefecture && !selectedDateRange && !selectedType) ||
                activeFilter === f.id ||
                (isRegion && selectedPrefecture) ||
                (isDate && selectedDateRange) ||
                (isType && selectedType)
              return (
                <button
                  key={f.id}
                  type="button"
                  className={`search-filter-btn ${isActive ? 'search-filter-btn--active' : ''}`}
                  onClick={handleClick}
                >
                  {f.icon === 'location' && <LocationIcon />}
                  {f.icon === 'calendar' && <CalendarIcon />}
                  {label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <main className={`search-main ${showFilters ? 'search-main--with-filters' : ''}`}>
        <section className="search-section">
          <h2 className="search-section-title">최근 검색어</h2>
          <div className="search-recent-scroll">
            {RECENT_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                className="search-recent-tag"
                onClick={() => setQuery(term)}
              >
                <ClockIcon />
                <span>{term}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="search-section">
          <h2 className="search-section-title">찾아가는 사람이 많은 축제</h2>
          <ul className="search-festival-list">
            {POPULAR_FESTIVALS.map((card) => (
              <li key={card.id}>
                <article className="search-festival-card">
                  <div className="search-festival-card-image">
                    <img src={card.image} alt="" />
                  </div>
                  <div className="search-festival-card-body">
                    <h3 className="search-festival-card-title">{card.title}</h3>
                    <p className="search-festival-card-location"><LocationIcon /><span>{card.location}</span></p>
                    <p className="search-festival-card-date"><CalendarIcon /><span>{card.date}</span></p>
                    <div className="search-festival-card-meta">
                      <span className="search-festival-card-rating">
                        <img src="/assets/star_icon.svg" alt="" aria-hidden />
                        {card.rating}({card.reviewCount})
                      </span>
                      <span className="search-festival-card-bookmark">
                        <img src="/assets/list_icon.svg" alt="" aria-hidden />
                        {card.bookmarkCount}
                      </span>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <div className="search-bottom-pad" />
      </main>

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

    </div>
  )
}

export default Search
