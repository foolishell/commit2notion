import chalk from "chalk";
import { Command } from "commander";
import prompts from "prompts";

import { createInits, loadCredentials, saveCredentails } from "../file-systems";
import { skipLine } from "../utils";

export const makeInitCommand = () => {
  const program = new Command("init");

  program.description("initialize configurations").action(async () => {
    // create needed dirctorys and files
    await createInits();
    // load credentials
    const credentials = await loadCredentials();

    skipLine();

    // ask notion token
    const notion_token = await askNotionToken();

    if (!notion_token) {
      console.warn(chalk.yellow.bold("no inputs were found"));
    } else {
      credentials["NOTION_TOKEN"] = notion_token;
      await saveCredentails(credentials);
      skipLine();
      console.log(`use ${chalk.green.bold("'c2n db --new'")} to add databases`);
    }

    skipLine();
  });

  return program;
};

const askNotionToken = async () => {
  const res = await prompts({
    type: "invisible",
    name: "value",
    message: chalk.green.bold("input notion token"),
  });
  return res.value;
};
