import { logger } from "../logger";
import { boss } from "../pg-boss";

export const gracefulShutdown = async () => {
  logger.info("Stopping pg-boss...");
  await boss.stop(); // This waits for active jobs to finish or timeout
  process.exit(0);
};
