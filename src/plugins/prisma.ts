import fp from 'fastify-plugin';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default fp(async (app)=>{
    app.decorate('prisma', prisma);

    app.addHook('onClose', async (app)=>{
            await app.prisma.$disconnect();
    })
});


declare module 'fastify'{
    interface FastifyInstance{
        prisma: PrismaClient;
    }
}