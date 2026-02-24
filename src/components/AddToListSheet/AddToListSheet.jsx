import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './AddToListSheet.css'

const DUMMY_LISTS = [
  { id: 1, name: '여름 축제', sharedWith: '오후의홍차와 공유', count: 32, thumbnail: null },
  { id: 2, name: '겨울 축제', sharedWith: null, count: 15, thumbnail: null },
  { id: 3, name: '가고 싶은 곳', sharedWith: null, count: 8, thumbnail: null },
  { id: 4, name: '북마크', sharedWith: null, count: 24, thumbnail: null },
  { id: 5, name: 'ㅇㅇ', sharedWith: null, count: 24, thumbnail: null },
  { id: 6, name: 'ㄴㄴ', sharedWith: null, count: 24, thumbnail: null },
  { id: 7, name: '북ㅁㅁ마크', sharedWith: null, count: 24, thumbnail: null },
  { id: 8, name: '북마ㅁㅁㅁㅁㅁㅁ크', sharedWith: null, count: 24, thumbnail: null },  
]

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function AddToListSheet({ isOpen, onClose, festivalId, festivalImages = [], addedToList = false }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleAddToList = (listId) => {
    // TODO: API call to add festival to list
    onClose()
  }

  const handleNewList = () => {
    onClose()
    navigate('/list/new', { state: { festivalId, festivalImages } })
  }

  if (!isOpen) return null

  return (
    <div className="add-to-list-backdrop" onClick={handleBackdropClick}>
      <div className="add-to-list-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="add-to-list-handle" aria-hidden />

        <div className="add-to-list-header">
          <h3 className="add-to-list-title">리스트</h3>
          <button type="button" className="add-to-list-new-btn" onClick={handleNewList}>
            새 리스트
            <PlusIcon />
          </button>
        </div>

        {addedToList && (
          <p className="add-to-list-added-msg" role="status">
            리스트에 추가되었습니다.
          </p>
        )}

        <div className="add-to-list-content">
          {DUMMY_LISTS.map((list) => (
            <button
              key={list.id}
              type="button"
              className="add-to-list-item"
              onClick={() => handleAddToList(list.id)}
            >
              <div className="add-to-list-item-thumb" />
              <div className="add-to-list-item-body">
                <span className="add-to-list-item-name">{list.name}</span>
                <span className="add-to-list-item-meta">
                  {list.sharedWith ? `${list.sharedWith} · ` : ''}{list.count}개
                </span>
              </div>
              <span className="add-to-list-item-plus">
                <PlusIcon />
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

export default AddToListSheet
