import { AnswerValue } from '../types/test'

export default function AnswerButtons(props: { value: AnswerValue | null; onPick: (v: AnswerValue) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <Option label="Верно" active={props.value === 'true'} onClick={() => props.onPick('true')} />
      <Option label="Неверно" active={props.value === 'false'} onClick={() => props.onPick('false')} />
    </div>
  )
}

function Option(props: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={props.onClick}
      style={{
        padding: '16px 18px',
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 600,
        fontFamily: 'var(--font-head)',
        border: '1px solid ' + (props.active ? 'var(--orange)' : 'var(--line2)'),
        background: props.active ? 'var(--orange)' : '#fff',
        color: props.active ? '#fff' : 'var(--ink)',
        transition: 'all 0.15s'
      }}
    >
      {props.label}
    </button>
  )
}
