import bcrypt from "bcrypt";
import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import { LoginBody, LoginResponse, RegisterBody, RegisterResponse, GetCurrentUserResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";
import {
  clearSessionCookie,
  createSessionCookie,
  SESSION_COOKIE,
  verifyJWT,
  verifyOptionalJWT,
  type UserRole,
} from "../lib/auth";

const router: IRouter = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: Date | string;
}

interface PasswordUserRow extends UserRow {
  password_hash: string;
}

function serializeUser(row: UserRow) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function isDuplicateEmail(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

router.post("/auth/register", authLimiter, async (request, response): Promise<void> => {
  const parsed = RegisterBody.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.message });
    return;
  }

  const fullName = parsed.data.fullName.trim();
  const email = parsed.data.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    const result = await pool.query<UserRow>(
      `INSERT INTO users (role, full_name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [parsed.data.role, fullName, email, passwordHash],
    );

    const user = serializeUser(result.rows[0]);
    createSessionCookie(response, { id: user.id, role: user.role });
    response.status(201).json(RegisterResponse.parse({ user }));
  } catch (error) {
    if (isDuplicateEmail(error)) {
      response.status(409).json({ error: "An account with this email already exists." });
      return;
    }
    request.log.error({ err: error }, "Account registration failed");
    response.status(500).json({ error: "Unable to create the account right now." });
  }
});

router.post("/auth/login", authLimiter, async (request, response): Promise<void> => {
  const parsed = LoginBody.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.message });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const result = await pool.query<PasswordUserRow>(
    `SELECT id, full_name, email, role, created_at, password_hash
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );
  const row = result.rows[0];

  if (!row || !(await bcrypt.compare(parsed.data.password, row.password_hash))) {
    response.status(401).json({ error: "Email or password is incorrect." });
    return;
  }

  const user = serializeUser(row);
  createSessionCookie(response, { id: user.id, role: user.role });
  response.json(LoginResponse.parse({ user }));
});

router.get("/auth/me", verifyOptionalJWT, async (request, response): Promise<void> => {
  const result = await pool.query<UserRow>(
    `SELECT id, full_name, email, role, created_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [request.user!.id],
  );
  const row = result.rows[0];

  if (!row) {
    clearSessionCookie(response);
    response.sendStatus(204);
    return;
  }

  response.json(GetCurrentUserResponse.parse({ user: serializeUser(row) }));
});

router.post("/auth/logout", verifyJWT, (_request, response): void => {
  clearSessionCookie(response);
  response.sendStatus(204);
});

export default router;
