import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkRole } from "../middlewares/auth.middleware.js";

export async function dashboardRoutes(app: FastifyInstance) {
  // Dashboard do médico
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/doctors/dashboard",
    onRequest: [app.authenticate, await checkRole(["medico"])],
    schema: {
      tags: ["Médicos"],
      summary: "Dashboard do médico",
      description:
        "Acesso exclusivo para usuários do tipo médico. Retorna informações do dashboard médico.",
      security: [{ bearerAuth: [] }],
      response: {
        200: z
          .object({
            message: z.string(),
            user: z.object({
              id: z.number(),
              email: z.string(),
              type: z.string(),
            }),
          })
          .describe("Dashboard do médico"),
        401: z
          .object({
            message: z.string(),
          })
          .describe("Não autorizado"),
        403: z
          .object({
            message: z.string(),
          })
          .describe("Acesso negado"),
      },
    },
    handler: async (request, reply) => {
      const user = request.user as { id: number; email: string; type: string };

      return reply.status(200).send({
        message: "Bem-vindo ao dashboard do médico",
        user,
      });
    },
  });

  // Dashboard do paciente
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/patients/dashboard",
    onRequest: [app.authenticate, await checkRole(["paciente"])],
    schema: {
      tags: ["Pacientes"],
      summary: "Dashboard do paciente",
      description:
        "Acesso exclusivo para usuários do tipo paciente. Retorna informações do dashboard do paciente.",
      security: [{ bearerAuth: [] }],
      response: {
        200: z
          .object({
            message: z.string(),
            user: z.object({
              id: z.number(),
              email: z.string(),
              type: z.string(),
            }),
          })
          .describe("Dashboard do paciente"),
        401: z
          .object({
            message: z.string(),
          })
          .describe("Não autorizado"),
        403: z
          .object({
            message: z.string(),
          })
          .describe("Acesso negado"),
      },
    },
    handler: async (request, reply) => {
      const user = request.user as { id: number; email: string; type: string };

      return reply.status(200).send({
        message: "Bem-vindo ao dashboard do paciente",
        user,
      });
    },
  });
}
