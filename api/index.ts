#!/usr/bin/env DENO_DIR=/tmp deno run --version v1.45.5 --include-files "{NotoColorEmoji-Regular.ttf,index.html}"

import app from "../main.ts";

// vercel-deno v3 expects a standard Web API handler:
// (request: Request) => Response | Promise<Response>
// Hono's app.fetch implements exactly this signature.
export default (req: Request) => app.fetch(req);
