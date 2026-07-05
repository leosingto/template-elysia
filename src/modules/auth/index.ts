import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'

import { AuthService } from './service'
import {
	authUser,
	register,
	login,
	loginResponse,
	emailTaken,
	invalidCredentials,
	unauthorized
} from './model'
import type { AuthUser } from './model'
import type { StoredAuthUser } from './service'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production'

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production')
	throw new Error('JWT_SECRET must be set in production')

const toPublic = (user: StoredAuthUser): AuthUser => ({
	id: user.id,
	name: user.name,
	email: user.email
})

export const auth = new Elysia({ prefix: '/auth', tags: ['Auth'] })
	.use(
		jwt({
			name: 'jwt',
			secret: JWT_SECRET,
			exp: '7d'
		})
	)
	.post(
		'/register',
		async ({ body, status }) => {
			if (AuthService.findByEmail(body.email))
				return status(409, 'Email already registered' as const)

			const passwordHash = await Bun.password.hash(body.password)
			const created = AuthService.create({
				name: body.name,
				email: body.email,
				passwordHash
			})

			return status(201, toPublic(created))
		},
		{
			body: register,
			response: {
				201: authUser,
				409: emailTaken
			},
			detail: { summary: 'Register a new user' }
		}
	)
	.post(
		'/login',
		async ({ body, jwt, status }) => {
			const user = AuthService.findByEmail(body.email)

			if (!user) return status(401, 'Invalid credentials' as const)

			const valid = await Bun.password.verify(
				body.password,
				user.passwordHash
			)

			if (!valid) return status(401, 'Invalid credentials' as const)

			const token = await jwt.sign({ sub: String(user.id) })

			return { token, user: toPublic(user) }
		},
		{
			body: login,
			response: {
				200: loginResponse,
				401: invalidCredentials
			},
			detail: { summary: 'Log in and receive a JWT' }
		}
	)
	.get(
		'/me',
		async ({ headers, jwt, status }) => {
			const authorization = headers.authorization

			if (!authorization?.startsWith('Bearer '))
				return status(401, 'Unauthorized' as const)

			const payload = await jwt.verify(authorization.slice(7))

			if (!payload || typeof payload.sub !== 'string')
				return status(401, 'Unauthorized' as const)

			const user = AuthService.findById(Number(payload.sub))

			if (!user) return status(401, 'Unauthorized' as const)

			return toPublic(user)
		},
		{
			response: {
				200: authUser,
				401: unauthorized
			},
			detail: { summary: 'Get the current authenticated user' }
		}
	)
