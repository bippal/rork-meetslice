import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", cors());

app.use("/api/trpc/*", async (c, next) => {
  console.log('=== TRPC Request ===');
  console.log('Path:', c.req.path);
  console.log('Method:', c.req.method);
  console.log('Headers:', Object.fromEntries(c.req.raw.headers.entries()));
  
  try {
    const body = await c.req.text();
    console.log('Body:', body);
    
    const newReq = new Request(c.req.url, {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: body || undefined,
    });
    
    c.req.raw = newReq;
  } catch (e) {
    console.error('Error reading request:', e);
  }
  
  await next();
  console.log('Response status:', c.res.status);
});

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    endpoint: "/api/trpc",
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

export default app;
