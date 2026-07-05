import axios from 'axios'
import { InviteData, InviteError, Statement, SubmitPayload } from '../types/test'

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

const statements: Statement[] = [
  { id: 1, text: 'Обычно я довожу начатое дело до конца.' },
  { id: 2, text: 'Мне часто бывает трудно сосредоточиться на работе.' },
  { id: 3, text: 'Я легко завожу новые знакомства.' },
  { id: 4, text: 'Иногда я откладываю на завтра то, что нужно сделать сегодня.' },
  { id: 5, text: 'В спорной ситуации я стараюсь выслушать обе стороны.' },
  { id: 6, text: 'Меня раздражает, когда меняются заранее оговорённые планы.' },
  { id: 7, text: 'Я предпочитаю работать по чёткому графику.' },
  { id: 8, text: 'Мне важно, что обо мне думают окружающие.' },
  { id: 9, text: 'Я редко волнуюсь перед важными событиями.' },
  { id: 10, text: 'Мне нравится браться за новые и незнакомые задачи.' },
  { id: 11, text: 'Я склонен подолгу обдумывать свои решения.' },
  { id: 12, text: 'В коллективе я чаще беру инициативу на себя.' },
  { id: 13, text: 'Критику в свой адрес я переношу спокойно.' },
  { id: 14, text: 'Я быстро устаю от общения с большим количеством людей.' },
  { id: 15, text: 'Порядок на рабочем месте помогает мне работать лучше.' },
  { id: 16, text: 'Я редко меняю своё первоначальное мнение.' }
]

const usedTokens = ['4c1d7b9e33', 'qwerty1234']
const expiredTokens = ['expired0000', 'olga1234ex']

const candidateByToken: Record<string, { name: string; position: string }> = {
  a7f3c9d1e2: { name: 'Полина Новикова', position: 'UX-дизайнер' },
  b2e8f4a0c6: { name: 'Сергей Кузнецов', position: 'Backend-разработчик' },
  test0000zz: { name: 'Проверка Связи', position: 'QA-инженер' }
}

function wait(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}

export class InviteRequestError extends Error {
  kind: InviteError
  constructor(kind: InviteError) {
    super(kind)
    this.kind = kind
  }
}

export async function getInvite(token: string): Promise<InviteData> {
  await wait(500)
  if (usedTokens.includes(token)) {
    throw new InviteRequestError('used')
  }
  if (expiredTokens.includes(token)) {
    throw new InviteRequestError('expired')
  }
  const known = candidateByToken[token]
  if (!known) {
    throw new InviteRequestError('invalid')
  }
  return {
    token,
    candidateName: known.name,
    position: known.position,
    statements
  }
}

export async function submitInvite(token: string, payload: SubmitPayload): Promise<{ ok: boolean }> {
  await wait(700)
  if (token === 'failnet') {
    throw new InviteRequestError('network')
  }
  return { ok: true, answers: payload.answers.length } as any
}
