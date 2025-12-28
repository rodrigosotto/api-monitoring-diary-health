import { PrismaClient } from "@prisma/client";
import fastifyJwt from "fastify-jwt";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }

  interface FastifyRequest {
    user?: {
      id: number;
      email: string;
      type: string;
    };
  }
}

declare module "fastify-jwt" {
  interface FastifyJWT {
    payload: {
      id: number;
      email: string;
      type: string;
    };
    user: {
      id: number;
      email: string;
      type: string;
    };
  }
}
