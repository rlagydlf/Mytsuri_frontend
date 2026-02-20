import { useState, useMemo } from 'react'
import './DateSelectSheet.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

function formatDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDisplay(d) {
  return `${d.getMonth() + 1}.${d.getDate()}`
}

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay()
  const days = []
  for (let i = 0; i < startPad; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  return days
}

function DateSelectSheet({ isOpen, onClose, onSelect }) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const calendarDays = useMemo(
    () => getCalendarDays(viewMonth.getFullYear(), viewMonth.getMonth()),
    [viewMonth]
  )

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const maxView = new Date(today.getFullYear(), today.getMonth() + 12, 1)
  const canPrev = viewMonth > new Date(today.getFullYear(), today.getMonth(), 1)
  const canNext = viewMonth < maxView

  const goPrevMonth = () => {
    if (canPrev) setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  }
  const goNextMonth = () => {
    if (canNext) setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
  }

  const isSelectable = (d) => {
    if (!d) return false
    return d >= today
  }

  const maxEndDate = useMemo(() => new Date(today.getFullYear(), today.getMonth() + 12, 0), [today])

  const isInEndRange = (d) => {
    if (!startDate || !d) return false
    const s = new Date(startDate)
    s.setHours(0, 0, 0, 0)
    const dd = new Date(d)
    dd.setHours(0, 0, 0, 0)
    return dd >= s && dd <= maxEndDate
  }

  const handleDayClick = (d) => {
    if (!d || !isSelectable(d)) return
    const dd = new Date(d)
    dd.setHours(0, 0, 0, 0)
    if (!startDate) {
      setStartDate(dd)  // dd 저장 (시간이 0으로 설정됨)
      setEndDate(null)
    } else {
      const s = new Date(startDate)
      s.setHours(0, 0, 0, 0)
      if (dd < s) {
        setStartDate(dd)  // dd 저장 (시간이 0으로 설정됨)
        setEndDate(null)
      } else {
        setEndDate(dd)  // dd 저장 (시간이 0으로 설정됨)
      }
    }
  }

  const getDayClass = (d) => {
    if (!d) return 'date-cal-day date-cal-day--empty'
    const key = formatDateKey(d)
    const selectable = isSelectable(d)
    const inEndRange = startDate && isInEndRange(d)
    const isStart = startDate && formatDateKey(startDate) === key
    const isEnd = endDate && formatDateKey(endDate) === key
    let c = 'date-cal-day'
    if (!selectable) c += ' date-cal-day--disabled'
    if (inEndRange) c += ' date-cal-day--in-range'
    if (isStart) c += ' date-cal-day--start'
    if (isEnd) c += ' date-cal-day--end'
    return c
  }

  const handleComplete = () => {
    if (startDate && endDate) {
      onSelect({ startDate, endDate, label: `${formatDisplay(startDate)} - ${formatDisplay(endDate)}` })
    }
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isOpen) return null

  return (
    <div className="date-sheet-backdrop" onClick={handleBackdropClick}>
      <div className="date-sheet date-sheet--calendar" onClick={(e) => e.stopPropagation()}>
        <div className="date-sheet-handle" aria-hidden />
        <h3 className="date-sheet-title">날짜 선택</h3>

        <div className="date-sheet-content">
          <div className="date-cal-header">
            <button
              type="button"
              className="date-cal-nav"
              onClick={goPrevMonth}
              disabled={!canPrev}
              aria-label="이전 달"
            >
              ‹
            </button>
            <span className="date-cal-month">{year}년 {MONTH_NAMES[month]}</span>
            <button
              type="button"
              className="date-cal-nav"
              onClick={goNextMonth}
              disabled={!canNext}
              aria-label="다음 달"
            >
              ›
            </button>
          </div>

          <div className="date-cal-weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w} className="date-cal-weekday">{w}</span>
            ))}
          </div>

          <div className="date-cal-grid">
            {calendarDays.map((d, i) => (
              <button
                key={d ? formatDateKey(d) : `empty-${i}`}
                type="button"
                className={getDayClass(d)}
                onClick={() => handleDayClick(d)}
                disabled={d && !isSelectable(d)}
              >
                {d ? d.getDate() : ''}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="date-sheet-done-btn"
          onClick={handleComplete}
          disabled={!startDate || !endDate}
        >
          완료
        </button>
      </div>
    </div>
  )
}

export default DateSelectSheet
