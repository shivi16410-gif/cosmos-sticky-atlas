import { createFileRoute } from "@tanstack/react-router";
import { CosmosApp } from "./index";

export const Route = createFileRoute("/canvas")({
  head: () => ({
    meta: [
      { title: "COSMOS Canvas" },
      { name: "description", content: "An infinite canvas for your thoughts, plans and goals." },
    ],
  }),
  component: CosmosApp,
});
