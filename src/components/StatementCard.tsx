import { AnswerValue, Statement } from '../types/test'
import AnswerButtons from './AnswerButtons'

export default function StatementCard(props: {
  statement: Statement
  value: AnswerValue | null
  onPick: (v: AnswerValue) => void
}) {
  return (
    <div className="card" style={{ padding: '30px 30px 26px' }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Утверждение
      </div>
      <p style={{ fontSize: 22, fontFamily: 'var(--font-head)', fontWeight: 600, lineHeight: 1.35, marginBottom: 26, minHeight: 66 }}>
        {props.statement.text}
      </p>
      <AnswerButtons value={props.value} onPick={props.onPick} />
    </div>
  )
}
