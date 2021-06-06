import { PagesCreateParameters } from "@notionhq/client/build/src/api-endpoints";
import { InputPropertyValue, MultiSelectOption, Property, SelectOption } from "@notionhq/client/build/src/api-types";
import chalk from "chalk";
import { Command } from "commander";
import prompts, { Choice } from "prompts";
import validator from "validator";

import { saveCommitAsJson } from "../file-systems";
import { getDatabaseSchema } from "../notion";

export const makeCommitCommand = () => {
  const program = new Command("commit");

  program
    .alias("cm")
    .description("create new item on local")
    .action(async () => {
      // get schema of target database
      const schema = await getDatabaseSchema();

      const requestBody: PagesCreateParameters = {
        parent: {
          database_id: schema.id,
        },
        properties: {},
      };
      for (const propertyName in schema.properties) {
        // ask each property value by prompt
        const value = await askPropertyValue(propertyName, schema.properties[propertyName]);
        if (value) {
          // make property value object for post request
          const inputPropertyValue = createInputPropertyValue(schema.properties[propertyName], value);
          requestBody.properties[propertyName] = inputPropertyValue;
        }
      }
      // save request body as json file
      await saveCommitAsJson(requestBody);

      console.log(chalk.green.bold("\ncommit succeeded! 🐚"));
    });
  return program;
};

const askPropertyValue = async (propertyName: string, propertySchema: Property): Promise<string | null> => {
  let res = {
    value: null,
  };
  let choices: Choice[];

  switch (propertySchema.type) {
    case "title": // simple string
    case "rich_text":
      res = await prompts({
        type: "text",
        name: "value",
        message: chalk.green(`${propertyName} (text): `),
      });
      break;
    case "checkbox": // bool
      res = await prompts({
        type: "confirm",
        name: "value",
        message: chalk.green(`${propertyName} (yes/no): `),
      });
      break;
    case "number": // number
      res = await prompts({
        type: "number",
        name: "value",
        message: chalk.green(`${propertyName} (number): `),
      });
      break;
    case "date": // date
      res = await prompts({
        type: "date",
        name: "value",
        message: chalk.green(`${propertyName}: `),
      });
      break;
    case "email": // email
      res = await prompts({
        type: "text",
        name: "value",
        message: chalk.green(`${propertyName} (email): `),
        validate: (value) => (!value || validator.isEmail(value) ? true : "Input must be Email format"),
      });
      break;
    case "phone_number": // phone number
      res = await prompts({
        type: "text",
        name: "value",
        message: chalk.green(`${propertyName} (phone): `),
        validate: (value) => (!value || validator.isMobilePhone(value) ? true : "Input must be phone number format"),
      });
      break;
    case "url": // url
      res = await prompts({
        type: "text",
        name: "value",
        message: chalk.green(`${propertyName} (url): `),
        validate: (value) => (!value || validator.isURL(value) ? true : "Input must be URL format"),
      });
      break;
    case "select": // select
      choices = createChoices(propertySchema.select.options);
      res = await prompts({
        type: "select",
        name: "value",
        message: chalk.green(`${propertyName} (select): `),
        choices: choices,
      });
      break;
    case "multi_select":
      choices = createChoices(propertySchema.multi_select.options);
      res = await prompts({
        type: "multiselect",
        name: "value",
        message: chalk.green(`${propertyName} (multi select): `),
        choices: choices,
      });
      break;
    case "created_time": // autofilled
    case "created_by":
    case "last_edited_time":
    case "last_edited_by":
      break;
    case "formula": // dificult to implement
    case "file":
    case "rollup":
    case "people":
      console.log(
        chalk.green(`${propertyName}: `) +
          chalk.yellow(`sorry, we've not implemented this type ${propertySchema.type}`),
      );
      break;
    default:
      console.log(chalk.green(`${propertyName}: `) + chalk.yellow(`unknown type ${propertySchema.type}`));
      break;
  }
  return res.value;
};

const createChoices = (opts: Array<SelectOption | MultiSelectOption>) => {
  const choices = [] as Choice[];
  for (const opt of opts) {
    choices.push({
      title: opt.name,
      value: opt.name,
    });
  }
  return choices;
};

export const createInputPropertyValue = (propertySchema: Property, newValue: any): InputPropertyValue => {
  let inputPropertyValue: InputPropertyValue | undefined;

  switch (propertySchema.type) {
    case "date": {
      inputPropertyValue = {
        type: "date",
        id: propertySchema.id,
        date: {
          start: newValue,
        },
      };
      break;
    }
    case "multi_select": {
      const multiSelectOptions = propertySchema.multi_select.options.filter((opt) => newValue.includes(opt.name));
      if (multiSelectOptions) {
        inputPropertyValue = {
          type: "multi_select",
          id: propertySchema.id,
          multi_select: multiSelectOptions,
        };
      }
      break;
    }
    case "select": {
      const selectOption = propertySchema.select.options.find((opt) => opt.name === newValue);
      if (selectOption) {
        inputPropertyValue = {
          type: "select",
          id: propertySchema.id,
          select: selectOption,
        };
      }
      break;
    }
    case "email": {
      inputPropertyValue = {
        type: "email",
        id: propertySchema.id,
        email: newValue,
      };
      break;
    }
    case "checkbox": {
      inputPropertyValue = {
        type: "checkbox",
        id: propertySchema.id,
        checkbox: newValue,
      };
      break;
    }
    case "url": {
      inputPropertyValue = {
        type: "url",
        id: propertySchema.id,
        url: newValue,
      };
      break;
    }
    case "number": {
      inputPropertyValue = {
        type: "number",
        id: propertySchema.id,
        number: newValue,
      };
      break;
    }
    case "title": {
      inputPropertyValue = {
        type: "title",
        id: propertySchema.id,
        title: [
          {
            type: "text",
            text: { content: newValue },
          },
        ],
      };
      break;
    }
    case "rich_text": {
      inputPropertyValue = {
        type: "rich_text",
        id: propertySchema.id,
        rich_text: [
          {
            type: "text",
            text: { content: newValue },
          },
        ],
      };
      break;
    }
    case "phone_number": {
      inputPropertyValue = {
        type: "phone_number",
        id: propertySchema.id,
        phone_number: newValue,
      };
      break;
    }
    default: {
      console.log("unimplemented property type: ", propertySchema.type);
      throw new Error("unimplemented property type");
    }
  }
  if (inputPropertyValue === undefined) {
    throw new Error("input property value is undefined");
  }
  return inputPropertyValue;
};
