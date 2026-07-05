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
  if (t >= 70) return '#fb6a7e'
  if (t >= 60) return '#fbbf24'
  return '#37d9a0'
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
    <g>
      {payload.t >= 70 && <circle cx={cx} cy={cy} r={8} fill={c} opacity={0.22} />}
      <circle cx={cx} cy={cy} r={4} fill="#0b0b14" stroke={c} strokeWidth={2.2} />
    </g>
  )
}

function TipBox(props: any) {
  if (!props.active || !props.payload || !props.payload.length) return null
  const d = props.payload[0].payload
  return (
    <div style={{ background: 'rgba(14,14,22,0.96)', border: '1px solid rgba(124,92,255,0.4)', borderRadius: 12, padding: '11px 14px', boxShadow: '0 12px 30px -10px rgba(0,0,0,0.7)' }}>
      <div style={{ fontSize: 12, color: '#8b8b9e', marginBottom: 3 }}>Шкала {d.code}</div>
      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 14, marginBottom: 8, maxWidth: 210 }}>{d.name}</div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div><span style={{ fontSize: 11.5, color: '#8b8b9e' }}>T-балл</span><div style={{ fontSize: 19, fontWeight: 700, fontFamily: 'var(--font-head)', color: tColor(d.t) }}>{d.t}</div></div>
        <div><span style={{ fontSize: 11.5, color: '#8b8b9e' }}>сырой</span><div style={{ fontSize: 19, fontWeight: 700, fontFamily: 'var(--font-head)' }}>{d.raw}</div></div>
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 18 }}>
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
    }, 600)
  }

  const val = person.validity

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)', background: 'rgba(7,7,12,0.72)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '15px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost" onClick={() => nav('/dashboard')} style={{ padding: '9px 14px' }}><BackIcon /> Назад</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 4 }}>
            <img src="/logo.svg" width={30} height={30} alt="" />
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15.5 }}>Карточка результата</div>
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn" onClick={() => setToast('Ссылка на профиль скопирована')} style={{ padding: '10px 15px' }}><ShareIcon /> Поделиться</button>
          <button className="btn btn-primary" onClick={exportPdf}><DownloadIcon /> Экспорт PDF</button>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '30px 28px 80px' }}>
        <div className="glass fade-up" style={{ padding: '26px 28px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 68, height: 68, borderRadius: 18, background: 'linear-gradient(135deg,#7c5cff,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 24, color: '#0a0a12' }}>{initials(person.name)}</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ fontSize: 28 }}>{person.name}</h1>
            <div style={{ color: 'var(--muted)', marginTop: 5, fontSize: 14.5 }}>{person.position} · {person.email}</div>
          </div>
          <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
            <Meta label="Пройден" value={person.completedAt || '—'} />
            <Meta label="Длительность" value={person.durationMin + ' мин'} />
            <Meta label="Ответов" value={person.answersDone + ' / ' + person.answersTotal} />
            <Meta label="Пол формы" value={person.gender === 'f' ? 'женская' : 'мужская'} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 22 }} className="valid-grid">
          <ValidityCard code="L" title="Ложь" t={person.profile.L} desc="социальная желательность" />
          <ValidityCard code="F" title="Достоверность" t={person.profile.F} desc="искренность ответов" />
          <ValidityCard code="K" title="Коррекция" t={person.profile.K} desc="открытость / защита" />
        </div>

        {val === 'doubtful' && (
          <div className="glass" style={{ padding: '15px 19px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 13, borderColor: 'rgba(251,191,36,0.35)', background: 'rgba(251,191,36,0.06)' }}>
            <span style={{ color: 'var(--amber)', display: 'flex', flexShrink: 0 }}><WarnIcon /></span>
            <div style={{ fontSize: 13.5, color: '#d9cfa6', lineHeight: 1.5 }}>Шкалы достоверности выходят за пределы нормы — к интерпретации профиля стоит относиться с осторожностью, возможна установка на социально одобряемые ответы.</div>
          </div>
        )}

        <div className="glass fade-up" style={{ padding: '24px 26px 14px', marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 19 }}>Профиль СМИЛ</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 4 }}>T-баллы по шкалам достоверности и базовым клиническим шкалам</p>
            </div>
            <div style={{ display: 'flex', gap: 18, fontSize: 12.5, color: 'var(--muted)', paddingTop: 4 }}>
              <Legend color="#37d9a0" text="норма 30–70" />
              <Legend color="#fbbf24" text="порог 70" dash />
              <Legend color="#fb6a7e" text="пик > 70" />
            </div>
          </div>

          <div style={{ width: '100%', height: 340 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 18, right: 12, left: -8, bottom: 4 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#7c5cff" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <ReferenceArea y1={30} y2={70} fill="#37d9a0" fillOpacity={0.05} />
                <ReferenceLine y={50} stroke="rgba(255,255,255,0.14)" strokeDasharray="2 4" />
                <ReferenceLine y={70} stroke="#fbbf24" strokeOpacity={0.5} strokeDasharray="5 5" />
                <XAxis dataKey="code" tick={{ fill: '#8b8b9e', fontSize: 13, fontFamily: 'Space Grotesk' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                <YAxis domain={[20, 110]} ticks={[30, 50, 70, 90, 110]} tick={{ fill: '#8b8b9e', fontSize: 12 }} axisLine={false} tickLine={false} width={38} />
                <Tooltip content={<TipBox />} cursor={{ stroke: 'rgba(124,92,255,0.4)', strokeWidth: 1 }} />
                <Line type="monotone" dataKey="t" stroke="url(#lineGrad)" strokeWidth={2.6} dot={<CustomDot />} activeDot={{ r: 6, fill: '#fff', stroke: '#7c5cff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 22 }} className="bottom-grid">
          <div className="glass" style={{ padding: '22px 24px' }}>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Значения по шкалам</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr 56px 56px 90px', gap: 10, fontSize: 11.5, color: 'var(--muted)', padding: '0 8px 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <span>№</span><span>Шкала</span><span style={{ textAlign: 'right' }}>Сырой</span><span style={{ textAlign: 'right' }}>T-балл</span><span></span>
              </div>
              {scales.map(s => {
                const t = person.profile[s.code]
                const c = tColor(t)
                return (
                  <div key={s.code} style={{ display: 'grid', gridTemplateColumns: '30px 1fr 56px 56px 90px', gap: 10, alignItems: 'center', padding: '9px 8px', borderRadius: 10, background: t >= 70 ? 'rgba(251,106,126,0.05)' : 'transparent' }}>
                    <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: s.type === 'validity' ? 'var(--cyan)' : 'var(--muted)' }}>{s.code}</span>
                    <span style={{ fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                    <span style={{ textAlign: 'right', fontSize: 13.5, color: 'var(--muted)' }}>{person.raw[s.code]}</span>
                    <span style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-head)', color: c }}>{t}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 8, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: Math.min(100, (t / 110 * 100)) + '%', background: c, borderRadius: 8 }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div className="glass" style={{ padding: '22px 24px' }}>
              <h2 style={{ fontSize: 18, marginBottom: 6 }}>Ведущие шкалы</h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Наиболее выраженные черты в профиле</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {leading.map(s => (
                  <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, color: tColor(person.profile[s.code]), background: tColor(person.profile[s.code]) + '1c', border: '1px solid ' + tColor(person.profile[s.code]) + '38' }}>{s.code}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>T = {person.profile[s.code]} · {tLabel(person.profile[s.code])}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass spotlight" style={{ padding: '22px 24px' }}>
              <h2 style={{ fontSize: 18, marginBottom: 14 }}>Резюме достоверности</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderRadius: 13, border: '1px solid ' + (val === 'valid' ? 'rgba(55,217,160,0.3)' : 'rgba(251,191,36,0.3)'), background: val === 'valid' ? 'rgba(55,217,160,0.06)' : 'rgba(251,191,36,0.06)' }}>
                <span style={{ color: val === 'valid' ? 'var(--green)' : 'var(--amber)', display: 'flex' }}>{val === 'valid' ? <ShieldOk /> : <WarnIcon />}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: val === 'valid' ? 'var(--green)' : 'var(--amber)' }}>{val === 'valid' ? 'Профиль достоверен' : 'Достоверность под вопросом'}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>по соотношению шкал L / F / K</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass fade-up" style={{ padding: '24px 26px', marginTop: 22 }}>
          <h2 style={{ fontSize: 19, marginBottom: 6 }}>Текстовая интерпретация</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 20 }}>Автоматически по повышенным шкалам профиля. Не является клиническим диагнозом.</p>

          {peaks.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>Выраженных пиков (T &gt; 70) в профиле нет — усреднённый, сглаженный тип реагирования без явных акцентуаций.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="interp-grid">
              {peaks.map(s => (
                <div key={s.code} style={{ padding: '17px 19px', borderRadius: 15, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.015)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 700, color: '#fb6a7e', background: 'rgba(251,106,126,0.14)' }}>{s.code}</span>
                    <span style={{ fontWeight: 600, fontSize: 14.5 }}>{s.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-head)', color: '#fb6a7e' }}>T {person.profile[s.code]}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: '#b9b9c8', lineHeight: 1.6 }}>{interpretations[s.code]}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 26, fontSize: 12.5, color: '#5a5a6e', textAlign: 'center' }}>Методика СМИЛ (Л.Н. Собчик) · T-баллы сверены с эталоном psytests.org · сформировано автоматически</div>
      </div>

      {toast !== '' && (
        <div className="no-print" style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 200, padding: '13px 22px', borderRadius: 13, background: 'rgba(14,14,22,0.95)', border: '1px solid rgba(124,92,255,0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 14px 40px -12px rgba(0,0,0,0.7)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 10px var(--cyan)' }} />
          <span style={{ fontSize: 14 }}>{toast}</span>
        </div>
      )}
    </div>
  )
}

function Meta(props: any) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{props.label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-head)' }}>{props.value}</div>
    </div>
  )
}

function ValidityCard(props: any) {
  const t = props.t
  const c = tColor(t)
  const ok = t >= 30 && t < 70
  return (
    <div className="glass spotlight" style={{ padding: '19px 21px', transition: 'transform 0.22s', display: 'flex', alignItems: 'center', gap: 16 }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}>
      <div style={{ width: 54, height: 54, borderRadius: 15, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 22, color: c, background: c + '18', border: '1px solid ' + c + '38' }}>{props.code}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{props.title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{props.desc}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-head)', color: c, lineHeight: 1 }}>{t}</div>
        <div style={{ fontSize: 11.5, color: ok ? 'var(--green)' : 'var(--amber)', marginTop: 4 }}>{ok ? 'в норме' : 'вне нормы'}</div>
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
