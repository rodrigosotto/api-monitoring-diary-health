import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserInput } from "../schemas/user.schema.js";
import { PaginationInput } from "../schemas/pagination.schema.js";
import { UserService } from "../services/user.service.js";

const userService = new UserService();

export class UserController {
  async createUser(
    request: FastifyRequest<{ Body: CreateUserInput }>,
    reply: FastifyReply
  ) {
    try {
      const user = await userService.createUser(request.body);
      return reply.status(201).send({
        message: "Usuário criado com sucesso",
        user,
      });
    } catch (error) {
      return reply.status(400).send({
        message:
          error instanceof Error ? error.message : "Erro ao criar usuário",
      });
    }
  }

  async getAllUsers(
    request: FastifyRequest<{ Querystring: PaginationInput }>,
    reply: FastifyReply
  ) {
    try {
      const paginatedUsers = await userService.getAllUsers(request.query);
      return reply.status(200).send(paginatedUsers);
    } catch (error) {
      return reply.status(500).send({
        message: "Erro ao buscar usuários",
      });
    }
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as any).id;
      const user = await userService.getUserById(userId);

      if (!user) {
        return reply.status(404).send({ message: "Usuário não encontrado" });
      }

      return reply.status(200).send(user);
    } catch (error) {
      return reply.status(500).send({
        message: "Erro ao buscar perfil",
      });
    }
  }
}
