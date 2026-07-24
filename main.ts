import { Context, Hono } from "hono";
import regexForEmoji from "emoji-regex";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const app = new Hono();
const DEFAULT_EMOJI = "💩";
const FONT_PATH = join(process.cwd(), "NotoColorEmoji-Regular.ttf");

// Register the emoji font once at module load.
GlobalFonts.registerFromPath(FONT_PATH, "Noto Color Emoji");

const getRandomElement = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

const emojiToSvg = (emoji: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 -5 128 128">
<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="100">
  ${emoji}
</text>
</svg>
`;

const fetchEmojiFromString = (txt: string): string => {
  txt = decodeURIComponent(txt);
  const emojisPresentInString = txt.match(regexForEmoji());
  return emojisPresentInString?.length ? emojisPresentInString[0] : DEFAULT_EMOJI;
};

const emojiToPng = async (emoji: string): Promise<Buffer> => {
  const size = 1024;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  ctx.font = "800px \"Noto Color Emoji\"";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, size / 2, size / 2);

  return canvas.toBuffer("image/png");
};

const emojiToUnicode = (emoji: string): string =>
  Array.from(emoji)
    .map((char) => char.codePointAt(0)!.toString(16).toUpperCase())
    .join(" ")
    .toLowerCase();

const pngRoute = async (c: Context): Promise<Response> => {
  const emojiParam = c.req.param("emoji") ?? "";
  const fetchedEmoji = fetchEmojiFromString(emojiParam);
  const pngBuffer = await emojiToPng(fetchedEmoji);

  return new Response(pngBuffer, {
    headers: { "Content-Type": "image/png" },
  });
};

const gifRoute = async (c: Context): Promise<Response> => {
  const emojiParam = c.req.param("emoji") ?? "";
  const fetchedEmoji = fetchEmojiFromString(emojiParam);
  const emojiUnicode = emojiToUnicode(fetchedEmoji);

  let gEmojiUrl =
    `https://fonts.gstatic.com/s/e/notoemoji/latest/${emojiUnicode}/512.gif`;

  const res = await fetch(gEmojiUrl);
  if (!res.ok) {
    gEmojiUrl =
      `https://fonts.gstatic.com/s/e/notoemoji/latest/${emojiToUnicode(DEFAULT_EMOJI)}/512.gif`;
  }

  const gifData = await fetch(gEmojiUrl);
  const gifBuffer = await gifData.arrayBuffer();

  return new Response(gifBuffer, {
    headers: { "Content-Type": "image/gif" },
  });
};

const svgRoute = (c: Context): Response => {
  const emojiParam = c.req.param("emoji") ?? "";
  const fetchedEmoji = fetchEmojiFromString(emojiParam);

  return c.body(emojiToSvg(fetchedEmoji), 200, {
    "Content-Type": "image/svg+xml",
  });
};

app.get("/svg/:emoji", svgRoute);
app.get("/gif/:emoji", gifRoute);
app.get("/png/:emoji", pngRoute);

app.get("/:emoji", (c) => {
  const availableRoutes = {
    svg: svgRoute,
    gif: gifRoute,
    png: pngRoute,
  };
  const randomMethod = getRandomElement<"svg" | "gif" | "png">([
    "svg",
    "png",
    "gif",
  ]);
  return availableRoutes[randomMethod](c);
});

app.get("/", async (c) => {
  return c.html(await readFile(join(process.cwd(), "index.html"), "utf-8"));
});

export default app;

// Start the server locally when run directly with tsx / node
if (import.meta.main) {
  const { serve } = await import("@hono/node-server");
  serve({ fetch: app.fetch, port: Number(process.env.PORT) || 8000 });
}
