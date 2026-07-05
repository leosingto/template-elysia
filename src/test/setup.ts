// Vitest workers run under Node, where the Bun global does not exist.
// Provide a minimal Bun shim so the app can boot: Elysia reads Bun.env
// at construction time, and the auth routes hash and verify passwords
// via Bun.password. Under a Bun-powered runner the real argon2id is used.
if (typeof globalThis.Bun === 'undefined') {
	;(globalThis as Record<string, unknown>).Bun = {
		env: process.env,
		gc: () => {},
		password: {
			hash: async (password: string) => `test-hash:${password}`,
			verify: async (password: string, hash: string) =>
				hash === `test-hash:${password}`
		}
	}
}
