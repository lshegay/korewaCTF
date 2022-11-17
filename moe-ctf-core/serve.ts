import serve from './app/mod.ts';

serve(4000, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
  },
});
