import size from "@/lib/generated/size.json";
import { version } from "@/lib/shared";

/** The package version from the root `package.json`. */
export function Version() {
  return <>{version}</>;
}

/** A size-limit result, measured when the docs are built. */
export function Size({ entry }: { entry: keyof typeof size }) {
  return <>{size[entry]}</>;
}
