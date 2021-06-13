import { Database, PaginatedList } from "@notionhq/client/build/src/api-types";
import chalk from "chalk";
import { Command } from "commander";
import prompts from "prompts";

import { loadDatabases, saveDatabase } from "../file-systems";
import { getDatabaseList } from "../notion";
import { skipLine } from "../utils";

export const makeDatabaseCommand = () => {
  const program = new Command("database");

  program
    .alias("db")
    .description("set and checkout database")
    .option("-n, --new", "add new database by ID")
    .option("-l, --list", "show databases existing on local")
    .option("-a, --all", "show all database available in Notion")
    .option("-d, --delete", "delete database on local")
    .action(async (options) => {
      skipLine();

      const databases = await loadDatabases();

      // add new database
      if (options.new) {
        const alias = await askDatabaseAlias();
        if (Object.keys(databases).includes(alias)) {
          console.warn("this alias is aleready in use");
        } else {
          const databaseId = await askDatabaseId();
          if (alias && databaseId) {
            databases[alias] = databaseId;
            await saveDatabase(databases);
          }
        }
      }

      // show database existing on local
      if (options.list || Object.keys(options).length === 0) {
        if (databases && Object.keys(databases).length === 0) {
          console.warn(chalk.yellow.bold("no databases are found on local"));
          console.warn(chalk.yellow.bold("use 'c2n db --all' & 'c2n db --new' to add database at first "));
        }
        for (const alias in databases) {
          console.log(`${chalk.green.bold(alias)}: ${databases[alias]}`);
        }
      }

      // show all database available in Notion
      if (options.all) {
        const remoteDatabases: PaginatedList<Database> = await getDatabaseList();
        for (const db of remoteDatabases.results) {
          console.log(`\n${chalk.green.bold(db.title[0].plain_text)}: ${db.id}`);
        }
      }

      skipLine();
    });

  return program;
};

const askDatabaseAlias = async () => {
  const res = await prompts({
    type: "text",
    name: "value",
    message: "input database alias",
  });
  return res.value;
};

const askDatabaseId = async () => {
  const res = await prompts({
    type: "text",
    name: "value",
    message: "input database id",
  });
  return res.value;
};
