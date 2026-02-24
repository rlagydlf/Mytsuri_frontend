import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import './ListInvite.css'

function LeftArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
    </svg>
  )
}

const DUMMY_LIST = {
  id: 1,
  name: '가고 싶은 여름 축제',
  coverImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
  ownerName: '야호',
  festivals: [
    { id: 101, title: '타카야마 여름 축제', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400', location: '기후현 타카야마시', date: '2026년 7월', rating: 4.8, reviewCount: 231, bookmarkCount: 124 },
    { id: 102, title: '기온 마츠리', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', location: '교토부 교토시', date: '2026년 7월', rating: 4.6, reviewCount: 189, bookmarkCount: 98 },
    { id: 103, title: '텐진 마쓰리', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', location: '오사카부 오사카시', date: '2026년 7월', rating: 4.5, reviewCount: 156, bookmarkCount: 87 },
    { id: 104, title: '아오모리 네부타', image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400', location: '아오모리현 아오모리시', date: '2026년 8월', rating: 4.9, reviewCount: 312, bookmarkCount: 201 },
  ],
}

function ListInvite() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [listData, setListData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joined, setJoined] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [morePos, setMorePos] = useState({ top: 0, right: 0 })
  const moreBtnRef = useRef(null)
  const moreRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        moreRef.current && !moreRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchList = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/lists/${id}/invite`, {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (isMounted) setListData(data)
      } catch (e) {
        if (e.name === 'AbortError') return
        if (isMounted) setListData(DUMMY_LIST)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchList()
    return () => { isMounted = false; controller.abort() }
  }, [id])

  useEffect(() => {
    if (!toastVisible) return
    const timer = setTimeout(() => setToastVisible(false), 2500)
    return () => clearTimeout(timer)
  }, [toastVisible])

  const handleJoinConfirm = async () => {
    setModalOpen(false)
    try {
      await fetch(`http://localhost:5000/api/lists/${id}/join`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // ignore
    }
    setJoined(true)
    setToastVisible(true)
  }

  const handleLeave = async () => {
    try {
      await fetch(`http://localhost:5000/api/lists/${id}/leave`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // ignore
    }
    setJoined(false)
  }

  if (loading) {
    return (
      <div className="li-page">
        <StatusBar />
        <p className="li-loading">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="li-page">
      <StatusBar />

      <div className="li-cover">
        <div className="li-cover-img-wrap">
          <img src={listData?.coverImage || ''} alt="" className="li-cover-img" />
          <div className="li-cover-gradient" />
        </div>

        <header className="li-cover-header">
          <button type="button" className="li-cover-btn" onClick={() => navigate(-1)} aria-label="뒤로">
            <LeftArrowIcon />
          </button>
          <div className="li-cover-header-right" ref={moreRef}>
            <button ref={moreBtnRef} type="button" className="li-cover-btn" aria-label="더보기" onClick={() => {
              if (!moreOpen && moreBtnRef.current) {
                const r = moreBtnRef.current.getBoundingClientRect()
                setMorePos({ top: r.bottom + 8, right: window.innerWidth - r.right })
              }
              setMoreOpen((p) => !p)
            }}>
              <MoreIcon />
            </button>
          </div>
        </header>

        <div className="li-cover-bottom">
          <div className="li-cover-info">
            <p className="li-cover-name">{listData?.name}</p>
            <div className="li-cover-meta">
              <span className="li-cover-meta-text">{listData?.ownerName} 님</span>
              <span className="li-cover-meta-dot" />
              <span className="li-cover-meta-text">{listData?.festivals?.length || 0}개의 축제</span>
            </div>
          </div>

          {!joined ? (
            <button type="button" className="li-join-btn" onClick={() => setModalOpen(true)}>
              참여
              <PlusIcon />
            </button>
          ) : (
            <button type="button" className="li-join-btn" onClick={handleLeave}>
              나가기
              <CheckIcon />
            </button>
          )}
        </div>
      </div>

      <main className="li-body">
        <div className="li-festival-list">
          {(listData?.festivals || []).map((item) => (
            <div
              key={item.id}
              className="li-festival-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/festival/${item.id}`)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/festival/${item.id}`)}
            >
              <div className="li-festival-card-image">
                {item.image ? <img src={item.image} alt={item.title} /> : <div className="li-festival-card-placeholder" />}
              </div>
              <div className="li-festival-card-body">
                <h3 className="li-festival-card-title">{item.title}</h3>
                <div className="li-festival-card-info">
                  <p className="li-festival-card-row"><LocationIcon /><span>{item.location}</span></p>
                  <p className="li-festival-card-row"><CalendarIcon /><span>{item.date}</span></p>
                </div>
                <div className="li-festival-card-meta">
                  <span className="li-festival-card-rating">
                    <img src="/assets/star_icon.svg" alt="" aria-hidden />
                    {item.rating}<span className="li-festival-card-reviews">({item.reviewCount})</span>
                  </span>
                  <span className="li-festival-card-bookmark">
                    <img src="/assets/list_icon.svg" alt="" aria-hidden />
                    {item.bookmarkCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {modalOpen && (
        <div className="li-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="li-modal" onClick={(e) => e.stopPropagation()}>
            <div className="li-modal-text">
              <p className="li-modal-title">공유된 리스트에 참가할까요?</p>
              <p className="li-modal-desc">친구와 함께 리스트에 축제를 추가할 수 있어요</p>
            </div>
            <div className="li-modal-actions">
              <button type="button" className="li-modal-cancel" onClick={() => setModalOpen(false)}>취소</button>
              <button type="button" className="li-modal-confirm" onClick={handleJoinConfirm}>참여하기</button>
            </div>
          </div>
        </div>
      )}

      {moreOpen && (
        <div ref={dropdownRef} className="li-dropdown" style={{ top: morePos.top, right: morePos.right }}>
          {joined ? (
            <button type="button" className="li-dropdown-item li-dropdown-item--single" onClick={() => { setMoreOpen(false); handleLeave() }}>나가기</button>
          ) : (
            <button type="button" className="li-dropdown-item li-dropdown-item--single" onClick={() => { setMoreOpen(false); setModalOpen(true) }}>참여하기</button>
          )}
        </div>
      )}

      <div className={`li-toast ${toastVisible ? 'li-toast--visible' : ''}`}>
        리스트에 참여했어요
      </div>
    </div>
  )
}

export default ListInvite
