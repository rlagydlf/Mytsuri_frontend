import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import NavigationBar from '../components/NavigationBar'
import './FestivalList.css'

const CITY_TABS = [
  { id: 'kyoto', label: '교토' },
  { id: 'osaka', label: '오사카' },
  { id: 'nagoya', label: '나고야' },
  { id: 'tokyo', label: '도쿄' },
  { id: 'fukuoka', label: '후쿠오카' },
]

const SEASON_TABS = [
  { id: 'summer', label: '여름' },
  { id: 'winter', label: '겨울' },
  { id: 'spring', label: '봄' },
  { id: 'autumn', label: '가을' },
  { id: 'food', label: '먹거리' },
  { id: 'local', label: '특산물' },
]

const FESTIVAL_LIST = [
  {
    id: 1,
    title: '아사히카와 겨울 축제',
    location: '아사히카와 동물원',
    date: '2026년 2월 6일~11일',
    rating: 4.4,
    reviewCount: 151,
    bookmarkCount: 102,
    image: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=400',
    season: 'winter',
    city: null,
  },
  {
    id: 2,
    title: '삿포로 겨울 축제',
    location: '삿포로 역 앞 거리 외 2곳',
    date: '2026년 2월 4일~11일',
    rating: 4.8,
    reviewCount: 231,
    bookmarkCount: 124,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    season: 'winter',
    city: null,
  },
  {
    id: 3,
    title: '조잔케이 눈등로',
    location: '삿포로 조잔케이신사',
    date: '2026년 1월 27일~2월 3일',
    rating: 4.8,
    reviewCount: 231,
    bookmarkCount: 124,
    image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a943?w=400',
    season: 'winter',
    city: null,
  },
  {
    id: 4,
    title: '유니시가와 온천 눈 축제',
    location: '토치기현 유니시가와',
    date: '2026년 1월~2월',
    rating: 4.6,
    reviewCount: 89,
    bookmarkCount: 67,
    image: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=400',
    season: 'winter',
    city: null,
  },
  {
    id: 5,
    title: '아오모리 네부타 제',
    location: '아오모리현 아오모리시',
    date: '2026년 8월 2일~7일',
    rating: 4.8,
    reviewCount: 312,
    bookmarkCount: 280,
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400',
    season: 'summer',
    city: null,
  },
  {
    id: 6,
    title: '교토 기온 마츠리',
    location: '교토부 교토시',
    date: '2026년 7월',
    rating: 4.9,
    reviewCount: 445,
    bookmarkCount: 520,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
    season: 'summer',
    city: 'kyoto',
  },
  {
    id: 7,
    title: '나고야 봄 축제',
    location: '나고야성',
    date: '2026년 3월 20일~4월 6일',
    rating: 4.2,
    reviewCount: 126,
    bookmarkCount: 453,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    season: 'spring',
    city: 'nagoya',
  },
  {
    id: 8,
    title: '히타치 해변 공원 코스모스',
    location: '이바라키현 히타치시',
    date: '2026년 9월~10월',
    rating: 4.6,
    reviewCount: 198,
    bookmarkCount: 167,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    season: 'autumn',
    city: null,
  },
  {
    id: 9,
    title: '도쿄 라멘 쇼',
    location: '도쿄 국제전시장',
    date: '2026년 11월',
    rating: 4.5,
    reviewCount: 234,
    bookmarkCount: 189,
    image: 'https://images.unsplash.com/photo-1569718212165-3a2854114a6e?w=400',
    season: 'food',
    city: 'tokyo',
  },
  {
    id: 10,
    title: '야마가타 체리 축제',
    location: '야마가타현',
    date: '2026년 6월',
    rating: 4.7,
    reviewCount: 156,
    bookmarkCount: 98,
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400',
    season: 'local',
    city: null,
  },
  {
    id: 11,
    title: '오사카 덴진 마츠리',
    location: '오사카부 오사카시',
    date: '2026년 7월',
    rating: 4.7,
    reviewCount: 289,
    bookmarkCount: 312,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    season: 'summer',
    city: 'osaka',
  },
  {
    id: 12,
    title: '후쿠오카 하카타 기온',
    location: '후쿠오카현 후쿠오카시',
    date: '2026년 7월',
    rating: 4.8,
    reviewCount: 421,
    bookmarkCount: 398,
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400',
    season: 'summer',
    city: 'fukuoka',
  },
]

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

function FestivalList() {
  const navigate = useNavigate()
  const { category, cityId } = useParams()
  const [activeTab, setActiveTab] = useState(() => {
    if (category && category !== 'categories' && category !== 'city' && SEASON_TABS.some((t) => t.id === category)) {
      return category
    }
    return 'summer'
  })

  useEffect(() => {
    if (category && category !== 'categories' && category !== 'city' && SEASON_TABS.some((t) => t.id === category)) {
      setActiveTab(category)
    }
  }, [category])

  const filteredList = FESTIVAL_LIST.filter((f) => {
    if (cityId) return f.city === cityId
    if (f.season !== activeTab) return false
    return true
  })

  return (
    <div className={`festival-list-page ${cityId ? 'festival-list-page--with-cities' : ''}`}>
      <div className="festival-list-top-fixed">
        <StatusBar />
        <header className="festival-list-header">
          <button type="button" className="festival-list-back" onClick={() => navigate('/')} aria-label="뒤로">
            <BackIcon />
          </button>
        </header>

        {cityId && (
          <div className="festival-list-cities">
            {CITY_TABS.map((city) => (
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

        {!cityId && (
        <div className="festival-list-tabs">
          {SEASON_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`festival-list-tab ${activeTab === tab.id ? 'festival-list-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        )}
      </div>

      <main className="festival-list-main">
        <ul className="festival-list">
          {filteredList.length > 0
            ? filteredList.map((item) => (
                <li key={item.id} className="festival-list-card">
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
            : filteredList.map((item) => (
                <li key={item.id} className="festival-list-card">
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
              ))}
        </ul>
      </main>

      <NavigationBar />
    </div>
  )
}

export default FestivalList
