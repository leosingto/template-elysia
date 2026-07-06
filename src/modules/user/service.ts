import type { CreateUser, User } from './model'

export abstract class UserService {
	private static users: User[] = [
		{ id: 1, name: 'Saltyaom', email: 'saltyaom@elysiajs.com' }
	]

	private static nextId = 2

	static list(): User[] {
		return this.users
	}

	static find(id: number): User | undefined {
		return this.users.find((user) => user.id === id)
	}

	static create(body: CreateUser): User {
		const created: User = { id: this.nextId++, ...body }
		this.users.push(created)

		return created
	}

	static remove(id: number): User | undefined {
		const index = this.users.findIndex((user) => user.id === id)

		if (index === -1) return undefined

		const [removed] = this.users.splice(index, 1)

		return removed
	}
}
