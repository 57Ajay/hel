import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import userRouter from '../routes/user.route'
export const runtime = 'edge'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Hono!'
  })
})

app.post("/post", (c) => {
  return c.json({
    message: "Post request"
  })
})

app.route("/user", userRouter);
export const POST = handle(app);
export const GET = handle(app);
