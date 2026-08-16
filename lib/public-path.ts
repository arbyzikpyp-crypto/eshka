/** Adds the deployment base path to an asset stored in `public/`. */
export function publicPath(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return `${basePath.replace(/\/$/, "")}${normalizedPath}`;
}
