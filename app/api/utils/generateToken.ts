import { Context } from "hono";
import { sign } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import prisma from "@/prisma/prisma";
import { SignatureKey } from "hono/utils/jwt/jws";
export const generateToken = async (ctx: Context, userId: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HTTPException(404, { message: "User not found." });
    };
    const secret: SignatureKey = process.env.JWT_SECRET as SignatureKey;
    const expirationTime = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    // console.log("This is jew secret from .env: \n", secret);
    const tokenVal = await sign({ id: userId, exp: expirationTime }, secret);
    await prisma.user.update({
      where: { id: userId },
      data: { token: tokenVal }
    });
    return tokenVal;
  } catch (error: any) {
    if (error instanceof HTTPException) {
      return new HTTPException(500, { message: `Something went wrong, can not generate token.: ${error.message}` });
    } else {
      console.log(error);
      return ctx.json({
        msg: "Token not generated",
        error: error.message
      })
    };
  };
}
