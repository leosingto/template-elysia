import { Elysia } from 'elysia'

import { authPlugin } from '../../plugins/auth'
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

export const auth = new Elysia({ prefix: '/auth', tags: ['Auth'] })
	.use(authPlugin)
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

			return status(201, AuthService.toPublic(created))
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

			return { token, user: AuthService.toPublic(user) }
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
	.get('/me', ({ user }) => user, {
		auth: true,
		response: {
			200: authUser,
			401: unauthorized
		},
		detail: { summary: 'Get the current authenticated user' }
	})
