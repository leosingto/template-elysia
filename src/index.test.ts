import { describe, expect, it } from 'vitest'

import { app } from '.'

const request = (path: string, init?: RequestInit) =>
	app.handle(new Request(`http://localhost${path}`, init))

describe('Health', () => {
	it('should return ok', async () => {
		const res = await request('/health')

		expect(res.status).toBe(200)
		expect(await res.json()).toEqual({ status: 'ok' })
	})
})
