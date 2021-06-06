import { Client } from "@notionhq/client";
import { DatabasesRetrieveResponse, PagesCreateParameters } from "@notionhq/client/build/src/api-endpoints";

import { DATABASE_ID, NOTION_TOKEN } from "./file-systems";

const notion = new Client({
  auth: NOTION_TOKEN,
});

export const getDatabaseSchema = async () => {
  const res: DatabasesRetrieveResponse = await notion.request({
    path: "databases/" + DATABASE_ID,
    method: "get",
  });
  return res;
};

export const createItemInDatabase = async (body: PagesCreateParameters) => {
  try {
    await notion.pages.create(body);
  } catch (e) {
    console.error("failed to craete new database item in notion");
    throw e;
  }
};
