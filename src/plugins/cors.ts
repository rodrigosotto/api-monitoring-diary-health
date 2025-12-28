import fastifyPlugin from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import { FastifyInstance } from "fastify";

async function corsPlugin(fastify: FastifyInstance) {
  fastify.register(fastifyCors, {
    origin: true, // Em produção, configure origens específicas
    credentials: true,
  });
}

export default fastifyPlugin(corsPlugin);
