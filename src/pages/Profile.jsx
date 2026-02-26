import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import NavigationBar from '../components/NavigationBar'
import './Profile.css'

function LocationIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FEFFFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function ArrowDownIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FC4A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FC4A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
}

function StarFilled() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FC4A3A" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function StarEmpty() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" strokeWidth="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function DefaultAvatarIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

const DUMMY_USER = {
  name: '홍길동',
  bio: '축제와 여행을 좋아해요이런소개',
  avatar: null,
}

const DUMMY_REVIEWS = [
  { id: 1, festivalName: '타카야마 여름 축제', festivalId: 101, date: '2026.02.15', rating: 4, text: '볼거리도 많고 밤에 진행되는 퍼레이드가 특히 인상적이었어요.' },
  { id: 2, festivalName: '기온 마츠리', festivalId: 102, date: '2026.02.10', rating: 5, text: '교토의 전통을 느낄 수 있는 최고의 축제였어요.' },
  { id: 3, festivalName: '텐진 마쓰리', festivalId: 103, date: '2026.01.28', rating: 4, text: '강 위의 불꽃놀이가 정말 환상적이었습니다.' },
  { id: 4, festivalName: '아오모리 네부타', festivalId: 104, date: '2026.01.15', rating: 5, text: '거대한 등불 퍼레이드가 압도적이었어요. 꼭 다시 가고 싶어요.' },
  { id: 5, festivalName: '삿포로 눈 축제', festivalId: 105, date: '2025.12.20', rating: 3, text: '눈 조각이 아름다웠지만 사람이 너무 많았어요.' },
  { id: 5, festivalName: '삿포로 눈 축제', festivalId: 105, date: '2025.12.20', rating: 3, text: '눈 조각이 아름다웠지만 사람이 너무 많았어요.' },
  { id: 5, festivalName: '삿포로 눈 축제', festivalId: 105, date: '2025.12.20', rating: 3, text: '눈 조각이 아름다웠지만 사람이 너무 많았어요.' },
  { id: 5, festivalName: '삿포로 눈 축제', festivalId: 105, date: '2025.12.20', rating: 3, text: '눈 조각이 아름다웠지만 사람이 너무 많았어요.' },
  { id: 5, festivalName: '삿포로 눈 축제', festivalId: 105, date: '2025.12.20', rating: 3, text: '눈 조각이 아름다웠지만 사람이 너무 많았어요.' },
  { id: 5, festivalName: '삿포로 눈 축제', festivalId: 105, date: '2025.12.20', rating: 3, text: '눈 조각이 아름다웠지만 사람이 너무 많았어요.' },
  { id: 5, festivalName: '삿포로 눈 축제', festivalId: 105, date: '2025.12.20', rating: 3, text: '눈 조각이 아름다웠지만 사람이 너무 많았어요.' },
  { id: 5, festivalName: '삿포로 눈 축제', festivalId: 105, date: '2025.12.20', rating: 3, text: '눈 조각이 아름다웠지만 사람이 너무 많았어요.' },
]

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [reviews, setReviews] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchData = async () => {
      try {
        setLoading(true)
        // 사용자 정보 조회
        let userRes = await fetch('http://localhost:5000/api/users/me', {
          credentials: 'include',
          signal: controller.signal,
        })
        
        // 401이 나면 토큰 갱신 시도
        if (userRes.status === 401) {
          const refreshRes = await fetch('http://localhost:5000/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
            signal: controller.signal,
          })
          
          if (refreshRes.ok) {
            // 토큰 갱신 성공하면 다시 요청
            userRes = await fetch('http://localhost:5000/api/users/me', {
              credentials: 'include',
              signal: controller.signal,
            })
          } else {
            // 토큰 갱신 실패하면 로그인 페이지로
            navigate('/login')
            return
          }
        }
        
        if (!userRes.ok) {
          throw new Error('사용자 정보 조회 실패')
        }
        
        const userData = await userRes.json()
        
        // 리뷰 조회
        const reviewsRes = await fetch('http://localhost:5000/api/users/me/reviews', {
          credentials: 'include',
          signal: controller.signal,
        })
        
        let reviewsData = []
        if (reviewsRes.ok) {
          reviewsData = await reviewsRes.json()
        }

        if (isMounted) {
          setUser({
            name: userData.name || '사용자',
            avatar: userData.profileImg 
              ? (userData.profileImg.startsWith('http') 
                ? userData.profileImg 
                : `http://localhost:5000${userData.profileImg}`)
              : `http://localhost:5000/uploads/profiles/default.svg`,
          })
          setReviews(reviewsData.map((r) => ({
            id: r.id,
            festivalName: r.festivalName,
            festivalId: r.festivalId,
            date: r.date,
            rating: r.rating,
            text: r.content,
          })))
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('프로필 데이터 조회 오류:', err)
        if (isMounted) {
          setUser({ 
            name: '사용자', 
            avatar: `http://localhost:5000/uploads/profiles/default.svg`
          })
          setReviews(DUMMY_REVIEWS)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false; controller.abort() }
  }, [])

  const handleLogout = async () => {
    try {
      // 로그아웃 API 호출 (쿠키 삭제)
      await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
    // 로그아웃 이벤트 발생 (App.jsx의 authStatus 업데이트)
    window.dispatchEvent(new Event('logout'))
    // 로그인 페이지로 이동
    navigate('/login', { replace: true })
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(i < rating ? <StarFilled key={i} /> : <StarEmpty key={i} />)
    }
    return stars
  }

  const displayedReviews = expanded ? reviews : reviews.slice(0, 3)

  if (loading) {
    return (
      <div className="pf-page">
        <div className="pf-status-top"><StatusBar /></div>
        <div className="pf-content">
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>로딩 중...</p>
        </div>
        <NavigationBar />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="pf-page">
        <div className="pf-status-top"><StatusBar /></div>
        <div className="pf-content">
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>사용자 정보를 불러올 수 없습니다</p>
        </div>
        <NavigationBar />
      </div>
    )
  }

  return (
    <div className="pf-page">
      <div className="pf-status-top"><StatusBar /></div>

      <div className="pf-content">
        <section className="pf-user-section">
          <div className="pf-user-left">
            <div className="pf-avatar">
              <img src={user.avatar} alt="" className="pf-avatar-img" />
            </div>
            <div className="pf-user-info">
              <p className="pf-user-name">{user.name}</p>
            </div>
          </div>
          <button type="button" className="pf-edit-btn" onClick={() => navigate('/profile/edit')}>
            <span>편집</span>
            <EditIcon />
          </button>
        </section>

        {reviews.length > 0 && (
          <section className="pf-reviews-card">
            <div className={`pf-reviews-list ${expanded ? 'pf-reviews-list--expanded' : ''}`}>
              {displayedReviews.map((review, idx) => (
                <div key={review.id} className="pf-review-item">
                  {idx > 0 && <div className="pf-review-divider" />}
                  <div className="pf-review-header">
                    <div className="pf-review-festival">
                      <LocationIcon />
                      <span 
                        className="pf-review-festival-name"
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/festival/${review.festivalId}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {review.festivalName}
                      </span>
                    </div>
                    <span className="pf-review-date">{review.date}</span>
                  </div>
                  <div className="pf-review-body">
                    <div className="pf-review-rating">
                      <div className="pf-review-stars">{renderStars(review.rating)}</div>
                      <span className="pf-review-rating-num">{review.rating.toFixed(1)}</span>
                    </div>
                    <p className="pf-review-text">{review.text}</p>
                  </div>
                </div>
              ))}
            </div>
            {reviews.length > 3 && (
              <button type="button" className="pf-view-all-btn" onClick={() => setExpanded((p) => !p)}>
                <span>{expanded ? '접기' : '전체보기'}</span>
                {expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
              </button>
            )}
          </section>
        )}

        <button type="button" className="pf-logout-btn" onClick={handleLogout}>
          <LogoutIcon />
          <span>로그아웃</span>
        </button>
      </div>

      <NavigationBar />
    </div>
  )
}

export default Profile
