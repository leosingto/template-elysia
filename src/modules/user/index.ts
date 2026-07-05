import { Elysia } from 'elysia'
import { z } from 'zod'

import { UserService } from './service'
import { user as userModel, createUser, userId, notFound } from './model'

export const user = new Elysia({ prefix: '/users', tags: ['User'] })
	.get('/', () => UserService.list(), {
		response: {
			200: z.array(userModel)
		},
		detail: { summary: 'List all users' }
	})
	.get('/:id', ({ params: { id } }) => UserService.find(id), {
		params: userId,
		response: {
			200: userModel,
			404: notFound
		},
		detail: { summary: 'Get a user by id' }
	})
	.post('/', ({ body, status }) => status(201, UserService.create(body)), {
		body: createUser,
		response: {
			201: userModel
		},
		detail: { summary: 'Create a user' }
	})
	.delete('/:id', ({ params: { id } }) => UserService.remove(id), {
		params: userId,
		response: {
			200: userModel,
			404: notFound
		},
		detail: { summary: 'Delete a user' }
	})
