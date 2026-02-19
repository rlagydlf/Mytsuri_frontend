import { useState, useEffect } from 'react'
import './StatusBar.css'

function StatusBar() {
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatTime(new Date()))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="status-bar" role="status" aria-label="상태바">
      <span className="status-bar-time">{time}</span>
      <div className="status-bar-icons">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  )
}

function formatTime(date) {
  const h = date.getHours()
  const m = date.getMinutes()
  return `${h}:${m.toString().padStart(2, '0')}`
}

function SignalIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
      <rect x="0" y="8" width="3" height="4" rx="0.5" fill="currentColor" opacity="0.4" />
      <rect x="4" y="5" width="3" height="7" rx="0.5" fill="currentColor" opacity="0.6" />
      <rect x="8" y="2" width="3" height="10" rx="0.5" fill="currentColor" opacity="0.8" />
      <rect x="12" y="0" width="3" height="12" rx="0.5" fill="currentColor" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4c4.2 0 8 1.7 10.7 4.5l-1.5 1.5c-2.2-2.2-5.2-3.5-9.2-3.5s-7 1.3-9.2 3.5l-1.5-1.5C4 5.7 7.8 4 12 4z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M12 9c2.8 0 5.4 1.1 7.3 3l-1.4 1.4c-1.4-1.4-3.5-2.3-5.9-2.3s-4.5.9-5.9 2.3L4.7 12C6.6 10.1 9.2 9 12 9z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="17" r="2" fill="currentColor" />
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg width="28" height="12" viewBox="0 0 28 12" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="22" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="3" y="3" width="16" height="6" rx="1" fill="currentColor" />
      <rect x="23" y="4" width="2" height="4" rx="0.5" fill="currentColor" />
    </svg>
  )
}

export default StatusBar
