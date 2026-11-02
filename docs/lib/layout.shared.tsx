import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Wordmark } from "@/components/logo";
import { repoUrl } from "./shared";

/** Navigation shared by the home page and the docs. */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: <Wordmark /> },
    githubUrl: repoUrl,
    links: [{ text: "Docs", url: "/docs", active: "nested-url" }],
  };
}
