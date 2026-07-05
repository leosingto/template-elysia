import { Elysia } from 'elysia'

import { authPlugin } from '../../plugins/auth'
import { publicMessage, protectedMessage, unauthorized } from './model'

export const example = new Elysia({ prefix: '/example', tags: ['Example'] })
	.use(authPlugin)
	.get(
		'/public',
		() => ({ message: 'This route is public — no token required' }),
		{
			response: {
				200: publicMessage
			},
			detail: { summary: 'Public route, no authentication needed' }
		}
	)
	.get(
		'/protected',
		({ user }) => ({
			message: `Hello ${user.name}, you are authenticated`,
			user
		}),
		{
			auth: true,
			response: {
				200: protectedMessage,
				401: unauthorized
			},
			detail: {
				summary: 'Protected route, requires a Bearer JWT',
				security: [{ bearerAuth: [] }]
			}
		}
	)
