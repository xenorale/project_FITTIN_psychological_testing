import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { candidates as allCandidates, invites as invitesData, positionsList } from '../mock'

const avatarColors = [
  'linear-gradient(135deg,#7c5cff,#22d3ee)',
  'linear-gradient(135deg,#ff5c9d,#7c5cff)',
  'linear-gradient(135deg,#22d3ee,#37d9a0)',
  'linear-gradient(135deg,#fbbf24,#ff5c9d)',
  'linear-gradient(135deg,#37d9a0,#22d3ee)',
  'linear-gradient(135deg,#8f74ff,#ff5c9d)'
]

function initials(name: string) {
  const p = name.split(' ')
  if (p.length >= 2) return p[0][0] + p[1][0]
  return name.slice(0, 2)
}

function statusMeta(s: string) {
  if (s === 'completed') return { label: 'Завершён', color: '#37d9a0', bg: 'rgba(55,217,160,0.12)', bd: 'rgba(55,217,160,0.3)' }
  if (s === 'in_progress') return { label: 'Проходит', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', bd: 'rgba(34,211,238,0.3)' }
  if (s === 'invited') return { label: 'Приглашён', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', bd: 'rgba(251,191,36,0.3)' }
  return { label: 'Просрочен', color: '#fb6a7e', bg: 'rgba(251,106,126,0.1)', bd: 'rgba(251,106,126,0.28)' }
}

export default function Dashboard() {
  const nav = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(false)
  const [invName, setInvName] = useState('')
  const [invEmail, setInvEmail] = useState('')
  const [invPos, setInvPos] = useState(positionsList[0])
  const [genLink, setGenLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [invites, setInvites] = useState(invitesData)

  const hrName = localStorage.getItem('hr_name') || 'HR-менеджер'

  const total = allCandidates.length
  const done = allCandidates.filter(c => c.status === 'completed').length
  const going = allCandidates.filter(c => c.status === 'in_progress').length
  const waiting = allCandidates.filter(c => c.status === 'invited').length

  let list = allCandidates
  if (filter !== 'all') list = list.filter(c => c.status === filter)
  if (query.trim() !== '') {
    const q = query.toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.position.toLowerCase().includes(q))
  }

  function openCandidate(c: any) {
    if (c.status === 'completed') {
      nav('/candidate/' + c.id)
    }
  }

  function logout() {
    localStorage.removeItem('hr_token')
    localStorage.removeItem('hr_name')
    nav('/')
  }

  function generate() {
    const token = Math.random().toString(36).slice(2, 12)
    const link = 'https://smil.fittin.ru/t/' + token
    setGenLink(link)
    setCopied(false)
    const newInv = { id: 'inv-' + Math.floor(Math.random() * 1000), candidate: invName || '—', position: invPos, token: token, createdAt: '2026-07-05', used: false }
    setInvites([newInv, ...invites])
  }

  function copyLink() {
    navigator.clipboard.writeText(genLink)
    setCopied(true)
  }

  function closeModal() {
    setModal(false)
    setGenLink('')
    setInvName('')
    setInvEmail('')
    setCopied(false)
  }

  function moveGlow(e: any) {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', (e.clientX - r.left) + 'px')
    e.currentTarget.style.setProperty('--my', (e.clientY - r.top) + 'px')
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)', background: 'rgba(7,7,12,0.72)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '15px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <img src="/logo.svg" width={34} height={34} alt="" />
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16.5 }}>СМИЛ<span style={{ color: 'var(--muted)', fontWeight: 500 }}> / HR</span></div>
          </div>

          <div style={{ position: 'relative', flex: 1, maxWidth: 420, marginLeft: 14 }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex' }}><SearchIcon /></span>
            <input className="field" value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по имени, почте, вакансии…" style={{ paddingLeft: 40, padding: '10px 14px 10px 40px' }} />
          </div>

          <div style={{ flex: 1 }} />

          <button className="btn btn-primary" onClick={() => setModal(true)}><PlusIcon /> Приглашение</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 11, paddingLeft: 8, borderLeft: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{hrName}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>рекрутер</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: avatarColors[1], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#0a0a12' }}>{initials(hrName)}</div>
            <button className="btn btn-ghost" onClick={logout} style={{ padding: '9px 11px' }} title="Выйти"><LogoutIcon /></button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '34px 28px 70px' }}>
        <div className="fade-up" style={{ marginBottom: 26 }}>
          <h1 style={{ fontSize: 34 }}>Здравствуйте, <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }} className="gradient-text">{hrName.split(' ')[0]}</span></h1>
          <p style={{ color: 'var(--muted)', marginTop: 7, fontSize: 15 }}>Вот что происходит с вашими кандидатами сегодня, 5 июля.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 30 }} className="stats-grid">
          <Stat label="Всего кандидатов" value={total} accent="#7c5cff" icon={<IconUsers />} sub="за всё время" onMove={moveGlow} />
          <Stat label="Завершили тест" value={done} accent="#37d9a0" icon={<IconCheck />} sub={Math.round(done / total * 100) + '% готовы'} onMove={moveGlow} />
          <Stat label="Проходят сейчас" value={going} accent="#22d3ee" icon={<IconClock />} sub="в процессе" onMove={moveGlow} />
          <Stat label="Ожидают ответа" value={waiting} accent="#fbbf24" icon={<IconMail />} sub="приглашены" onMove={moveGlow} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 22 }} className="main-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <FilterTab active={filter === 'all'} onClick={() => setFilter('all')} label="Все" count={allCandidates.length} />
              <FilterTab active={filter === 'completed'} onClick={() => setFilter('completed')} label="Завершены" count={done} />
              <FilterTab active={filter === 'in_progress'} onClick={() => setFilter('in_progress')} label="Проходят" count={going} />
              <FilterTab active={filter === 'invited'} onClick={() => setFilter('invited')} label="Приглашены" count={waiting} />
              <FilterTab active={filter === 'expired'} onClick={() => setFilter('expired')} label="Просрочены" count={allCandidates.filter(c => c.status === 'expired').length} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {list.length === 0 && (
                <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Ничего не найдено по запросу «{query}»</div>
              )}
              {list.map((c, i) => {
                const m = statusMeta(c.status)
                const clickable = c.status === 'completed'
                return (
                  <div key={c.id} onClick={() => openCandidate(c)} onMouseMove={moveGlow}
                    className="glass spotlight fade-up"
                    style={{ padding: '17px 19px', display: 'flex', alignItems: 'center', gap: 16, cursor: clickable ? 'pointer' : 'default', animationDelay: (i * 0.04) + 's', transition: 'transform 0.22s, border-color 0.22s, box-shadow 0.22s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(124,92,255,0.4)'; e.currentTarget.style.boxShadow = '0 18px 40px -20px rgba(124,92,255,0.6)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 13, background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15.5, color: '#0a0a12', flexShrink: 0 }}>{initials(c.name)}</div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15.5, fontFamily: 'var(--font-head)' }}>{c.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.position} · {c.email}</div>
                    </div>

                    {c.status === 'in_progress' && (
                      <div style={{ width: 128, flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--muted)', marginBottom: 5 }}>
                          <span>{Math.round(c.answersDone / c.answersTotal * 100)}%</span>
                          <span>{c.answersDone}/{c.answersTotal}</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 10, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: (c.answersDone / c.answersTotal * 100) + '%', background: 'linear-gradient(90deg,#22d3ee,#7c5cff)', borderRadius: 10 }} />
                        </div>
                      </div>
                    )}

                    {c.validity === 'doubtful' && (
                      <span title="Сомнительная достоверность" style={{ color: '#fbbf24', display: 'flex' }}><WarnIcon /></span>
                    )}

                    <span className="badge" style={{ color: m.color, background: m.bg, borderColor: m.bd }}>
                      <span className="dot" style={{ background: m.color, boxShadow: '0 0 8px ' + m.color }} />{m.label}
                    </span>

                    <div style={{ width: 108, textAlign: 'right', flexShrink: 0 }}>
                      {clickable ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: 'var(--cyan)' }}>Профиль <ChevronIcon /></span>
                      ) : (
                        <span style={{ fontSize: 12.5, color: '#5a5a6e' }}>{c.status === 'invited' ? 'нет данных' : c.status === 'expired' ? 'истекло' : 'не завершён'}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <h3 style={{ fontSize: 16 }}>Активные приглашения</h3>
                <span className="badge" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>{invites.filter(x => !x.used).length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {invites.slice(0, 5).map(inv => (
                  <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 13, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.015)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--violet)' }}><LinkIcon /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.candidate}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{inv.position}</div>
                    </div>
                    {inv.used
                      ? <span style={{ fontSize: 11.5, color: 'var(--green)' }}>открыта</span>
                      : <span style={{ fontSize: 11.5, color: 'var(--amber)' }}>ждёт</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass spotlight" onMouseMove={moveGlow} style={{ padding: 22, position: 'relative' }}>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>Сверка с эталоном</h3>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 16 }}>Последняя сверка T-баллов с psytests.org прошла без расхождений по всем 13 шкалам.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 7, borderRadius: 10, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg,#37d9a0,#22d3ee)' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>13/13</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(5,5,10,0.66)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} className="glass fade-up" style={{ width: '100%', maxWidth: 460, padding: 30, background: 'var(--panel-solid)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
              <div>
                <h2 style={{ fontSize: 22 }}>Новое приглашение</h2>
                <p style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 5 }}>Именная одноразовая ссылка для кандидата</p>
              </div>
              <button className="btn btn-ghost" onClick={closeModal} style={{ padding: 8 }}><CloseIcon /></button>
            </div>

            <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 7 }}>Имя кандидата</label>
            <input className="field" value={invName} onChange={e => setInvName(e.target.value)} placeholder="Иван Иванов" style={{ marginBottom: 16 }} />

            <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 7 }}>Почта</label>
            <input className="field" value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="ivan@example.com" style={{ marginBottom: 16 }} />

            <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 7 }}>Вакансия</label>
            <select value={invPos} onChange={e => setInvPos(e.target.value)} className="field" style={{ marginBottom: 22, appearance: 'none', cursor: 'pointer' }}>
              {positionsList.map(p => <option key={p} value={p} style={{ background: '#101019' }}>{p}</option>)}
            </select>

            {genLink === '' ? (
              <button className="btn btn-primary" onClick={generate} style={{ width: '100%', justifyContent: 'center', padding: 13 }}><LinkIcon /> Сгенерировать ссылку</button>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: 9 }}>
                  <input className="field" readOnly value={genLink} style={{ fontSize: 13, color: 'var(--cyan)' }} />
                  <button className="btn" onClick={copyLink} style={{ flexShrink: 0, borderColor: copied ? 'rgba(55,217,160,0.5)' : 'var(--border)', color: copied ? 'var(--green)' : 'var(--text)' }}>
                    {copied ? <><CheckSmall /> Готово</> : <><CopyIcon /> Копировать</>}
                  </button>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 12, lineHeight: 1.5 }}>Ссылка одноразовая и привязана к кандидату. Отправьте её на почту — после прохождения профиль появится в списке.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat(props: any) {
  return (
    <div className="glass spotlight" onMouseMove={props.onMove}
      style={{ padding: '20px 21px', position: 'relative', transition: 'transform 0.22s, box-shadow 0.22s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 44px -22px ' + props.accent }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: props.accent, background: props.accent + '1f', border: '1px solid ' + props.accent + '3a' }}>{props.icon}</div>
        <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{props.sub}</span>
      </div>
      <div style={{ fontSize: 36, fontFamily: 'var(--font-head)', fontWeight: 700, lineHeight: 1 }}>{props.value}</div>
      <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 7 }}>{props.label}</div>
    </div>
  )
}

