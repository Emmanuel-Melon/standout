import { PgBoss } from "pg-boss";

import { dbConfig } from "@/config";
import { logger } from "@/lib/logger";

export enum PgBossQueueName {
  // Notification Queues
  EmailNotificationsQueue = "email-notifications-queue",
  InAppNotificationsQueue = "in-app-notifications-queue",
  NotificationsQueue = "notifications-queue",
  PushNotificationsQueue = "push-notifications-queue",

  // Dead Letter Queue
  DeadLetterQueue = "dead-letter-queue",
}

const boss = new PgBoss(dbConfig.postgres.url);

boss.on("error", (error) => logger.error({ error }, "Pg-boss error"));

export const initPgBoss = async () => {
  await boss.start();
  logger.info("🚀 Pg-boss started");
};

export { boss };
