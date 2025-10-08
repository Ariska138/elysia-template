import { app } from './src/app';
import { swagger } from '@elysiajs/swagger';
import { openapi } from '@elysiajs/openapi'

let server = app;

if (process.env.NODE_ENV !== 'production') {
  server = server.use(swagger({
    path: '/swagger',
    documentation: { info: { title: 'Elysia API', version: '1.0.0' } }
  }));

  // server = server.use(openapi());

  const devApp = server.listen(3000);
  console.log(`🦊 Elysia is running at http://localhost:${devApp.server?.port}`);
  console.log(`📄 Swagger UI available at http://localhost:${devApp.server?.port}/swagger`);
} else {
  // Jalankan server tanpa Swagger untuk produksi
  const prodApp = server.listen(3000);
  console.log(`🦊 Elysia is running in production at http://localhost:${prodApp.server?.port}`);
}