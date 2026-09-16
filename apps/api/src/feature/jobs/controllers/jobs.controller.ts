import { Request, Response } from "express";
import { z } from "zod";

import { queryIntentSchema } from "@/feature/intent/intent.types";
import { asyncHandler } from "@/lib/express/express.async-handler";
import { sendSuccessResponse } from "@/lib/express/express.response";
import { HttpStatus } from "@/lib/http/http.status";

import { SerializedJobListing } from "../jobs.config";
import { jobSearchService } from "../jobs.service";

export const JobSearchControllers = {
  searchJobs: asyncHandler(async (req: Request, res: Response) => {
    const intent = (req.validated?.body || req.validated?.query) as z.infer<
      typeof queryIntentSchema
    >;

    const jobs = await jobSearchService.findMatchingJobs(intent);

    sendSuccessResponse(
      req,
      res,
      {
        data: jobs,
        serializerConfig: SerializedJobListing,
        type: "collection",
      },
      {
        status: HttpStatus.SUCCESS,
        additionalMeta: { totalCount: jobs.length },
      },
    );
  }),
};
