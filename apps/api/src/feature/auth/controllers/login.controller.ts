import { randomUUID } from "crypto";
import type { Request, Response } from "express";

import { SerializedUser } from "@/feature/users/users.config";
import { unwrap } from "@/lib/drizzle/drizzle.utils";
import { asyncHandler } from "@/lib/express/express.async-handler";
import { sendSuccessResponse } from "@/lib/express/express.response";
import { HttpError } from "@/lib/http/http.error";
import { HttpStatus } from "@/lib/http/http.status";

import { AuthJobs } from "../auth.config";
import { setAuthCookies } from "../auth.cookies";
import { generateAccessToken, generateRefreshToken } from "../auth.tokens";
import type { LoginAttrs } from "../auth.types";
import { insertSession } from "../operations/auth.insert";
import { loginUser } from "../operations/auth.login";

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.validated.body as LoginAttrs;

    const sessionId = randomUUID();

    const user = unwrap(
      await loginUser({ email, password }),
      new HttpError(HttpStatus.UNAUTHORIZED, "Invalid credentials"),
    );

    const token = {
      userId: user!.id,
      sessionId,
      role: user!.role,
    };

    const accessToken = generateAccessToken(token);
    const refreshToken = generateRefreshToken(token);

    await insertSession({ userId: user!.id, sessionId, refreshToken });
    setAuthCookies({
      req,
      res,
      userId: user!.id,
      role: user!.role,
      accessToken,
      refreshToken,
    });

    sendSuccessResponse(
      req,
      res,
      { data: user!, serializerConfig: SerializedUser, type: "single" },
      { status: HttpStatus.SUCCESS },
    );
  },
);
