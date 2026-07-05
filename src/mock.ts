export const scales = [
  { code: 'L', short: 'L', name: 'Ложь', type: 'validity' },
  { code: 'F', short: 'F', name: 'Достоверность', type: 'validity' },
  { code: 'K', short: 'K', name: 'Коррекция', type: 'validity' },
  { code: '1', short: '1', name: 'Сверхконтроль (Hs)', type: 'clinical' },
  { code: '2', short: '2', name: 'Пессимистичность (D)', type: 'clinical' },
  { code: '3', short: '3', name: 'Эмоциональная лабильность (Hy)', type: 'clinical' },
  { code: '4', short: '4', name: 'Импульсивность (Pd)', type: 'clinical' },
  { code: '5', short: '5', name: 'Мужественность / Женственность (Mf)', type: 'clinical' },
  { code: '6', short: '6', name: 'Ригидность (Pa)', type: 'clinical' },
  { code: '7', short: '7', name: 'Тревожность (Pt)', type: 'clinical' },
  { code: '8', short: '8', name: 'Индивидуалистичность (Sc)', type: 'clinical' },
  { code: '9', short: '9', name: 'Оптимистичность (Ma)', type: 'clinical' },
  { code: '0', short: '0', name: 'Интроверсия (Si)', type: 'clinical' }
]

export const interpretations: any = {
  L: 'Стремление показать себя в лучшем свете, следование социально одобряемым нормам. Высокие значения снижают достоверность профиля.',
  F: 'Показатель искренности и эмоциональной напряжённости. Резкое повышение говорит о стремлении подчеркнуть проблемы либо о невнимательном заполнении.',
  K: 'Защитные механизмы личности, закрытость. Умеренное повышение — нормальная осторожность, высокое — стремление скрыть трудности.',
  '1': 'Сверхконтроль, склонность к беспокойству о собственном здоровье, осторожность, избегание рисков в решениях.',
  '2': 'Пессимистичность, склонность к анализу, повышенное чувство ответственности, острое переживание неудач.',
  '3': 'Эмоциональная лабильность, потребность в признании, коммуникабельность, ориентация на мнение окружающих.',
  '4': 'Импульсивность, активность, стремление к самостоятельности, нетерпимость к жёсткому контролю извне.',
  '5': 'Соотношение мужских и женских черт характера, гибкость ролевого поведения, широта интересов.',
  '6': 'Ригидность установок, упорство в достижении цели, обострённое чувство справедливости, соперничество.',
  '7': 'Тревожность, мнительность, повышенная чувствительность к деталям, потребность в стабильности и правилах.',
  '8': 'Индивидуалистичность, нестандартность мышления, самобытность, погружённость во внутренний мир.',
  '9': 'Оптимистичность, высокая активность, лёгкость в общении, увлечённость, иногда переоценка возможностей.',
  '0': 'Обращённость в мир внутренних переживаний, избирательность в контактах, потребность в личном пространстве.'
}

export type Candidate = {
  id: string
  name: string
  email: string
  position: string
  status: 'invited' | 'in_progress' | 'completed' | 'expired'
  gender: 'm' | 'f'
  invitedAt: string
  completedAt: string | null
  durationMin: number | null
  validity: 'valid' | 'doubtful' | null
  answersDone: number
  answersTotal: number
  profile: any
  raw: any
}

