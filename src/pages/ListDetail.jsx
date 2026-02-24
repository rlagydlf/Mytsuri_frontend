import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import './ListDetail.css'

function LeftArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function LocationIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
}

function CalendarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}

function PlusSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function InviteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function DownArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
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

function BookmarkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  )
}

const DUMMY_LIST_DETAIL = {
  id: 1,
  name: '가고 싶은 여름 축제',
  coverImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
  sharedWith: '야호',
  isPublic: true,
  festivals: [
    { id: 101, title: '타카야마 여름 축제', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400', location: '기후현 타카야마시', date: '2026년 7월', rating: 4.8, reviewCount: 231, bookmarkCount: 124 },
    { id: 102, title: '기온 마츠리', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', location: '교토부 교토시', date: '2026년 7월', rating: 4.6, reviewCount: 189, bookmarkCount: 98 },
    { id: 103, title: '텐진 마쓰리', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', location: '오사카부 오사카시', date: '2026년 7월', rating: 4.5, reviewCount: 156, bookmarkCount: 87 },
    { id: 104, title: '아오모리 네부타', image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400', location: '아오모리현 아오모리시', date: '2026년 8월', rating: 4.9, reviewCount: 312, bookmarkCount: 201 },
  ],
}

function ListDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const isNew = location.pathname === '/list/new'
  const isDetail = !!id && !isNew
  const festivalId = location.state?.festivalId
  const fileInputRef = useRef(null)

  const [selectedImage, setSelectedImage] = useState(null)
  const [listName, setListName] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const [listData, setListData] = useState(null)
  const [listLoading, setListLoading] = useState(false)
  const [sortKey, setSortKey] = useState('newest')
  const [moreOpen, setMoreOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMsg, setToastMsg] = useState('리스트에 축제가 추가되었어요')
  const moreRef = useRef(null)
  const sortRef = useRef(null)
  const moreBtnRef = useRef(null)
  const sortBtnRef = useRef(null)
  const moreDropRef = useRef(null)
  const sortDropRef = useRef(null)
  const [morePos, setMorePos] = useState({ top: 0, right: 0 })
  const [sortPos, setSortPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        moreRef.current && !moreRef.current.contains(e.target) &&
        (!moreDropRef.current || !moreDropRef.current.contains(e.target))
      ) setMoreOpen(false)
      if (
        sortRef.current && !sortRef.current.contains(e.target) &&
        (!sortDropRef.current || !sortDropRef.current.contains(e.target))
      ) setSortOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (location.state?.festivalAdded) {
      setToastMsg('리스트에 축제가 추가되었어요')
      setToastVisible(true)
      window.history.replaceState({}, '')
    }
    if (location.state?.listEdited) {
      setToastMsg('리스트가 수정되었어요')
      setToastVisible(true)
      window.history.replaceState({}, '')
    }
    if (location.state?.festivalEdited) {
      setToastMsg('축제가 편집되었어요')
      setToastVisible(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  useEffect(() => {
    if (!toastVisible) return
    const timer = setTimeout(() => setToastVisible(false), 2500)
    return () => clearTimeout(timer)
  }, [toastVisible])

  useEffect(() => {
    if (!isDetail) return
    let isMounted = true
    const controller = new AbortController()

    const fetchList = async () => {
      setListLoading(true)
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
        if (isMounted) setListData(DUMMY_LIST_DETAIL)
      } finally {
        if (isMounted) setListLoading(false)
      }
    }

    fetchList()
    return () => { isMounted = false; controller.abort() }
  }, [id, isDetail])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(URL.createObjectURL(file))
    }
    e.target.value = ''
  }

  const handlePhotoAreaClick = () => {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    return () => {
      if (selectedImage) URL.revokeObjectURL(selectedImage)
    }
  }, [selectedImage])

  const handleBackOrComplete = () => {
    if (festivalId) {
      navigate(`/festival/${festivalId}`, { state: { openAddToList: true, addedToList: true } })
    } else {
      navigate(-1)
    }
  }

  const handleNext = () => {
    if (isNew && listName.trim()) {
      // TODO: API call to create list with selectedImage, listName, isPublic, festivalId
    }
    handleBackOrComplete()
  }

  const SORT_OPTIONS = [
    { key: 'newest', label: '최신 추가 순' },
    { key: 'oldest', label: '오래 전 추가 순' },
    { key: 'rating', label: '별점 순' },
  ]

  const sortedFestivals = (() => {
    if (!listData?.festivals) return []
    const arr = [...listData.festivals]
    if (sortKey === 'oldest') return arr.reverse()
    if (sortKey === 'rating') return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    return arr
  })()

  if (isDetail) {
    return (
      <div className="list-detail-page list-detail-page--view">
        <StatusBar />

        <div className="ld-cover">
          <img src={listData?.coverImage || ''} alt="" className="ld-cover-img" />
          <div className="ld-cover-gradient" />

          <header className="ld-cover-header">
            <button type="button" className="ld-cover-btn" onClick={() => navigate('/list')} aria-label="뒤로">
              <LeftArrowIcon />
            </button>
            <div className="ld-cover-header-right" ref={moreRef}>
              <button ref={moreBtnRef} type="button" className="ld-cover-btn" aria-label="더보기" onClick={() => {
                setSortOpen(false)
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

          <div className="ld-cover-info">
            <p className="ld-cover-name">{listData?.name}</p>
            <div className="ld-cover-meta">
              {listData?.sharedWith && (
                <>
                  <span className="ld-cover-meta-text">{listData.sharedWith}님과 공유</span>
                  <span className="ld-cover-meta-dot" />
                </>
              )}
              <span className="ld-cover-meta-text">{listData?.festivals?.length || 0}개의 축제</span>
            </div>
          </div>
        </div>

        <div className="ld-actions">
          <button type="button" className="ld-action-btn" onClick={() => navigate(`/list/${id}/add`)}>
            축제 추가
            <PlusSmallIcon />
          </button>
          <button type="button" className="ld-action-btn" onClick={async () => {
            const url = `${window.location.origin}/list/${id}/invite`
            if (navigator.share) {
              try { await navigator.share({ title: listData?.name || '리스트 초대', url }) } catch { /* cancelled */ }
            } else {
              try { await navigator.clipboard.writeText(url); setToastMsg('초대 링크가 복사되었어요'); setToastVisible(true) } catch { /* ignore */ }
            }
          }}>
            친구 초대
            <InviteIcon />
          </button>
        </div>

        <main className="ld-body">
          <div className="ld-sort-wrap" ref={sortRef}>
            <button
              ref={sortBtnRef}
              type="button"
              className="ld-sort-btn"
              onClick={() => {
                setMoreOpen(false)
                if (!sortOpen && sortBtnRef.current) {
                  const r = sortBtnRef.current.getBoundingClientRect()
                  setSortPos({ top: r.bottom + 4, left: r.left })
                }
                setSortOpen((p) => !p)
              }}
            >
              <span>{SORT_OPTIONS.find((o) => o.key === sortKey)?.label}</span>
              <DownArrowIcon />
            </button>
          </div>

          {listLoading && <p className="list-detail-empty">불러오는 중...</p>}

          <div className="ld-festival-list">
            {sortedFestivals.map((item) => (
              <div
                key={item.id}
                className="ld-festival-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/festival/${item.id}`)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/festival/${item.id}`)}
              >
                <div className="ld-festival-card-image">
                  {item.image ? <img src={item.image} alt={item.title} /> : <div className="ld-festival-card-placeholder" />}
                </div>
                <div className="ld-festival-card-body">
                  <h3 className="ld-festival-card-title">{item.title}</h3>
                  <div className="ld-festival-card-info">
                    <p className="ld-festival-card-row"><LocationIcon /><span>{item.location}</span></p>
                    <p className="ld-festival-card-row"><CalendarIcon /><span>{item.date}</span></p>
                  </div>
                  <div className="ld-festival-card-meta">
                    <span className="ld-festival-card-rating">
                      <img src="/assets/star_icon.svg" alt="" aria-hidden />
                      {item.rating}<span className="ld-festival-card-reviews">({item.reviewCount})</span>
                    </span>
                    <span className="ld-festival-card-bookmark">
                      <img src="/assets/list_icon.svg" alt="" aria-hidden />
                      {item.bookmarkCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {moreOpen && (
          <div ref={moreDropRef} className="ld-dropdown" style={{ top: morePos.top, right: morePos.right }}>
            <button type="button" className="ld-dropdown-item ld-dropdown-item--first" onClick={() => { setMoreOpen(false); navigate(`/list/${id}/edit`) }}>리스트 편집</button>
            <button type="button" className="ld-dropdown-item" onClick={() => { setMoreOpen(false); navigate(`/list/${id}/edit-festivals`) }}>축제 편집</button>
            <button type="button" className="ld-dropdown-item ld-dropdown-item--last" onClick={async () => {
              setMoreOpen(false)
              const url = `${window.location.origin}/list/${id}/invite`
              if (navigator.share) {
                try { await navigator.share({ title: listData?.name || '리스트 초대', url }) } catch { /* cancelled */ }
              } else {
                try { await navigator.clipboard.writeText(url); setToastMsg('초대 링크가 복사되었어요'); setToastVisible(true) } catch { /* ignore */ }
              }
            }}>친구 초대하기</button>
          </div>
        )}

        {sortOpen && (
          <div ref={sortDropRef} className="ld-dropdown" style={{ top: sortPos.top, left: sortPos.left }}>
            {SORT_OPTIONS.map((opt, i) => (
              <button
                key={opt.key}
                type="button"
                className={`ld-dropdown-item ${i === 0 ? 'ld-dropdown-item--first' : ''} ${i === SORT_OPTIONS.length - 1 ? 'ld-dropdown-item--last' : ''} ${sortKey === opt.key ? 'ld-dropdown-item--active' : ''}`}
                onClick={() => { setSortKey(opt.key); setSortOpen(false) }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div className={`ld-toast ${toastVisible ? 'ld-toast--visible' : ''}`}>
          {toastMsg}
        </div>
      </div>
    )
  }

  return (
    <div className="list-detail-page">
      <div className="list-detail-top-fixed"> 
        <StatusBar />
      </div>

      <main className="list-detail-main">
        {isNew && (
          <>
            <section className="list-detail-section list-detail-photo-section">
              <button
                type="button"
                className="list-detail-back-btn"
                onClick={handleBackOrComplete}
                aria-label="뒤로"
              >
                <LeftArrowIcon />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="list-detail-file-input"
                onChange={handleImageChange}
                aria-label="사진 선택"
              />
              <button
                type="button"
                className={`list-detail-photo-picker ${selectedImage ? 'has-image' : ''}`}
                onClick={handlePhotoAreaClick}
              >
                {selectedImage ? (
                  <>
                    <img src={selectedImage} alt="선택된 사진" />
                    <span className="list-detail-photo-overlay" aria-hidden />
                  </>
                ) : (
                  <span className="list-detail-photo-placeholder">
                    <ImageIcon />
                    <span>사진 선택</span>
                  </span>
                )}
              </button>
            </section>

            <section className="list-detail-section">
              <label className="list-detail-label" htmlFor="list-name-input">
              </label>
              <input
                id="list-name-input"
                type="text"
                className="list-detail-input"
                placeholder=""
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                autoComplete="off"
              />
            </section>

            <section className="list-detail-section list-detail-visibility-section">
              <label className="list-detail-label">공개 여부</label>
              <div className="list-detail-visibility">
                <button
                  type="button"
                  className={`list-detail-visibility-option ${isPublic ? 'active' : ''}`}
                  onClick={() => setIsPublic(true)}
                >
                  <span className="list-detail-visibility-content">
                    <span className="list-detail-visibility-label">공개</span>
                    <span className="list-detail-visibility-desc">공개 리스트는 다른 사용자에게도 표시되어요</span>
                  </span>
                  <span className={`list-detail-visibility-check ${isPublic ? 'checked' : ''}`}>{isPublic ? <CheckIcon /> : null}</span>
                </button>
                <button
                  type="button"
                  className={`list-detail-visibility-option ${!isPublic ? 'active' : ''}`}
                  onClick={() => setIsPublic(false)}
                >
                  <span className="list-detail-visibility-content">
                    <span className="list-detail-visibility-label">비공개</span>
                    <span className="list-detail-visibility-desc">비공개 리스트는 나만 확인할 수 있어요</span>
                  </span>
                  <span className={`list-detail-visibility-check ${!isPublic ? 'checked' : ''}`}>{!isPublic ? <CheckIcon /> : null}</span>
                </button>
              </div>
            </section>

            <button
              type="button"
              className={`list-detail-next-btn ${listName.trim() ? 'list-detail-next-btn--active' : ''}`}
              onClick={handleNext}
            >
              완료
            </button>
          </>
        )}
      </main>
    </div>
  )
}

export default ListDetail
