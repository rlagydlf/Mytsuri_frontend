import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar'
import StatusBar from '../components/StatusBar'
import './Home.css'

const BANNER_SLIDES = [
  { id: 1, image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800', title: '아오모리 네부타 제', subtitle: '동북 지방 대표 여름 축제' },
  { id: 2, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', title: '교토 기온 마츠리', subtitle: '일본 3대 축제 중 하나' },
  { id: 3, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', title: '나고야 축제', subtitle: '도시의 문화를 느껴보세요' },
  { id: 4, image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800', title: '후쿠오카 하카타 기온', subtitle: '매년 7월 열리는 전통 축제' },
  { id: 5, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', title: '센다이 다나바타', subtitle: '동북 3대 축제 중 하나' },
]

const CATEGORIES = [
  { id: 'summer', label: '여름 축제', icon: '⛱️' },
  { id: 'winter', label: '겨울 축제', icon: '☃️' },
  { id: 'spring', label: '봄 축제', icon: '🌸' },
  { id: 'autumn', label: '가을 축제', icon: '🍂' },
  { id: 'food', label: '먹거리 축제', icon: '🍜' },
  { id: 'local', label: '특산물 축제', icon: '🍎' },
]

const CITIES = [
  { id: 'kyoto', label: '교토', image: '/assets/city/Kyoto.svg' },
  { id: 'osaka', label: '오사카', image: '/assets/city/Osaka.svg' },
  { id: 'nagoya', label: '나고야', image: '/assets/city/Nagoya.svg' },
  { id: 'tokyo', label: '도쿄', image: '/assets/city/Tokyo.svg' },
  { id: 'fukuoka', label: '후쿠오카', image: '/assets/city/Fukuoka.svg' },
]

const FESTIVAL_CARD = {
  image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400',
  title: '타카야마 여름 축제',
  location: '기후현 타카야마시',
  date: '2026년 7월',
  rating: 4.8,
  reviewCount: 231,
  bookmarkCount: 124,
}

const FESTIVAL_CARDS = [
  { ...FESTIVAL_CARD, id: 1 },
  { ...FESTIVAL_CARD, id: 2, title: '고잔 오쿠리비', rating: 4.7 },
  { ...FESTIVAL_CARD, id: 3, title: '후쿠오카 하카타 기온 야마카사', location: '후쿠오카현 구시다 신사', date: '매년 7월 1일~7월 15일', rating: 4.5, reviewCount: 345, bookmarkCount: 450 },
  { ...FESTIVAL_CARD, id: 4, title: '나고야 봄 축제', location: '나고야현 나고야성', date: '2026년 3월 20일 ~ 4월 6일', rating: 4.2, reviewCount: 126, bookmarkCount: 453 },
]

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="home-page">
      <div className="home-top-fixed">
        <StatusBar />
        <header className="home-header">
          <Link to="/" className="home-logo">
            <img src="/assets/logo_home.svg" alt="Mytsuri" />
          </Link>
          <div className="home-header-actions">
            <button type="button" className="icon-btn" aria-label="검색"><SearchIcon /></button>
            <button type="button" className="icon-btn" aria-label="알림"><NotificationIcon /></button>
          </div>
        </header>
      </div>

      <main className="home-main">
        <section className="banner-slider">
          <div className="banner-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {BANNER_SLIDES.map((slide) => (
              <div key={slide.id} className="banner-slide">
                <img src={slide.image} alt={slide.title} />
                <div className="banner-overlay">
                  <h2 className="banner-title">{slide.title}</h2>
                  <p className="banner-subtitle">{slide.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="banner-dots">
            {BANNER_SLIDES.map((_, i) => (
              <button key={i} type="button" className={`banner-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} aria-label={`${i + 1}번 슬라이드`} />
            ))}
          </div>
        </section>

        <section className="category-section">
          <div className="category-scroll">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} type="button" className="category-item">
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
            <button type="button" className="section-more" aria-label="더보기"><ArrowIcon /></button>
          </div>
          <div className="festival-scroll">
            {FESTIVAL_CARDS.map((card) => <FestivalCard key={card.id} data={card} />)}
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
            {FESTIVAL_CARDS.map((card) => <FestivalCard key={`r-${card.id}`} data={{ ...card, id: card.id + 10 }} />)}
          </div>
        </section>

        <section className="city-section">
          <h3 className="section-title">어디로 갈까요?</h3>
          <div className="city-scroll">
            {CITIES.map((city) => (
              <button key={city.id} type="button" className="city-item">
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
            {FESTIVAL_CARDS.map((card) => <FestivalCard key={`s-${card.id}`} data={{ ...card, id: card.id + 20 }} />)}
          </div>
        </section>

        <div className="home-bottom-pad" />
      </main>

      <NavigationBar />
    </div>
  )
}

function FestivalCard({ data }) {
  return (
    <article className="festival-card">
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
