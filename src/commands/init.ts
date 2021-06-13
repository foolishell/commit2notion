import chalk from "chalk";
import { Command } from "commander";
import prompts from "prompts";

import { createInits, loadCredentials, saveCredentails } from "../file-systems";

export const makeInitCommand = () => {
  const program = new Command("init");

  program.description("initialize configurations").action(async () => {
    // create needed dirctorys and files
    await createInits();
    // load credentials
    const credentials = await loadCredentials();

    const notion_token = await askNotionToken();

    if (!notion_token) {
      console.warn("no input found");
    } else {
      credentials["NOTION_TOKEN"] = notion_token;
      await saveCredentails(credentials);
    }
    console.log(
      chalk.green.bold("use ") + chalk.blueBright.bold("c2n db --new") + chalk.green.bold(" to add databases"),
    );
  });

  return program;
};

const askNotionToken = async () => {
  const res = await prompts({
    type: "invisible",
    name: "value",
    message: "input slack token",
  });
  return res.value;
};
