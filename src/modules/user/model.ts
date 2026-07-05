import { z } from 'zod'

export const user = z.object({
	id: z.number(),
	name: z.string().min(1),
	email: z.email()
})
export type User = z.infer<typeof user>

export const createUser = z.object({
	name: z.string().min(1),
	email: z.email()
})
export type CreateUser = z.infer<typeof createUser>

export const userId = z.object({
	id: z.coerce.number().min(1)
})

export const notFound = z.literal('User not found')
