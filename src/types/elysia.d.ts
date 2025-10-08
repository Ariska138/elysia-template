import type { User } from '../db/in-memory';

declare module 'elysia' {
  interface Context {
    currentUser: User | null;
  }
}
