import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE_NAME = "apex_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  return process.env.SESSION_SECRET || "dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createToken(): string {
  const payload = `admin.${Date.now() + SESSION_TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  const expires = Number(payload.split(".")[1]);
  return Number.isFinite(expires) && Date.now() < expires;
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

export async function setSessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/**
 * Password check: uses the bcrypt hash stored in Settings if the admin has
 * changed their password; otherwise falls back to ADMIN_PASSWORD from .env.
 */
export async function checkPassword(password: string): Promise<boolean> {
  const row = await prisma.setting.findUnique({
    where: { key: "adminPasswordHash" },
  });
  if (row?.value) {
    return bcrypt.compare(password, row.value);
  }
  const envPassword = process.env.ADMIN_PASSWORD;
  return !!envPassword && password === envPassword;
}

export async function setPassword(newPassword: string) {
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.setting.upsert({
    where: { key: "adminPasswordHash" },
    update: { value: hash },
    create: { key: "adminPasswordHash", value: hash },
  });
}
