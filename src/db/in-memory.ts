// src/db/in-memory.ts

import type { RegisterSchema } from "../shared/auth.schema";
import type { TransactionSchema } from "../shared/finance.schema";

// Tipe untuk pengguna, gabungan dari skema registrasi dan ID
export type User = RegisterSchema & { id: number };

// Tipe untuk transaksi, gabungan dari skema transaksi dan data tambahan
export type Transaction = TransactionSchema & {
  id: number;
  userId: number;
  createdAt: Date;
};

// Penyimpanan data sementara dengan tipe yang jelas
export const users: User[] = [];
export const transactions: Transaction[] = [];