import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import './Onboarding.css'

function Onboarding() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')

  const canNext = name.trim().length > 0 && gender !== '' && age.trim().length > 0

  const handleNext = async () => {
    if (!canNext) return
    try {
      await fetch('http://localhost:5000/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim(), gender, age }),
      })
    } catch {
      // ignore
    }
    navigate('/onboarding/survey')
  }

  return (
    <div className="ob-page">
      <StatusBar />

      <main className="ob-main">
        <div className="ob-fields">
          <div className="ob-field">
            <label className="ob-label">이름</label>
            <input
              type="text"
              className={`ob-input ${name ? 'ob-input--filled' : ''}`}
              placeholder="예) 홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="ob-field">
            <label className="ob-label">성별</label>
            <div className="ob-gender-row">
              <button
                type="button"
                className={`ob-gender-btn ${gender === '여성' ? 'ob-gender-btn--active' : ''}`}
                onClick={() => setGender(gender === '여성' ? '' : '여성')}
              >
                여성
              </button>
              <button
                type="button"
                className={`ob-gender-btn ${gender === '남성' ? 'ob-gender-btn--active' : ''}`}
                onClick={() => setGender(gender === '남성' ? '' : '남성')}
              >
                남성
              </button>
            </div>
          </div>

          <div className="ob-field">
            <label className="ob-label">나이</label>
            <input
              type="text"
              className={`ob-input ${age ? 'ob-input--filled' : ''}`}
              placeholder="예) 20"
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>
        </div>

        <button
          type="button"
          className={`ob-next-btn ${canNext ? 'ob-next-btn--active' : ''}`}
          onClick={handleNext}
        >
          다음
        </button>
      </main>
    </div>
  )
}

export default Onboarding
