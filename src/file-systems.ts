import fs from "fs";
import path from "path";

import { PagesCreateParameters } from "@notionhq/client/build/src/api-endpoints";
import chalk from "chalk";
import { format } from "date-fns";
import { config } from "dotenv";
import * as ini from "ini";

config();

export const NOTION_TOKEN = process.env.NOTION_TOKEN || "xxxxxxxxxx";
export const DATABASE_ID = process.env.DATABASE_ID || "xxxxxxxxxx";

const userHome = process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"];
const c2nDirPath = path.join(userHome!, ".c2n");
const credentialsPath = path.join(c2nDirPath, "credentials");
const commitDirPath = path.join(c2nDirPath, "commits");

// init
export const createInits = async () => {
  try {
    // cli root dir
    if (!fs.existsSync(c2nDirPath)) {
      await fs.promises.mkdir(c2nDirPath);
      console.log(chalk.green(`${c2nDirPath} was created`));
    }

    // commits
    if (!fs.existsSync(commitDirPath)) {
      fs.promises.mkdir(commitDirPath);
      console.log(chalk.green(`${commitDirPath} was created`));
    }

    // credentials
    if (!fs.existsSync(credentialsPath)) {
      fs.promises.open(credentialsPath, "w");
      console.log(chalk.green(`${credentialsPath} was created`));
    }
  } catch (e) {
    console.error("Error occured while creating initial file and directorys");
    throw e;
  }
};

// credentials
export const loadCredentials = async () => {
  const credentialsText: string = await fs.promises.readFile(credentialsPath, { encoding: "utf8" });
  const credentials = ini.parse(credentialsText);
  return credentials;
};

export const saveCredentails = async (credentials) => {
  const credentialsText: string = ini.stringify(credentials);
  try {
    await fs.promises.writeFile(credentialsPath, credentialsText, { encoding: "utf8" });
  } catch (e) {
    console.error("Error occurred while writing file");
    throw e;
  }
};

// commit/push by json
export const saveCommitAsJson = async (requestBody: PagesCreateParameters) => {
  const now = format(new Date(), "yyyyMMddHHmmss");
  const commitPath = path.join(commitDirPath, `${now}-commit.json`);

  const commitJson = JSON.stringify(requestBody);
  try {
    await fs.promises.writeFile(commitPath, commitJson, { encoding: "utf8" });
  } catch (e) {
    console.error("Error occurred while writing file");
    throw e;
  }
};

export const listCommitFiles = async () => {
  const files = await fs.promises.readdir(commitDirPath);
  return files;
};

export const parseCommitJson = async (fileName: string) => {
  const filePath = path.join(commitDirPath, fileName);
  const commitText: string = await fs.promises.readFile(filePath, { encoding: "utf8" });
  return JSON.parse(commitText);
};

export const deleteCommitJson = async (fileName: string) => {
  const filePath = path.join(commitDirPath, fileName);
  try {
    await fs.promises.rm(filePath);
  } catch (e) {
    console.error("Error occurred while refreshing commits");
    throw e;
  }
};
