import { status } from 'elysia'

import type { CreateUser, User } from './model'

export abstract class UserService {
	private static users: User[] = [
		{ id: 1, name: 'Saltyaom', email: 'saltyaom@elysiajs.com' }
	]

	private static nextId = 2

	static list(): User[] {
		return this.users
	}

	static find(id: number) {
		const found = this.users.find((user) => user.id === id)

		if (!found) return status(404, 'User not found' as const)

		return found
	}

	static create(body: CreateUser): User {
		const created: User = { id: this.nextId++, ...body }
		this.users.push(created)

		return created
	}

	static remove(id: number) {
		const index = this.users.findIndex((user) => user.id === id)

		if (index === -1) return status(404, 'User not found' as const)

		const [removed] = this.users.splice(index, 1)

		return removed
	}
}
