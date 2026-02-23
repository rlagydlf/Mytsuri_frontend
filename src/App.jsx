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

    const checkAuth = async () => {
      // 로그인이 필요 없는 페이지는 인증 체크 스킵
      const publicPaths = ['/login', '/festivals', '/list', '/profile', '/notifications']
      const isPublicPage = publicPaths.some(path => location.pathname.startsWith(path))
      
      if (isPublicPage) {
        setAuthStatus('guest')
        return
      }

      setAuthStatus('loading')

      try {
        const accessToken = sessionStorage.getItem('access_token')
        const res = await fetch('http://localhost:5000/api/users/me', {
          method: 'GET',
          credentials: 'include',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          signal: controller.signal
        })

        if (!res.ok && accessToken) {
          sessionStorage.removeItem('access_token')
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
      {/* <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />} />
      <Route path="/map" element={isLoggedIn ? <MapPage /> : <Navigate to="/login" replace />} />
      <Route path="/list" element={<List />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notification />} />
      <Route path="/festivals" element={<FestivalList />} />
      <Route path="/festivals/city/:cityId" element={<FestivalList />} />
      <Route path="/festivals/:category" element={<FestivalList />} />
      <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} /> */}
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/list" element={<List />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notification />} />
      <Route path="/search" element={<Search />} />
      <Route path="/festivals" element={<FestivalList />} />
      <Route path="/festivals/city/:cityId" element={<FestivalList />} />
      <Route path="/festivals/:category" element={<FestivalList />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
