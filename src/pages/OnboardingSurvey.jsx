import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import './OnboardingSurvey.css'

const QUESTIONS = [
  {
    title: '어떤 분위기의\n축제를 좋아하세요?',
    options: ['조용하고 여유로운 축제', '활기차고 사람 많은 축제', '감성적인 분위기의 축제', '체험·참여형 축제'],
  },
  {
    title: '축제에서 가장\n중요한 건 무엇인가요?',
    options: ['퍼레이드, 공연 등 볼거리', '먹거리', '사진 찍기 좋은 공간', '체험 프로그램'],
  },
  {
    title: '사람이 많은 축제는\n어떤 편이세요?',
    options: ['좋아해요', '괜찮아요', '되도록 피하고 싶어요'],
  },
  {
    title: '보통 누구와 함께\n축제에 가시나요?',
    options: ['혼자', '친구', '연인', '가족'],
  },
]

function LeftArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OnboardingSurvey() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null))

  const current = QUESTIONS[step]
  const selected = answers[step]
  const canNext = selected !== null

  const handleSelect = (idx) => {
    const next = [...answers]
    next[step] = idx
    setAnswers(next)
  }

  const handleNext = async () => {
    if (!canNext) return
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      const payload = QUESTIONS.map((q, i) => ({
        question: q.title.replace('\n', ' '),
        answer: q.options[answers[i]],
      }))
      try {
        await fetch('http://localhost:5000/api/users/me/survey', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ survey: payload }),
        })
      } catch {
        // ignore
      }
      navigate('/', { replace: true })
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    } else {
      navigate(-1)
    }
  }

  const handleSkip = () => {
    navigate('/', { replace: true })
  }

  return (
    <div className="osv-page">
      <StatusBar />

      <div className="osv-header">
        <button type="button" className="osv-back-btn" onClick={handleBack} aria-label="이전">
          <LeftArrowIcon />
        </button>
        <div className="osv-progress">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`osv-dot ${i === step ? 'osv-dot--active' : ''}`}
            />
          ))}
        </div>
        <button type="button" className="osv-skip-btn" onClick={handleSkip}>건너뛰기</button>
      </div>

      <main className="osv-main">
        <div className="osv-content">
          <h1 className="osv-title">
            {current.title.split('\n').map((line, i) => (
              <span key={i}>{line}{i < current.title.split('\n').length - 1 && <br />}</span>
            ))}
          </h1>

          <div className="osv-options">
            {current.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                className={`osv-option ${selected === i ? 'osv-option--selected' : ''}`}
                onClick={() => handleSelect(i)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={`osv-next-btn ${canNext ? 'osv-next-btn--active' : ''}`}
          onClick={handleNext}
          disabled={!canNext}
        >
          다음
        </button>
      </main>
    </div>
  )
}

export default OnboardingSurvey
