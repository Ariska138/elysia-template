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
  .post('/login', async ({ body, jwt, set, cookie }: any) => {
    const user = users.find(u => u.username === body.username && u.password === body.password);
    if (!user) {
      set.status = 401;
      return { error: 'Invalid credentials.' };
    }
    const token = await jwt.sign({ userId: user.id });
    cookie.auth.set({
      value: token,
      httpOnly: true,
      maxAge: 7 * 86400, // 7 days
    });
    return { message: 'Login successful.' };
  }, { body: loginSchema })
  .post('/logout', ({ removeCookie }: any) => {
    removeCookie('auth');
    return { message: 'Logout successful.' };
  });