function FilterTab(props: any) {
  return (
    <button onClick={props.onClick} style={{
      padding: '8px 15px', borderRadius: 11, fontSize: 13.5, fontWeight: 600,
      border: '1px solid ' + (props.active ? 'rgba(124,92,255,0.5)' : 'var(--border)'),
      background: props.active ? 'rgba(124,92,255,0.13)' : 'transparent',
      color: props.active ? '#c4b6ff' : 'var(--muted)', transition: 'all 0.2s',
      display: 'inline-flex', alignItems: 'center', gap: 8
    }}>
      {props.label}
      <span style={{ fontSize: 11.5, padding: '1px 7px', borderRadius: 20, background: props.active ? 'rgba(124,92,255,0.2)' : 'rgba(255,255,255,0.06)', color: props.active ? '#c4b6ff' : 'var(--muted)' }}>{props.count}</span>
    </button>
  )
}

function SearchIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" /></svg>
}
function PlusIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" /><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" /></svg>
}
function LogoutIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" /></svg>
}
function ChevronIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function WarnIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinejoin="round" /><line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" /></svg>
}
function LinkIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function CopyIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function CheckSmall() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function CloseIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" /><line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" /></svg>
}
function IconUsers() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IconCheck() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" /><polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IconClock() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IconMail() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
