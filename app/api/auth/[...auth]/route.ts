import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const handler = toNextJsHandler(auth);

async function withRateLimit(req: Request, method: 'GET' | 'POST') {
  const rateLimited = checkRateLimit(req, 'api:auth', RATE_LIMITS.auth.limit, RATE_LIMITS.auth.windowMs);
  if (rateLimited) return rateLimited;
  return method === 'GET' ? handler.GET(req) : handler.POST(req);
}

export async function GET(req: Request) {
  return withRateLimit(req, 'GET');
}

export async function POST(req: Request) {
  return withRateLimit(req, 'POST');
}