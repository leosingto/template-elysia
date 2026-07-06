import { z } from 'zod'

// Zod schema builders — feed route `response` options so the envelope shows up
// in OpenAPI docs and Eden client types, not just at runtime.
export const successResponse = <T extends z.ZodType>(data: T) =>
	z.object({ success: z.literal(true), data })

export const errorResponse = <const C extends string>(code: C) =>
	z.object({
		success: z.literal(false),
		error: z.object({ code: z.literal(code), message: z.string() })
	})

// Runtime constructors used in handlers.
export const ok = <const T>(data: T) => ({ success: true as const, data })

export const err = <const C extends string>(code: C, message: string) => ({
	success: false as const,
	error: { code, message }
})

// Shared 401 schema — the auth macro in plugins/auth.ts is used by both the
// auth and example modules, so the schema lives here instead of per-module.
export const unauthorized = errorResponse('UNAUTHORIZED')
