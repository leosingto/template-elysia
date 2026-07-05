import { describe, expect, it } from 'vitest'

import { app } from '../..'

const request = (path: string, init?: RequestInit) =>
	app.handle(new Request(`http://localhost${path}`, init))

const json = (body: unknown, init?: RequestInit): RequestInit => ({
	...init,
	method: init?.method ?? 'POST',
	headers: { 'Content-Type': 'application/json', ...init?.headers },
	body: JSON.stringify(body)
})

const registerUser = (
	overrides: Partial<{ name: string; email: string; password: string }> = {}
) =>
	request(
		'/auth/register',
		json({
			name: 'Test User',
			email: 'test@example.com',
			password: 'password123',
			...overrides
		})
	)

describe('Auth', () => {
	describe('POST /auth/register', () => {
		it('should register a new user', async () => {
			const res = await registerUser({ email: 'register@example.com' })

			expect(res.status).toBe(201)
			expect(await res.json()).toEqual({
				id: expect.any(Number),
				name: 'Test User',
				email: 'register@example.com'
			})
		})

		it('should not leak password fields in the response', async () => {
			const res = await registerUser({ email: 'no-leak@example.com' })

			expect(res.status).toBe(201)

			const body = (await res.json()) as Record<string, unknown>
			expect(body).not.toHaveProperty('password')
			expect(body).not.toHaveProperty('passwordHash')
			expect(Object.keys(body).sort()).toEqual(['email', 'id', 'name'])
		})

		it('should return 409 for a duplicate email', async () => {
			const first = await registerUser({ email: 'dupe@example.com' })
			expect(first.status).toBe(201)

			const second = await registerUser({ email: 'dupe@example.com' })

			expect(second.status).toBe(409)
			expect(await second.text()).toBe('Email already registered')
		})

		it('should reject a short password', async () => {
			const res = await registerUser({
				email: 'short-password@example.com',
				password: 'short'
			})

			expect(res.status).toBe(422)
		})

		it('should reject an invalid body', async () => {
			const res = await registerUser({ name: '', email: 'not-an-email' })

			expect(res.status).toBe(422)
		})
	})

	describe('POST /auth/login', () => {
		it('should log in and return a JWT with the user', async () => {
			await registerUser({ name: 'Login User', email: 'login@example.com' })

			const res = await request(
				'/auth/login',
				json({ email: 'login@example.com', password: 'password123' })
			)

			expect(res.status).toBe(200)

			const body = (await res.json()) as {
				token: string
				user: { id: number; name: string; email: string }
			}

			expect(body.token.split('.')).toHaveLength(3)
			expect(body.user).toEqual({
				id: expect.any(Number),
				name: 'Login User',
				email: 'login@example.com'
			})
		})

		it('should return 401 for an unknown email', async () => {
			const res = await request(
				'/auth/login',
				json({ email: 'nobody@example.com', password: 'password123' })
			)

			expect(res.status).toBe(401)
			expect(await res.text()).toBe('Invalid credentials')
		})

		it('should return 401 for a wrong password', async () => {
			await registerUser({ email: 'wrong-password@example.com' })

			const res = await request(
				'/auth/login',
				json({
					email: 'wrong-password@example.com',
					password: 'not-the-password'
				})
			)

			expect(res.status).toBe(401)
			expect(await res.text()).toBe('Invalid credentials')
		})
	})

	describe('GET /auth/me', () => {
		const login = async (email: string) => {
			await registerUser({ name: 'Me User', email })

			const res = await request(
				'/auth/login',
				json({ email, password: 'password123' })
			)

			return (await res.json()) as {
				token: string
				user: { id: number; name: string; email: string }
			}
		}

		it('should return the current user with a valid token', async () => {
			const { token, user } = await login('me@example.com')

			const res = await request('/auth/me', {
				headers: { Authorization: `Bearer ${token}` }
			})

			expect(res.status).toBe(200)
			expect(await res.json()).toEqual(user)
		})

		it('should return 401 without an Authorization header', async () => {
			const res = await request('/auth/me')

			expect(res.status).toBe(401)
			expect(await res.text()).toBe('Unauthorized')
		})

		it('should return 401 for a malformed token', async () => {
			const res = await request('/auth/me', {
				headers: { Authorization: 'Bearer not-a-jwt' }
			})

			expect(res.status).toBe(401)
			expect(await res.text()).toBe('Unauthorized')
		})

		it('should return 401 for a wrongly-signed token', async () => {
			const { token } = await login('tampered@example.com')

			const [header, payload] = token.split('.')
			const forged = `${header}.${payload}.${'A'.repeat(43)}`

			const res = await request('/auth/me', {
				headers: { Authorization: `Bearer ${forged}` }
			})

			expect(res.status).toBe(401)
			expect(await res.text()).toBe('Unauthorized')
		})
	})
})
