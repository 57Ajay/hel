import prisma from "@/prisma/prisma";
import { verify } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import { SignatureKey } from "hono/utils/jwt/jws";
import { Context, Next } from "hono";
import { createMiddleware } from 'hono/factory';

export const authenticate = createMiddleware(async (ctx, next) => {
  const token = ctx.req.header("Authorization")?.split(" ")[1];
  const secret = process.env.JWT_SECRET as SignatureKey;

  if (!token) {
    return ctx.json({ error: "No token provided" }, 401);
  }

  try {
    const payload = await verify(token, secret);

    if (typeof payload !== "object" || !payload.id) {
      throw new HTTPException(403, { message: "Invalid token payload." });
    }

    const user = await prisma.user.findFirst({
      where: { token },
    });

    if (!user) {
      return ctx.json({ error: "Invalid token" }, 401);
    }

    ctx.set("user", user);
    await next();
  } catch (error) {
    return ctx.json({
      error: "Invalid token, please provide a valid token",
      details: error instanceof HTTPException ? error.message : "Authentication failed",
    });
  }
});
