import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';

export default async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string };

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await app.prisma.user.create({
        data: { username, password: hashedPassword },
      });
      reply.code(201).send({ userId: user.id });
    } catch (err) {
      reply.code(400).send({ error: 'Username already exists' });
    }
  });

  app.post('/login', async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string };

    const user = await app.prisma.user.findUnique({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.code(401).send({ error: 'Invalid username or password' });
    }

    const token = app.jwt.sign({ userId: user.id });
    reply.send({ token, username: user.username, id: user.id  });
  });
}
