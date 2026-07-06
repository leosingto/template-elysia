import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'

import { AuthService } from '../modules/auth/service'
import { err } from '../lib/response'

// Fail closed: an unset NODE_ENV (common in bare Bun/Docker deploys) must not
// silently fall back to the publicly-known dev secret.
const NODE_ENV = process.env.NODE_ENV
const isDevOrTest = NODE_ENV === 'development' || NODE_ENV === 'test'

if (!process.env.JWT_SECRET && !isDevOrTest)
	throw new Error(
		'JWT_SECRET must be set unless NODE_ENV is "development" or "test"'
	)

if (!process.env.JWT_SECRET && NODE_ENV === 'development')
	console.warn('⚠️ JWT_SECRET is not set — using an insecure development-only fallback')

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production'

export const authPlugin = new Elysia({ name: 'auth-plugin' })
	.use(
		jwt({
			name: 'jwt',
			secret: JWT_SECRET,
			exp: '7d'
		})
	)
	.macro({
		auth: {
			async resolve({ headers, jwt, status }) {
				const authorization = headers.authorization

				if (!authorization?.startsWith('Bearer '))
					return status(401, err('UNAUTHORIZED', 'Unauthorized'))

				const payload = await jwt.verify(authorization.slice(7))

				if (!payload || typeof payload.sub !== 'string')
					return status(401, err('UNAUTHORIZED', 'Unauthorized'))

				const user = AuthService.findById(Number(payload.sub))

				if (!user) return status(401, err('UNAUTHORIZED', 'Unauthorized'))

				return { user: AuthService.toPublic(user) }
			}
		}
	})
