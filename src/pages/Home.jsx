import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar'
import StatusBar from '../components/StatusBar'
import './Home.css'

const EMPTY_BANNERS = []
const EMPTY_CATEGORIES = []
const EMPTY_CITIES = []
const EMPTY_FESTIVALS = []

const DUMMY_FESTIVAL = {
  id: 1,
  title: '타카야마 여름 축제',
  subtitle: '불꽃·등불 퍼레이드 전통 축제',
  image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
  location: '일본 기후현 다카야마시 시로야마 156',
  date: '2024년 7월 14일 - 15일',
  time: '09:00 - 22:00',
  rating: 4.8,
  reviewCount: 231,
  bookmarkCount: 124,
  description: '화려한 수레와 전통 공연이 어우러진, 일본에서 가장 아름다운 축제 중 하나입니다. 수백 개의 등불로 밝혀진 환상적인 밤 퍼레이드를 통해 진짜 일본 문화를 경험해 보세요.',
  hashtags: ['#여름밤축제', '#불꽃놀이명소', '#다카야마여행'],
  activities: [
    { title: '불꽃놀이', subtitle: '밤하늘을 수놓는 메인 행사', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400' },
    { title: '등불 퍼레이드', subtitle: '등불과 수레가 이어지는 행진', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400' },
  ],
  homepage: 'https://www.takayamafestival.com',
  images: [
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
  ],
}

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
        const [bannersRes, categoriesRes, citiesRes, festivalsRes] = await Promise.all([
          fetch('http://localhost:5000/api/home/banners', { signal: controller.signal }),
          fetch('http://localhost:5000/api/home/categories', { signal: controller.signal }),
          fetch('http://localhost:5000/api/home/cities', { signal: controller.signal }),
          fetch('http://localhost:5000/api/home/festivals', { signal: controller.signal })
        ])

        if (!bannersRes.ok || !categoriesRes.ok || !citiesRes.ok || !festivalsRes.ok) {
          throw new Error('홈 데이터를 불러오지 못했어요.')
        }

        const [bannersData, categoriesData, citiesData, festivalsData] = await Promise.all([
          bannersRes.json(),
          categoriesRes.json(),
          citiesRes.json(),
          festivalsRes.json()
        ])

        if (isMounted) {
          setBanners(Array.isArray(bannersData) ? bannersData : EMPTY_BANNERS)
          const sortedCategories = Array.isArray(categoriesData)
            ? [...categoriesData].sort((a, b) => getCategoryOrder(a.label) - getCategoryOrder(b.label))
            : EMPTY_CATEGORIES
          setCategories(sortedCategories)
          setCities(Array.isArray(citiesData) ? citiesData : EMPTY_CITIES)
          setFestivals(Array.isArray(festivalsData) ? festivalsData : EMPTY_FESTIVALS)
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
              <div
                key={slide.id}
                className="banner-slide"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/festival/${slide.festivalId ?? slide.id}`, { state: { from: 'home' } })}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/festival/${slide.festivalId ?? slide.id}`, { state: { from: 'home' } })}
              >
                <img src={slide.image} alt={slide.title} />
                <div className="banner-overlay">
                  <h2 className="banner-title">{slide.title}</h2>
                  <p className="banner-subtitle">{slide.subtitle}</p>
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
              <p className="section-subtitle">조회수가 가장 높은 여름 축제들을 모아봤어요!</p>
            </div>
            <button type="button" className="section-more" aria-label="더보기" onClick={() => navigate('/festivals', { state: { section: 'trending' } })}><ArrowIcon /></button>
          </div>
          <div className="festival-scroll">
            {(festivals.length > 0 ? festivals : [DUMMY_FESTIVAL]).map((card) => (
              <FestivalCard key={card.id} data={card} onClick={() => navigate(`/festival/${card.id}`, { state: { from: 'home' } })} />
            ))}
          </div>
        </section>

        <section className="festival-section">
          <div className="section-header">
            <div className="section-header-inner">
              <h3 className="section-title">리뷰가 많은 축제들</h3>
              <p className="section-subtitle">최근 3개월간 가장 리뷰가 많았어요</p>
            </div>
            <button type="button" className="section-more" aria-label="더보기" onClick={() => navigate('/festivals', { state: { section: 'reviews' } })}><ArrowIcon /></button>
          </div>
          <div className="festival-scroll">
            {(festivals.length > 0 ? festivals : [DUMMY_FESTIVAL]).map((card) => (
              <FestivalCard key={`r-${card.id}`} data={card} onClick={() => navigate(`/festival/${card.id}`, { state: { from: 'home' } })} />
            ))}
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
            <button type="button" className="section-more" aria-label="더보기" onClick={() => navigate('/festivals', { state: { section: 'spring' } })}><ArrowIcon /></button>
          </div>
          <div className="festival-scroll">
            {(festivals.length > 0 ? festivals : [DUMMY_FESTIVAL]).map((card) => (
              <FestivalCard key={`s-${card.id}`} data={card} onClick={() => navigate(`/festival/${card.id}`, { state: { from: 'home' } })} />
            ))}
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

function FestivalCard({ data, onClick }) {
  return (
    <article className="festival-card" role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}>
      <div className="festival-card-image">
        <img src={data.image} alt={data.title} />
      </div>
      <div className="festival-card-body">
        <h4 className="festival-card-title">{data.title}</h4>
        <p className="festival-card-location"><LocationIcon /><span>{data.location}</span></p>
        <p className="festival-card-date"><CalendarIcon /><span>{data.date}</span></p>
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
