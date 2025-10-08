// src/plugins/auth.plugin.ts

import { Elysia } from "elysia";

export const isAuthenticated = new Elysia({
  name: 'isAuthenticated'
})
  .onBeforeHandle(({ currentUser, set }: any) => {
    if (!currentUser) {
      // By returning a standard `Response` object, we ensure the request is halted.
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  });