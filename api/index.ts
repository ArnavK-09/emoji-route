import { handle } from "@hono/node-server/vercel";
import app from "../main.ts";

export default handle(app);
