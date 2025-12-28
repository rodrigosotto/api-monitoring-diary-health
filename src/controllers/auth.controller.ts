import { FastifyReply, FastifyRequest } from "fastify";
import { LoginInput, RefreshTokenInput } from "../schemas/auth.schema.js";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export class AuthController {
  async login(
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply
  ) {
    try {
      const user = await authService.login(request.body);

      // Gerar access token JWT (válido por 1 hora)
      const accessToken = request.server.jwt.sign(
        {
          id: user.id,
          email: user.email,
          type: user.type,
        },
        { expiresIn: "1h" }
      );

      // Gerar refresh token (válido por 90 dias)
      const refreshToken = await authService.generateRefreshToken(user.id);

      return reply.status(200).send({
        message: "Login realizado com sucesso",
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hora em segundos
        user,
      });
    } catch (error) {
      return reply.status(401).send({
        message:
          error instanceof Error ? error.message : "Erro ao realizar login",
      });
    }
  }

  async refresh(
    request: FastifyRequest<{ Body: RefreshTokenInput }>,
    reply: FastifyReply
  ) {
    try {
      const { refreshToken } = request.body;

      // Validar refresh token
      const user = await authService.validateRefreshToken(refreshToken);

      // Gerar novo access token
      const newAccessToken = request.server.jwt.sign(
        {
          id: user.id,
          email: user.email,
          type: user.type,
        },
        { expiresIn: "1h" }
      );

      return reply.status(200).send({
        message: "Token renovado com sucesso",
        accessToken: newAccessToken,
        expiresIn: 3600,
      });
    } catch (error) {
      return reply.status(401).send({
        message:
          error instanceof Error ? error.message : "Erro ao renovar token",
      });
    }
  }

  async logout(
    request: FastifyRequest<{ Body: RefreshTokenInput }>,
    reply: FastifyReply
  ) {
    try {
      const { refreshToken } = request.body;

      // Revogar o refresh token
      await authService.revokeRefreshToken(refreshToken);

      return reply.status(200).send({
        message: "Logout realizado com sucesso",
      });
    } catch (error) {
      return reply.status(400).send({
        message:
          error instanceof Error ? error.message : "Erro ao fazer logout",
      });
    }
  }

  async logoutAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as any).id;

      // Revogar todos os refresh tokens do usuário
      await authService.revokeAllUserTokens(userId);

      return reply.status(200).send({
        message: "Logout realizado em todos os dispositivos",
      });
    } catch (error) {
      return reply.status(400).send({
        message:
          error instanceof Error ? error.message : "Erro ao fazer logout",
      });
    }
  }
}
