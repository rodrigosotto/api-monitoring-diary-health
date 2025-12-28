export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3000,
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  DATABASE_URL: process.env.DATABASE_URL,
};
