import { serverConfig } from "@/config";

export const getFrontendUrl = (path: string): string => {
  const baseUrl = serverConfig.clientUrls[0] || "http://localhost:5173";
  const sanitizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${baseUrl}/${sanitizedPath}`;
};
