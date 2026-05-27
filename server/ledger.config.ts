import { defineConfig } from "../index";

export default defineConfig({
  connection: "postgresql://postgres:postgres@localhost:5432/postgres",
  schemaFile: "/logger/schema",
  schema: "app",
  dialect: "postgresql",
  logger: {
    transport: {
      targets: [
        {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
        {
          target: "pino/file",
          options: {
            destination: "logs/app.log",
          },
        },
      ],
    },
  },
  maxBatchSize: 1000,
  flushInterval: 5000,
});
