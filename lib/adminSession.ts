import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "mindlet_admin";
const SESSION_VALUE = "mindlet-admin-v1";

function signingSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("관리자 세션 환경 변수가 설정되지 않았습니다.");
  return secret;
}

function signature(value: string) {
  return createHmac("sha256", signingSecret())
    .update(value)
    .digest("hex");
}

export function createAdminSessionToken() {
  const value = [SESSION_VALUE, Date.now() + 8 * 60 * 60 * 1000].join(".");
  return [value, signature(value)].join(".");
}

export async function isAdminRequest() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== SESSION_VALUE) return false;
  const expiresAt = Number(parts[1]);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return false;
  if (!process.env.ADMIN_SESSION_SECRET) return false;
  const value = parts.slice(0, 2).join(".");
  const expected = [value, signature(value)].join(".");
  const left = Buffer.from(token);
  const right = Buffer.from(expected);

  return left.length === right.length && timingSafeEqual(left, right);
}
