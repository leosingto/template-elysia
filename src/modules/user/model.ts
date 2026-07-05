import { t } from 'elysia'

export const user = t.Object({
	id: t.Number(),
	name: t.String({ minLength: 1 }),
	email: t.String({ format: 'email' })
})
export type User = typeof user.static

export const createUser = t.Object({
	name: t.String({ minLength: 1 }),
	email: t.String({ format: 'email' })
})
export type CreateUser = typeof createUser.static

export const userId = t.Object({
	id: t.Number({ minimum: 1 })
})

export const notFound = t.Literal('User not found')

export const models = {
	user,
	createUser,
	userId,
	notFound
}
