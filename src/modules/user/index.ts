import { Elysia } from 'elysia'
import { z } from 'zod'

import { ok, err, successResponse } from '../../lib/response'
import { UserService } from './service'
import { user as userModel, createUser, userId, notFound } from './model'

export const user = new Elysia({ prefix: '/users', tags: ['User'] })
	.get('/', () => ok(UserService.list()), {
		response: {
			200: successResponse(z.array(userModel))
		},
		detail: { summary: 'List all users' }
	})
	.get(
		'/:id',
		({ params: { id }, status }) => {
			const found = UserService.find(id)

			if (!found) return status(404, err('NOT_FOUND', 'User not found'))

			return ok(found)
		},
		{
			params: userId,
			response: {
				200: successResponse(userModel),
				404: notFound
			},
			detail: { summary: 'Get a user by id' }
		}
	)
	.post('/', ({ body, status }) => status(201, ok(UserService.create(body))), {
		body: createUser,
		response: {
			201: successResponse(userModel)
		},
		detail: { summary: 'Create a user' }
	})
	.delete(
		'/:id',
		({ params: { id }, status }) => {
			const removed = UserService.remove(id)

			if (!removed) return status(404, err('NOT_FOUND', 'User not found'))

			return ok(removed)
		},
		{
			params: userId,
			response: {
				200: successResponse(userModel),
				404: notFound
			},
			detail: { summary: 'Delete a user' }
		}
	)
