import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CreateUserInput } from "../schemas/user.schema.js";

const prisma = new PrismaClient();

export class UserService {
  async createUser(data: CreateUserInput) {
    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Email já está em uso");
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    // Retornar usuário sem a senha
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        createdAt: true,
      },
    });
    return users;
  }

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        createdAt: true,
      },
    });
    return user;
  }
}
