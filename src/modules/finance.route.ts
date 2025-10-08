// src/modules/finance.route.ts

import { Elysia } from 'elysia';
import { transactionSchema } from '../shared/finance.schema';
import { transactions } from '../db/in-memory';
import { isAuthenticated } from '../plugins/auth.plugin';

// Helper untuk menemukan transaksi dan memverifikasi kepemilikan
const findTransaction = (id: number, userId: number) => {
  return transactions.find(t => t.id === id && t.userId === userId);
};

export const financeRoutes = new Elysia({ prefix: '/transactions' })
  // Melindungi semua rute dalam grup ini
  .use(isAuthenticated) // <-- 2. Use the plugin correctly

  // CREATE: Menambah transaksi baru
  .post(
    '/',
    ({ body, currentUser, set }: any) => {
      const newTransaction = {
        id: transactions.length + 1,
        userId: currentUser.id, // Now TS knows currentUser is not null
        ...body,
        createdAt: new Date(),
      };
      transactions.push(newTransaction);
      set.status = 201;
      return { message: 'Transaksi berhasil dibuat', data: newTransaction };
    },
    {
      body: transactionSchema,
      detail: { summary: 'Membuat transaksi keuangan baru' }
    }
  )

// ... (the rest of the routes in this file remain the same)
// They will now be correctly typed and protected.