import fastifyPlugin from "fastify-plugin";
import fastifyJwt from "fastify-jwt";
import { FastifyInstance } from "fastify";
import { authenticate } from "../middlewares/auth.middleware.js";

async function jwtPlugin(fastify: FastifyInstance) {
  const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

  fastify.register(fastifyJwt, {
    secret: jwtSecret,
  });

  fastify.decorate("authenticate", authenticate);
}

export default fastifyPlugin(jwtPlugin);
