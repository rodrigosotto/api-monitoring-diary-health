import fastifyPlugin from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function prismaPlugin(fastify: FastifyInstance) {
  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async (app) => {
    await app.prisma.$disconnect();
  });
}

export default fastifyPlugin(prismaPlugin);
