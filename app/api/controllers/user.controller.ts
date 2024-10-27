import prisma from "@/prisma/prisma";
import { Context } from "hono";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { hashPassword, verifyPassword, checkPasswordStrength } from "../utils/auth";
import { generateToken } from "../utils/generateToken";
const userSchema = z.object({
  username: z.string().trim().min(3),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((password) => {
      const { isStrong, requirements } = checkPasswordStrength(password);
      if (!isStrong) {
        throw new Error(requirements.join(', '));
      }
      return true;
    }, {
      message: "Password is not strong enough"
    }),
  role: z.nativeEnum(UserRole),
});

type User = z.infer<typeof userSchema>;

export const createUser = async (ctx: Context) => {
  try {
    const input: User = await ctx.req.json();
    const validatedInput = userSchema.parse(input);

    const { username, email, password, role } = validatedInput;

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        username,
        email,
        password: hashedPassword,
        role,
        updatedAt: new Date(),
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return ctx.json(userWithoutPassword);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return ctx.json({
        error: "Validation failed",
        details: error.errors
      }, 400);
    }

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return ctx.json({
        error: "User already exists",
        details: "Email or username is already taken"
      }, 409);
    }

    console.error("User creation error:", error);
    return ctx.json({
      error: `Failed to create user: ${error.message}`
    }, 500);
  }
};

export const loginUser = async (ctx: Context) => {
  try {
    const { email, password } = await ctx.req.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return ctx.json({
        error: "User not found"
      }, 404);
    }
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return ctx.json({
        error: "Invalid password"
      }, 401);
    }
    const token = await generateToken(ctx, user.id);
    return ctx.json({
      token, user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return ctx.json({
      error: `Failed to login: ${error.message}`
    }, 500);
  }
};
