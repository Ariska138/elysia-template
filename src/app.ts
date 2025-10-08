// src/app.ts

import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cookie } from '@elysiajs/cookie';
import { users, type User } from './db/in-memory';
import { authRoutes } from './modules/auth.route';
import { financeRoutes } from './modules/finance.route';
import { isAuthenticated } from './plugins/auth.plugin';

export const app = new Elysia()
  .use(cookie())
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET!
  }))
  .derive(async ({ jwt, cookie }): Promise<{ currentUser: User | null }> => {
    const authCookie = cookie.auth;
    if (!authCookie) return { currentUser: null };

    const userPayload = await jwt.verify(authCookie);
    if (!userPayload) return { currentUser: null };

    const user = users.find(u => u.id === userPayload.userId) || null;

    return { currentUser: user };
  })
  .use(isAuthenticated) // <-- Pindahkan plugin ke sini
  .use(authRoutes)
  .use(financeRoutes)
  .group('/users', app => app
    // .use(isAuthenticated) // <-- Hapus dari sini
    .get('/me', ({ currentUser }) => {
      if (!currentUser) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      return currentUser;
    })
  );

export type App = typeof app;