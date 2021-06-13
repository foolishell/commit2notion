import { Client } from "@notionhq/client";
import { DatabasesRetrieveResponse, PagesCreateParameters } from "@notionhq/client/build/src/api-endpoints";
import { Database, PaginatedList } from "@notionhq/client/build/src/api-types";

import { loadCredentials } from "./file-systems";

const notionClieant = async () => {
  const credentials = await loadCredentials();
  return new Client({
    auth: credentials["NOTION_TOKEN"],
  });
};

export const getDatabaseSchema = async (databaseId) => {
  const notion = await notionClieant();
  const res: DatabasesRetrieveResponse = await notion.request({
    path: "databases/" + databaseId,
    method: "get",
  });
  return res;
};

export const createItemInDatabase = async (body: PagesCreateParameters) => {
  try {
    const notion = await notionClieant();
    await notion.pages.create(body);
  } catch (e) {
    console.error("failed to craete new database item in notion");
    throw e;
  }
};

export const getDatabaseList = async () => {
  const notion = await notionClieant();
  const res = (await notion.search({
    filter: {
      value: "database",
      property: "object",
    },
  })) as PaginatedList<Database>;
  return res;
};
