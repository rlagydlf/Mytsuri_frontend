import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import './ListInvite.css'

function LeftArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function LocationIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
}

function CalendarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
    </svg>
  )
}

const DUMMY_LIST = {
  id: 1,
  name: '가고 싶은 여름 축제',
  coverImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
  ownerName: '야호',
  festivals: [
    { id: 101, title: '타카야마 여름 축제', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400', location: '기후현 타카야마시', date: '2026년 7월', rating: 4.8, reviewCount: 231, bookmarkCount: 124 },
    { id: 102, title: '기온 마츠리', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', location: '교토부 교토시', date: '2026년 7월', rating: 4.6, reviewCount: 189, bookmarkCount: 98 },
    { id: 103, title: '텐진 마쓰리', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', location: '오사카부 오사카시', date: '2026년 7월', rating: 4.5, reviewCount: 156, bookmarkCount: 87 },
    { id: 104, title: '아오모리 네부타', image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400', location: '아오모리현 아오모리시', date: '2026년 8월', rating: 4.9, reviewCount: 312, bookmarkCount: 201 },
  ],
}

function ListInvite() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [listData, setListData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [currentUserId, setCurrentUserId] = useState(null)
  const [collaborators, setCollaborators] = useState([])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchData = async () => {
      try {
        // 사용자 정보 조회
        const userRes = await fetch('http://localhost:5000/api/users/me', {
          credentials: 'include',
          signal: controller.signal,
        })
        let userId = null
        if (userRes.ok) {
          const userData = await userRes.json()
          userId = userData.userId
          if (isMounted) setCurrentUserId(userId)
        }

        // 리스트 조회
        const res = await fetch(`http://localhost:5000/api/lists/${id}`, {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (isMounted) {
          setListData(data)
          setCollaborators(data.collaborators || [])
        }
      } catch (e) {
        if (e.name === 'AbortError') return
        if (isMounted) {
          console.error('Failed to fetch:', e)
          setListData(null)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false; controller.abort() }
  }, [id])

  useEffect(() => {
    if (!toastVisible) return
    const timer = setTimeout(() => setToastVisible(false), 2500)
    return () => clearTimeout(timer)
  }, [toastVisible])

  const handleInvite = async () => {
    if (!email.trim()) {
      setToastMsg('이메일을 입력해주세요')
      setToastVisible(true)
      return
    }

    try {
      setInviting(true)
      const res = await fetch(`http://localhost:5000/api/lists/${id}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim() })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '초대 실패')
      }

      const result = await res.json()
      setToastMsg('초대를 보냈습니다')
      setToastVisible(true)
      setEmail('')
      
      // 협력자 목록 다시 불러오기
      const listRes = await fetch(`http://localhost:5000/api/lists/${id}`, {
        credentials: 'include',
      })
      if (listRes.ok) {
        const data = await listRes.json()
        setCollaborators(data.collaborators || [])
      }
    } catch (err) {
      setToastMsg(err.message || '초대에 실패했습니다')
      setToastVisible(true)
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/lists/${id}/collaborators/${collaboratorId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) throw new Error()

      setToastMsg('협력자를 제거했습니다')
      setToastVisible(true)
      
      // 협력자 목록 업데이트
      setCollaborators(collaborators.filter(c => {
        const userId = c.user_id?._id || c.user_id
        return userId !== collaboratorId
      }))
    } catch (err) {
      setToastMsg('협력자 제거에 실패했습니다')
      setToastVisible(true)
    }
  }

  if (loading) {
    return (
      <div className="li-page">
        <StatusBar />
        <p className="li-loading">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="li-page">
      <StatusBar />

      <header className="li-header">
        <button type="button" className="li-back-btn" onClick={() => navigate(-1)} aria-label="뒤로">
          <LeftArrowIcon />
        </button>
        <h1 className="li-header-title">친구 초대</h1>
      </header>

      <main className="li-main">
        <section className="li-section">
          <h2 className="li-section-title">이메일로 초대</h2>
          <div className="li-invite-form">
            <input 
              type="email" 
              className="li-email-input" 
              placeholder="이메일 주소 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
            />
            <button 
              type="button" 
              className="li-invite-btn" 
              onClick={handleInvite}
              disabled={inviting}
            >
              {inviting ? '초대 중...' : '초대'}
            </button>
          </div>
        </section>

        {collaborators.length > 0 && (
          <section className="li-section">
            <h2 className="li-section-title">협력자 목록</h2>
            <div className="li-collaborator-list">
              {collaborators.map((collaborator) => (
                <div key={collaborator.user_id?._id || collaborator.user_id} className="li-collaborator-item">
                  <div className="li-collaborator-info">
                    <p className="li-collaborator-name">
                      {collaborator.user_id?.nickname || '사용자'}
                      {collaborator.user_id?.email && ` (${collaborator.user_id.email})`}
                    </p>
                    <p className="li-collaborator-role">
                      {collaborator.status === 'pending' ? '대기 중' : '수락됨'} · {collaborator.role === 'editor' ? '편집 가능' : '보기만'}
                    </p>
                  </div>
                  {listData?.user_id === currentUserId && (
                    <button 
                      type="button" 
                      className="li-remove-btn" 
                      onClick={() => handleRemoveCollaborator(collaborator.user_id?._id || collaborator.user_id)}
                    >
                      제거
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {toastVisible && (
        <div className="li-toast">
          {toastMsg}
        </div>
      )}
    </div>
  )
}

export default ListInvite
