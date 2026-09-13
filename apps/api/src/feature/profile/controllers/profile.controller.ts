import { Request, Response } from "express";

import { asyncHandler } from "@/lib/express/express.async-handler";
import { sendSuccessResponse } from "@/lib/express/express.response";
import { HttpStatus } from "@/lib/http/http.status";

import { findProfile } from "../operations/profile.find";
import { SerializedProfile } from "../profile.config";

export const ProfileControllers = {
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const profile = await findProfile("id", req.params.id as string);

    return sendSuccessResponse(
      req,
      res,
      {
        data: profile?.data,
        type: "single",
        serializerConfig: SerializedProfile,
      },
      {
        status: HttpStatus.SUCCESS,
      },
    );
  }),
};
