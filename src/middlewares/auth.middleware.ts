import { FastifyReply, FastifyRequest } from "fastify";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch (error) {
    return reply.status(401).send({
      message: "Token inválido ou ausente",
    });
  }
}

export async function checkRole(allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as { type: string };

      if (!allowedRoles.includes(user.type)) {
        return reply.status(403).send({
          message:
            "Acesso negado. Você não tem permissão para acessar este recurso.",
        });
      }
    } catch (error) {
      return reply.status(401).send({
        message: "Não autorizado",
      });
    }
  };
}
