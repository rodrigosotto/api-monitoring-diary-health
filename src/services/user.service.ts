import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CreateUserInput } from "../schemas/user.schema.js";
import {
  calculatePagination,
  createPaginatedResponse,
  PaginationParams,
} from "../utils/pagination.js";

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

  async getAllUsers(paginationParams: PaginationParams) {
    const { skip, take } = calculatePagination(paginationParams);

    // Buscar usuários com paginação
    const [users, totalItems] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          type: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count(),
    ]);

    return createPaginatedResponse(users, paginationParams, totalItems);
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
