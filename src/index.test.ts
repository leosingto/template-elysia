import { describe, expect, it } from 'vitest'

import { app } from '.'

const request = (path: string, init?: RequestInit) =>
	app.handle(new Request(`http://localhost${path}`, init))

describe('Health', () => {
	it('should return ok', async () => {
		const res = await request('/health')

		expect(res.status).toBe(200)
		expect(await res.json()).toEqual({
			success: true,
			data: { status: 'ok' }
		})
	})
})

describe('Global error handling', () => {
	it('should return a NOT_FOUND envelope for an unknown route', async () => {
		const res = await request('/nope')

		expect(res.status).toBe(404)
		expect(await res.json()).toEqual({
			success: false,
			error: { code: 'NOT_FOUND', message: 'Not found' }
		})
	})
})
