import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import './ListEdit.css'

function LeftArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FC4A3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const DUMMY_LIST = {
  id: 1,
  name: '가고 싶은 여름 축제',
  coverImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
  isPublic: false,
}

function ListEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const fileInputRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [listName, setListName] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [coverImage, setCoverImage] = useState('')
  const [newImageFile, setNewImageFile] = useState(null)
  const [newImagePreview, setNewImagePreview] = useState(null)

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
        if (isMounted) {
          setListName(data.name || '')
          setIsPublic(data.isPublic !== false)
          setCoverImage(data.coverImage || '')
        }
      } catch (e) {
        if (e.name === 'AbortError') return
        if (isMounted) {
          setListName(DUMMY_LIST.name)
          setIsPublic(DUMMY_LIST.isPublic)
          setCoverImage(DUMMY_LIST.coverImage)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchList()
    return () => { isMounted = false; controller.abort() }
  }, [id])

  useEffect(() => {
    return () => {
      if (newImagePreview) URL.revokeObjectURL(newImagePreview)
    }
  }, [newImagePreview])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setNewImageFile(file)
      setNewImagePreview(URL.createObjectURL(file))
    }
    e.target.value = ''
  }

  const handleSave = async () => {
    if (!listName.trim()) return

    try {
      await fetch(`http://localhost:5000/api/lists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: listName.trim(),
          isPublic,
        }),
      })
    } catch {
      // ignore
    }

    navigate(`/list/${id}`, { state: { listEdited: true } })
  }

  if (loading) {
    return (
      <div className="le-page">
        <StatusBar />
        <p className="le-loading">불러오는 중...</p>
      </div>
    )
  }

  const displayImage = newImagePreview || coverImage

  return (
    <div className="le-page">
      <div className="le-top-fixed">
        <StatusBar />
      </div>

      <main className="le-main">
        <section className="le-photo-section">
          <button type="button" className="le-back-btn" onClick={() => navigate(`/list/${id}`)} aria-label="뒤로">
            <LeftArrowIcon />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="le-file-input"
            onChange={handleImageChange}
          />
          <button type="button" className="le-photo-area" onClick={() => fileInputRef.current?.click()}>
            {displayImage ? (
              <>
                <img src={displayImage} alt="" className="le-photo-img" />
                <span className="le-photo-overlay" />
              </>
            ) : null}
            <span className="le-photo-icon"><ImageIcon /></span>
          </button>
        </section>

        <section className="le-name-section">
          <div className="le-name-field">
            <input
              type="text"
              className="le-name-input"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              autoComplete="off"
            />
          </div>
        </section>

        <section className="le-visibility-section">
          <p className="le-visibility-label">공개 여부</p>

         
          <button
            type="button"
            className={`le-visibility-option ${isPublic ? 'le-visibility-option--active' : ''}`}
            onClick={() => setIsPublic(true)}
          >
            <div className="le-visibility-text">
              <span className={`le-visibility-name ${isPublic ? 'le-visibility-name--active' : ''}`}>공개</span>
              <span className="le-visibility-desc">공개 리스트는 다른 사용자에게도 표시되어요</span>
            </div>
            {isPublic && <CheckIcon />}
          </button>
          <button
            type="button"
            className={`le-visibility-option ${isPublic ? '' : 'le-visibility-option--active'}`}
            onClick={() => setIsPublic(false)}
          >
            <div className="le-visibility-text">
              <span className={`le-visibility-name ${!isPublic ? 'le-visibility-name--active' : ''}`}>비공개</span>
              <span className="le-visibility-desc">비공개 리스트는 나만 확인할 수 있어요</span>
            </div>
            {!isPublic && <CheckIcon />}
          </button>

        </section>

        <button
          type="button"
          className={`le-save-btn ${listName.trim() ? 'le-save-btn--active' : ''}`}
          onClick={handleSave}
        >
          완료
        </button>
      </main>
    </div>
  )
}

export default ListEdit
