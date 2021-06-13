#!/usr/local/env node

import { Command } from "commander";
import pjson from "pjson";

import { makeCommitCommand, makeDatabaseCommand, makeInitCommand, makePushCommand } from "./commands";

const program = new Command();
program
  .name("c2n")
  .version(pjson.version, "-v, --version")
  .description("CLI tool to create new database item in Notion");

program.addCommand(makeInitCommand());
program.addCommand(makeDatabaseCommand());
program.addCommand(makeCommitCommand());
program.addCommand(makePushCommand());

program.parse(process.argv);
