import "dotenv/config";
import { isTaskDueThisWeek } from "@/lib/date/currentWeek";

import { getCompletion } from "@/lib/gpt/completion";
import { buildPrompt } from "@/lib/gpt/prompt";

import { createPage } from "@/lib/notion/create";
import { getProjectList } from "@/lib/notion/project";
import { getTasks } from "@/lib/notion/task";
import { getText } from "@/lib/string/markdown";

const generateReport = async (databaseId: string, type: "ai" | "markdown") => {
  console.log("\n" + "Getting tasks from Notion ".padEnd(80, "-"));
  const tasks = await getTasks(databaseId);

  const tasksDueThisWeek = tasks.filter(isTaskDueThisWeek);
  const projects = getProjectList(tasksDueThisWeek);
  console.log(
    `Found ${tasks.length} task(s), ${tasksDueThisWeek.length} due this week and ${projects.length} project(s).`
  );

  let answer = "";
  if (type === "ai") {
    console.log("\n" + "Generating result by AI".padEnd(80, "-"));

    console.log("Getting completion from GPT-3...");
    const prompt = buildPrompt(projects);
    answer = await getCompletion(prompt);
    console.log("Completion received.");
  }
  if (type === "markdown") {
    console.log("\n" + "Generating markdown by concatenation ".padEnd(80, "-"));
    answer = getText(projects);
  }

  console.log("\n" + "Exporting result in Notion ".padEnd(80, "-"));

  console.log("Creating page in Notion...");
  const page = await createPage(
    process.env.NOTION_OUTPUT_DATABASE_ID as string,
    answer
  );
  if (page) console.log("Page created successfully.");
};

generateReport(process.env.NOTION_SOURCE_DATABASE_ID as string, "markdown").catch(
  console.error
);
