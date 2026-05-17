import { defineConfig } from "../index";

export default defineConfig({
  connection: "postgresql://postgres:postgres@localhost:5432/postgres",
  schemaFile: "/logger/schema",
  schema: "app",
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  },
});
