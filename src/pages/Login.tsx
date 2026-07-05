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
    }, 750)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch' }}>
      <div style={{ position: 'fixed', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,92,255,0.35), transparent 65%)', top: -120, left: -80, filter: 'blur(30px)', animation: 'floaty 14s ease-in-out infinite', zIndex: 0 }} />
      <div style={{ position: 'fixed', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.25), transparent 65%)', bottom: -160, right: -100, filter: 'blur(30px)', animation: 'floaty 18s ease-in-out infinite reverse', zIndex: 0 }} />

      <div className="login-left" style={{ flex: 1.15, padding: '58px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1, borderRight: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <img src="/logo.svg" width={44} height={44} alt="logo" />
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>СМИЛ Platform</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>кабинет рекрутера · FITTIN</div>
          </div>
        </div>

        <div style={{ maxWidth: 520 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 13px', borderRadius: 30, border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--muted)', marginBottom: 26 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }} />
            Методика СМИЛ / MMPI · 566 утверждений
          </div>
          <h1 style={{ fontSize: 52, lineHeight: 1.05, fontWeight: 700 }}>
            Психологический<br />профиль кандидата<br />
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }} className="gradient-text">за один вечер</span>
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 22, fontSize: 16, lineHeight: 1.6, maxWidth: 440 }}>
            Отправляйте именные приглашения, отслеживайте прохождение и открывайте готовые профили с T-баллами по всем шкалам — без ручного подсчёта.
          </p>

          <div style={{ display: 'flex', gap: 30, marginTop: 40 }}>
            <Feat icon="chart" title="13 шкал" sub="+ достоверность L/F/K" />
            <Feat icon="shield" title="Сверка" sub="с эталоном psytests" />
            <Feat icon="doc" title="PDF" sub="карточка результата" />
          </div>
        </div>

        <div style={{ fontSize: 12.5, color: '#5a5a6e' }}>© 2026 FITTIN · внутренний инструмент найма</div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', zIndex: 1 }}>
        <form onSubmit={submit} className="glass fade-up" style={{ width: '100%', maxWidth: 400, padding: '38px 34px' }}>
          <h2 style={{ fontSize: 26, marginBottom: 6 }}>Вход в кабинет</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>Доступ только для сотрудников HR</p>

          <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>Рабочая почта</label>
          <input className="field" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@fittin.ru" style={{ marginBottom: 18 }} />

          <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>Пароль</label>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input className="field" type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex' }}>
              {showPass ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {err !== '' && (
            <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 10, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)' }} />{err}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 22, padding: '13px', opacity: loading ? 0.75 : 1 }}>
            {loading ? <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0a0a12', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <>Войти <Arrow /></>}
          </button>

          <div style={{ marginTop: 20, padding: '11px 14px', borderRadius: 11, background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.18)', fontSize: 12.5, color: 'var(--muted)' }}>
            Демо-доступ: любая почта и пароль — данные замоканы.
          </div>
        </form>
      </div>
    </div>
  )
}

function Feat(props: any) {
  return (
    <div>
      <div style={{ width: 42, height: 42, borderRadius: 12, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)', marginBottom: 11, background: 'rgba(255,255,255,0.02)' }}>
        {props.icon === 'chart' && <IconChart />}
        {props.icon === 'shield' && <IconShield />}
        {props.icon === 'doc' && <IconDoc />}
      </div>
      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 15 }}>{props.title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{props.sub}</div>
    </div>
  )
}

function Eye() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" /></svg>
}
function EyeOff() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" /><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" /></svg>
}
function Arrow() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" /><polyline points="12 5 19 12 12 19" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IconChart() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18" strokeLinecap="round" /><path d="M7 14l3-4 3 3 4-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IconShield() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IconDoc() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinejoin="round" /><polyline points="14 2 14 8 20 8" strokeLinejoin="round" /><line x1="8" y1="13" x2="16" y2="13" strokeLinecap="round" /><line x1="8" y1="17" x2="13" y2="17" strokeLinecap="round" /></svg>
}
