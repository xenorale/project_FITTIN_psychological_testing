import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine, Cell } from 'recharts'
import { api } from '../api/client'
import { scales } from '../mock'

type CandidateDetail = {
  id: string
  name: string
  email: string
  position: string
  status: string
  gender: 'm' | 'f'
  completedAt: string | null
  durationMin: number | null
  validity: 'valid' | 'doubtful' | null
  answersDone: number
  answersTotal: number
  profile: any
  raw: any
  interpretation: { code: string; name: string; t: number; text: string }[] | null
}

function initials(name: string) {
  const p = name.split(' ')
  if (p.length >= 2) return p[0][0] + p[1][0]
  return name.slice(0, 2)
}

function tColor(t: number) {
  if (t >= 70) return '#dc4438'
  if (t >= 60) return '#d98200'
  return '#1f9d63'
}

function tLabel(t: number) {
  if (t >= 70) return 'пик'
  if (t >= 60) return 'повышение'
  if (t < 40) return 'снижение'
  return 'норма'
}

function CustomDot(props: any) {
  const { cx, cy, payload } = props
  if (cx === undefined) return null
  const c = tColor(payload.t)
  return (
    <circle cx={cx} cy={cy} r={4} fill="#fff" stroke={c} strokeWidth={2.4} />
  )
}

function TipBox(props: any) {
  if (!props.active || !props.payload || !props.payload.length) return null
  const d = props.payload[0].payload
  return (
    <div style={{ background: '#fff', border: '1px solid #d5d8df', borderRadius: 8, padding: '9px 12px', boxShadow: '0 10px 26px -10px rgba(0,0,0,0.22)' }}>
      <div style={{ fontSize: 12, color: '#6d717a', marginBottom: 3 }}>Шкала {d.code}</div>
      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 15, marginBottom: 7, maxWidth: 205 }}>{d.name}</div>
      <div style={{ display: 'flex', gap: 15 }}>
        <div><span style={{ fontSize: 12, color: '#6d717a' }}>T-балл</span><div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-head)', color: tColor(d.t) }}>{d.t}</div></div>
        <div><span style={{ fontSize: 12, color: '#6d717a' }}>сырой</span><div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-head)' }}>{d.raw}</div></div>
      </div>
    </div>
  )
}

