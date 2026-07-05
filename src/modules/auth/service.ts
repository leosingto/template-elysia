export interface StoredAuthUser {
	id: number
	name: string
	email: string
	passwordHash: string
}

export abstract class AuthService {
	private static users: StoredAuthUser[] = []

	private static nextId = 1

	static findByEmail(email: string): StoredAuthUser | undefined {
		return this.users.find((user) => user.email === email)
	}

	static findById(id: number): StoredAuthUser | undefined {
		return this.users.find((user) => user.id === id)
	}

	static create(user: Omit<StoredAuthUser, 'id'>): StoredAuthUser {
		const created: StoredAuthUser = { id: this.nextId++, ...user }
		this.users.push(created)

		return created
	}
}
