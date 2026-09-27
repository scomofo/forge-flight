import { resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    let target = resolvePath(process.cwd(), "src", specifier.slice(2));
    if (!target.endsWith(".ts") && !target.endsWith(".tsx") && !target.endsWith(".mjs")) target += ".ts";
    return nextResolve(pathToFileURL(target).href, context);
  }
  return nextResolve(specifier, context);
}
