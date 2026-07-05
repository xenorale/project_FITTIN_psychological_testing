export default function ProgressBar(props: { current: number; total: number }) {
  const pct = props.total === 0 ? 0 : Math.round((props.current / props.total) * 100)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Вопрос {props.current} из {props.total}
        </span>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: '#eceef1', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: pct + '%', background: 'var(--orange)', borderRadius: 4, transition: 'width 0.25s' }} />
      </div>
    </div>
  )
}
