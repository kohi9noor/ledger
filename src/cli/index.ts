#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .command("generate")
  .description("Generate migration from your tasks")
  .action(async () => {
    const { generate } = await import("./commands/generate.ts");
    await generate();
  });

program
  .command("migrate")
  .description("Run migrations")
  .action(async () => {
    const { migration } = await import("./commands/migration.ts");
    await migration();
  });

program.parse();
