import { FastifyInstance } from 'fastify';

export default async function todoRoutes(app: FastifyInstance) {
  // Hook para verificar o token em todas as rotas
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify(); // Verifica o token e adiciona os dados ao `request.user`
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  app.get('/tasks', async (request, reply) => {
    const todos = await app.prisma.todo.findMany({
      where: { userId: request.user.userId },
    });
    reply.send(todos);
  });

  app.post('/tasks', async (request, reply) => {
    const { title } = request.body as { title: string };

    const todo = await app.prisma.todo.create({
      data: {
        title,
        userId: request.user.userId,
      },
    });
    reply.code(201).send(todo);
  });

  app.put('/tasks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { title, completed } = request.body as { title: string; completed: boolean };
    const todo = await app.prisma.todo.updateMany({
      where: { id: Number(id), userId: request.user.userId },
      data: { title, completed },
    });

    if (!todo.count) {
      return reply.code(404).send({ error: 'Todo not found' });
    }

    reply.send({ message: 'Todo updated successfully' });
  });

  app.delete('/tasks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const todo = await app.prisma.todo.deleteMany({
      where: { id: Number(id), userId: request.user.userId },
    });

    if (!todo.count) {
      return reply.code(404).send({ error: 'Todo not found' });
    }

    reply.send({ message: 'Todo deleted successfully' });
  });
}
