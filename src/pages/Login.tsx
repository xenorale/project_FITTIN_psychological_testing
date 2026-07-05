import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('hr@fittin.ru')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  function submit(e: any) {
    e.preventDefault()
    setErr('')
    if (email.trim() === '' || pass.trim() === '') {
      setErr('Введите почту и пароль')
      return
    }
    if (!email.includes('@')) {
      setErr('Похоже, это не почта')
      return
    }
    setLoading(true)
    setTimeout(() => {
      localStorage.setItem('hr_token', 'demo-jwt-token-' + Date.now())
      localStorage.setItem('hr_name', 'Ирина Соловьёва')
      nav('/dashboard')
    }, 500)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 22 }}>
          <Logo size={40} />
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 17 }}>СМИЛ Платформа</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Кабинет рекрутера · FITTIN</div>
          </div>
        </div>

        <form onSubmit={submit} className="card" style={{ padding: '28px 26px' }}>
          <h2 style={{ fontSize: 21, marginBottom: 4 }}>Вход в кабинет</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 24 }}>Только для сотрудников HR-отдела</p>

          <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 7 }}>Рабочая почта</label>
          <input className="field" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@fittin.ru" style={{ marginBottom: 16 }} />

          <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 7 }}>Пароль</label>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input className="field" type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" style={{ paddingRight: 42 }} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex' }}>
              {showPass ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {err !== '' && (
            <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 8, marginBottom: 2 }}>{err}</div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 20, padding: '12px', opacity: loading ? 0.75 : 1 }}>
            {loading ? <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : 'Войти'}
          </button>

          <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 8, background: '#f4f5f7', border: '1px solid var(--line)', fontSize: 12.5, color: 'var(--muted)' }}>
            Демо-доступ: любая почта и пароль.
          </div>
        </form>

        <div style={{ fontSize: 12, color: '#9498a0', textAlign: 'center', marginTop: 18 }}>© 2026 FITTIN · внутренний инструмент найма</div>
      </div>
    </div>
  )
}

function Logo(props: any) {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="56" height="56" rx="14" fill="#ff5a1f" />
      <path d="M14 41 L24 29 L32 37 L42 21 L50 31" stroke="#111214" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="42" cy="21" r="4.2" fill="#111214" />
    </svg>
  )
}

function Eye() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" /></svg>
}
function EyeOff() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" /><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" /></svg>
}
