import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { UserController } from "../controllers/user.controller.js";
import { createUserSchema } from "../schemas/user.schema.js";
import { paginationSchema } from "../schemas/pagination.schema.js";

const userController = new UserController();

export async function userRoutes(app: FastifyInstance) {
  // Criar usuário
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/users",
    schema: {
      tags: ["Usuários"],
      summary: "Criar novo usuário",
      description: "Registra um novo usuário no sistema (médico ou paciente)",
      body: createUserSchema,
      response: {
        201: z
          .object({
            message: z.string(),
            user: z.object({
              id: z.number(),
              name: z.string(),
              email: z.string().email(),
              type: z.string(),
              createdAt: z.string().or(z.date()),
            }),
          })
          .describe("Usuário criado com sucesso"),
        400: z
          .object({
            message: z.string(),
          })
          .describe("Erro ao criar usuário"),
      },
    },
    handler: userController.createUser.bind(userController),
  });

  // Listar todos os usuários
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/users",
    schema: {
      tags: ["Usuários"],
      summary: "Listar todos os usuários com paginação",
      description:
        "Retorna a lista paginada de todos os usuários cadastrados no sistema",
      querystring: paginationSchema,
      response: {
        200: z
          .object({
            data: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
                email: z.string().email(),
                type: z.string(),
                createdAt: z.string().or(z.date()),
              })
            ),
            meta: z.object({
              currentPage: z.number(),
              itemsPerPage: z.number(),
              totalItems: z.number(),
              totalPages: z.number(),
              hasNextPage: z.boolean(),
              hasPreviousPage: z.boolean(),
            }),
          })
          .describe("Lista paginada de usuários"),
        500: z
          .object({
            message: z.string(),
          })
          .describe("Erro ao buscar usuários"),
      },
    },
    handler: userController.getAllUsers.bind(userController),
  });

  // Ver perfil (rota protegida)
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/profile",
    onRequest: [app.authenticate],
    schema: {
      tags: ["Usuários"],
      summary: "Ver perfil do usuário autenticado",
      description:
        "Retorna os dados do perfil do usuário logado. Requer autenticação JWT.",
      security: [{ bearerAuth: [] }],
      response: {
        200: z
          .object({
            id: z.number(),
            name: z.string(),
            email: z.string().email(),
            type: z.string(),
            createdAt: z.string().or(z.date()),
          })
          .describe("Dados do perfil"),
        401: z
          .object({
            message: z.string(),
          })
          .describe("Não autorizado"),
        404: z
          .object({
            message: z.string(),
          })
          .describe("Usuário não encontrado"),
      },
    },
    handler: userController.getProfile.bind(userController),
  });
}
