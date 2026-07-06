import { describe, expect, it } from 'vitest'

import { app } from '../..'

const request = (path: string, init?: RequestInit) =>
	app.handle(new Request(`http://localhost${path}`, init))

const json = (body: unknown, init?: RequestInit): RequestInit => ({
	...init,
	headers: { 'Content-Type': 'application/json', ...init?.headers },
	body: JSON.stringify(body)
})

describe('User', () => {
	it('should list users', async () => {
		const res = await request('/users/')

		expect(res.status).toBe(200)
		expect(await res.json()).toEqual({
			success: true,
			data: [{ id: 1, name: 'Saltyaom', email: 'saltyaom@elysiajs.com' }]
		})
	})

	it('should get a user by id', async () => {
		const res = await request('/users/1')

		expect(res.status).toBe(200)
		expect(await res.json()).toEqual({
			success: true,
			data: {
				id: 1,
				name: 'Saltyaom',
				email: 'saltyaom@elysiajs.com'
			}
		})
	})

	it('should return 404 for unknown user', async () => {
		const res = await request('/users/999')

		expect(res.status).toBe(404)
		expect(await res.json()).toEqual({
			success: false,
			error: { code: 'NOT_FOUND', message: 'User not found' }
		})
	})

	it('should validate params', async () => {
		const res = await request('/users/not-a-number')

		expect(res.status).toBe(422)

		const body = (await res.json()) as {
			success: boolean
			error: { code: string }
		}
		expect(body.success).toBe(false)
		expect(body.error.code).toBe('VALIDATION')
	})

	it('should create then delete a user', async () => {
		const created = await request(
			'/users/',
			json({ name: 'Elysia', email: 'elysia@example.com' }, { method: 'POST' })
		)

		expect(created.status).toBe(201)

		const { data: user } = (await created.json()) as {
			success: true
			data: { id: number; name: string; email: string }
		}
		expect(user).toMatchObject({
			name: 'Elysia',
			email: 'elysia@example.com'
		})

		const removed = await request(`/users/${user.id}`, { method: 'DELETE' })

		expect(removed.status).toBe(200)
		expect(await removed.json()).toEqual({ success: true, data: user })

		const gone = await request(`/users/${user.id}`)
		expect(gone.status).toBe(404)
	})

	it('should reject invalid body', async () => {
		const res = await request(
			'/users/',
			json({ name: '', email: 'not-an-email' }, { method: 'POST' })
		)

		expect(res.status).toBe(422)

		const body = (await res.json()) as {
			success: boolean
			error: { code: string }
		}
		expect(body.success).toBe(false)
		expect(body.error.code).toBe('VALIDATION')
	})
})
