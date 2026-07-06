import { Elysia } from 'elysia'

import { authPlugin } from '../../plugins/auth'
import { ok, successResponse } from '../../lib/response'
import { publicMessage, protectedMessage, unauthorized } from './model'

export const example = new Elysia({ prefix: '/example', tags: ['Example'] })
	.use(authPlugin)
	.get(
		'/public',
		() => ok({ message: 'This route is public — no token required' }),
		{
			response: {
				200: successResponse(publicMessage)
			},
			detail: { summary: 'Public route, no authentication needed' }
		}
	)
	.get(
		'/protected',
		({ user }) =>
			ok({
				message: `Hello ${user.name}, you are authenticated`,
				user
			}),
		{
			auth: true,
			response: {
				200: successResponse(protectedMessage),
				401: unauthorized
			},
			detail: {
				summary: 'Protected route, requires a Bearer JWT',
				security: [{ bearerAuth: [] }]
			}
		}
	)
