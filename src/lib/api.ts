import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ZodError, type z, type ZodTypeAny } from 'zod';
import { authOptions } from '@/lib/auth';

export type SessionUser = { id: string; name: string; email: string; role: 'ADMIN' | 'STUDENT' };

/** Next 15 passes dynamic route params as a Promise. */
export type RouteContext<P extends Record<string, string>> = { params: Promise<P> };

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as SessionUser | undefined) ?? null;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user?.id) throw new ApiError(401, 'Unauthorized');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'ADMIN') throw new ApiError(403, 'Forbidden');
  return user;
}

export async function parseBody<S extends ZodTypeAny>(req: Request, schema: S): Promise<z.output<S>> {
  const body = await req.json().catch(() => {
    throw new ApiError(400, 'Invalid JSON body');
  });
  return schema.parse(body);
}

/** Wraps a route handler so thrown ApiError / ZodError / Prisma errors become JSON responses. */
export function handler<C>(fn: (req: Request, ctx: C) => Promise<Response>) {
  return async (req: Request, ctx: C) => {
    try {
      return await fn(req, ctx);
    } catch (err: any) {
      if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
      if (err instanceof ZodError) {
        const message = err.errors.map(e => `${e.path.join('.') || 'input'}: ${e.message}`).join('; ');
        return NextResponse.json({ error: message }, { status: 422 });
      }
      if (err?.code === 'P2002') return NextResponse.json({ error: 'A record with that value already exists' }, { status: 409 });
      if (err?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
      console.error(err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
