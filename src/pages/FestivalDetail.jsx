import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import StatusBar from '../components/StatusBar'
import AddToListSheet from '../components/AddToListSheet/AddToListSheet'
import './FestivalDetail.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

const DUMMY_DATA = {
  id: 1,
  title: '타카야마 여름 축제',
  subtitle: '불꽃·등불 퍼레이드 전통 축제',
  images: [
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
  ],
  photos: [
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400',
    'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f8?w=400',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400',
    'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400',
    'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=400',
    'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=400',
    'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400',
    'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=400',
    'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=400',
    'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=400',
    'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=400',
  ],
  rating: 4.8,
  reviewCount: 231,
  location: '일본 기후현 다카야마시 시로야마 156',
  lat: 36.1408,
  lng: 137.2523,
  date: '2026년 7월 14일 - 15일',
  time: '09:00 - 22:00',
  description: '화려한 수레와 전통 공연이 어우러진, 일본에서 가장 아름다운 축제 중 하나입니다. 수백 개의 등불로 밝혀진 환상적인 밤 퍼레이드를 통해 진짜 일본 문화를 경험해 보세요.',
  hashtags: ['#여름밤축제', '#불꽃놀이명소', '#다카야마여행'],
  activities: [
    { title: '불꽃놀이', subtitle: '밤하늘을 수놓는 메인 행사', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400' },
    { title: '등불 퍼레이드', subtitle: '등불과 수레가 이어지는 행진', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400' },
  ],
  homepage: 'https://www.takayamafestival.com',
}

const DUMMY_REVIEWS = [
  { id: 1, userName: '홍길동', rating: 4, date: '2026.02.15', tags: ['전통 행사를 볼 수 있어요', '소규모예요', '노점이 많아요'], body: '볼거리도 많고 밤에 진행되는 퍼레이드가 특히 인상적이었어요.\n아이와 어른이 함께 즐길 수 있어서 가족 여행 코스로 추천해요.' },
  { id: 2, userName: '홍길동', rating: 1, date: '2026.02.15', tags: ['전통 행사를 볼 수 있어요', '소규모예요', '노점이 많아요'], body: '볼거리도 많고 밤에 진행되는 퍼레이드가 특히 인상적이었어요.\n아이와 어른이 함께 즐길 수 있어서 가족 여행 코스로 추천해요.' },
  { id: 3, userName: '홍길동', rating: 5, date: '2026.02.15', tags: ['전통 행사를 볼 수 있어요', '소규모예요', '노점이 많아요'], body: '볼거리도 많고 밤에 진행되는 퍼레이드가 특히 인상적이었어요.\n아이와 어른이 함께 즐길 수 있어서 가족 여행 코스로 추천해요.' },
]

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function LocationIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
}

function CalendarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}

function ClockIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
}

function ReviewStarIcon({ filled }) {
  return <img src={filled ? '/assets/star_icon_g.svg' : '/assets/star_icon_b.svg'} alt="" width={20} height={20} />
}

function DownArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function UpArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
}

function PlusSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function NavigationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  )
}

function DirectionsMap({ lat, lng, title, location: locationText }) {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || mapRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 14,
      accessToken: MAPBOX_TOKEN,
    })

    new mapboxgl.Marker({ color: '#FC4A3A' })
      .setLngLat([lng, lat])
      .addTo(map)

    mapRef.current = map

    return () => { map.remove(); mapRef.current = null }
  }, [lat, lng])

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(url, '_blank')
  }

  if (!MAPBOX_TOKEN) {
    return <p className="festival-detail-empty">.env에 VITE_MAPBOX_ACCESS_TOKEN을 추가해주세요.</p>
  }

  return (
    <div className="directions-map-wrapper">
      <div className="directions-map-container" ref={mapContainer} onClick={handleDirections} role="button" tabIndex={0} aria-label="지도 클릭 시 길찾기" />
    </div>
  )
}

const TABS = ['개요', '리뷰', '사진', '가는 길']

function FestivalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('개요')
  const [addToListOpen, setAddToListOpen] = useState(false)
  const [addedToList, setAddedToList] = useState(false)
  const [reviewSortDesc, setReviewSortDesc] = useState(true)

  useEffect(() => {
    if (location.state?.openAddToList) {
      setAddToListOpen(true)
      setAddedToList(!!location.state?.addedToList)
      navigate(location.pathname, { replace: true, state: { from: location.state?.from } })
    }
  }, [location.state?.openAddToList, location.pathname, navigate])

  const data = DUMMY_DATA

  return (
    <div className="festival-detail-page">
      <div className="festival-detail-top-fixed">
        <StatusBar />
        <header className="festival-detail-header">
          <button type="button" className="festival-detail-header-btn" onClick={() => navigate(-1)} aria-label="뒤로">
            <BackIcon />
          </button>
          <div className="festival-detail-header-actions">
            <button type="button" className="festival-detail-header-btn" aria-label="리스트 추가" onClick={() => setAddToListOpen(true)}><BookmarkIcon /></button>
            <button type="button" className="festival-detail-header-btn" onClick={() => navigate('/')} aria-label="닫기"><CloseIcon /></button>
          </div>
        </header>
      </div>

      <main className="festival-detail-main">
        <section className="festival-detail-hero">
          <div className="festival-detail-hero-cards">
            {data.images.map((img, i) => (
              <div key={i} className="festival-detail-hero-card" style={{ background: `url(${img}) lightgray 50% / cover no-repeat` }} />
            ))}
          </div>
        </section>

        <section className="festival-detail-info">
          <div className="festival-detail-title-row">
            <h1 className="festival-detail-title">{data.title}</h1>
            <a href={data.homepage} target="_blank" rel="noopener noreferrer" className="festival-detail-homepage-btn">
              홈페이지
              <ExternalLinkIcon />
            </a>
          </div>
          <p className="festival-detail-subtitle">{data.subtitle}</p>
          <div className="festival-detail-meta-row">
            <span className="festival-detail-rating">
              <img src="/assets/star_icon.svg" alt="" aria-hidden />
              {data.rating} <span className="festival-detail-review-count">({data.reviewCount})</span>
            </span>
          </div>
        </section>

        <nav className="festival-detail-tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              className={`festival-detail-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === '개요' && (
          <div className="festival-detail-overview">
            <div className="festival-detail-details">
              <p className="festival-detail-detail-row"><LocationIcon /><span>{data.location}</span></p>
              <p className="festival-detail-detail-row"><CalendarIcon /><span>{data.date}</span></p>
              <p className="festival-detail-detail-row"><ClockIcon /><span>{data.time}</span></p>
            </div>

            <section className="festival-detail-section">
              <h2 className="festival-detail-section-title">소개</h2>
              <p className="festival-detail-description">{data.description}</p>
              <div className="festival-detail-hashtags">
                {data.hashtags.map((tag) => (
                  <span key={tag} className="festival-detail-hashtag">{tag}</span>
                ))}
              </div>
            </section>

            <section className="festival-detail-section">
              <h2 className="festival-detail-section-title">활동</h2>
              <div className="festival-detail-activities">
                {data.activities.map((act, i) => (
                  <div key={i} className="festival-detail-activity-card">
                    <div className="festival-detail-activity-image">
                      <img src={act.image} alt="" />
                    </div>
                    <div className="festival-detail-activity-overlay">
                      <h3 className="festival-detail-activity-title">{act.title}</h3>
                      <p className="festival-detail-activity-subtitle">{act.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === '리뷰' && (
          <div className="festival-detail-tab-content festival-detail-reviews">
            <div className="review-toolbar">
              <button
                type="button"
                className="review-sort-btn"
                onClick={() => setReviewSortDesc((prev) => !prev)}
                aria-expanded={!reviewSortDesc}
                aria-label={reviewSortDesc ? '최신순 (클릭 시 오래된순)' : '오래된순 (클릭 시 최신순)'}
              >
                <span>최신순</span>
                {reviewSortDesc ? <DownArrowIcon /> : <UpArrowIcon />}
              </button>
              <button type="button" className="review-write-btn" onClick={() => navigate(`/festival/${id}/review`)}>
                리뷰 작성
                <PlusSmallIcon />
              </button>
            </div>

            {DUMMY_REVIEWS.length > 0 ? (
              <div className="review-list">
                {(reviewSortDesc ? [...DUMMY_REVIEWS] : [...DUMMY_REVIEWS].reverse()).map((review, idx, arr) => (
                  <div key={review.id} className="review-item">
                    <div className="review-card">
                      <div className="review-card-top">
                        <span className="review-card-name">{review.userName}</span>
                        <span className="review-card-date">{review.date}</span>
                      </div>
                      <div className="review-card-rating">
                        <span className="review-card-stars">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <ReviewStarIcon key={s} filled={s <= review.rating} />
                          ))}
                        </span>
                        <span className="review-card-score">{review.rating.toFixed(1)}</span>
                      </div>
                      {review.tags && review.tags.length > 0 && (
                        <div className="review-card-tags">
                          {review.tags.map((tag) => (
                            <span key={tag} className="review-card-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      <p className="review-card-body">{review.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="festival-detail-empty">리뷰가 없습니다.</p>
            )}
          </div>
        )}
        {activeTab === '사진' && (
          <div className="festival-detail-tab-content">
            {data.photos && data.photos.length > 0 ? (
              <div className="photo-grid">
                {data.photos.map((src, i) => (
                  <div key={i} className="photo-grid-item">
                    <img src={src} alt={`사진 ${i + 1}`} loading="lazy" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="festival-detail-empty">사진이 없습니다.</p>
            )}
          </div>
        )}
        {activeTab === '가는 길' && (
          <div className="festival-detail-tab-content">
            <DirectionsMap lat={data.lat} lng={data.lng} title={data.title} location={data.location} />
          </div>
        )}

        <div className="festival-detail-bottom-pad" />
      </main>

      <AddToListSheet
        isOpen={addToListOpen}
        onClose={() => { setAddToListOpen(false); setAddedToList(false) }}
        festivalId={id}
        festivalImages={data.images}
        addedToList={addedToList}
      />
    </div>
  )
}

export default FestivalDetail
