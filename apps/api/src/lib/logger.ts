import { Request } from "express";
import { multistream, pino } from "pino";

import { setupLoki } from "./loki.js";

const isDevelopment = process.env.NODE_ENV !== "production";

const streams: any[] = [];

try {
  const pinoPretty = require("pino-pretty");
  const prettyStream = pinoPretty({
    colorize: true,
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
  });
  streams.push({ stream: prettyStream });
} catch (e) {
  console.error("Pino-pretty failed to load", e);
}

// Setup Loki stream asynchronously
const setupLoggerStreams = async () => {
  const lokiStream = await setupLoki();
  if (lokiStream) {
    streams.push(lokiStream);
  }
  return streams;
};

// Export a function to get the configured logger
export const getLogger = async () => {
  const configuredStreams = await setupLoggerStreams();

  return pino(
    {
      level: process.env.LOG_LEVEL || "info",
      serializers: {
        req: (req: Request) => ({ method: req.method, url: req.url }),
      },
    },
    multistream(
      isDevelopment ? configuredStreams : [{ stream: process.stdout }],
    ),
  );
};

// Synchronous logger for backwards compatibility (without Loki)
export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    serializers: {
      req: (req: Request) => ({ method: req.method, url: req.url }),
    },
  },
  multistream(isDevelopment ? streams : [{ stream: process.stdout }]),
);
