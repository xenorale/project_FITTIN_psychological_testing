import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts'
import { candidates, scales, interpretations } from '../mock'

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
    <div style={{ background: '#fff', border: '1px solid #d5d8df', borderRadius: 8, padding: '10px 13px', boxShadow: '0 10px 26px -10px rgba(0,0,0,0.22)' }}>
      <div style={{ fontSize: 12, color: '#6d717a', marginBottom: 3 }}>Шкала {d.code}</div>
      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 14, marginBottom: 8, maxWidth: 210 }}>{d.name}</div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div><span style={{ fontSize: 11.5, color: '#6d717a' }}>T-балл</span><div style={{ fontSize: 19, fontWeight: 700, fontFamily: 'var(--font-head)', color: tColor(d.t) }}>{d.t}</div></div>
        <div><span style={{ fontSize: 11.5, color: '#6d717a' }}>сырой</span><div style={{ fontSize: 19, fontWeight: 700, fontFamily: 'var(--font-head)' }}>{d.raw}</div></div>
      </div>
    </div>
  )
}

export default function Candidate() {
  const { id } = useParams()
  const nav = useNavigate()
  const [toast, setToast] = useState('')

  const person = candidates.find(c => c.id === id)

  if (!person || !person.profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ color: 'var(--muted)' }}>Профиль недоступен — тест ещё не завершён.</div>
        <button className="btn" onClick={() => nav('/dashboard')}>← К списку</button>
      </div>
    )
  }

  const chartData = scales.map(s => ({ code: s.code, name: s.name, t: person.profile[s.code], raw: person.raw[s.code] }))
  const clinical = scales.filter(s => s.type === 'clinical')
  const peaks = clinical.filter(s => person.profile[s.code] >= 70).sort((a, b) => person.profile[b.code] - person.profile[a.code])
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
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
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

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '24px 24px 70px' }}>
        <div className="card" style={{ padding: '22px 24px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: '#fff' }}>{initials(person.name)}</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ fontSize: 25 }}>{person.name}</h1>
            <div style={{ color: 'var(--muted)', marginTop: 5, fontSize: 14 }}>{person.position} · {person.email}</div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <Meta label="Пройден" value={person.completedAt || '—'} />
            <Meta label="Длительность" value={person.durationMin + ' мин'} />
            <Meta label="Ответов" value={person.answersDone + ' / ' + person.answersTotal} />
            <Meta label="Форма" value={person.gender === 'f' ? 'женская' : 'мужская'} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 18 }} className="valid-grid">
          <ValidityCard code="L" title="Ложь" t={person.profile.L} desc="социальная желательность" />
          <ValidityCard code="F" title="Достоверность" t={person.profile.F} desc="искренность ответов" />
          <ValidityCard code="K" title="Коррекция" t={person.profile.K} desc="открытость / защита" />
        </div>

        {val === 'doubtful' && (
          <div className="card" style={{ padding: '13px 17px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, borderColor: '#f5dcb0', background: '#fdf7ec' }}>
            <span style={{ color: '#d98200', display: 'flex', flexShrink: 0 }}><WarnIcon /></span>
            <div style={{ fontSize: 13, color: '#8a6516', lineHeight: 1.5 }}>Шкалы достоверности выходят за пределы нормы — к интерпретации профиля стоит относиться с осторожностью, возможна установка на социально одобряемые ответы.</div>
          </div>
        )}

        <div className="card" style={{ padding: '20px 22px 12px', marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 17 }}>Профиль СМИЛ</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 3 }}>T-баллы по шкалам достоверности и базовым клиническим шкалам</p>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: 'var(--muted)', paddingTop: 4 }}>
              <Legend color="#1f9d63" text="норма 30–70" />
              <Legend color="#d98200" text="порог 70" dash />
              <Legend color="#dc4438" text="пик > 70" />
            </div>
          </div>

          <div style={{ width: '100%', height: 330 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 16, right: 12, left: -10, bottom: 4 }}>
                <CartesianGrid stroke="#e8eaee" vertical={false} />
                <ReferenceArea y1={30} y2={70} fill="#1f9d63" fillOpacity={0.06} />
                <ReferenceLine y={50} stroke="#d5d8df" strokeDasharray="2 4" />
                <ReferenceLine y={70} stroke="#d98200" strokeOpacity={0.7} strokeDasharray="5 5" />
                <XAxis dataKey="code" tick={{ fill: '#3a3d44', fontSize: 13, fontFamily: 'Space Grotesk' }} axisLine={{ stroke: '#d5d8df' }} tickLine={false} />
                <YAxis domain={[20, 110]} ticks={[30, 50, 70, 90, 110]} tick={{ fill: '#6d717a', fontSize: 12 }} axisLine={false} tickLine={false} width={38} />
                <Tooltip content={<TipBox />} cursor={{ stroke: '#ff5a1f', strokeOpacity: 0.35, strokeWidth: 1 }} />
                <Line type="monotone" dataKey="t" stroke="#ff5a1f" strokeWidth={2.6} dot={<CustomDot />} activeDot={{ r: 6, fill: '#ff5a1f', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 18 }} className="bottom-grid">
          <div className="card" style={{ padding: '20px 22px' }}>
            <h2 style={{ fontSize: 16, marginBottom: 14 }}>Значения по шкалам</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 52px 52px 84px', gap: 10, fontSize: 11, color: 'var(--muted)', padding: '0 8px 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <span>№</span><span>Шкала</span><span style={{ textAlign: 'right' }}>Сырой</span><span style={{ textAlign: 'right' }}>T-балл</span><span></span>
              </div>
              {scales.map(s => {
                const t = person.profile[s.code]
                const c = tColor(t)
                return (
                  <div key={s.code} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 52px 52px 84px', gap: 10, alignItems: 'center', padding: '8px', borderRadius: 6, background: t >= 70 ? '#fdf3f2' : 'transparent' }}>
                    <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: s.type === 'validity' ? 'var(--orange)' : 'var(--muted)' }}>{s.code}</span>
                    <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                    <span style={{ textAlign: 'right', fontSize: 13, color: 'var(--muted)' }}>{person.raw[s.code]}</span>
                    <span style={{ textAlign: 'right', fontSize: 14.5, fontWeight: 700, fontFamily: 'var(--font-head)', color: c }}>{t}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 4, background: '#eceef1', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: Math.min(100, (t / 110 * 100)) + '%', background: c, borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="card" style={{ padding: '20px 22px' }}>
              <h2 style={{ fontSize: 16, marginBottom: 4 }}>Ведущие шкалы</h2>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>Наиболее выраженные черты в профиле</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {leading.map(s => (
                  <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: tColor(person.profile[s.code]), background: '#f4f5f7', border: '1px solid var(--line)' }}>{s.code}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>T = {person.profile[s.code]} · {tLabel(person.profile[s.code])}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '20px 22px' }}>
              <h2 style={{ fontSize: 16, marginBottom: 12 }}>Резюме достоверности</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', borderRadius: 8, border: '1px solid ' + (val === 'valid' ? '#bfe6d0' : '#f5dcb0'), background: val === 'valid' ? '#e7f6ee' : '#fdf7ec' }}>
                <span style={{ color: val === 'valid' ? '#1f9d63' : '#d98200', display: 'flex' }}>{val === 'valid' ? <ShieldOk /> : <WarnIcon />}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: val === 'valid' ? '#1f9d63' : '#8a6516' }}>{val === 'valid' ? 'Профиль достоверен' : 'Достоверность под вопросом'}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>по соотношению шкал L / F / K</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px 22px', marginTop: 18 }}>
          <h2 style={{ fontSize: 17, marginBottom: 4 }}>Текстовая интерпретация</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 18 }}>Автоматически по повышенным шкалам профиля. Не является клиническим диагнозом.</p>

          {peaks.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>Выраженных пиков (T &gt; 70) в профиле нет — усреднённый, сглаженный тип реагирования без явных акцентуаций.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="interp-grid">
              {peaks.map(s => (
                <div key={s.code} style={{ padding: '16px 18px', borderRadius: 8, border: '1px solid var(--line)', background: '#fafbfc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 700, color: '#dc4438', background: '#fbeceb' }}>{s.code}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-head)', color: '#dc4438' }}>T {person.profile[s.code]}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#4a4d54', lineHeight: 1.6 }}>{interpretations[s.code]}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 22, fontSize: 12, color: '#9498a0', textAlign: 'center' }}>Методика СМИЛ (Л.Н. Собчик) · T-баллы сверены с эталоном psytests.org · сформировано автоматически</div>
      </div>

      {toast !== '' && (
        <div className="no-print" style={{ position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 200, padding: '12px 20px', borderRadius: 9, background: '#1d1f24', color: '#fff', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 12px 34px -12px rgba(0,0,0,0.4)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5a1f' }} />
          <span style={{ fontSize: 13.5 }}>{toast}</span>
        </div>
      )}
    </div>
  )
}

function Meta(props: any) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{props.label}</div>
      <div style={{ fontSize: 14.5, fontWeight: 600, fontFamily: 'var(--font-head)' }}>{props.value}</div>
    </div>
  )
}

function ValidityCard(props: any) {
  const t = props.t
  const c = tColor(t)
  const ok = t >= 30 && t < 70
  return (
    <div className="card" style={{ padding: '17px 19px', display: 'flex', alignItems: 'center', gap: 15 }}>
      <div style={{ width: 50, height: 50, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 21, color: c, background: '#f4f5f7', border: '1px solid var(--line)' }}>{props.code}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>{props.title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{props.desc}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-head)', color: c, lineHeight: 1 }}>{t}</div>
        <div style={{ fontSize: 11.5, color: ok ? '#1f9d63' : '#d98200', marginTop: 4, fontWeight: 600 }}>{ok ? 'в норме' : 'вне нормы'}</div>
      </div>
    </div>
  )
}

function Legend(props: any) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      <span style={{ width: 16, height: props.dash ? 0 : 3, borderRadius: 3, background: props.dash ? 'transparent' : props.color, borderTop: props.dash ? '2px dashed ' + props.color : 'none' }} />
      {props.text}
    </span>
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
