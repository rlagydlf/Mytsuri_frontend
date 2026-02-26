import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const initializeGoogle = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

      if (!clientId) {
        console.error('VITE_GOOGLE_CLIENT_ID is not set')
        return
      }

      if (!window.google?.accounts?.id) {
        console.error('Google 라이브러리 로드 중...')
        setTimeout(initializeGoogle, 100)
        return
      }

      // Google 초기화
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse
      })
    }

    initializeGoogle()
  }, [])

  const handleCredentialResponse = async (response) => {
    const idToken = response?.credential

    if (!idToken) {
      setErrorMessage('Google 토큰을 받지 못했습니다.')
      setIsLoading(false)
      return
    }

    console.log('Google 토큰 받음:', idToken.substring(0, 20) + '...')

    try {
      const result = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ idToken })
      })

      const data = await result.json().catch(() => ({}))

      console.log('서버 응답:', data)

      if (!result.ok) {
        setErrorMessage(data?.message || '로그인에 실패했습니다.')
        setIsLoading(false)
        return
      }

      // 쿠키에 JWT가 자동으로 저장되므로 별도 저장 불필요
      console.log('로그인 성공:', data)
      
      // 사용자 데이터 확인 (온보딩 완료 여부)
      try {
        const userRes = await fetch('http://localhost:5000/api/users/me', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (userRes.ok) {
          const userData = await userRes.json()
          console.log('사용자 데이터:', userData)
          
          // 온보딩 완료 여부 확인 (name이 있으면 프로필 정보가 저장된 것으로 판단)
          if (userData.onboardingCompleted || userData.name || userData.region) {
            // 온보딩 완료 - 홈으로 이동
            console.log('온보딩 완료된 사용자 - 홈으로 이동')
            window.history.replaceState(null, '', '/')
            window.location.href = '/'
          } else {
            // 온보딩 미완료 - 온보딩으로 이동
            console.log('온보딩 미완료 - 온보딩으로 이동')
            window.history.replaceState(null, '', '/onboarding')
            window.location.href = '/onboarding'
          }
        } else {
          // 사용자 데이터 조회 실패 - 안전하게 온보딩으로 이동
          window.history.replaceState(null, '', '/onboarding')
          window.location.href = '/onboarding'
        }
      } catch (err) {
        console.error('사용자 데이터 조회 오류:', err)
        // 에러 발생시 안전하게 온보딩으로 이동
        window.history.replaceState(null, '', '/onboarding')
        window.location.href = '/onboarding'
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      setErrorMessage('서버와 통신할 수 없습니다.')
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    console.log('구글 로그인 버튼 클릭')
    setErrorMessage('')
    setIsLoading(true)

    if (!window.google?.accounts?.id) {
      setErrorMessage('Google 로그인 스크립트를 불러오지 못했습니다.')
      setIsLoading(false)
      return
    }

    try {
      // 프롬프트 표시
      window.google.accounts.id.prompt((notification) => {
        console.log('프롬프트 알림:', notification)
        
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.error('프롬프트 표시 실패:', notification)
          setErrorMessage('구글 로그인 팝업을 열 수 없습니다.')
          setIsLoading(false)
        }
      })
    } catch (error) {
      console.error('프롬프트 오류:', error)
      setErrorMessage('로그인 팝업을 열 수 없습니다.')
      setIsLoading(false)
    }
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