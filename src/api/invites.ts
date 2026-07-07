import axios from 'axios'
import { api } from './client'
import { InviteData, InviteError, SubmitPayload } from '../types/test'

export class InviteRequestError extends Error {
  kind: InviteError
  constructor(kind: InviteError) {
    super(kind)
    this.kind = kind
  }
}

function resolveErrorKind(error: unknown): InviteError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'network'
    }
    const detail = error.response.data?.detail
    if (detail === 'invalid' || detail === 'expired' || detail === 'used') {
      return detail
    }
  }
  return 'network'
}

export async function getInvite(token: string): Promise<InviteData> {
  try {
    const { data } = await api.get<InviteData>(`/api/invites/${token}`)
    return data
  } catch (error) {
    throw new InviteRequestError(resolveErrorKind(error))
  }
}

export async function submitInvite(token: string, payload: SubmitPayload): Promise<{ ok: boolean }> {
  try {
    const { data } = await api.post<{ ok: boolean }>(`/api/invites/${token}/submit`, payload)
    return data
  } catch (error) {
    throw new InviteRequestError(resolveErrorKind(error))
  }
}

export type InviteCreatePayload = {
  candidateName: string
  email: string
  position: string
  gender: 'm' | 'f'
}

export type InviteCreateResult = {
  token: string
  link: string
}

export async function createInvite(payload: InviteCreatePayload): Promise<InviteCreateResult> {
  const { data } = await api.post<InviteCreateResult>('/api/invites', payload)
  return data
}
