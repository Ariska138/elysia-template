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
  // Fungsi 'derive' ini akan berjalan di setiap request untuk memverifikasi cookie JWT
  // dan menambahkan 'currentUser' ke dalam konteks.
  .derive(async ({ jwt, cookie }): Promise<{ currentUser: User | null }> => {
    const authCookie = cookie.auth;
    if (!authCookie) return { currentUser: null };

    const userPayload = await jwt.verify(authCookie);
    if (!userPayload) return { currentUser: null };

    const user = users.find(u => u.id === userPayload.userId) || null;

    return { currentUser: user };
  })
  // Rute otentikasi tidak memerlukan perlindungan
  .use(authRoutes)
  // Rute finansial sudah dilindungi di dalam filenya sendiri (finance.route.ts)
  .use(financeRoutes)
  .group('/users', app => app
    // Terapkan plugin HANYA pada grup rute yang memerlukan otentikasi.
    .use(isAuthenticated)
    .get('/me', ({ currentUser }) => {
      // Tidak perlu lagi memeriksa `currentUser` di sini,
      // karena plugin 'isAuthenticated' sudah menjalankannya.
      // Jika kode ini berjalan, 'currentUser' dijamin ada.
      return currentUser;
    })
  );

export type App = typeof app;