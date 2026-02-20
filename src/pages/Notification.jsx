import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import './Notification.css'

const NOTIFICATIONS = [
  { id: 1, type: 'list', title: '리스트', body: '친구가 새로운 축제를 추가했어요.', time: '2월 20일' },
  { id: 2, type: 'festival', title: '내 축제', body: '내가 찜한 구본오도리가 곧 개최돼요!', time: '1월 30일' },
]

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

function Notification() {
  const navigate = useNavigate()

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
        {NOTIFICATIONS.length > 0 ? (
          <ul className="notification-list">
            {NOTIFICATIONS.map((item) => (
              <li key={item.id} className="notification-item">
                <span className={`notification-item-icon ${item.type === 'list' ? 'notification-item-icon--list' : ''}`} aria-hidden>
                  {item.type === 'list' ? null : <CheckIcon />}
                </span>
                <div className="notification-item-body">
                  <div className="notification-item-row">
                    <h3 className="notification-item-title">{item.title}</h3>
                    <span className="notification-item-time">{item.time}</span>
                  </div>
                  <p className="notification-item-text">{item.body}</p>
                </div>
              </li>
            ))}
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
