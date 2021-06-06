import { Command } from "commander";
import prompts from "prompts";

import { createInits, loadCredentials, saveCredentails } from "../file-systems";

export const makeInitCommand = () => {
  const program = new Command("init");

  program.description("create necessary dirctorys for CLI & configure credentials").action(async () => {
    // create needed dirctorys and files
    await createInits();
    // input credentials
    const credentials = await loadCredentials();
    if (!credentials["SLACK_TOKEN"]) {
      const slack_token = await askSlackToken();
      credentials["SLACK_TOKEN"] = slack_token;
      await saveCredentails(credentials);
    }
  });

  return program;
};

const askSlackToken = async () => {
  const res = await prompts({
    type: "invisible",
    name: "value",
    message: "regist slack token",
  });
  return res.value;
};
