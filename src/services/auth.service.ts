import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { LoginInput } from "../schemas/auth.schema.js";

const prisma = new PrismaClient();

export class AuthService {
  async login(data: LoginInput) {
    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Credenciais inválidas");
    }

    // Retornar dados do usuário (sem a senha)
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async generateRefreshToken(userId: number) {
    // Gerar token único
    const token = crypto.randomBytes(64).toString("hex");

    // Data de expiração: 90 dias
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    // Salvar no banco
    const refreshToken = await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return refreshToken.token;
  }

  async validateRefreshToken(token: string) {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      throw new Error("Refresh token inválido");
    }

    if (refreshToken.revoked) {
      throw new Error("Refresh token foi revogado");
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new Error("Refresh token expirado");
    }

    const { password, ...userWithoutPassword } = refreshToken.user;
    return userWithoutPassword;
  }

  async revokeRefreshToken(token: string) {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  }

  async revokeAllUserTokens(userId: number) {
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async cleanExpiredTokens() {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
