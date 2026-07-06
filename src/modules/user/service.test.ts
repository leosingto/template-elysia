import { describe, expect, it } from 'vitest'

import { UserService } from './service'

describe('UserService', () => {
	it('should list the seed user', () => {
		expect(UserService.list()).toEqual([
			{ id: 1, name: 'Saltyaom', email: 'saltyaom@elysiajs.com' }
		])
	})

	it('should find a user by id', () => {
		expect(UserService.find(1)).toEqual({
			id: 1,
			name: 'Saltyaom',
			email: 'saltyaom@elysiajs.com'
		})
	})

	it('should return undefined for an unknown id', () => {
		expect(UserService.find(999)).toBeUndefined()
	})

	it('should create a user with an incrementing id', () => {
		const created = UserService.create({
			name: 'Elysia',
			email: 'elysia@example.com'
		})

		expect(created).toEqual({
			id: 2,
			name: 'Elysia',
			email: 'elysia@example.com'
		})
		expect(UserService.list()).toContainEqual(created)
	})

	it('should remove a user and return it', () => {
		const created = UserService.create({
			name: 'To Remove',
			email: 'to-remove@example.com'
		})

		expect(UserService.remove(created.id)).toEqual(created)
		expect(UserService.list()).not.toContainEqual(created)
	})

	it('should return undefined when removing an unknown id', () => {
		expect(UserService.remove(999)).toBeUndefined()
	})
})
