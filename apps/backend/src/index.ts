import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { AccessToken } from "livekit-server-sdk";
import z from "zod";

const app = new Elysia()
  .use(cors())
  .get("/", () => "Hello Elysia")
  .post("/auth", async ({ body }) => {
    const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, { identity: body.identity });
    token.addGrant({
      room: "test",
      roomJoin: true,
      canPublish: true,
    });
    return {
      token: await token.toJwt(),
    };
  }, {
    body: z.object({
      identity: z.string(),
    }),
  })
  .listen(4000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;