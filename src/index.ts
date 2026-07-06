import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { z } from 'zod'

import { ok, err, successResponse } from './lib/response'
import { user } from './modules/user'
import { auth } from './modules/auth'
import { example } from './modules/example'

export const app = new Elysia()
	.onError(({ code, error, set }) => {
		switch (code) {
			case 'VALIDATION':
				set.status = 422
				return err('VALIDATION', error.message)
			case 'NOT_FOUND':
				set.status = 404
				return err('NOT_FOUND', 'Not found')
			case 'PARSE':
				set.status = 400
				return err('PARSE', 'Invalid request body')
			default:
				// Never leak error.message — internal errors may carry sensitive detail
				set.status = 500
				return err('INTERNAL_SERVER_ERROR', 'Internal server error')
		}
	})
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
	.get('/health', () => ok({ status: 'ok' as const }), {
		response: {
			200: successResponse(z.object({ status: z.literal('ok') }))
		},
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
