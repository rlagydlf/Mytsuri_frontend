import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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

function ListDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = location.pathname === '/list/new'
  const festivalId = location.state?.festivalId
  const fileInputRef = useRef(null)

  const [selectedImage, setSelectedImage] = useState(null)
  const [listName, setListName] = useState('')
  const [isPublic, setIsPublic] = useState(true)

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
