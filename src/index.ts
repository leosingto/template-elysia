import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { z } from 'zod'

import { user } from './modules/user'
import { auth } from './modules/auth'

export const app = new Elysia()
	.use(cors())
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
					{ name: 'Auth', description: 'Authentication' }
				]
			}
		})
	)
	.get('/health', () => ({ status: 'ok' as const }), {
		detail: { tags: ['App'], summary: 'Health check' }
	})
	.use(user)
	.use(auth)

if (import.meta.main) {
	app.listen(3000)

	console.log(
		`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
	)
	console.log(
		`📖 OpenAPI docs at http://${app.server?.hostname}:${app.server?.port}/openapi`
	)
}
