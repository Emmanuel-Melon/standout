import { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "@/lib/express/express.async-handler";
import { sendSuccessResponse } from "@/lib/express/express.response";
import { HttpError } from "@/lib/http/http.error";
import { HttpStatus } from "@/lib/http/http.status";
import { logger } from "@/lib/logger";

import {
  IntentJobs,
  SerializedIntent,
  SerializedSavedSearch,
} from "../intent.config";
import { IntentRequest, savedSearchInsertSchema } from "../intent.types";
import { intentQueue } from "../jobs/intent.queue";
import { findIntent, getUserSavedSearches } from "../operations/intent.find";
import { saveUserSearch } from "../operations/intent.insert";

export const IntentControllers = {
  deriveIntent: asyncHandler(async (req: Request, res: Response) => {
    const { message } = req.body as IntentRequest;
    const userId = req.user?.id;

    const { intent, usedFallback } = await findIntent(message, userId);

    try {
      await intentQueue.enqueue(IntentJobs.Derived, {
        userId,
        message,
        intent,
        usedFallback,
      });
    } catch (error) {
      logger.error({ error }, "Failed to enqueue intent-derived job");
    }

    sendSuccessResponse(
      req,
      res,
      {
        data: intent,
        serializerConfig: SerializedIntent,
        type: "single",
      },
      {
        status: HttpStatus.SUCCESS,
        additionalMeta: { usedFallback },
      },
    );
  }),

  saveSearch: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { name, intent } = req.body as z.infer<
      typeof savedSearchInsertSchema
    >;

    const savedSearch = await saveUserSearch(userId, name, intent);

    if (!savedSearch.ok || !savedSearch.data) {
      throw new HttpError(HttpStatus.NOT_FOUND, "Unable to save search");
    }

    sendSuccessResponse(
      req,
      res,
      {
        data: savedSearch.data,
        type: "single",
        serializerConfig: SerializedSavedSearch,
      },
      {
        status: HttpStatus.CREATED,
      },
    );
  }),

  listSavedSearches: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const searches = await getUserSavedSearches(userId);

    sendSuccessResponse(
      req,
      res,
      {
        data: searches.data,
        type: "collection",
        serializerConfig: SerializedSavedSearch,
      },
      {
        status: HttpStatus.SUCCESS,
      },
    );
  }),
};
