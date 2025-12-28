import fastifyPlugin from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import fastifyScalar from "@scalar/fastify-api-reference";
import { FastifyInstance } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

async function swaggerPlugin(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Health Diary Monitoring API",
        description:
          "API REST para gerenciamento e monitoramento de saúde diária para pacientes",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Servidor de desenvolvimento",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Token JWT obtido através do endpoint /login",
          },
        },
      },
      tags: [
        {
          name: "Autenticação",
          description: "Endpoints relacionados à autenticação de usuários",
        },
        {
          name: "Usuários",
          description: "Endpoints para gerenciamento de usuários",
        },
        {
          name: "Médicos",
          description: "Endpoints exclusivos para médicos",
        },
        {
          name: "Pacientes",
          description: "Endpoints exclusivos para pacientes",
        },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await fastify.register(fastifyScalar, {
    routePrefix: "/docs",
    configuration: {
      theme: "purple",
      hideDownloadButton: false,
    },
  });
}

export default fastifyPlugin(swaggerPlugin);
