import { z } from 'zod';

// helper: konversi string/number ke Date, biarkan nilai lain apa adanya
const toDate = (val: unknown) => {
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d;
  }
  return val;
};

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense'] as const, {
    message: "Tipe harus 'income' atau 'expense'"
  }),
  category: z.string().min(1, { message: "Kategori tidak boleh kosong" }),
  amount: z.number().positive({ message: "Jumlah harus angka positif" }),
  description: z.string().optional(),
  date: z
    .preprocess(toDate, z.date()) // coba konversi dulu
    .refine((d) => d instanceof Date && !isNaN(d.getTime()), {
      message: "Tanggal tidak valid"
    })
});

export type TransactionSchema = z.infer<typeof transactionSchema>;
