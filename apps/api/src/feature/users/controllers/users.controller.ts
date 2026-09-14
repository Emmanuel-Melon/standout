import { Request, Response } from "express";
import { z } from "zod";

import { unwrap } from "@/lib/drizzle/drizzle.utils";
import { asyncHandler } from "@/lib/express/express.async-handler";
import { sendSuccessResponse } from "@/lib/express/express.response";
import { HttpError } from "@/lib/http/http.error";
import { HttpStatus } from "@/lib/http/http.status";

import { deleteUser } from "../operations/users.delete";
import { findUser } from "../operations/users.find";
import { updateUser } from "../operations/users.update";
import { SerializedUser } from "../users.config";
import { usersUpdateSchema } from "../users.types";

export const UserControllers = {
  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const targetUserId = req.params.id as string;
    const user = unwrap(
      await findUser("id", targetUserId),
      new HttpError(HttpStatus.NOT_FOUND, "User not found"),
    );

    sendSuccessResponse(
      req,
      res,
      {
        data: user,
        serializerConfig: SerializedUser,
        type: "single",
      },
      {
        status: HttpStatus.SUCCESS,
      },
    );
  }),

  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const targetUserId = Array.isArray(id) ? id[0] : id;

    unwrap(
      await deleteUser(targetUserId),
      new HttpError(HttpStatus.NOT_FOUND, "User not found or already deleted"),
    );

    return sendSuccessResponse(req, res, undefined, {
      status: HttpStatus.NO_CONTENT,
      additionalMeta: {
        message: "Resource successfully deleted",
        deletedAt: new Date().toISOString(),
      },
    });
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const targetUserId = Array.isArray(id) ? id[0] : id;
    const authUser = req.user!;

    const validatedData = req.validated?.body as z.infer<
      typeof usersUpdateSchema
    >;

    const updatedUser = unwrap(
      await updateUser("id", targetUserId, validatedData),
      new HttpError(HttpStatus.NOT_FOUND, "User profile not found"),
    );

    sendSuccessResponse(
      req,
      res,
      {
        data: updatedUser,
        serializerConfig: SerializedUser,
        type: "single",
      },
      {
        status: HttpStatus.SUCCESS,
      },
    );
  }),
};
