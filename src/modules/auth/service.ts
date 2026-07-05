import type { AuthUser } from './model'

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

	// Re-checks the email at insert time: the controller's pre-check and the
	// insert are separated by an await (password hashing), so two concurrent
	// registrations could otherwise both pass the pre-check.
	static create(user: Omit<StoredAuthUser, 'id'>): StoredAuthUser | undefined {
		if (this.findByEmail(user.email)) return undefined

		const created: StoredAuthUser = { id: this.nextId++, ...user }
		this.users.push(created)

		return created
	}

	static toPublic(user: StoredAuthUser): AuthUser {
		return {
			id: user.id,
			name: user.name,
			email: user.email
		}
	}
}
