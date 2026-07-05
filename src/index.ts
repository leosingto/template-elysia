import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { z } from 'zod'

import { user } from './modules/user'
import { auth } from './modules/auth'
import { example } from './modules/example'

export const app = new Elysia()
	.use(
		cors({
			// Set ALLOWED_ORIGINS (comma-separated) before exposing this API —
			// without it every origin is reflected, which is only safe for local dev.
			origin: process.env.ALLOWED_ORIGINS?.split(',') ?? true
		})
	)
	.use(
		openapi({
			mapJsonSchema: {
				zod: z.toJSONSchema
			},
			documentation: {
				info: {
					title: 'Elysia Template',
					version: '1.0.0'
				},
				tags: [
					{ name: 'App', description: 'General endpoints' },
					{ name: 'User', description: 'User management' },
					{ name: 'Auth', description: 'Authentication' },
					{
						name: 'Example',
						description: 'Public vs protected route examples'
					}
				]
			}
		})
	)
	.get('/health', () => ({ status: 'ok' as const }), {
		detail: { tags: ['App'], summary: 'Health check' }
	})
	.use(user)
	.use(auth)
	.use(example)

if (import.meta.main) {
	app.listen(3000)

	console.log(
		`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
	)
	console.log(
		`📖 OpenAPI docs at http://${app.server?.hostname}:${app.server?.port}/openapi`
	)
}
