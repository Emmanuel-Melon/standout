import { PgBoss } from "pg-boss";

import { dbConfig } from "@/config";
import { logger } from "@/lib/logger";

async function run() {
  const boss = new PgBoss(dbConfig.postgres.url);
  const args = process.argv.slice(2); // get all arguments after the script name

  if (args.length === 0) {
    logger.error(
      "Please provide queue name(s) or --all: npm run pgboss:delete-queues -- <name1> <name2> ... | --all",
    );
    process.exit(1);
  }

  await boss.start();

  try {
    // Check for --all flag
    if (args.includes("--all")) {
      const queues = await boss.getQueues();
      if (queues.length === 0) {
        logger.info("No queues to delete.");
      } else {
        const names = queues.map((q) => q.name);
        await Promise.all(names.map((name) => boss.deleteQueue(name)));
        logger.info({ count: names.length, names }, "✅ All queues deleted");
      }
    } else {
      // Treat each argument as a queue name
      const names = args;
      await Promise.all(names.map((name) => boss.deleteQueue(name)));
      logger.info(
        { count: names.length, names },
        "✅ Specified queues deleted",
      );
    }
  } catch (err) {
    logger.error(err, "Failed to delete queues");
  } finally {
    await boss.stop();
    process.exit(0);
  }
}

run();
