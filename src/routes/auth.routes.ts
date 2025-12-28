import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AuthController } from "../controllers/auth.controller.js";
import { loginSchema, refreshTokenSchema } from "../schemas/auth.schema.js";

const authController = new AuthController();

export async function authRoutes(app: FastifyInstance) {
  // Login
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/login",
    schema: {
      tags: ["Autenticação"],
      summary: "Realizar login na aplicação",
      description:
        "Autentica um usuário com email e senha, retornando um access token (1h) e refresh token (90 dias)",
      body: loginSchema,
      response: {
        200: z
          .object({
            message: z.string(),
            accessToken: z.string(),
            refreshToken: z.string(),
            expiresIn: z.number(),
            user: z.object({
              id: z.number(),
              name: z.string(),
              email: z.string().email(),
              type: z.string(),
              createdAt: z.string().or(z.date()),
            }),
          })
          .describe("Login realizado com sucesso"),
        401: z
          .object({
            message: z.string(),
          })
          .describe("Credenciais inválidas"),
      },
    },
    handler: authController.login.bind(authController),
  });

  // Refresh Token
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/refresh",
    schema: {
      tags: ["Autenticação"],
      summary: "Renovar access token",
      description:
        "Gera um novo access token usando um refresh token válido. Use quando o access token expirar.",
      body: refreshTokenSchema,
      response: {
        200: z
          .object({
            message: z.string(),
            accessToken: z.string(),
            expiresIn: z.number(),
          })
          .describe("Token renovado com sucesso"),
        401: z
          .object({
            message: z.string(),
          })
          .describe("Refresh token inválido ou expirado"),
      },
    },
    handler: authController.refresh.bind(authController),
  });

  // Logout (revogar refresh token específico)
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/logout",
    schema: {
      tags: ["Autenticação"],
      summary: "Fazer logout",
      description:
        "Revoga o refresh token fornecido, invalidando-o para uso futuro",
      body: refreshTokenSchema,
      response: {
        200: z
          .object({
            message: z.string(),
          })
          .describe("Logout realizado com sucesso"),
        400: z
          .object({
            message: z.string(),
          })
          .describe("Erro ao fazer logout"),
      },
    },
    handler: authController.logout.bind(authController),
  });

  // Logout de todos os dispositivos
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/logout-all",
    onRequest: [app.authenticate],
    schema: {
      tags: ["Autenticação"],
      summary: "Fazer logout de todos os dispositivos",
      description:
        "Revoga todos os refresh tokens do usuário autenticado, fazendo logout de todos os dispositivos",
      security: [{ bearerAuth: [] }],
      response: {
        200: z
          .object({
            message: z.string(),
          })
          .describe("Logout realizado em todos os dispositivos"),
        401: z
          .object({
            message: z.string(),
          })
          .describe("Não autorizado"),
        400: z
          .object({
            message: z.string(),
          })
          .describe("Erro ao fazer logout"),
      },
    },
    handler: authController.logoutAll.bind(authController),
  });
}
