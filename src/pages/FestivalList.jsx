import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import NavigationBar from '../components/NavigationBar'
import './FestivalList.css'



function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function LocationIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
}

function CalendarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}

const SECTION_TITLES = {
  trending: '최근 떠오르는 축제들',
  reviews: '리뷰가 많은 축제들',
  spring: '곧 열릴 예정인 봄 축제',
}

function FestivalList() {
  const navigate = useNavigate()
  const location = useLocation()
  const { category, cityId } = useParams()
  const sectionType = location.state?.section
  const sectionTitle = sectionType ? SECTION_TITLES[sectionType] : null
  const [activeTab, setActiveTab] = useState('')
  const categoryOrder = ['summer', 'winter', 'spring', 'autumn', 'food', 'local']
  const categoryOrderIndex = new Map(categoryOrder.map((id, index) => [id, index]))

  // 축제 데이터 상태
  const [festivals, setFestivals] = useState([])
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // API에서 축제 데이터 가져오기
  useEffect(() => {
    const fetchFestivals = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // API 쿼리 문자열 생성
        const params = new URLSearchParams()
        if (cityId) {
          params.append('city', cityId)
        } else if (sectionType) {
          params.append('section', sectionType)
        } else if (activeTab) {
          params.append('season', activeTab)
        }

        const response = await fetch(`http://localhost:5000/api/festivals?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('축제 데이터를 불러올 수 없습니다')
        }

        const data = await response.json()
        setFestivals(data)
      } catch (err) {
        setError(err.message)
        setFestivals([])
      } finally {
        setLoading(false)
      }
    }

    fetchFestivals()
  }, [activeTab, cityId, sectionType])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchCities = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/home/cities', {
          signal: controller.signal
        })
        if (!res.ok) return
        const data = await res.json()
        if (isMounted && Array.isArray(data)) setCities(data)
      } catch (err) {
        if (err.name !== 'AbortError') return
      }
    }

    fetchCities()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/home/categories', {
          signal: controller.signal
        })
        if (!res.ok) return
        const data = await res.json()
        if (isMounted && Array.isArray(data)) setCategories(data)
      } catch (err) {
        if (err.name !== 'AbortError') return
      }
    }

    fetchCategories()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (!categories.length) return

    if (category && category !== 'categories' && category !== 'city' && categories.some((t) => t.id === category)) {
      setActiveTab(category)
      return
    }

    if (!cityId && !activeTab) {
      const sortedCategories = [...categories].sort((a, b) => {
        const aIndex = categoryOrderIndex.get(a.id) ?? Number.MAX_SAFE_INTEGER
        const bIndex = categoryOrderIndex.get(b.id) ?? Number.MAX_SAFE_INTEGER
        return aIndex - bIndex
      })
      if (sortedCategories.length) {
        setActiveTab(sortedCategories[0].id)
      }
    }
  }, [category, categories, cityId, activeTab, categoryOrderIndex])

  const orderedCategories = [...categories].sort((a, b) => {
    const aIndex = categoryOrderIndex.get(a.id) ?? Number.MAX_SAFE_INTEGER
    const bIndex = categoryOrderIndex.get(b.id) ?? Number.MAX_SAFE_INTEGER
    return aIndex - bIndex
  })

  return (
    <div className={`festival-list-page ${cityId ? 'festival-list-page--with-cities' : ''} ${sectionType ? 'festival-list-page--section' : ''}`}>
      <div className="festival-list-top-fixed">
        <StatusBar />
        <header className="festival-list-header">
          <button type="button" className="festival-list-back" onClick={() => navigate('/')} aria-label="뒤로">
            <BackIcon />
          </button>
          {sectionTitle && <h1 className="festival-list-header-title">{sectionTitle}</h1>}
        </header>

        {!sectionType && cityId && (
          <div className="festival-list-cities">
            {cities.map((city) => (
              <button
                key={city.id}
                type="button"
                className={`festival-list-city ${cityId === city.id ? 'festival-list-city--active' : ''}`}
                onClick={() => navigate(`/festivals/city/${city.id}`)}
              >
                {city.label}
              </button>
            ))}
          </div>
        )}

        {!sectionType && !cityId && (
        <div className="festival-list-tabs">
          {orderedCategories.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`festival-list-tab ${activeTab === tab.id ? 'festival-list-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label.replace(/\s*축제$/u, '')}
            </button>
          ))}
        </div>
        )}
      </div>

      <main className="festival-list-main">
        {loading && <p className="festival-list-loading">축제를 불러오는 중...</p>}
        {error && <p className="festival-list-error">{error}</p>}
        
        <ul className="festival-list">
          {festivals.length > 0
            ? festivals.map((item) => (
                <li key={item.id} className="festival-list-card" onClick={() => navigate(`/festival/${item.id}`)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/festival/${item.id}`)}>
                  <div className="festival-list-card-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="festival-list-card-body">
                    <h3 className="festival-list-card-title">{item.title}</h3>
                    <p className="festival-list-card-row">
                      <LocationIcon />
                      <span>{item.location}</span>
                    </p>
                    <p className="festival-list-card-row">
                      <CalendarIcon />
                      <span>{item.date}</span>
                    </p>
                    <div className="festival-list-card-meta">
                      <span className="festival-list-card-rating">
                        <img src="/assets/star_icon.svg" alt="" aria-hidden />
                        {item.rating}({item.reviewCount})
                      </span>
                      <span className="festival-list-card-bookmark">
                        <img src="/assets/list_icon.svg" alt="" aria-hidden />
                        {item.bookmarkCount}
                      </span>
                    </div>
                  </div>
                </li>
              ))
            : !loading && <p className="festival-list-empty">축제가 없습니다</p>
          }
        </ul>
      </main>

      <NavigationBar />
    </div>
  )
}

export default FestivalList
