import app from "../main.ts";

// Vercel Node.js runtime supports the Web Standard `fetch` handler.
// This is the simplest bridge to Hono: app.fetch takes a Request and returns a Response.
export default {
  async fetch(req: Request): Promise<Response> {
    return app.fetch(req);
  },
};
