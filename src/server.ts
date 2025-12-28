import { app } from "./app.js";
import { env } from "./config/env.js";

async function start() {
  try {
    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });

    console.log(`\n🚀 Servidor rodando em: http://localhost:${env.PORT}`);
    console.log(
      `📚 Documentação disponível em: http://localhost:${env.PORT}/docs\n`
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
