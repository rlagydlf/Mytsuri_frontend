import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    setErrorMessage('')

    if (!clientId) {
      setErrorMessage('VITE_GOOGLE_CLIENT_ID가 설정되지 않았어요.')
      return
    }

    if (!window.google?.accounts?.id) {
      setErrorMessage('구글 로그인 스크립트를 불러오지 못했어요.')
      return
    }

    setIsLoading(true)

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        const idToken = response?.credential

        if (!idToken) {
          setIsLoading(false)
          setErrorMessage('ID 토큰을 받지 못했어요.')
          return
        }

        try {
          const result = await fetch('http://localhost:5000/api/auth/google', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ idToken })
          })

          const data = await result.json().catch(() => null)

          if (!result.ok) {
            setErrorMessage(data?.message || '로그인에 실패했어요.')
            return
          }

          console.log('로그인 성공', data)
          navigate('/', { replace: true })
        } catch (error) {
          console.error(error)
          setErrorMessage('서버와 통신할 수 없어요.')
        } finally {
          setIsLoading(false)
        }
      }
    })

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setIsLoading(false)
        setErrorMessage('구글 로그인 팝업을 열 수 없어요.')
      }
    })
  }

  return (
    <div className="login-page">
      <div className="login-content">
        <div className="login-logo">
          <img src="/assets/logo_login.svg" alt="Mytsuri 로고" />
        </div>
        <div className="login-title">
          <img src="/assets/title.svg" alt="Mytsuri" />
        </div>
        <button
          type="button"
          className="google-login-btn"
          onClick={handleGoogleLogin}
          aria-label="구글 계정으로 로그인"
          aria-busy={isLoading}
          disabled={isLoading}
        >
          <GoogleIcon />
          <span>{isLoading ? '로그인 중...' : '구글 계정으로 로그인'}</span>
        </button>
        {errorMessage ? (
          <p className="login-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
      <div className="login-safe-area" aria-hidden="true" />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default Login