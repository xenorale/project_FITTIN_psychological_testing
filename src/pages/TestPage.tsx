import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getInvite, InviteRequestError, submitInvite } from '../api/invites'
import { Answer, AnswerValue, InviteError, Statement } from '../types/test'
import StatementCard from '../components/StatementCard'
import ProgressBar from '../components/ProgressBar'
import InvalidInvitePage from './InvalidInvitePage'

export default function TestPage() {
  const { inviteToken } = useParams()
  const token = inviteToken || ''

  const query = useQuery({
    queryKey: ['invite', token],
    queryFn: () => getInvite(token),
    retry: false
  })

  const [order, setOrder] = useState<Statement[]>([])
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({})
  const [phase, setPhase] = useState<'intro' | 'test' | 'review' | 'done'>('intro')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (query.data) {
      setOrder(query.data.statements)
      setAnswers({})
      setPhase('intro')
      setIndex(0)
    }
  }, [query.data])

  const total = order.length
  const answeredCount = Object.keys(answers).length

  const mutation = useMutation({
    mutationFn: (payload: Answer[]) => submitInvite(token, { answers: payload }),
    onSuccess: () => setPhase('done')
  })

  const payload = useMemo(() => {
    return order.map(s => ({ statementId: s.id, value: answers[s.id] })).filter(a => a.value) as Answer[]
  }, [order, answers])

  if (query.isLoading) {
    return <Loader />
  }

  if (query.isError) {
    const err = query.error
    const kind: InviteError = err instanceof InviteRequestError ? err.kind : 'invalid'
    return <InvalidInvitePage kind={kind} />
  }

  if (!query.data || total === 0) {
    return <Loader />
  }

  const data = query.data

  function pick(value: AnswerValue) {
    const st = order[index]
    setAnswers(prev => ({ ...prev, [st.id]: value }))
    setTimeout(() => {
      if (index < total - 1) {
        setIndex(index + 1)
      } else {
        setPhase('review')
      }
    }, 160)
  }

  function back() {
    if (index > 0) {
      setIndex(index - 1)
    } else {
      setPhase('intro')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="topbar" style={{ position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '13px 22px', display: 'flex', alignItems: 'center', gap: 11 }}>
          <Logo size={26} />
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: '#fff' }}>FITTIN · Тестирование</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{data.position}</div>
        </div>
      </div>

      <div style={{ flex: 1, width: '100%', maxWidth: 720, margin: '0 auto', padding: '28px 22px 60px' }}>
        {phase === 'intro' && (
          <div className="card" style={{ padding: '32px 30px' }}>
            <h1 style={{ fontSize: 22, marginBottom: 10 }}>Здравствуйте, {data.candidateName}!</h1>
            <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 8 }}>
              Вам предстоит пройти короткий личностный опросник для позиции «{data.position}». В тесте {total} утверждений.
              По каждому выберите «Верно» или «Неверно» — отвечайте так, как считаете про себя, здесь нет правильных и неправильных ответов.
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 26 }}>
              К предыдущим вопросам можно вернуться кнопкой «Назад». Результаты передаются только HR-специалисту.
            </p>
            <button className="btn btn-primary" style={{ padding: '12px 22px' }} onClick={() => { setPhase('test'); setIndex(0) }}>
              Начать тест
            </button>
          </div>
        )}

        {phase === 'test' && (
          <div>
            <div style={{ marginBottom: 22 }}>
              <ProgressBar current={index + 1} total={total} />
            </div>
            <StatementCard statement={order[index]} value={answers[order[index].id] || null} onPick={pick} />
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
              <button className="btn" onClick={back}><BackIcon /> Назад</button>
              <div style={{ flex: 1 }} />
              {answers[order[index].id] && index < total - 1 && (
                <button className="btn" onClick={() => setIndex(index + 1)}>Далее <FwdIcon /></button>
              )}
              {answers[order[index].id] && index === total - 1 && (
                <button className="btn btn-dark" onClick={() => setPhase('review')}>К завершению <FwdIcon /></button>
              )}
            </div>
          </div>
        )}

        {phase === 'review' && (
          <div className="card" style={{ padding: '32px 30px' }}>
            <h1 style={{ fontSize: 22, marginBottom: 9 }}>Почти готово</h1>
            <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 22 }}>
              Вы ответили на {answeredCount} из {total} утверждений. Проверьте, что всё верно, и отправьте ответы HR-специалисту.
              После отправки изменить ответы будет нельзя.
            </p>

            {answeredCount < total && (
              <div className="card" style={{ padding: '12px 15px', marginBottom: 20, borderColor: '#f5dcb0', background: '#fdf7ec' }}>
                <div style={{ fontSize: 12, color: '#8a6516', lineHeight: 1.5 }}>
                  Есть {total - answeredCount} утверждений без ответа. Вернитесь назад, чтобы ответить на них.
                </div>
              </div>
            )}

            {mutation.isError && (
              <div className="card" style={{ padding: '12px 15px', marginBottom: 20, borderColor: '#f2c4c0', background: '#fbeceb' }}>
                <div style={{ fontSize: 12, color: '#a3352b', lineHeight: 1.5 }}>
                  Не удалось отправить ответы — проблема с сетью. Ваши ответы сохранены, попробуйте ещё раз.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn" onClick={() => { setPhase('test'); setIndex(total - 1) }} disabled={mutation.isPending}>
                <BackIcon /> Вернуться к вопросам
              </button>
              <div style={{ flex: 1 }} />
              <button
                className="btn btn-primary"
                style={{ padding: '12px 24px' }}
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(payload)}
              >
                {mutation.isPending
                  ? <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  : (mutation.isError ? 'Повторить отправку' : 'Отправить')}
              </button>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="card" style={{ padding: '40px 30px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e7f6ee', color: 'var(--green)' }}>
              <CheckIcon />
            </div>
            <h1 style={{ fontSize: 22, marginBottom: 10 }}>Спасибо, результаты переданы HR</h1>
            <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6 }}>
              Ваши ответы отправлены и сохранены. Дальнейшую информацию о результатах сообщит HR-специалист. Эту вкладку можно закрыть.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Loader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <span style={{ width: 26, height: 26, border: '3px solid #e2e4e9', borderTopColor: 'var(--orange)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Загружаем тест…</div>
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

function BackIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="19" y1="12" x2="5" y2="12" strokeLinecap="round" /><polyline points="12 19 5 12 12 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function FwdIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" /><polyline points="12 5 19 12 12 19" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function CheckIcon() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
