import { sign, verify } from "jsonwebtoken";
import type { RequestHandler, Response } from "express";

export const SESSION_COOKIE = "agricycle_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_SECRET = process.env.SESSION_SECRET ?? "";

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be configured before the API server starts.");
}

export type UserRole = "FARMER" | "CONSUMER" | "ADMIN";

export interface AuthIdentity {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthIdentity;
    }
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/auth",
    maxAge: SESSION_DURATION_MS,
  };
}

export function createSessionCookie(
  response: Response,
  user: AuthIdentity,
): void {
  const token = sign(
    { role: user.role },
    SESSION_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "7d",
      subject: user.id,
    },
  );

  response.cookie(SESSION_COOKIE, token, cookieOptions());
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  });
}

export const verifyJWT: RequestHandler = (request, response, next) => {
  const token = request.cookies?.[SESSION_COOKIE];
  if (typeof token !== "string" || token.length === 0) {
    response.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const decoded = verify(token, SESSION_SECRET, { algorithms: ["HS256"] });
    if (
      typeof decoded === "string" ||
      !decoded.sub ||
      !isUserRole(decoded.role)
    ) {
      clearSessionCookie(response);
      response.status(401).json({ error: "Session is invalid or expired." });
      return;
    }

    request.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch {
    clearSessionCookie(response);
    response.status(401).json({ error: "Session is invalid or expired." });
  }
};

export const verifyOptionalJWT: RequestHandler = (request, response, next) => {
  const token = request.cookies?.[SESSION_COOKIE];
  if (typeof token !== "string" || token.length === 0) {
    response.sendStatus(204);
    return;
  }

  try {
    const decoded = verify(token, SESSION_SECRET, { algorithms: ["HS256"] });
    if (
      typeof decoded === "string" ||
      !decoded.sub ||
      !isUserRole(decoded.role)
    ) {
      clearSessionCookie(response);
      response.sendStatus(204);
      return;
    }

    request.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch {
    clearSessionCookie(response);
    response.sendStatus(204);
  }
};

function isUserRole(value: unknown): value is UserRole {
  return value === "FARMER" || value === "CONSUMER" || value === "ADMIN";
}
