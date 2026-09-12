import { z } from "zod";

import { compileEmailBlocks } from "@/feature/notifications/notifications.emails";

import { createAlertGenerators } from "../alerts.core";

export const voucherRefundFailedPayloadSchema = z.object({
  processId: z.string(),
  orderId: z.string().optional(),
  error: z.object({
    message: z.string(),
    name: z.string().optional(),
    stack: z.string().optional(),
  }),
  amountCents: z.number().int().optional(),
});

export const RecoveryAlertTemplates = {
  VOUCHER_REFUND_FAILED: {
    key: "VOUCHER_REFUND_FAILED",
    schema: voucherRefundFailedPayloadSchema,
  },
} as const;

export const recoveryAlertGenerators = createAlertGenerators(
  RecoveryAlertTemplates,
)({
  VOUCHER_REFUND_FAILED: (data) => ({
    subject: `⚠️ Voucher Refund Failed: Process ${data.processId}`,
    bodyHtml: compileEmailBlocks([
      { heading: "Voucher Refund Failed" },
      {
        paragraph: `The partial voucher refund for gift process <strong>${data.processId}</strong> failed and requires manual intervention.`,
      },
      {
        kvList: {
          "Process ID": data.processId,
          ...(data.orderId ? { "Order ID": data.orderId } : {}),
          ...(data.amountCents != null
            ? { "Amount (cents)": String(data.amountCents) }
            : {}),
          Error: data.error.message,
        },
      },
      {
        hint: "The gift process has been placed ON_HOLD. Resolve the Stripe refund manually or trigger a recovery retry.",
      },
    ]),
    metadata: { service: "payments", processId: data.processId },
  }),
});
