import { z } from 'zod'

import { authUser } from '../auth/model'

export const publicMessage = z.object({
	message: z.string()
})
export type PublicMessage = z.infer<typeof publicMessage>

export const protectedMessage = z.object({
	message: z.string(),
	user: authUser
})
export type ProtectedMessage = z.infer<typeof protectedMessage>

export { unauthorized } from '../../lib/response'
