import http from "node:http";
import { handler } from "./api/index.ts";

const toHeaders = (raw: http.IncomingHttpHeaders): Headers => {
  const headers = new Headers();
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  return headers;
};

const readBody = (req: http.IncomingMessage): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

const server = http.createServer(async (req, res) => {
  try {
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host || "localhost";
    const url = new URL(req.url!, `${protocol}://${host}`);

    const body =
      req.method && !["GET", "HEAD"].includes(req.method)
        ? await readBody(req)
        : undefined;

    const request = new Request(url.toString(), {
      method: req.method,
      headers: toHeaders(req.headers),
      body,
    });

    const response = await handler(request);

    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
    }

    res.end();
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
});

const port = Number(process.env.PORT) || 8000;
server.listen(port, () => console.log(`Listening on http://localhost:${port}`));
