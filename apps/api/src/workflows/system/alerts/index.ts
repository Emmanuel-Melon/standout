import { alertsConfig } from "@/config";

import { sendSystemAlert } from "./alerts.core";
import { AlertRegistry } from "./alerts.registry";
import {
  circuitBreakerAlertGenerators,
  CircuitBreakerAlertTemplates,
} from "./topics/circuit-breaker.alerts";
import {
  queueAlertGenerators,
  QueueAlertTemplates,
} from "./topics/queue.alerts";
import {
  recoveryAlertGenerators,
  RecoveryAlertTemplates,
} from "./topics/recovery.alerts";

// Register all alert topics at module load
AlertRegistry.register({
  map: QueueAlertTemplates,
  generators: queueAlertGenerators,
});

AlertRegistry.register({
  map: CircuitBreakerAlertTemplates,
  generators: circuitBreakerAlertGenerators,
});

AlertRegistry.register({
  map: RecoveryAlertTemplates,
  generators: recoveryAlertGenerators,
});

/**
 * Central system alerter.
 */
export const SystemAlerter = {
  deadLetter: async (
    payload: Parameters<typeof queueAlertGenerators.DEAD_LETTER>[0],
  ) => {
    const content = await AlertRegistry.generateAlertContent(
      "DEAD_LETTER",
      payload,
    );
    await sendSystemAlert("critical", alertsConfig.engineeringEmail, content);
  },

  brevoDegraded: async (
    payload: Parameters<typeof circuitBreakerAlertGenerators.BREVO_DEGRADED>[0],
  ) => {
    const content = await AlertRegistry.generateAlertContent(
      "BREVO_DEGRADED",
      payload,
    );
    await sendSystemAlert("warning", alertsConfig.engineeringEmail, content);
  },

  stripeDegraded: async (
    payload: Parameters<
      typeof circuitBreakerAlertGenerators.STRIPE_DEGRADED
    >[0],
  ) => {
    const content = await AlertRegistry.generateAlertContent(
      "STRIPE_DEGRADED",
      payload,
    );
    await sendSystemAlert("warning", alertsConfig.engineeringEmail, content);
  },

  storageDegraded: async (
    payload: Parameters<
      typeof circuitBreakerAlertGenerators.STORAGE_DEGRADED
    >[0],
  ) => {
    const content = await AlertRegistry.generateAlertContent(
      "STORAGE_DEGRADED",
      payload,
    );
    await sendSystemAlert("warning", alertsConfig.engineeringEmail, content);
  },

  voucherRefundFailed: async (
    payload: Parameters<
      typeof recoveryAlertGenerators.VOUCHER_REFUND_FAILED
    >[0],
  ) => {
    const content = await AlertRegistry.generateAlertContent(
      "VOUCHER_REFUND_FAILED",
      payload,
    );
    await sendSystemAlert("critical", alertsConfig.engineeringEmail, content);
  },
};
