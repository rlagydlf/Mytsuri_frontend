import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar'
import StatusBar from '../components/StatusBar'
import './Home.css'

const EMPTY_BANNERS = []
const EMPTY_CATEGORIES = []
const EMPTY_CITIES = []
const EMPTY_FESTIVALS = []

const CATEGORY_ORDER = [
  '여름 축제',
  '겨울 축제',
  '봄 축제',
  '가을 축제',
  '먹거리 축제',
  '특산물 축제'
]

const getCategoryOrder = (label) => {
  const index = CATEGORY_ORDER.indexOf(label)
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

const SWIPE_THRESHOLD = 50

function Home() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [banners, setBanners] = useState(EMPTY_BANNERS)
  const [categories, setCategories] = useState(EMPTY_CATEGORIES)
  const [cities, setCities] = useState(EMPTY_CITIES)
  const [festivals, setFestivals] = useState(EMPTY_FESTIVALS)
  const [loadError, setLoadError] = useState('')
  const touchStartX = useRef(0)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchData = async () => {
      try {
        setLoadError('')
        const [recommendationsRes, categoriesRes, citiesRes, festivalsRes] = await Promise.all([
          fetch('http://localhost:5000/api/recommendations', { signal: controller.signal, credentials: 'include' }),
          fetch('http://localhost:5000/api/home/categories', { signal: controller.signal }),
          fetch('http://localhost:5000/api/home/cities', { signal: controller.signal }),
          fetch('http://localhost:5000/api/home/festivals', { signal: controller.signal })
        ])

        if (!recommendationsRes.ok || !categoriesRes.ok || !citiesRes.ok || !festivalsRes.ok) {
          throw new Error('홈 데이터를 불러오지 못했어요.')
        }

        const [recommendationsData, categoriesData, citiesData, festivalsData] = await Promise.all([
          recommendationsRes.json(),
          categoriesRes.json(),
          citiesRes.json(),
          festivalsRes.json()
        ])

        if (isMounted) {
          setBanners(Array.isArray(recommendationsData) ? recommendationsData : EMPTY_BANNERS)
          const sortedCategories = Array.isArray(categoriesData)
            ? [...categoriesData].sort((a, b) => getCategoryOrder(a.label) - getCategoryOrder(b.label))
            : EMPTY_CATEGORIES
          setCategories(sortedCategories)
          setCities(Array.isArray(citiesData) ? citiesData : EMPTY_CITIES)
          const sortedFestivals = Array.isArray(festivalsData)
            ? [...festivalsData].sort((a, b) => (b.bookmarkCount ?? 0) - (a.bookmarkCount ?? 0))
            : EMPTY_FESTIVALS
          setFestivals(sortedFestivals)
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }
        if (isMounted) {
          setLoadError('홈 데이터를 불러오지 못했어요.')
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (!banners.length) {
      return undefined
    }
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [banners.length])

  // 섹션별 정렬된 축제 배열 생성
  const festivalsByBookmarks = [...festivals].sort(
    (a, b) => (b.bookmarkCount ?? 0) - (a.bookmarkCount ?? 0)
  )
  const festivalsByReviews = [...festivals].sort(
    (a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
  )
  const festivalsByDate = [...festivals].sort(
    (a, b) => {
      const dateA = new Date(a.start_date || a.startDate || '9999-12-31')
      const dateB = new Date(b.start_date || b.startDate || '9999-12-31')
      return dateA - dateB
    }
  )

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX
    const deltaX = touchStartX.current - endX
    const total = banners.length
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return
    if (deltaX > 0) {
      setCurrentSlide((prev) => (prev + 1) % total)
    } else {
      setCurrentSlide((prev) => (prev - 1 + total) % total)
    }
  }

  return (
    <div className="home-page">
      <div className="home-top-fixed">
        <StatusBar />
        <header className="home-header">
          <Link to="/" className="home-logo">
            <img src="/assets/logo_home.svg" alt="Mytsuri" />
          </Link>
          <div className="home-header-actions">
            <button type="button" className="icon-btn" aria-label="검색" onClick={() => navigate('/search')}><SearchIcon /></button>
            <button type="button" className="icon-btn" aria-label="알림" onClick={() => navigate('/notifications')}><NotificationIcon /></button>
          </div>
        </header>
      </div>

      <main className="home-main">
        <section
          className="banner-slider"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="banner-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {banners.map((slide) => (
              <div key={slide.id} className="banner-slide">
                <img src={slide.image} alt={slide.title} />
                <div className="banner-overlay">
                  <h2 className="banner-title">{slide.title}</h2>
                  <p className="banner-subtitle">{slide.subtitle || slide.reason || slide.location}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="banner-dots">
            {banners.map((_, i) => (
              <button key={i} type="button" className={`banner-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} aria-label={`${i + 1}번 슬라이드`} />
            ))}
          </div>
        </section>

        <section className="category-section">
          <div className="category-scroll">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="category-item"
                onClick={() => navigate(`/festivals/${cat.id}`)}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="festival-section">
          <div className="section-header">
            <div className="section-header-inner">
              <h3 className="section-title">최근 떠오르는 축제들</h3>
              <p className="section-subtitle">사람들이 많이 찾는 축제들로 모아왔어요!</p>
            </div>
            <button type="button" className="section-more" aria-label="더보기"><ArrowIcon /></button>
          </div>
          <div className="festival-scroll">
            {festivalsByBookmarks.map((card) => <FestivalCard key={card.id} data={card} />)}
          </div>
        </section>

        <section className="festival-section">
          <div className="section-header">
            <div className="section-header-inner">
              <h3 className="section-title">리뷰가 많은 축제들</h3>
              <p className="section-subtitle">최근 3개월간 가장 리뷰가 많았어요</p>
            </div>
            <button type="button" className="section-more" aria-label="더보기"><ArrowIcon /></button>
          </div>
          <div className="festival-scroll">
            {festivalsByReviews.map((card) => <FestivalCard key={`r-${card.id}`} data={card} />)}
          </div>
        </section>

        <section className="city-section">
          <h3 className="section-title">어디로 갈까요?</h3>
          <div className="city-scroll">
            {cities.map((city) => (
              <button
                key={city.id}
                type="button"
                className="city-item"
                onClick={() => navigate(`/festivals/city/${city.id}`)}
              >
                <img src={city.image} alt={city.label} className="city-item-image" />
              </button>
            ))}
          </div>
        </section>

        <section className="festival-section">
          <div className="section-header">
            <div className="section-header-inner">
              <h3 className="section-title">곧 열릴 예정인 봄 축제</h3>
              <p className="section-subtitle">요즘 계절에 맞는 봄 축제를 모아봤어요</p>
            </div>
            <button type="button" className="section-more" aria-label="더보기"><ArrowIcon /></button>
          </div>
          <div className="festival-scroll">
            {festivalsByDate.map((card) => <FestivalCard key={`s-${card.id}`} data={card} />)}
          </div>
        </section>

        {loadError ? (
          <p className="home-load-error" role="alert">
            {loadError}
          </p>
        ) : null}

        <div className="home-bottom-pad" />
      </main>

      <NavigationBar />
    </div>
  )
}

function FestivalCard({ data }) {
  const formatDate = (startDate, endDate) => {
    if (!startDate) return ''
    try {
      const start = new Date(startDate)
      const end = new Date(endDate || startDate)
      const startMonth = start.getMonth() + 1
      const startDay = start.getDate()
      const endMonth = end.getMonth() + 1
      const endDay = end.getDate()
      
      if (startMonth === endMonth) {
        return `${startMonth}월 ${startDay}일 ~ ${endDay}일`
      } else {
        return `${startMonth}월 ${startDay}일 ~ ${endMonth}월 ${endDay}일`
      }
    } catch {
      return ''
    }
  }

  const displayDate = formatDate(data.start_date || data.startDate, data.end_date || data.endDate)

  return (
    <article className="festival-card">
      <div className="festival-card-image">
        <img src={data.image} alt={data.title} />
      </div>
      <div className="festival-card-body">
        <h4 className="festival-card-title">{data.title}</h4>
        <p className="festival-card-location"><LocationIcon /><span>{data.location}</span></p>
        <p className="festival-card-date"><CalendarIcon /><span>{displayDate}</span></p>
        <div className="festival-card-meta">
          <span className="festival-card-rating">
            <img src="/assets/star_icon.svg" alt="" aria-hidden />
            {data.rating} <span className="festival-card-review-count">({data.reviewCount})</span>
          </span>
          <span className="festival-card-bookmark">
            <img src="/assets/list_icon.svg" alt="" aria-hidden />
            {data.bookmarkCount}
          </span>
        </div>
      </div>
    </article>
  )
}

function LocationIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
}
function CalendarIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}
function SearchIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
}
function NotificationIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
}
function ArrowIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
}

export default Home
