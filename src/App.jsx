import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Map from './pages/Map'
import List from './pages/List'
import Profile from './pages/Profile'
import FestivalList from './pages/FestivalList'

// import Login from './pages/Login'

function App() {
  const accessToken = localStorage.getItem('accessToken')
  const userId = localStorage.getItem('userId')
  const isLoggedIn = Boolean(accessToken || userId)

  return (
    <Routes>
      {/* <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} /> */}
      {/* <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />} /> */}
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<Map />} />
      <Route path="/list" element={<List />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/festivals" element={<FestivalList />} />
      <Route path="/festivals/:category" element={<FestivalList />} />
      {/* <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} /> */}
    </Routes>
  )
}

export default App
