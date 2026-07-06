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

const login = async (email: string) => {
	await request(
		'/auth/register',
		json({ name: 'Example User', email, password: 'password123' })
	)

	const res = await request(
		'/auth/login',
		json({ email, password: 'password123' })
	)

	const { data } = (await res.json()) as {
		success: true
		data: {
			token: string
			user: { id: number; name: string; email: string }
		}
	}

	return data
}

describe('Example', () => {
	describe('GET /example/public', () => {
		it('should be accessible without a token', async () => {
			const res = await request('/example/public')

			expect(res.status).toBe(200)
			expect(await res.json()).toEqual({
				success: true,
				data: {
					message: 'This route is public — no token required'
				}
			})
		})

		it('should ignore an invalid token', async () => {
			const res = await request('/example/public', {
				headers: { Authorization: 'Bearer not-a-jwt' }
			})

			expect(res.status).toBe(200)
		})
	})

	describe('GET /example/protected', () => {
		it('should return the message and user with a valid token', async () => {
			const { token, user } = await login('example-protected@example.com')

			const res = await request('/example/protected', {
				headers: { Authorization: `Bearer ${token}` }
			})

			expect(res.status).toBe(200)
			expect(await res.json()).toEqual({
				success: true,
				data: {
					message: `Hello ${user.name}, you are authenticated`,
					user
				}
			})
		})

		it('should return 401 without an Authorization header', async () => {
			const res = await request('/example/protected')

			expect(res.status).toBe(401)
			expect(await res.json()).toEqual({
				success: false,
				error: { code: 'UNAUTHORIZED', message: 'Unauthorized' }
			})
		})

		it('should return 401 for a malformed token', async () => {
			const res = await request('/example/protected', {
				headers: { Authorization: 'Bearer not-a-jwt' }
			})

			expect(res.status).toBe(401)
			expect(await res.json()).toEqual({
				success: false,
				error: { code: 'UNAUTHORIZED', message: 'Unauthorized' }
			})
		})

		it('should return 401 for a wrongly-signed token', async () => {
			const { token } = await login('example-tampered@example.com')

			const [header, payload] = token.split('.')
			const forged = `${header}.${payload}.${'A'.repeat(43)}`

			const res = await request('/example/protected', {
				headers: { Authorization: `Bearer ${forged}` }
			})

			expect(res.status).toBe(401)
			expect(await res.json()).toEqual({
				success: false,
				error: { code: 'UNAUTHORIZED', message: 'Unauthorized' }
			})
		})
	})
})
