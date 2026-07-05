import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'

import { AuthService } from '../modules/auth/service'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production'

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production')
	throw new Error('JWT_SECRET must be set in production')

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
					return status(401, 'Unauthorized' as const)

				const payload = await jwt.verify(authorization.slice(7))

				if (!payload || typeof payload.sub !== 'string')
					return status(401, 'Unauthorized' as const)

				const user = AuthService.findById(Number(payload.sub))

				if (!user) return status(401, 'Unauthorized' as const)

				return { user: AuthService.toPublic(user) }
			}
		}
	})
