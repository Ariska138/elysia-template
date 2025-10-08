import { Elysia } from 'elysia';
import { registerSchema, loginSchema } from '../shared/auth.schema';
import { users, type User } from '../db/in-memory';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/register', ({ body, set }) => {
    const userExists = users.some(u => u.username === body.username);
    if (userExists) {
      set.status = 400;
      return { error: 'Username already exists.' };
    }
    const newUser = { id: users.length + 1, ...body };
    users.push(newUser);
    set.status = 201;
    return { message: 'User registered successfully.' };
  }, { body: registerSchema })
  // src/modules/auth.route.ts (potongan)


  // asumsi: konteks handler menyediakan { body, jwt, cookie, set }
  // - jwt: plugin jwt dari @elysiajs/jwt
  // - cookie: plugin cookie dari @elysiajs/cookie
  // Jika struktur plugin Anda berbeda, saya sertakan fallback di dalamnya.

  .post('/login', async ({ body, jwt, cookie, set }: any) => {
    // validasi body sudah bisa dilakukan oleh route validation, tapi double-check:
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { error: parsed.error.flatten() };
    }

    const { username, password } = parsed.data;

    // contoh verifikasi user (ganti sesuai DB Anda)
    const user = users.find(u => u.username === username);
    if (!user) {
      set.status = 401;
      return { error: 'User tidak ditemukan' };
    }

    // NOTE: jangan simpan password plain-text di production. Gunakan bcrypt/argon2.
    if (user.password !== password) {
      set.status = 401;
      return { error: 'Password salah' };
    }

    // buat token JWT
    const token = await jwt.sign({ userId: user.id });

    // Secure cookie options — untuk development pakai secure: false, untuk production gunakan true dan HTTPS
    const cookieOptions = {
      httpOnly: true,
      path: '/',         // pastikan path konsisten antara set dan remove
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      secure: process.env.NODE_ENV === 'production', // dev=false
      sameSite: 'lax' as const
    };

    // Dua kemungkinan API cookie tergantung versi / plugin:
    // 1) cookie.set('name', value, options)
    // 2) cookie.auth.set({ value, ...options }) (reactive)
    try {
      if (typeof cookie?.set === 'function') {
        // API umum: cookie.set(name, value, opts)
        cookie.set('auth', token, cookieOptions);
      } else if (cookie?.auth && typeof cookie.auth.set === 'function') {
        // reactive pattern used earlier in conversation
        cookie.auth.set({
          value: token,
          ...cookieOptions
        });
      } else if (typeof set?.header === 'function') {
        // fallback: langsung set header (manual)
        const serialized = `auth=${token}; HttpOnly; Path=/; Max-Age=${cookieOptions.maxAge}; SameSite=${cookieOptions.sameSite};${cookieOptions.secure ? ' Secure;' : ''}`;
        set.header('Set-Cookie', serialized);
      } else {
        // jika tidak ada API cookie yang kita kenal — return token di body (sebagai fallback, hanya untuk debug)
        return { token, warning: 'Cookie plugin tidak tersedia; token dikembalikan di body (dev only)' };
      }
    } catch (err) {
      console.error('Gagal set cookie:', err);
      set.status = 500;
      return { error: 'Gagal melakukan login (cookie)' };
    }

    set.status = 200;
    return { message: 'Login sukses' };
  })

  .post('/logout', ({ cookie, set }: any) => {
    const cookieOptions = { path: '/', maxAge: 0, expires: new Date(0) };

    if (typeof cookie?.set === 'function') {
      cookie.set('auth', '', cookieOptions);
    } else if (cookie?.auth && typeof cookie.auth.set === 'function') {
      cookie.auth.set({ value: '', ...cookieOptions });
    } else if (typeof set?.header === 'function') {
      set.header('Set-Cookie', `auth=; Path=/; Max-Age=0; Expires=${new Date(0).toUTCString()}; HttpOnly`);
    }

    set.status = 200;
    return { message: 'Logout sukses' };
  });
