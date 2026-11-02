import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { BundleSize } from "@/components/bundle-size";
import { Demo, HashDemo } from "@/components/demo";
import { GridsDemo } from "@/components/grids-demo";

/** Components available in every MDX page. */
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    BundleSize,
    Demo,
    GridsDemo,
    HashDemo,
    Step,
    Steps,
    Tab,
    Tabs,
    TypeTable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
