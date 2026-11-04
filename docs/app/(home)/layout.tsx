import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/footer";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions()}>
      {children}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SiteFooter />
      </div>
    </HomeLayout>
  );
}
