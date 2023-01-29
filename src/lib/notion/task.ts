import {
  DatePropertyItemObjectResponse,
  PageObjectResponse,
  SelectPropertyItemObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { getContent, notion } from "@/lib/notion";
import { Task } from "@/types/notion";

export const getTasks = async (database_id: string) => {
  const { results: raw_tasks } = (await notion.databases.query({
    database_id,
  })) as { results: PageObjectResponse[] };

  const tasks: Task[] = await Promise.all(
    raw_tasks.map(async (task) => ({
      project:
        (task.properties["projet"] as SelectPropertyItemObjectResponse).select
          ?.name || "Sans projet",
      date: (task.properties.Date as DatePropertyItemObjectResponse).date
        ?.start,
      //@ts-ignore
      title: task.properties.Name.title[0].plain_text,
      //@ts-ignore
      assigned: task.properties["assigné"].people
        .map((p: { name: string }) => p.name)
        .join(", "),

      content: await getContent(task.id),
      status:
        (task.properties["état"] as SelectPropertyItemObjectResponse).select
          ?.name || "inconnu",
    }))
  );

  return tasks;
};