export const candidates: Candidate[] = [
  {
    id: 'c-1041',
    name: 'Алина Ковалёва',
    email: 'a.kovaleva@mail.ru',
    position: 'Продуктовый аналитик',
    status: 'completed',
    gender: 'f',
    invitedAt: '2026-06-24',
    completedAt: '2026-06-25',
    durationMin: 47,
    validity: 'valid',
    answersDone: 566,
    answersTotal: 566,
    profile: { L: 48, F: 55, K: 52, '1': 58, '2': 71, '3': 62, '4': 49, '5': 44, '6': 54, '7': 74, '8': 60, '9': 45, '0': 63 },
    raw: { L: 4, F: 9, K: 14, '1': 16, '2': 27, '3': 24, '4': 20, '5': 30, '6': 11, '7': 32, '8': 29, '9': 18, '0': 34 }
  },
  {
    id: 'c-1042',
    name: 'Дмитрий Соколов',
    email: 'sokolov.d@gmail.com',
    position: 'Frontend-разработчик',
    status: 'completed',
    gender: 'm',
    invitedAt: '2026-06-24',
    completedAt: '2026-06-24',
    durationMin: 39,
    validity: 'valid',
    answersDone: 566,
    answersTotal: 566,
    profile: { L: 44, F: 51, K: 58, '1': 46, '2': 48, '3': 50, '4': 66, '5': 53, '6': 49, '7': 42, '8': 55, '9': 73, '0': 40 },
    raw: { L: 3, F: 7, K: 18, '1': 11, '2': 18, '3': 20, '4': 26, '5': 26, '6': 9, '7': 19, '8': 26, '9': 24, '0': 22 }
  },
  {
    id: 'c-1043',
    name: 'Марина Егорова',
    email: 'marina.egorova@yandex.ru',
    position: 'HR-менеджер',
    status: 'completed',
    gender: 'f',
    invitedAt: '2026-06-23',
    completedAt: '2026-06-23',
    durationMin: 54,
    validity: 'doubtful',
    answersDone: 566,
    answersTotal: 566,
    profile: { L: 66, F: 43, K: 71, '1': 52, '2': 47, '3': 61, '4': 44, '5': 48, '6': 46, '7': 45, '8': 43, '9': 58, '0': 41 },
    raw: { L: 8, F: 5, K: 22, '1': 14, '2': 17, '3': 23, '4': 18, '5': 28, '6': 8, '7': 21, '8': 20, '9': 20, '0': 23 }
  },
  {
    id: 'c-1044',
    name: 'Артём Лебедев',
    email: 'artem.lebedev@outlook.com',
    position: 'Backend-разработчик',
    status: 'completed',
    gender: 'm',
    invitedAt: '2026-06-22',
    completedAt: '2026-06-23',
    durationMin: 61,
    validity: 'valid',
    answersDone: 566,
    answersTotal: 566,
    profile: { L: 50, F: 62, K: 47, '1': 63, '2': 59, '3': 55, '4': 72, '5': 58, '6': 76, '7': 64, '8': 69, '9': 61, '0': 53 },
    raw: { L: 5, F: 12, K: 12, '1': 18, '2': 22, '3': 22, '4': 28, '5': 29, '6': 15, '7': 28, '8': 33, '9': 21, '0': 29 }
  },
  {
    id: 'c-1045',
    name: 'Екатерина Волкова',
    email: 'e.volkova@mail.ru',
    position: 'Продуктовый аналитик',
    status: 'in_progress',
    gender: 'f',
    invitedAt: '2026-07-03',
    completedAt: null,
    durationMin: null,
    validity: null,
    answersDone: 318,
    answersTotal: 566,
    profile: null,
    raw: null
  },
  {
    id: 'c-1046',
    name: 'Никита Морозов',
    email: 'nikita.morozov@gmail.com',
    position: 'Frontend-разработчик',
    status: 'in_progress',
    gender: 'm',
    invitedAt: '2026-07-04',
    completedAt: null,
    durationMin: null,
    validity: null,
    answersDone: 92,
    answersTotal: 566,
    profile: null,
    raw: null
  },
  {
    id: 'c-1047',
    name: 'Полина Новикова',
    email: 'polina.n@yandex.ru',
    position: 'UX-дизайнер',
    status: 'invited',
    gender: 'f',
    invitedAt: '2026-07-04',
    completedAt: null,
    durationMin: null,
    validity: null,
    answersDone: 0,
    answersTotal: 566,
    profile: null,
    raw: null
  },
  {
    id: 'c-1048',
    name: 'Сергей Кузнецов',
    email: 'kuznetsov.serg@mail.ru',
    position: 'Backend-разработчик',
    status: 'invited',
    gender: 'm',
    invitedAt: '2026-07-05',
    completedAt: null,
    durationMin: null,
    validity: null,
    answersDone: 0,
    answersTotal: 566,
    profile: null,
    raw: null
  },
  {
    id: 'c-1049',
    name: 'Ольга Смирнова',
    email: 'olga.smirnova@gmail.com',
    position: 'HR-менеджер',
    status: 'expired',
    gender: 'f',
    invitedAt: '2026-06-18',
    completedAt: null,
    durationMin: null,
    validity: null,
    answersDone: 0,
    answersTotal: 566,
    profile: null,
    raw: null
  },
  {
    id: 'c-1050',
    name: 'Роман Павлов',
    email: 'roman.pavlov@outlook.com',
    position: 'Продуктовый аналитик',
    status: 'completed',
    gender: 'm',
    invitedAt: '2026-06-20',
    completedAt: '2026-06-21',
    durationMin: 44,
    validity: 'valid',
    answersDone: 566,
    answersTotal: 566,
    profile: { L: 46, F: 49, K: 55, '1': 51, '2': 44, '3': 53, '4': 57, '5': 50, '6': 52, '7': 48, '8': 47, '9': 62, '0': 46 },
    raw: { L: 4, F: 6, K: 17, '1': 13, '2': 16, '3': 21, '4': 23, '5': 27, '6': 10, '7': 22, '8': 22, '9': 22, '0': 25 }
  }
]

export const invites = [
  { id: 'inv-91', candidate: 'Полина Новикова', position: 'UX-дизайнер', token: 'a7f3c9d1e2', createdAt: '2026-07-04', used: false },
  { id: 'inv-92', candidate: 'Сергей Кузнецов', position: 'Backend-разработчик', token: 'b2e8f4a0c6', createdAt: '2026-07-05', used: false },
  { id: 'inv-90', candidate: 'Екатерина Волкова', position: 'Продуктовый аналитик', token: '4c1d7b9e33', createdAt: '2026-07-03', used: true }
]

export const positionsList = [
  'Продуктовый аналитик',
  'Frontend-разработчик',
  'Backend-разработчик',
  'HR-менеджер',
  'UX-дизайнер',
  'QA-инженер'
]
