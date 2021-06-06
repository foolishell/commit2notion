import chalk from "chalk";
import { Command } from "commander";

import { deleteCommitJson, listCommitFiles, parseCommitJson } from "../file-systems";
import { createItemInDatabase } from "../notion";

export const makePushCommand = () => {
  const program = new Command("push");

  program.description("send created commits to notion database").action(async () => {
    console.log(chalk.green.bold("pushing all local commits..."));
    try {
      // read files from /.c2n/commits/
      const files = await listCommitFiles();
      await Promise.all(
        files.map(async (f) => {
          const body = await parseCommitJson(f);
          await createItemInDatabase(body);
          await deleteCommitJson(f);
          console.log(f);
        }),
      );
      console.log(chalk.green.bold("\npush completed! 🐚"));
    } catch (e) {
      console.error("Error occurred while pushing commits");
      throw e;
    }
  });

  return program;
};
