import { Context, Hono } from "hono";
import { createUser, loginUser } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
const userRouter = new Hono();

userRouter.get("/", (ctx) => {
  return ctx.json({ message: "Hello, user!" });
});

userRouter.post("/create", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/auth", authenticate, async (ctx: Context) => {
  const user = await ctx.get('user');
  return ctx.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

export default userRouter;
