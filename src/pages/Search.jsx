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
  
  // 추가 상태
  const [recentSearches, setRecentSearches] = useState(() => {
    // 초기값: localStorage에서 불러오기
    const localHistory = localStorage.getItem('recentSearches')
    return localHistory ? JSON.parse(localHistory) : []
  })
  const [popularFestivals, setPopularFestivals] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)

  // 필터 불러오기
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    const fetchFilters = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/map/filters', { 
          signal: controller.signal,
          credentials: 'include'
        })
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

  // 최근 검색어 불러오기 (로그인 사용자는 서버에서, 비로그인은 이미 localStorage에서 초기화됨)
  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/search/history', {
          credentials: 'include'
        })
        if (!res.ok) return
        const data = await res.json()
        // 서버에서 데이터가 있으면 업데이트
        if (data && data.length > 0) {
          setRecentSearches(data)
        }
      } catch (error) {
        // 에러 시 localStorage 유지
      }
    }
    fetchRecentSearches()
  }, [])

  // 인기 축제 불러오기
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/search/popular')
        if (!res.ok) return
        const data = await res.json()
        setPopularFestivals(data)
      } catch (error) {
        console.error('인기 축제 불러오기 실패:', error)
      }
    }
    fetchPopular()
  }, [])

  // 검색 실행
  const handleSearch = async () => {
    if (!query.trim()) return
    
    setShowFilters(true)
    setLoading(true)

    try {
      // 검색어 저장
      await saveSearchHistory(query.trim())

      // 검색 API 호출
      const params = new URLSearchParams({ q: query.trim() })
      
      console.log("필터 상태:", {
        selectedPrefecture,
        selectedDateRange,
        selectedType
      })
      
      // 날짜 범위 상세 로그
      if (selectedDateRange) {
        console.log("selectedDateRange 상세:", {
          startDate: selectedDateRange.startDate,
          endDate: selectedDateRange.endDate,
          label: selectedDateRange.label,
          hasStartDate: !!selectedDateRange.startDate,
          hasEndDate: !!selectedDateRange.endDate,
          startIsDate: selectedDateRange.startDate instanceof Date,
          endIsDate: selectedDateRange.endDate instanceof Date
        })
      }
      
      if (selectedPrefecture) params.append('prefecture', selectedPrefecture)
      if (selectedDateRange?.startDate && selectedDateRange?.endDate) {
        console.log("날짜 필터 추가 시도:", {
          startDate: selectedDateRange.startDate.toISOString().split('T')[0],
          endDate: selectedDateRange.endDate.toISOString().split('T')[0]
        })
        params.append('startDate', selectedDateRange.startDate.toISOString().split('T')[0])
        params.append('endDate', selectedDateRange.endDate.toISOString().split('T')[0])
      }
      // selectedType은 { id, name } 객체
      if (selectedType?.id) {
        console.log("종류 필터 추가:", { id: selectedType.id, name: selectedType.name })
        // 데이터베이스 값과 매칭: "여름 축제" -> "여름축제"
        params.append('type', selectedType.name.replace(/\s+/g, ''))
      }

      console.log("전송 파라미터:", params.toString())

      const res = await fetch(`http://localhost:5000/api/search?${params.toString()}`, {
        credentials: 'include'
      })
      
      if (!res.ok) throw new Error('검색 실패')
      
      const data = await res.json()
      setSearchResults(data)
    } catch (error) {
      console.error('검색 에러:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  // 검색어 저장
  const saveSearchHistory = async (searchQuery) => {
    try {
      // 서버에 저장 시도 (로그인 사용자)
      const res = await fetch('http://localhost:5000/api/search/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query: searchQuery })
      })

      if (res.status === 401) {
        // 로그인 안 했으면 로컬스토리지
        saveToLocalStorage(searchQuery)
        return
      }

      if (res.ok) {
        // 성공하면 최근 검색어 새로고침
        const historyRes = await fetch('http://localhost:5000/api/search/history', {
          credentials: 'include'
        })
        if (historyRes.ok) {
          const data = await historyRes.json()
          setRecentSearches(data)
        }
      }
    } catch (error) {
      // 에러 시 로컬스토리지
      saveToLocalStorage(searchQuery)
    }
  }

  // 로컬스토리지에 저장
  const saveToLocalStorage = (searchQuery) => {
    const existing = localStorage.getItem('recentSearches')
    let searches = existing ? JSON.parse(existing) : []
    
    // 중복 제거
    searches = searches.filter((s) => s !== searchQuery)
    // 최신 검색어를 앞에 추가
    searches.unshift(searchQuery)
    // 최대 8개만 유지
    searches = searches.slice(0, 8)
    
    localStorage.setItem('recentSearches', JSON.stringify(searches))
    setRecentSearches(searches)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleRecentSearchClick = async (term) => {
    setQuery(term)
    setShowFilters(true)
    setLoading(true)

    try {
      // 검색 API 호출 (term 직접 사용)
      const params = new URLSearchParams({ q: term.trim() })
      if (selectedPrefecture) params.append('prefecture', selectedPrefecture)
      if (selectedDateRange?.start && selectedDateRange?.end) {
        params.append('startDate', selectedDateRange.start.toISOString().split('T')[0])
        params.append('endDate', selectedDateRange.end.toISOString().split('T')[0])
      }
      if (selectedType?.value) params.append('type', selectedType.value)

      const res = await fetch(`http://localhost:5000/api/search?${params.toString()}`, {
        credentials: 'include'
      })
      
      if (!res.ok) throw new Error('검색 실패')
      
      const data = await res.json()
      setSearchResults(data)
    } catch (error) {
      console.error('검색 에러:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  // 필터 변경 시 검색 다시 실행
  useEffect(() => {
    if (showFilters && query.trim()) {
      handleSearch()
    }
  }, [selectedPrefecture, selectedDateRange, selectedType])

  // 지역 선택 콜백
  const handleSelectPrefecture = (prefecture) => {
    setSelectedPrefecture(prefecture)
    setRegionSheetOpen(false)
  }

  // 날짜 선택 콜백
  const handleSelectDateRange = (dateRange) => {
    setSelectedDateRange(dateRange)
    setDateSheetOpen(false)
  }

  // 종류 선택 콜백
  const handleSelectType = (type) => {
    setSelectedType(type)
    setTypeSheetOpen(false)
  }

  return (
    <div className="search-page">
      <div className={`search-top-fixed ${showFilters ? 'search-top-fixed--with-filters' : ''}`}>
        <StatusBar />
        <div className="search-bar-row">
          <button
            type="button"
            className="search-back-btn"
            onClick={() => {
              if (showFilters) {
                setShowFilters(false)
                setQuery('')
                setSearchResults([])
                setSelectedPrefecture(null)
                setSelectedDateRange(null)
                setSelectedType(null)
                setActiveFilter('all')
                setRegionSheetOpen(false)
                setDateSheetOpen(false)
                setTypeSheetOpen(false)
              } else {
                navigate(-1)
              }
            }}
            aria-label="이전으로"
          >
            <BackIcon />
          </button>
          <div className="search-bar-wrap">
          <input
            type="search"
            className="search-input"
            placeholder="축제 검색"
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
        {/* 검색 결과 */}
        {showFilters && searchResults.length > 0 && (
          <section className="search-section">
            <h2 className="search-section-title">검색 결과 ({searchResults.length})</h2>
            <ul className="search-festival-list">
              {searchResults.map((card) => (
                <li key={card.id} onClick={() => navigate(`/festival/${card.id}`, { state: { from: 'search' } })} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/festival/${card.id}`, { state: { from: 'search' } })}>
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
        )}

        {showFilters && loading && <p className="search-loading">검색 중...</p>}
        {showFilters && !loading && searchResults.length === 0 && (
          <p className="search-empty">검색 결과가 없습니다</p>
        )}

        {/* 최근 검색어 */}
        {!showFilters && recentSearches.length > 0 && (
          <section className="search-section">
            <h2 className="search-section-title">최근 검색어</h2>
            <div className="search-recent-scroll">
              {recentSearches.map((term, index) => (
                <button
                  key={`${term}-${index}`}
                  type="button"
                  className="search-recent-tag"
                  onClick={() => handleRecentSearchClick(term)}
                >
                  <ClockIcon />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 인기 축제 */}
        {!showFilters && (
          <section className="search-section">
            <h2 className="search-section-title">찾아가는 사람이 많은 축제</h2>
            <ul className="search-festival-list">
              {popularFestivals.map((card) => (
                <li key={card.id} onClick={() => navigate(`/festival/${card.id}`, { state: { from: 'search' } })} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/festival/${card.id}`, { state: { from: 'search' } })}>
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
        )}

        <div className="search-bottom-pad" />
      </main>

      <RegionSelectSheet
        key={`region-${regionSheetOpen}`}
        isOpen={regionSheetOpen}
        onClose={() => setRegionSheetOpen(false)}
        onSelect={handleSelectPrefecture}
      />
      <DateSelectSheet
        key={`date-${dateSheetOpen}`}
        isOpen={dateSheetOpen}
        onClose={() => setDateSheetOpen(false)}
        onSelect={handleSelectDateRange}
      />
      <TypeSelectSheet
        key={`type-${typeSheetOpen}`}
        isOpen={typeSheetOpen}
        onClose={() => setTypeSheetOpen(false)}
        onSelect={handleSelectType}
      />

    </div>
  )
}

export default Search
