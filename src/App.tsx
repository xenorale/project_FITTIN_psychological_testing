import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Candidate from './pages/Candidate'
import TestPage from './pages/TestPage'

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
      <Route path="/test/:inviteToken" element={<TestPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
