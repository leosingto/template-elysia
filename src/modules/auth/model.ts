import { z } from 'zod'

import { errorResponse } from '../../lib/response'

export const authUser = z.object({
	id: z.number(),
	name: z.string().min(1),
	email: z.email()
})
export type AuthUser = z.infer<typeof authUser>

export const register = z.object({
	name: z.string().min(1),
	email: z.email(),
	password: z.string().min(8)
})
export type Register = z.infer<typeof register>

export const login = z.object({
	email: z.email(),
	password: z.string()
})
export type Login = z.infer<typeof login>

export const loginResponse = z.object({
	token: z.string(),
	user: authUser
})
export type LoginResponse = z.infer<typeof loginResponse>

export const emailTaken = errorResponse('EMAIL_TAKEN')

export const invalidCredentials = errorResponse('INVALID_CREDENTIALS')

export { unauthorized } from '../../lib/response'
