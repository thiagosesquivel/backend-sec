import fastify from 'fastify';
import fastifyJWT from '@fastify/jwt';
import prisma from './plugins/prisma';
import authRoutes from './routes/auth';
import todoRoutes from './routes/todos';
import diagnostics from 'diagnostics_channel';
import cors from '@fastify/cors';

// Configure o canal de diagnóstico
const channel = diagnostics.channel('fastify.request.handler');

const app = fastify({ logger: true });
// Configurar CORS
app.register(cors, {
  origin: 'http://localhost:5173', // Substitua pelo endereço do frontend
  credentials: true, // Habilitar credenciais (cookies, headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
});

// Middleware para registrar eventos no canal
app.addHook('onRequest', (request, reply, done) => {
  channel.publish({ method: request.method, url: request.url });
  done();
});


app.register(fastifyJWT,{
    secret:'supersecreto'
})

app.register(prisma);
app.register(authRoutes);
app.register(todoRoutes);


app.get('/', async (request, reply) => {
  return { message: 'Hello, Fastify!' };
});



const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log('Server running at http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
