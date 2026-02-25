import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import './ListEditFestivals.css'

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

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FC4A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

const DUMMY_LIST = {
  id: 1,
  name: '가고 싶은 여름 축제',
  coverImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
  sharedWith: '야호',
  festivals: [
    { id: 101, title: '타카야마 여름 축제', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400', location: '기후현 타카야마시', date: '2026년 7월', rating: 4.8, reviewCount: 231, bookmarkCount: 124 },
    { id: 102, title: '기온 마츠리', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', location: '교토부 교토시', date: '2026년 7월', rating: 4.6, reviewCount: 189, bookmarkCount: 98 },
    { id: 103, title: '텐진 마쓰리', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', location: '오사카부 오사카시', date: '2026년 7월', rating: 4.5, reviewCount: 156, bookmarkCount: 87 },
    { id: 104, title: '아오모리 네부타', image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400', location: '아오모리현 아오모리시', date: '2026년 8월', rating: 4.9, reviewCount: 312, bookmarkCount: 201 },
  ],
}

function ListEditFestivals() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [listData, setListData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [removed, setRemoved] = useState(new Set())
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchList = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/lists/${id}`, {
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

  const handleXClick = (festivalId) => {
    setPendingDeleteId(festivalId)
    setModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return
    setModalOpen(false)

    try {
      await fetch(`http://localhost:5000/api/lists/${id}/items/${pendingDeleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
    } catch {
      // ignore
    }

    setRemoved((prev) => new Set(prev).add(pendingDeleteId))
    setPendingDeleteId(null)
    setToastMsg('축제가 삭제되었어요')
    setToastVisible(true)
  }

  const handleCancel = () => {
    setModalOpen(false)
    setPendingDeleteId(null)
  }

  const visibleFestivals = (listData?.festivals || []).filter((f) => !removed.has(f.id))

  if (loading) {
    return (
      <div className="lef-page">
        <StatusBar />
        <p className="lef-loading">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="lef-page">
      <StatusBar />

      <div className="lef-cover">
        <img src={listData?.coverImage || ''} alt="" className="lef-cover-img" />
        <div className="lef-cover-gradient" />

        <header className="lef-cover-header">
          <button type="button" className="lef-cover-btn" onClick={() => navigate(`/list/${id}`, { state: { festivalEdited: true } })} aria-label="뒤로">
            <LeftArrowIcon />
          </button>
        </header>

        <div className="lef-cover-info">
          <p className="lef-cover-name">{listData?.name}</p>
          <div className="lef-cover-meta">
            {listData?.sharedWith && (
              <>
                <span className="lef-cover-meta-text">{listData.sharedWith}님과 공유</span>
                <span className="lef-cover-meta-dot" />
              </>
            )}
            <span className="lef-cover-meta-text">{visibleFestivals.length}개의 축제</span>
          </div>
        </div>
      </div>

      <main className="lef-body">
        <div className="lef-festival-list">
          {visibleFestivals.map((item) => (
            <div key={item.id} className="lef-festival-card">
              <div className="lef-festival-card-left">
                <div className="lef-festival-card-image">
                  {item.image ? <img src={item.image} alt={item.title} /> : <div className="lef-festival-card-placeholder" />}
                </div>
                <div className="lef-festival-card-body">
                  <h3 className="lef-festival-card-title">{item.title}</h3>
                  <div className="lef-festival-card-info">
                    <p className="lef-festival-card-row"><LocationIcon /><span>{item.location}</span></p>
                    <p className="lef-festival-card-row"><CalendarIcon /><span>{item.date}</span></p>
                  </div>
                  <div className="lef-festival-card-meta">
                    <span className="lef-festival-card-rating">
                      <img src="/assets/star_icon.svg" alt="" aria-hidden="true" />
                      {item.rating}<span className="lef-festival-card-reviews">({item.reviewCount})</span>
                    </span>
                    <span className="lef-festival-card-bookmark">
                      <img src="/assets/list_icon.svg" alt="" aria-hidden="true" />
                      {item.bookmarkCount}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="lef-festival-card-x"
                onClick={() => handleXClick(item.id)}
                aria-label={`${item.title} 삭제`}
              >
                <CloseIcon />
              </button>
            </div>
          ))}

          {visibleFestivals.length === 0 && (
            <p className="lef-empty">축제가 없습니다</p>
          )}
        </div>
      </main>

      {modalOpen && (
        <div className="lef-modal-overlay" onClick={handleCancel}>
          <div className="lef-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lef-modal-text">
              <p className="lef-modal-title">리스트에서 축제를 삭제할까요?</p>
              <p className="lef-modal-desc">삭제된 축제는 복구할 수 없어요</p>
            </div>
            <div className="lef-modal-actions">
              <button type="button" className="lef-modal-cancel" onClick={handleCancel}>취소</button>
              <button type="button" className="lef-modal-confirm" onClick={handleDeleteConfirm}>삭제하기</button>
            </div>
          </div>
        </div>
      )}

      <div className={`lef-toast ${toastVisible ? 'lef-toast--visible' : ''}`}>
        {toastMsg}
      </div>
    </div>
  )
}

export default ListEditFestivals
