import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import './Notification.css'

const NOTIFICATIONS = [
  { id: 1, type: 'list', title: '리스트 관련 알람', body: '저장한 리스트에 새로운 축제가 추가되었어요.', time: '10분 전' },
  { id: 2, type: 'festival', title: '내축제 관련 알람', body: '북마크한 축제가 곧 시작됩니다. 일정을 확인해보세요!', time: '1시간 전' },
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
                  <h3 className="notification-item-title">{item.title}</h3>
                  <p className="notification-item-text">{item.body}</p>
                  <span className="notification-item-time">{item.time}</span>
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
