import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Home from './pages/Home'
import MapPage from './pages/Map'
import List from './pages/List'
import Profile from './pages/Profile'
import FestivalList from './pages/FestivalList'
import Notification from './pages/Notification'
import Search from './pages/Search'

function App() {
  const location = useLocation()
  const [authStatus, setAuthStatus] = useState('loading')

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const refreshToken = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          signal: controller.signal
        })
        return res.ok
      } catch (error) {
        return false
      }
    }

    const checkAuth = async () => {
      setAuthStatus('loading')

      try {
        // 쿠키 기반 세션
        let res = await fetch('http://localhost:5000/api/users/me', {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal
        })

        // 401 에러면 토큰 갱신 시도
        if (res.status === 401) {
          console.log('토큰 만료, 갱신 시도...')
          const refreshed = await refreshToken()
          
          if (refreshed) {
            // 토큰 갱신 성공 - 다시 요청
            res = await fetch('http://localhost:5000/api/users/me', {
              method: 'GET',
              credentials: 'include',
              signal: controller.signal
            })
          }
        }

        if (!isMounted) return
        setAuthStatus(res.ok ? 'authed' : 'guest')
      } catch (error) {
        if (error.name === 'AbortError') return
        if (isMounted) {
          setAuthStatus('guest')
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [location.pathname])

  if (authStatus === 'loading') {
    return (
      <div className="page-placeholder" role="status" aria-live="polite">
        <h1>로딩 중...</h1>
        <p>로그인 상태를 확인하고 있어요.</p>
      </div>
    )
  }

  const isLoggedIn = authStatus === 'authed'

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />} />
      <Route path="/map" element={isLoggedIn ? <MapPage /> : <Navigate to="/login" replace />} />
      <Route path="/list" element={isLoggedIn ? <List /> : <Navigate to="/login" replace />} />
      <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" replace />} />
      <Route path="/notifications" element={isLoggedIn ? <Notification /> : <Navigate to="/login" replace />} />
      <Route path="/search" element={isLoggedIn ? <Search /> : <Navigate to="/login" replace />} />
      <Route path="/festivals" element={isLoggedIn ? <FestivalList /> : <Navigate to="/login" replace />} />
      <Route path="/festivals/city/:cityId" element={isLoggedIn ? <FestivalList /> : <Navigate to="/login" replace />} />
      <Route path="/festivals/:category" element={isLoggedIn ? <FestivalList /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default App
