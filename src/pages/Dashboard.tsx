import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { api } from '../api/client'
import { createInvite } from '../api/invites'
import { Candidate, positionsList } from '../mock'

function initials(name: string) {
  const p = name.split(' ')
  if (p.length >= 2) return p[0][0] + p[1][0]
  return name.slice(0, 2)
}

function statusMeta(s: string) {
  if (s === 'completed') return { label: 'Завершён', color: '#1f9d63', bg: '#e7f6ee', bd: '#bfe6d0' }
  if (s === 'in_progress') return { label: 'Проходит', color: '#2f6feb', bg: '#e8f0fe', bd: '#c5d9fb' }
  if (s === 'invited') return { label: 'Приглашён', color: '#d98200', bg: '#fdf1e0', bd: '#f5dcb0' }
  return { label: 'Просрочен', color: '#dc4438', bg: '#fbeceb', bd: '#f3ccc8' }
}

export default function Dashboard() {
  const nav = useNavigate()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(false)
  const [invName, setInvName] = useState('')
  const [invEmail, setInvEmail] = useState('')
  const [invPos, setInvPos] = useState(positionsList[0])
  const [invGender, setInvGender] = useState<'m' | 'f' | ''>('')
  const [genLink, setGenLink] = useState('')
  const [genToken, setGenToken] = useState('')
  const [genLoading, setGenLoading] = useState(false)
  const [genError, setGenError] = useState('')
  const [copied, setCopied] = useState(false)
  const [invites, setInvites] = useState<{ id: string; candidate: string; position: string; token: string; createdAt: string; used: boolean }[]>([])

  const hrName = localStorage.getItem('hr_name') || 'HR-менеджер'

  const candidatesQuery = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const { data } = await api.get<Candidate[]>('/api/candidates')
      return data
    }
  })

  useEffect(() => {
    if (axios.isAxiosError(candidatesQuery.error) && candidatesQuery.error.response?.status === 401) {
      logout()
    }
  }, [candidatesQuery.error])

  const allCandidates = candidatesQuery.data || []

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

  async function generate() {
    if (invGender === '') return
    setGenLoading(true)
    setGenError('')
    try {
      const result = await createInvite({ candidateName: invName, email: invEmail, position: invPos, gender: invGender })
      setGenToken(result.token)
      setGenLink(window.location.origin + '/test/' + result.token)
      setCopied(false)
      setInvites([{ id: result.token, candidate: invName || '—', position: invPos, token: result.token, createdAt: new Date().toISOString().slice(0, 10), used: false }, ...invites])
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    } catch (error) {
      setGenError('Не удалось создать приглашение')
    } finally {
      setGenLoading(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(genLink)
    setCopied(true)
  }

  function closeModal() {
    setModal(false)
    setGenLink('')
    setGenToken('')
    setInvName('')
    setInvEmail('')
    setInvGender('')
    setGenError('')
    setCopied(false)
  }

  if (candidatesQuery.isLoading) {
    return <Loader />
  }

  if (candidatesQuery.isError) {
    if (axios.isAxiosError(candidatesQuery.error) && candidatesQuery.error.response?.status === 401) {
      return <Loader />
    }
    return <ErrorScreen />
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="topbar" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1236, margin: '0 auto', padding: '11px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Logo size={32} />
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: '#fff' }}>СМИЛ<span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}> / Кабинет HR</span></div>
          </div>

          <div style={{ position: 'relative', flex: 1, maxWidth: 380, marginLeft: 10 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-52%)', color: '#9498a0', display: 'flex' }}><SearchIcon /></span>
            <input className="field" value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по имени, почте, вакансии" style={{ paddingLeft: 36, padding: '8px 12px 8px 36px' }} />
          </div>

          <div style={{ flex: 1 }} />

          <button className="btn btn-primary" onClick={() => setModal(true)}><PlusIcon /> Приглашение</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 6, marginLeft: 3, borderLeft: '1px solid rgba(255,255,255,0.14)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{hrName}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>рекрутер</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff' }}>{initials(hrName)}</div>
            <button className="btn btn-ghost" onClick={logout} style={{ padding: '9px 10px' }} title="Выйти"><LogoutIcon /></button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1236, margin: '0 auto', padding: '20px 22px 62px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 17 }}>
          <h1 style={{ fontSize: 22 }}>Кандидаты</h1>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>{total} записей в базе</span>
        </div>

        <div className="stats-grid" style={{ display: 'flex', gap: 13, marginBottom: 27 }}>
          <Stat label="Всего кандидатов" value={total} icon={<IconUsers />} accent="#3a3d44" grow={1.3} minw={176} px={20} py={16} />
          <Stat label="Завершили тест" value={done} icon={<IconCheck />} accent="#1f9d63" grow={1} minw={154} px={17} py={15} />
          <Stat label="Проходят сейчас" value={going} icon={<IconClock />} accent="#2f6feb" grow={0.9} minw={150} px={16} py={15} />
          <Stat label="Ожидают ответа" value={waiting} icon={<IconMail />} accent="#d98200" grow={1.1} minw={166} px={19} py={17} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 298px', gap: 22 }} className="main-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 13, flexWrap: 'wrap' }}>
              <button className={'tabbtn' + (filter === 'all' ? ' active' : '')} onClick={() => setFilter('all')}>Все <Cnt n={allCandidates.length} active={filter === 'all'} /></button>
              <button className={'tabbtn' + (filter === 'completed' ? ' active' : '')} onClick={() => setFilter('completed')}>Завершены <Cnt n={done} active={filter === 'completed'} /></button>
              <button className={'tabbtn' + (filter === 'in_progress' ? ' active' : '')} onClick={() => setFilter('in_progress')}>Проходят <Cnt n={going} active={filter === 'in_progress'} /></button>
              <button className={'tabbtn' + (filter === 'invited' ? ' active' : '')} onClick={() => setFilter('invited')}>Приглашены <Cnt n={waiting} active={filter === 'invited'} /></button>
              <button className={'tabbtn' + (filter === 'expired' ? ' active' : '')} onClick={() => setFilter('expired')}>Просрочены <Cnt n={allCandidates.filter(c => c.status === 'expired').length} active={filter === 'expired'} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {list.length === 0 && query.trim() !== '' && (
                <div className="card" style={{ padding: '46px 20px 50px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h5" />
                    <polyline points="14 2 14 8 20 8" />
                    <circle cx="16.4" cy="16.4" r="3" />
                    <line x1="18.6" y1="18.6" x2="21.5" y2="21.5" />
                  </svg>
                  <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 15, maxWidth: 300, lineHeight: 1.5 }}>Кандидаты не найдены. Попробуйте изменить запрос</div>
                </div>
              )}
              {list.length === 0 && query.trim() === '' && (
                <div className="card" style={{ padding: '46px 20px 50px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                  </svg>
                  <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 15 }}>В этой вкладке пока нет кандидатов</div>
                </div>
              )}
              {list.map((c, i) => {
                const m = statusMeta(c.status)
                const clickable = c.status === 'completed'
                return (
                  <div key={c.id} onClick={() => openCandidate(c)}
                    className="card"
                    style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 13, cursor: clickable ? 'pointer' : 'default' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fafbfc'; e.currentTarget.style.borderColor = '#d0d3da' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--line)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: '#eef0f3', border: '1px solid #e2e4e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#3a3d44', flexShrink: 0 }}>{initials(c.name)}</div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, fontFamily: 'var(--font-head)', lineHeight: 1.25 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.position} · {c.email}</div>
                    </div>

                    {c.status === 'in_progress' && (
                      <div style={{ width: 118, flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                          <span>{Math.round(c.answersDone / c.answersTotal * 100)}%</span>
                          <span>{c.answersDone}/{c.answersTotal}</span>
                        </div>
                        <div style={{ height: 5, borderRadius: 4, background: '#eceef1', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: (c.answersDone / c.answersTotal * 100) + '%', background: 'var(--orange)', borderRadius: 4 }} />
                        </div>
                      </div>
                    )}

                    {c.validity === 'doubtful' && (
                      <span title="Сомнительная достоверность" style={{ color: '#d98200', display: 'flex' }}><WarnIcon /></span>
                    )}

                    <span className="badge" style={{ color: m.color, background: m.bg, borderColor: m.bd }}>
                      <span className="dot" style={{ background: m.color }} />{m.label}
                    </span>

                    <div style={{ width: 84, textAlign: 'right', flexShrink: 0 }}>
                      {clickable ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--orange)' }}>Профиль <ChevronIcon /></span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#a2a6ae' }}>{c.status === 'invited' ? 'нет данных' : c.status === 'expired' ? 'истекло' : 'не завершён'}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 17 }}>
            <div className="card" style={{ padding: '16px 17px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
                <h3 style={{ fontSize: 15 }}>Активные приглашения</h3>
                <span className="badge" style={{ color: 'var(--muted)', background: '#f2f3f5', borderColor: 'var(--line)' }}>{invites.filter(x => !x.used).length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {invites.slice(0, 6).map(inv => (
                  <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 9px', borderRadius: 8, border: '1px solid var(--line)', background: '#fafbfc' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: '#fff', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange)', flexShrink: 0 }}><LinkIcon /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.25 }}>{inv.candidate}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{inv.position}</div>
                    </div>
                    {inv.used
                      ? <span style={{ fontSize: 12, color: '#1f9d63', fontWeight: 600 }}>открыта</span>
                      : <span style={{ fontSize: 12, color: '#d98200', fontWeight: 600 }}>ждёт</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '17px 18px 16px' }}>
              <h3 style={{ fontSize: 15, marginBottom: 7 }}>Сверка с эталоном</h3>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 13 }}>Последняя сверка T-баллов с psytests.org — без расхождений по 13 шкалам.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 5, borderRadius: 4, background: '#eceef1', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', background: '#1f9d63' }} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1f9d63' }}>13/13</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(20,22,26,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 438, padding: '24px 25px 26px', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 19 }}>
              <div>
                <h2 style={{ fontSize: 22 }}>Новое приглашение</h2>
                <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>Именная одноразовая ссылка для кандидата</p>
              </div>
              <button className="btn" onClick={closeModal} style={{ padding: 8, border: '1px solid var(--line)' }}><CloseIcon /></button>
            </div>

            <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Имя кандидата</label>
            <input className="field" value={invName} onChange={e => setInvName(e.target.value)} placeholder="Иван Иванов" style={{ marginBottom: 13 }} />

            <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Почта</label>
            <input className="field" value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="ivan@example.com" style={{ marginBottom: 13 }} />

            <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Вакансия</label>
            <select value={invPos} onChange={e => setInvPos(e.target.value)} className="field" style={{ marginBottom: 13, cursor: 'pointer' }}>
              {positionsList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Пол кандидата</label>
            <div style={{ display: 'flex', gap: 16, marginBottom: 19 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="gender" checked={invGender === 'm'} onChange={() => setInvGender('m')} /> Мужской
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="gender" checked={invGender === 'f'} onChange={() => setInvGender('f')} /> Женский
              </label>
            </div>

            {genError !== '' && (
              <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{genError}</div>
            )}

            {genLink === '' ? (
              <button className="btn btn-primary" onClick={generate} disabled={invGender === '' || genLoading} style={{ width: '100%', justifyContent: 'center', padding: 11 }}>
                {genLoading
                  ? <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  : <><LinkIcon /> Сгенерировать ссылку</>}
              </button>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="field" readOnly value={genLink} style={{ fontSize: 12, color: '#3a3d44' }} />
                  <button className="btn" onClick={copyLink} style={{ flexShrink: 0, borderColor: copied ? '#bfe6d0' : 'var(--line2)', color: copied ? '#1f9d63' : 'var(--ink)' }}>
                    {copied ? <><CheckSmall /> Готово</> : <><CopyIcon /> Копировать</>}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Токен: <span style={{ fontFamily: 'monospace', color: 'var(--ink)' }}>{genToken}</span></p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 11, lineHeight: 1.5 }}>Ссылка одноразовая и привязана к кандидату. Отправьте её на почту — после прохождения профиль появится в списке.</p>
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
    <div className="card" style={{ flex: props.grow + ' 1 auto', minWidth: props.minw, padding: props.py + 'px ' + props.px + 'px' }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: props.accent, background: '#f2f3f5', border: '1px solid var(--line)', marginBottom: 14 }}>{props.icon}</div>
      <div style={{ fontSize: 22, fontFamily: 'var(--font-head)', fontWeight: 700, lineHeight: 1 }}>{props.value}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{props.label}</div>
    </div>
  )
}

function Cnt(props: any) {
  return (
    <span style={{ fontSize: 12, padding: '0px 6px', borderRadius: 20, background: props.active ? 'rgba(255,255,255,0.25)' : '#eceef1', color: props.active ? '#fff' : 'var(--muted)' }}>{props.n}</span>
  )
}

function Loader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <span style={{ width: 26, height: 26, border: '3px solid #e2e4e9', borderTopColor: 'var(--orange)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Загружаем кандидатов…</div>
    </div>
  )
}

function ErrorScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 15, color: 'var(--muted)' }}>Не удалось загрузить список кандидатов</div>
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

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" /></svg>
}
function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" /><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" /></svg>
}
function LogoutIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" /></svg>
}
function ChevronIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function WarnIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinejoin="round" /><line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" /></svg>
}
function LinkIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function CopyIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function CheckSmall() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" /><line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" /></svg>
}
function IconUsers() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IconCheck() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" /><polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IconClock() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function IconMail() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
