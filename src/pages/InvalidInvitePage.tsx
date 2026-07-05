import { InviteError } from '../types/test'

const texts: Record<string, { title: string; desc: string }> = {
  invalid: {
    title: 'Ссылка недействительна',
    desc: 'Такого приглашения не существует. Проверьте, правильно ли скопирована ссылка из письма.'
  },
  expired: {
    title: 'Срок приглашения истёк',
    desc: 'Время на прохождение теста закончилось. Обратитесь к HR-специалисту, чтобы получить новую ссылку.'
  },
  used: {
    title: 'Тест уже пройден',
    desc: 'По этой ссылке тест уже был завершён. Повторное прохождение не требуется — результаты переданы HR.'
  }
}

export default function InvalidInvitePage(props: { kind: InviteError }) {
  const t = texts[props.kind] || texts.invalid
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Logo size={44} />
        </div>
        <div className="card" style={{ padding: '34px 30px 30px' }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fbeceb', color: 'var(--red)' }}>
            <WarnIcon />
          </div>
          <h1 style={{ fontSize: 22, marginBottom: 9 }}>{t.title}</h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.55 }}>{t.desc}</p>
        </div>
        <div style={{ fontSize: 12, color: '#9498a0', marginTop: 17 }}>© 2026 FITTIN · платформа профориентации</div>
      </div>
    </div>
  )
}

function Logo(props: { size: number }) {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="56" height="56" rx="14" fill="#ff5a1f" />
      <path d="M14 41 L24 29 L32 37 L42 21 L50 31" stroke="#111214" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="42" cy="21" r="4.2" fill="#111214" />
    </svg>
  )
}

function WarnIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinejoin="round" /><line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" /></svg>
}
