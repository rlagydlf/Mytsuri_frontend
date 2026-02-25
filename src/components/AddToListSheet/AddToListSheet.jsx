import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AddToListSheet.css'

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
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingToList, setAddingToList] = useState(null)
  const [successMessage, setSuccessMessage] = useState(false)

  useEffect(() => {
    console.log('AddToListSheet isOpen changed:', isOpen, 'festivalId:', festivalId)
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  // Fetch user's lists when sheet opens
  useEffect(() => {
    if (!isOpen) return

    const fetchLists = async () => {
      try {
        setLoading(true)
        setError(null)
        setSuccessMessage(false)
        console.log('Fetching lists...')
        
        const res = await fetch('http://localhost:5000/api/lists', {
          credentials: 'include'
        })

        if (!res.ok) {
          throw new Error('리스트를 불러오지 못했어요.')
        }

        const data = await res.json()
        console.log('Fetched lists:', data)
        setLists(data)
      } catch (err) {
        console.error('Error fetching lists:', err)
        setError(err.message)
        setLists([])
      } finally {
        setLoading(false)
      }
    }

    fetchLists()
  }, [isOpen])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleAddToList = async (listId) => {
    if (!listId || addingToList) return

    try {
      setAddingToList(listId)
      const res = await fetch(`http://localhost:5000/api/lists/${listId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ festivalId })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.msg || '리스트에 추가하지 못했어요.')
      }

      setSuccessMessage(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingToList(null)
    }
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

        {successMessage && (
          <p className="add-to-list-added-msg" role="status">
            리스트에 추가되었습니다.
          </p>
        )}

        {error && (
          <p className="add-to-list-error-msg" role="alert">
            {error}
          </p>
        )}

        <div className="add-to-list-content">
          {loading ? (
            <p className="add-to-list-loading">로딩 중...</p>
          ) : lists.length === 0 ? (
            <p className="add-to-list-empty">저장한 리스트가 없어요.</p>
          ) : (
            lists.map((list) => (
              <button
                key={list._id || list.id}
                type="button"
                className="add-to-list-item"
                disabled={addingToList === (list._id || list.id)}
                onClick={() => handleAddToList(list._id || list.id)}
              >
                <div className="add-to-list-item-thumb" />
                <div className="add-to-list-item-body">
                  <span className="add-to-list-item-name">{list.name}</span>
                  <span className="add-to-list-item-meta">
                    {list.festivals ? list.festivals.length : 0}개
                  </span>
                </div>
                <span className="add-to-list-item-plus">
                  {addingToList === (list._id || list.id) ? '추가 중...' : <PlusIcon />}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AddToListSheet
