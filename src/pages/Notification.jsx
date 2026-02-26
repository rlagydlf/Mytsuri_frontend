import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import './Notification.css'

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FC4A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  )
}

function Notification() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const res = await fetch('http://localhost:5000/api/notifications', {
          credentials: 'include'
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || '알림을 불러오지 못했습니다')
        }

        const data = await res.json()
        if (isMounted) {
          setNotifications(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || '알림을 불러오지 못했습니다')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchNotifications()

    return () => {
      isMounted = false
    }
  }, [])

  const formatDate = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  }

  const handleNotificationClick = async (notificationId) => {
    if (!notificationId) return
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include'
      })

      if (res.ok) {
        // 알림을 제거하지 않고 isRead 상태 업데이트
        setNotifications((prev) => prev.map((item) => {
          const itemId = item._id || item.id
          if (itemId === notificationId) {
            return { ...item, isRead: true }
          }
          return item
        }))
      }
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err)
    }
  }

  const handleInviteAction = async (notificationId, action) => {
    if (!notificationId || actionLoadingId) return
    setActionLoadingId(notificationId)
    setError('')

    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${notificationId}/${action}`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || '요청에 실패했습니다')
      }

      // 알림을 제거하지 않고 isRead 상태 업데이트
      setNotifications((prev) => prev.map((item) => {
        const itemId = item._id || item.id
        if (itemId === notificationId) {
          return { ...item, isRead: true }
        }
        return item
      }))
    } catch (err) {
      setError(err.message || '요청에 실패했습니다')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="notification-page">
      <div className="notification-top-fixed">
        <StatusBar />
        <header className="notification-header">
          <button type="button" className="notification-back" onClick={() => navigate('/')} aria-label="뒤로">
            <BackIcon />
          </button>
          <h1 className="notification-title">알림</h1>
        </header>
      </div>

      <main className="notification-main">
        {error && <p className="notification-error">{error}</p>}
        {loading ? (
          <div className="notification-empty">
            <p className="notification-empty-text">알림을 불러오는 중입니다</p>
          </div>
        ) : notifications.length > 0 ? (
          <ul className="notification-list">
            {notifications.map((item) => {
              const notificationId = item._id || item.id
              const isInvite = item.type === 'list_invite'
              const isFestivalUpcoming = item.type === 'festival_upcoming'
              const isListFestivalAdded = item.type === 'list_festival_added'
              const isListFestivalRemoved = item.type === 'list_festival_removed'

              return (
              <li
                key={notificationId}
                className="notification-item"
                onClick={() => !isInvite && handleNotificationClick(notificationId)}
                style={{
                  cursor: isInvite ? 'default' : 'pointer',
                  opacity: item.isRead ? 0.5 : 1,
                  transition: 'opacity 0.3s ease'
                }}
              >
                <span 
                  className={`notification-item-icon ${
                    isInvite ? 'notification-item-icon--list' : 
                    isListFestivalAdded ? 'notification-item-icon--list-add' :
                    isListFestivalRemoved ? 'notification-item-icon--list-remove' : ''
                  }`} 
                  aria-hidden
                >
                  {isInvite ? null : isListFestivalAdded ? <ListIcon /> : isListFestivalRemoved ? <TrashIcon /> : <CheckIcon />}
                </span>
                <div className="notification-item-body">
                  <div className="notification-item-row">
                    <h3 className="notification-item-title">{item.title || '알림'}</h3>
                    <span className="notification-item-time">{formatDate(item.created_at || item.updated_at)}</span>
                  </div>
                  <p className="notification-item-text">{item.message}</p>
                  {isInvite && (
                    <div className="notification-item-actions">
                      <button
                        type="button"
                        className="notification-action-btn"
                        onClick={() => handleInviteAction(notificationId, 'accept')}
                        disabled={actionLoadingId === notificationId}
                      >
                        수락
                      </button>
                      <button
                        type="button"
                        className="notification-action-btn notification-action-btn--ghost"
                        onClick={() => handleInviteAction(notificationId, 'reject')}
                        disabled={actionLoadingId === notificationId}
                      >
                        거절
                      </button>
                    </div>
                  )}
                </div>
              </li>
            )})}
          </ul>
        ) : (
          <div className="notification-empty">
            <p className="notification-empty-text">알림이 없습니다</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Notification
