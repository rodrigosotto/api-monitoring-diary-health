import Fastify from "fastify";
import { env } from "./config/env.js";

// Plugins
import corsPlugin from "./plugins/cors.js";
import jwtPlugin from "./plugins/jwt.js";
import prismaPlugin from "./plugins/prisma.js";
import swaggerPlugin from "./plugins/swagger.js";

// Routes
import { authRoutes } from "./routes/auth.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
export const app = Fastify({
  logger: {
    level: env.NODE_ENV === "production" ? "info" : "debug",
    transport:
      env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              ignore: "pid,hostname",
              translateTime: "HH:MM:ss Z",
            },
          }
        : undefined,
  },
});

// Registrar plugins
await app.register(corsPlugin);
await app.register(prismaPlugin);
await app.register(jwtPlugin);
await app.register(swaggerPlugin);

// Rota de health check
app.get("/", async () => {
  return {
    message: "Health Diary Monitoring API",
    version: "1.0.0",
    status: "running",
    docs: "/docs",
  };
});

// Registrar rotas
await app.register(authRoutes);
await app.register(userRoutes);
await app.register(dashboardRoutes);

// Tratamento de erros global
app.setErrorHandler(
  (error: Error & { validation?: unknown }, request, reply) => {
    if (error.validation) {
      return reply.status(400).send({
        message: "Erro de validação",
        errors: error.validation,
      });
    }

    app.log.error(error);

    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  }
);
