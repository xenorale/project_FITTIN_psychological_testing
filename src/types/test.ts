export type Statement = {
  id: number
  text: string
}

export type InviteData = {
  token: string
  candidateName: string
  position: string
  statements: Statement[]
}

export type AnswerValue = 'true' | 'false'

export type Answer = {
  statementId: number
  value: AnswerValue
}

export type SubmitPayload = {
  answers: Answer[]
}

export type InviteError = 'invalid' | 'expired' | 'used' | 'network'
