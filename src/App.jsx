import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Home from './pages/Home'
import MapPage from './pages/Map'
import List from './pages/List'
import Profile from './pages/Profile'
import FestivalList from './pages/FestivalList'
import Notification from './pages/Notification'
import DebugNotification from './pages/DebugNotification'
import Search from './pages/Search'
import FestivalDetail from './pages/FestivalDetail'
import ListDetail from './pages/ListDetail'
import ListAddFestival from './pages/ListAddFestival'
import ListInvite from './pages/ListInvite'
import ListEdit from './pages/ListEdit'
import ListEditFestivals from './pages/ListEditFestivals'
import ProfileEdit from './pages/ProfileEdit'
import Onboarding from './pages/Onboarding'
import OnboardingSurvey from './pages/OnboardingSurvey'
import ReviewWrite from './pages/ReviewWrite'

function App() {
  const [authStatus, setAuthStatus] = useState('loading')

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const refreshToken = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          signal: controller.signal,
        })
        return res.ok
      } catch {
        return false
      }
    }

    const checkAuth = async () => {
      try {
        let res = await fetch('http://localhost:5000/api/users/me', {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
        })

        if (res.status === 401) {
          const refreshed = await refreshToken()
          if (refreshed) {
            res = await fetch('http://localhost:5000/api/users/me', {
              method: 'GET',
              credentials: 'include',
              signal: controller.signal,
            })
          }
        }

        if (!isMounted) return
        setAuthStatus(res.ok ? 'authed' : 'guest')
      } catch (error) {
        if (error.name === 'AbortError') return
        if (isMounted) setAuthStatus('guest')
      }
    }

    checkAuth()

    // 로그아웃 이벤트 리스너
    const handleLogout = () => {
      if (isMounted) {
        setAuthStatus('guest')
      }
    }
    window.addEventListener('logout', handleLogout)

    return () => {
      isMounted = false
      controller.abort()
      window.removeEventListener('logout', handleLogout)
    }
  }, [])

  if (authStatus === 'loading') return null

  const isLoggedIn = authStatus === 'authed'

  return (
    <Routes>
      {/* 인증 불필요 */}
      <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/onboarding/survey" element={<OnboardingSurvey />} />

      {/* 인증 필요 */}
      <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />} />
      <Route path="/map" element={isLoggedIn ? <MapPage /> : <Navigate to="/login" replace />} />
      <Route path="/search" element={isLoggedIn ? <Search /> : <Navigate to="/login" replace />} />
      <Route path="/notifications" element={isLoggedIn ? <Notification /> : <Navigate to="/login" replace />} />
      <Route path="/debug/notifications" element={isLoggedIn ? <DebugNotification /> : <Navigate to="/login" replace />} />

      <Route path="/list" element={isLoggedIn ? <List /> : <Navigate to="/login" replace />} />
      <Route path="/list/new" element={isLoggedIn ? <ListDetail /> : <Navigate to="/login" replace />} />
      <Route path="/list/:id" element={isLoggedIn ? <ListDetail /> : <Navigate to="/login" replace />} />
      <Route path="/list/:id/add" element={isLoggedIn ? <ListAddFestival /> : <Navigate to="/login" replace />} />
      <Route path="/list/:id/invite" element={isLoggedIn ? <ListInvite /> : <Navigate to="/login" replace />} />
      <Route path="/list/:id/edit" element={isLoggedIn ? <ListEdit /> : <Navigate to="/login" replace />} />
      <Route path="/list/:id/edit-festivals" element={isLoggedIn ? <ListEditFestivals /> : <Navigate to="/login" replace />} />

      <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" replace />} />
      <Route path="/profile/edit" element={isLoggedIn ? <ProfileEdit /> : <Navigate to="/login" replace />} />

      <Route path="/festivals" element={isLoggedIn ? <FestivalList /> : <Navigate to="/login" replace />} />
      <Route path="/festivals/city/:cityId" element={isLoggedIn ? <FestivalList /> : <Navigate to="/login" replace />} />
      <Route path="/festivals/:category" element={isLoggedIn ? <FestivalList /> : <Navigate to="/login" replace />} />

      <Route path="/festival/:id" element={isLoggedIn ? <FestivalDetail /> : <Navigate to="/login" replace />} />
      <Route path="/festival/:id/review" element={isLoggedIn ? <ReviewWrite /> : <Navigate to="/login" replace />} />

      {/* 404 - 와일드카드는 반드시 마지막 */}
      <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default App
