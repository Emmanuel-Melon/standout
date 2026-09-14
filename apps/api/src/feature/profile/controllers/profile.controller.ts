import { Request, Response } from "express";

import { asyncHandler } from "@/lib/express/express.async-handler";
import { sendSuccessResponse } from "@/lib/express/express.response";
import { HttpError } from "@/lib/http/http.error";
import { HttpStatus } from "@/lib/http/http.status";

import { findProfile } from "../operations/profile.find";
import { SerializedProfile } from "../profile.config";

export const ProfileControllers = {
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const profile = await findProfile("id", req.params.id as string);

    if (!profile.ok || !profile.data) {
      throw new HttpError(HttpStatus.NOT_FOUND, "Profile Not Found");
    }

    return sendSuccessResponse(
      req,
      res,
      {
        data: profile.data,
        type: "single",
        serializerConfig: SerializedProfile,
      },
      {
        status: HttpStatus.SUCCESS,
      },
    );
  }),
};
