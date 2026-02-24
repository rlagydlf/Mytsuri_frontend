import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import './ProfileEdit.css'

function LeftArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#070707" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const DUMMY_PROFILE = {
  name: '김미림',
  gender: '여성',
  age: '21',
  avatar: null,
}

function ProfileEdit() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [name, setName] = useState(DUMMY_PROFILE.name)
  const [gender, setGender] = useState(DUMMY_PROFILE.gender)
  const [age, setAge] = useState(DUMMY_PROFILE.age)
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
    e.target.value = ''
  }

  const canSave = name.trim().length > 0

  const handleSave = async () => {
    if (!canSave) return

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

    navigate('/profile')
  }

  return (
    <div className="ped-page">
      <StatusBar />

      <header className="ped-header">
        <button type="button" className="ped-back-btn" onClick={() => navigate('/profile')} aria-label="뒤로">
          <LeftArrowIcon />
        </button>
        <h1 className="ped-title">프로필 편집</h1>
        <div className="ped-header-spacer" />
      </header>

      <main className="ped-body">
        <div className="ped-avatar-wrap">
          <div className="ped-avatar">
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="ped-avatar-img" />
            ) : null}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="ped-file-input"
            onChange={handleImageChange}
          />
          <button type="button" className="ped-avatar-camera" onClick={() => fileInputRef.current?.click()} aria-label="사진 변경">
            <CameraIcon />
          </button>
        </div>

        <div className="ped-fields">
          <div className="ped-field">
            <label className="ped-field-label">이름</label>
            <div className="ped-input-wrap">
              <input
                type="text"
                className="ped-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
              />
              {name.trim() && <CheckIcon />}
            </div>
          </div>

          <div className="ped-field">
            <label className="ped-field-label">성별</label>
            <div className="ped-gender-wrap">
              <button
                type="button"
                className={`ped-gender-btn ${gender === '여성' ? 'ped-gender-btn--active' : ''}`}
                onClick={() => setGender('여성')}
              >
                여성
              </button>
              <button
                type="button"
                className={`ped-gender-btn ${gender === '남성' ? 'ped-gender-btn--active' : ''}`}
                onClick={() => setGender('남성')}
              >
                남성
              </button>
            </div>
          </div>

          <div className="ped-field">
            <label className="ped-field-label">나이</label>
            <div className="ped-input-wrap">
              <input
                type="text"
                className="ped-input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                autoComplete="off"
                inputMode="numeric"
              />
              {age.trim() && <CheckIcon />}
            </div>
          </div>
        </div>

        <button
          type="button"
          className={`ped-save-btn ${canSave ? 'ped-save-btn--active' : ''}`}
          onClick={handleSave}
        >
          확인
        </button>
      </main>
    </div>
  )
}

export default ProfileEdit
