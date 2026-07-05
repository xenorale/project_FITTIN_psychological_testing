import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Candidate from './pages/Candidate'

function isAuthed() {
  return localStorage.getItem('hr_token') ? true : false
}

function Protected(props: any) {
  if (!isAuthed()) {
    return <Navigate to="/" replace />
  }
  return props.children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/candidate/:id" element={<Protected><Candidate /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
