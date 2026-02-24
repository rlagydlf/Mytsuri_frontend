import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import './ListAddFestival.css'

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

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
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
}

function CalendarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}

function ListAddFestival() {
  const navigate = useNavigate()
  const { id } = useParams()
  const inputRef = useRef(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const [recentSearches, setRecentSearches] = useState(() => {
    const stored = localStorage.getItem('recentSearches')
    return stored ? JSON.parse(stored) : []
  })
  const [popularFestivals, setPopularFestivals] = useState([])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchPopular = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/search/popular', {
          signal: controller.signal,
        })
        if (!res.ok) return
        const data = await res.json()
        if (isMounted) setPopularFestivals(data)
      } catch {
        // ignore
      }
    }
    fetchPopular()
    return () => { isMounted = false; controller.abort() }
  }, [])

  const doSearch = async (term) => {
    if (!term.trim()) return
    setLoading(true)
    setSearched(true)

    try {
      const params = new URLSearchParams({ q: term.trim() })
      const res = await fetch(`http://localhost:5000/api/search?${params.toString()}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const saveRecentSearch = (term) => {
    const stored = localStorage.getItem('recentSearches')
    let searches = stored ? JSON.parse(stored) : []
    searches = searches.filter((s) => s !== term)
    searches.unshift(term)
    searches = searches.slice(0, 8)
    localStorage.setItem('recentSearches', JSON.stringify(searches))
    setRecentSearches(searches)
  }

  const handleSearch = () => {
    if (!query.trim()) return
    saveRecentSearch(query.trim())
    doSearch(query.trim())
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleRecentClick = (term) => {
    setQuery(term)
    saveRecentSearch(term)
    doSearch(term)
  }

  const handleSelectFestival = async (festival) => {
    try {
      await fetch(`http://localhost:5000/api/lists/${id}/festivals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ festivalId: festival.id }),
      })
    } catch {
      // ignore
    }
    navigate(`/list/${id}`, { state: { festivalAdded: true } })
  }

  const renderCard = (item) => (
    <article
      className="laf-card"
      role="button"
      tabIndex={0}
      onClick={() => handleSelectFestival(item)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectFestival(item)}
    >
      <div className="laf-card-image">
        {item.image ? <img src={item.image} alt="" /> : <div className="laf-card-placeholder" />}
      </div>
      <div className="laf-card-body">
        <h3 className="laf-card-title">{item.title}</h3>
        <p className="laf-card-row"><LocationIcon /><span>{item.location}</span></p>
        <p className="laf-card-row"><CalendarIcon /><span>{item.date}</span></p>
        <div className="laf-card-meta">
          <span className="laf-card-rating">
            <img src="/assets/star_icon.svg" alt="" aria-hidden />
            {item.rating}<span className="laf-card-reviews">({item.reviewCount})</span>
          </span>
          <span className="laf-card-bookmark">
            <img src="/assets/list_icon.svg" alt="" aria-hidden />
            {item.bookmarkCount}
          </span>
        </div>
      </div>
    </article>
  )

  const showHome = !loading && !searched

  return (
    <div className="laf-page">
      <div className="laf-top">
        <StatusBar />
        <div className="laf-bar">
          <button type="button" className="laf-back" onClick={() => navigate(-1)} aria-label="뒤로">
            <BackIcon />
          </button>
          <div className="laf-input-wrap">
            <input
              ref={inputRef}
              type="search"
              className="laf-input"
              placeholder="축제 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="축제 검색"
            />
            <span className="laf-input-icon" aria-hidden><SearchIcon /></span>
          </div>
        </div>
      </div>

      <main className="laf-main">
        {loading && <p className="laf-status">검색 중...</p>}

        {!loading && searched && results.length === 0 && (
          <p className="laf-status">검색 결과가 없습니다</p>
        )}

        {!loading && searched && results.length > 0 && (
          <section className="laf-section">
            <h2 className="laf-section-title">검색 결과 ({results.length})</h2>
            <ul className="laf-list">
              {results.map((item) => (
                <li key={item.id}>{renderCard(item)}</li>
              ))}
            </ul>
          </section>
        )}

        {showHome && recentSearches.length > 0 && (
          <section className="laf-section">
            <h2 className="laf-section-title">최근 검색어</h2>
            <div className="laf-recent-tags">
              {recentSearches.map((term, i) => (
                <button
                  key={`${term}-${i}`}
                  type="button"
                  className="laf-recent-tag"
                  onClick={() => handleRecentClick(term)}
                >
                  <ClockIcon />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {showHome && popularFestivals.length > 0 && (
          <section className="laf-section">
            <h2 className="laf-section-title">추천 축제</h2>
            <ul className="laf-list">
              {popularFestivals.map((item) => (
                <li key={item.id}>{renderCard(item)}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}

export default ListAddFestival
