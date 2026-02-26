import { useState, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import './ReviewWrite.css'

const KEYWORD_CATEGORIES = [
  {
    title: '분위기/감성',
    tags: ['현지 느낌이 잘 나요', '사진 찍기 좋아요', '야경이 예뻐요', '가족과 함께 좋아요'],
  },
  {
    title: '즐길거리',
    tags: ['체험 프로그램이 많아요', '먹거리가 다양해요', '전통 행사를 볼 수 있어요', '노점이 많아요'],
  },
  {
    title: '편의/접근성',
    tags: ['교통이 편리해요', '화장실이 깨끗해요', '주차가 편해요', '소규모에요'],
  },
]

function BackArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function StarIcon({ filled }) {
  return <img src={filled ? '/assets/star_icon_g.svg' : '/assets/star_icon_b.svg'} alt="" width={40} height={40} />
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#616161" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function ReviewWrite() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()

  const [rating, setRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState([])
  const [reviewText, setReviewText] = useState('')
  const [selectedImages, setSelectedImages] = useState([])
  const [fileObjects, setFileObjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const toggleTag = (tag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag)
      if (prev.length >= 5) return prev
      return [...prev, tag]
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      if (selectedImages.length < 4) {
        const url = URL.createObjectURL(file)
        setSelectedImages((prev) => [...prev, url])
        setFileObjects((prev) => [...prev, file])
      }
    }
    e.target.value = ''
  }

  const removeImage = (index) => {
    setSelectedImages((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
    setFileObjects((prev) => prev.filter((_, i) => i !== index))
  }

  const canSubmit = rating > 0

  const handleSubmit = async () => {
    if (!canSubmit || loading) return

    setLoading(true)
    setError('')

    try {
      // 사진을 base64로 변환
      const images = []
      for (const file of fileObjects) {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
        images.push(base64)
      }

      // 리뷰 데이터 생성
      const reviewData = {
        rating,
        tags: selectedTags,
        body: reviewText.trim(),
        images
      }

      console.log('리뷰 데이터:', reviewData)

      // 서버에 리뷰 전송
      const res = await fetch(`http://localhost:5000/api/festivals/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(reviewData)
      })

      console.log('서버 응답 상태:', res.status, res.statusText)

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        console.error('서버 에러:', errData)
        throw new Error(errData.msg || `리뷰 작성에 실패했습니다. (상태: ${res.status})`)
      }

      const result = await res.json()
      console.log('리뷰 작성 성공:', result)

      // 성공 - 축제 상세 페이지로 이동 (리뷰 탭으로)
      navigate(`/festival/${id}`, { 
        state: { from: 'review', reviewWritten: true }
      })
    } catch (err) {
      console.error('리뷰 작성 오류:', err)
      setError(err.message || '리뷰를 작성하지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="review-write-page">
      <div className="review-write-top-fixed">
        <StatusBar />
        <header className="review-write-header">
          <button type="button" className="review-write-header-btn" onClick={() => navigate('/')} aria-label="뒤로">
            <BackArrowIcon />
          </button>
          <button type="button" className="review-write-header-btn" onClick={() => navigate(`/festival/${id}`, { state: location.state })} aria-label="닫기">
            <CloseIcon />
          </button>
        </header>
      </div>

      <main className="review-write-main">
        <section className="review-write-section review-write-rating-section">
          <h2 className="review-write-heading">축제는 어떠셨나요?</h2>
          <div className="review-write-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" className="review-write-star-btn" onClick={() => setRating(star)} aria-label={`${star}점`}>
                <StarIcon filled={star <= rating} />
              </button>
            ))}
          </div>
        </section>

        <section className="review-write-section review-write-keywords-section">
          <div className="review-write-keywords-header">
            <h2 className="review-write-heading">어떤 점이 좋으셨나요?</h2>
            <p className="review-write-sub">축제에 어울리는 키워드를 1~5개 골라주세요</p>
          </div>
          <div className="review-write-keywords-scroll">
            <div className="review-write-keywords-columns">
              {KEYWORD_CATEGORIES.map((cat) => (
                <div key={cat.title} className="review-write-keyword-col">
                  <span className="review-write-keyword-cat">{cat.title}</span>
                  <div className="review-write-keyword-tags">
                    {cat.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`review-write-tag ${selectedTags.includes(tag) ? 'review-write-tag--active' : ''}`}
                        onClick={() => toggleTag(tag)}
                      >
                        <span className="review-write-tag-emoji">🔍</span>
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="review-write-section review-write-text-section">
          <div className="review-write-text-header">
            <h2 className="review-write-heading">더 자세히 남겨볼까요?</h2>
            <p className="review-write-sub">더 자세히 남기고 싶다면 자유롭게 더 적어주세요!</p>
          </div>

          <div className="review-write-photo-and-text">
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
            <div className="review-write-photos">
              {selectedImages.length < 4 && (
                <button type="button" className="review-write-photo-btn" onClick={() => fileInputRef.current?.click()}>
                  <PlusIcon />
                </button>
              )}
              {selectedImages.map((src, i) => (
                <div key={i} className="review-write-photo-thumb">
                  <img src={src} alt={`첨부 ${i + 1}`} />
                  <button type="button" className="review-write-photo-remove" onClick={() => removeImage(i)} aria-label="삭제">×</button>
                </div>
              ))}
            </div>

            <div className="review-write-textarea-wrap">
              <textarea
                className="review-write-textarea"
                placeholder="자세한 후기를 입력해볼까요?"
                maxLength={500}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <span className={`review-write-textarea-count ${reviewText.length > 0 ? 'review-write-textarea-count--active' : ''}`}>{reviewText.length}/500자</span>
            </div>
          </div>
        </section>

        {error && (
          <div className="review-write-error" role="alert">
            {error}
          </div>
        )}

        <button
          type="button"
          className={`review-write-submit ${canSubmit ? 'review-write-submit--active' : ''}`}
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
        >
          {loading ? '작성 중...' : '완료'}
        </button>
      </main>
    </div>
  )
}

export default ReviewWrite