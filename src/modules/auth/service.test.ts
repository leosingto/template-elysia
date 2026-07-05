import { describe, expect, it } from 'vitest'

import { AuthService } from './service'

describe('AuthService', () => {
	it('should create a user with an incrementing id', () => {
		const first = AuthService.create({
			name: 'First',
			email: 'first@example.com',
			passwordHash: 'hash-1'
		})
		const second = AuthService.create({
			name: 'Second',
			email: 'second@example.com',
			passwordHash: 'hash-2'
		})

		expect(first).toEqual({
			id: expect.any(Number),
			name: 'First',
			email: 'first@example.com',
			passwordHash: 'hash-1'
		})
		expect(second.id).toBe(first.id + 1)
	})

	it('should find a user by email', () => {
		const created = AuthService.create({
			name: 'Find Me',
			email: 'find-by-email@example.com',
			passwordHash: 'hash'
		})

		expect(AuthService.findByEmail('find-by-email@example.com')).toEqual(
			created
		)
	})

	it('should return undefined for an unknown email', () => {
		expect(AuthService.findByEmail('nobody@example.com')).toBeUndefined()
	})

	it('should find a user by id', () => {
		const created = AuthService.create({
			name: 'By Id',
			email: 'find-by-id@example.com',
			passwordHash: 'hash'
		})

		expect(AuthService.findById(created.id)).toEqual(created)
	})

	it('should return undefined for an unknown id', () => {
		expect(AuthService.findById(999_999)).toBeUndefined()
	})
})