export default function Candidate() {
  const { id } = useParams()
  const nav = useNavigate()
  const [toast, setToast] = useState('')

  const query = useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      const { data } = await api.get<CandidateDetail>(`/api/candidates/${id}`)
      return data
    },
    retry: false
  })

  if (query.isLoading) {
    return <Loader />
  }

  if (query.isError) {
    const status = axios.isAxiosError(query.error) ? query.error.response?.status : undefined
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 15 }}>
        <div style={{ color: 'var(--muted)', fontSize: 15 }}>{status === 404 ? 'Кандидат не найден.' : 'Не удалось загрузить карточку кандидата.'}</div>
        <button className="btn" onClick={() => nav('/dashboard')}>← К списку</button>
      </div>
    )
  }

  if (!query.data) {
    return <Loader />
  }

  const person = query.data

  if (!person.profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 15 }}>
        <div style={{ color: 'var(--muted)', fontSize: 15 }}>Профиль недоступен — тест ещё не завершён.</div>
        <button className="btn" onClick={() => nav('/dashboard')}>← К списку</button>
      </div>
    )
  }

  const chartData = scales.map(s => ({ code: s.code, name: s.name, t: person.profile[s.code], raw: person.raw[s.code] }))
  const clinical = scales.filter(s => s.type === 'clinical')
  const interpretation = person.interpretation || []
  const leading = [...clinical].sort((a, b) => person.profile[b.code] - person.profile[a.code]).slice(0, 3)

  function exportPdf() {
    setToast('Формируем PDF…')
    setTimeout(() => {
      setToast('')
      window.print()
    }, 500)
  }

  const val = person.validity

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="topbar no-print" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '11px 22px', display: 'flex', alignItems: 'center', gap: 13 }}>
          <button className="btn btn-ghost" onClick={() => nav('/dashboard')} style={{ padding: '9px 12px' }}><BackIcon /> Назад</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginLeft: 2 }}>
            <Logo size={28} />
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: '#fff' }}>Карточка результата</div>
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={() => setToast('Ссылка на профиль скопирована')} style={{ padding: '9px 12px' }}><ShareIcon /> Поделиться</button>
          <button className="btn btn-primary" onClick={exportPdf}><DownloadIcon /> Экспорт PDF</button>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '20px 22px 66px' }}>
        <div className="card" style={{ padding: '19px 24px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 62, height: 62, borderRadius: 12, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: '#fff' }}>{initials(person.name)}</div>
          <div style={{ flex: 1, minWidth: 210 }}>
            <h1 style={{ fontSize: 22 }}>{person.name}</h1>
            <div style={{ color: 'var(--muted)', marginTop: 4, fontSize: 12 }}>{person.position} · {person.email}</div>
          </div>
          <div style={{ display: 'flex', gap: 23, flexWrap: 'wrap' }}>
            <Meta label="Пройден" value={person.completedAt || '—'} />
            <Meta label="Длительность" value={person.durationMin + ' мин'} />
            <Meta label="Ответов" value={person.answersDone + ' / ' + person.answersTotal} />
            <Meta label="Форма" value={person.gender === 'f' ? 'женская' : 'мужская'} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 13, marginBottom: 16 }} className="valid-grid">
          <ValidityCard code="L" title="Ложь" t={person.profile.L} desc="социальная желательность" grow={1.05} minw={205} />
          <ValidityCard code="F" title="Достоверность" t={person.profile.F} desc="искренность ответов" grow={1.15} minw={218} />
          <ValidityCard code="K" title="Коррекция" t={person.profile.K} desc="открытость / защита" grow={0.95} minw={198} />
        </div>

        {val === 'doubtful' && (
          <div className="card" style={{ padding: '12px 17px', marginBottom: 21, display: 'flex', alignItems: 'center', gap: 12, borderColor: '#f5dcb0', background: '#fdf7ec' }}>
            <span style={{ color: '#d98200', display: 'flex', flexShrink: 0 }}><WarnIcon /></span>
            <div style={{ fontSize: 12, color: '#8a6516', lineHeight: 1.5 }}>Шкалы достоверности выходят за пределы нормы — к интерпретации профиля стоит относиться с осторожностью, возможна установка на социально одобряемые ответы.</div>
          </div>
        )}

        <div className="card" style={{ padding: '19px 22px 12px', marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 22 }}>Профиль СМИЛ</h2>
              <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 3 }}>T-баллы по шкалам достоверности и базовым клиническим шкалам</p>
            </div>
            <div style={{ display: 'flex', gap: 15, fontSize: 12, color: 'var(--muted)', paddingTop: 5 }}>
              <Legend color="#1f9d63" text="норма 30–70" />
              <Legend color="#d98200" text="порог 70" dash />
              <Legend color="#dc4438" text="пик > 70" />
            </div>
          </div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              {person.status === 'completed' ? (
                <BarChart data={chartData} margin={{ top: 16, right: 10, left: -12, bottom: 4 }} barCategoryGap="20%">
                  <CartesianGrid stroke="#e8eaee" vertical={false} />
                  <ReferenceArea y1={30} y2={70} fill="#1f9d63" fillOpacity={0.06} />
                  <ReferenceLine y={50} stroke="#d5d8df" strokeDasharray="2 4" />
                  <ReferenceLine y={70} stroke="#d98200" strokeOpacity={0.7} strokeDasharray="5 5" />
                  <XAxis dataKey="code" tick={{ fill: '#3a3d44', fontSize: 12, fontFamily: 'Space Grotesk' }} axisLine={{ stroke: '#d5d8df' }} tickLine={false} />
                  <YAxis domain={[20, 110]} ticks={[30, 50, 70, 90, 110]} tick={{ fill: '#6d717a', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip content={<TipBox />} cursor={{ fill: '#ff5a1f', fillOpacity: 0.05 }} />
                  <Bar dataKey="t" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={tColor(entry.t)} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 16, right: 10, left: -12, bottom: 4 }}>
                  <CartesianGrid stroke="#e8eaee" vertical={false} />
                  <ReferenceArea y1={30} y2={70} fill="#1f9d63" fillOpacity={0.06} />
                  <ReferenceLine y={50} stroke="#d5d8df" strokeDasharray="2 4" />
                  <ReferenceLine y={70} stroke="#d98200" strokeOpacity={0.7} strokeDasharray="5 5" />
                  <XAxis dataKey="code" tick={{ fill: '#3a3d44', fontSize: 12, fontFamily: 'Space Grotesk' }} axisLine={{ stroke: '#d5d8df' }} tickLine={false} />
                  <YAxis domain={[20, 110]} ticks={[30, 50, 70, 90, 110]} tick={{ fill: '#6d717a', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip content={<TipBox />} cursor={{ stroke: '#ff5a1f', strokeOpacity: 0.35, strokeWidth: 1 }} />
                  <Line type="monotone" dataKey="t" stroke="#ff5a1f" strokeWidth={2.6} dot={<CustomDot />} activeDot={{ r: 6, fill: '#ff5a1f', stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 336px', gap: 20 }} className="bottom-grid">
          <div className="card" style={{ padding: '18px 20px' }}>
            <h2 style={{ fontSize: 15, marginBottom: 13 }}>Значения по шкалам</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr 46px 46px 76px', gap: 9, fontSize: 12, color: 'var(--muted)', padding: '0 8px 7px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <span>№</span><span>Шкала</span><span style={{ textAlign: 'right' }}>Сырой</span><span style={{ textAlign: 'right' }}>T</span><span></span>
              </div>
              {scales.map(s => {
                const t = person.profile[s.code]
                const c = tColor(t)
                return (
                  <div key={s.code} style={{ display: 'grid', gridTemplateColumns: '26px 1fr 46px 46px 76px', gap: 9, alignItems: 'center', padding: '5px 8px', borderRadius: 6, background: t >= 70 ? '#fdf3f2' : 'transparent' }}>
                    <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: s.type === 'validity' ? 'var(--orange)' : 'var(--muted)' }}>{s.code}</span>
                    <span style={{ fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                    <span style={{ textAlign: 'right', fontSize: 15, color: 'var(--muted)' }}>{person.raw[s.code]}</span>
                    <span style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-head)', color: c }}>{t}</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 4, background: '#eceef1', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: Math.min(100, (t / 110 * 100)) + '%', background: c, borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: '18px 19px' }}>
              <h2 style={{ fontSize: 15, marginBottom: 3 }}>Ведущие шкалы</h2>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 13 }}>Наиболее выраженные черты в профиле</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {leading.map(s => (
                  <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: tColor(person.profile[s.code]), background: '#f4f5f7', border: '1px solid var(--line)' }}>{s.code}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>T = {person.profile[s.code]} · {tLabel(person.profile[s.code])}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '18px 19px' }}>
              <h2 style={{ fontSize: 15, marginBottom: 11 }}>Резюме достоверности</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderRadius: 8, border: '1px solid ' + (val === 'valid' ? '#bfe6d0' : '#f5dcb0'), background: val === 'valid' ? '#e7f6ee' : '#fdf7ec' }}>
                <span style={{ color: val === 'valid' ? '#1f9d63' : '#d98200', display: 'flex' }}>{val === 'valid' ? <ShieldOk /> : <WarnIcon />}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: val === 'valid' ? '#1f9d63' : '#8a6516' }}>{val === 'valid' ? 'Профиль достоверен' : 'Достоверность под вопросом'}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>по соотношению шкал L / F / K</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px 22px', marginTop: 22 }}>
          <h2 style={{ fontSize: 22, marginBottom: 4 }}>Текстовая интерпретация</h2>
          <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 17 }}>Автоматически по повышенным шкалам профиля. Не является клиническим диагнозом.</p>

          {interpretation.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 15 }}>Выраженных пиков (T &gt; 70) в профиле нет — усреднённый, сглаженный тип реагирования без явных акцентуаций.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }} className="interp-grid">
              {interpretation.map(item => (
                <div key={item.code} style={{ padding: '15px 17px', borderRadius: 8, border: '1px solid var(--line)', background: '#fafbfc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: '#dc4438', background: '#fbeceb' }}>{item.code}</span>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-head)', color: '#dc4438' }}>T {item.t}</span>
                  </div>
                  <p style={{ fontSize: 15, color: '#4a4d54', lineHeight: 1.55 }}>{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 26, fontSize: 12, color: '#9498a0', textAlign: 'center' }}>Методика СМИЛ (Л.Н. Собчик) · T-баллы сверены с эталоном psytests.org · сформировано автоматически</div>
      </div>

      {toast !== '' && (
        <div className="no-print" style={{ position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 200, padding: '11px 19px', borderRadius: 9, background: '#1d1f24', color: '#fff', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 12px 34px -12px rgba(0,0,0,0.4)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5a1f' }} />
          <span style={{ fontSize: 15 }}>{toast}</span>
        </div>
      )}
    </div>
  )
}

function Meta(props: any) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{props.label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-head)' }}>{props.value}</div>
    </div>
  )
}

function ValidityCard(props: any) {
  const t = props.t
  const c = tColor(t)
  const ok = t >= 30 && t < 70
  return (
    <div className="card" style={{ flex: props.grow + ' 1 auto', minWidth: props.minw, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 22, color: c, background: '#f4f5f7', border: '1px solid var(--line)' }}>{props.code}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{props.title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{props.desc}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-head)', color: c, lineHeight: 1 }}>{t}</div>
        <div style={{ fontSize: 12, color: ok ? '#1f9d63' : '#d98200', marginTop: 4, fontWeight: 600 }}>{ok ? 'в норме' : 'вне нормы'}</div>
      </div>
    </div>
  )
}

function Legend(props: any) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 15, height: props.dash ? 0 : 3, borderRadius: 3, background: props.dash ? 'transparent' : props.color, borderTop: props.dash ? '2px dashed ' + props.color : 'none' }} />
      {props.text}
    </span>
  )
}

function Loader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <span style={{ width: 26, height: 26, border: '3px solid #e2e4e9', borderTopColor: 'var(--orange)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Загружаем карточку кандидата…</div>
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

function BackIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="19" y1="12" x2="5" y2="12" strokeLinecap="round" /><polyline points="12 19 5 12 12 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function DownloadIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" /><polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" /></svg>
}
function ShareIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" strokeLinecap="round" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" strokeLinecap="round" /></svg>
}
function WarnIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinejoin="round" /><line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" /></svg>
}
function ShieldOk() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
