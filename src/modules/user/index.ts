import { Elysia, t } from 'elysia'

import { UserService } from './service'
import { models, user as userModel } from './model'

export const user = new Elysia({ prefix: '/users', tags: ['User'] })
	.model(models)
	.get('/', () => UserService.list(), {
		response: {
			200: t.Array(userModel)
		},
		detail: { summary: 'List all users' }
	})
	.get('/:id', ({ params: { id } }) => UserService.find(id), {
		params: 'userId',
		response: {
			200: 'user',
			404: 'notFound'
		},
		detail: { summary: 'Get a user by id' }
	})
	.post('/', ({ body, status }) => status(201, UserService.create(body)), {
		body: 'createUser',
		response: {
			201: 'user'
		},
		detail: { summary: 'Create a user' }
	})
	.delete('/:id', ({ params: { id } }) => UserService.remove(id), {
		params: 'userId',
		response: {
			200: 'user',
			404: 'notFound'
		},
		detail: { summary: 'Delete a user' }
	})
