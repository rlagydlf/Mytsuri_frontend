import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'

function App() {
  const accessToken = localStorage.getItem('accessToken')
  const userId = localStorage.getItem('userId')
  const isLoggedIn = Boolean(accessToken || userId)

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default App
