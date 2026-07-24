import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import regexForEmoji from "emoji-regex";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_EMOJI = "💩";
const FONT_PATH = path.join(process.cwd(), "NotoColorEmoji-Regular.ttf");

GlobalFonts.registerFromPath(FONT_PATH, "Noto Color Emoji");

const readFile = fs.promises.readFile;

const fetchEmojiFromString = (txt: string): string => {
  let decoded = txt;
  try {
    decoded = decodeURIComponent(txt);
  } catch {
    // already decoded or malformed; keep raw
  }
  const emojis = decoded.match(regexForEmoji());
  return emojis?.length ? emojis[0] : DEFAULT_EMOJI;
};

const emojiToPng = async (emoji: string, size = 1024): Promise<Buffer> => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Start with a font size proportional to the canvas, leave 10% padding
  const maxExtent = size * 0.9;
  let fontSize = Math.floor(size * 0.75);
  ctx.font = `${fontSize}px "Noto Color Emoji"`;

  // Measure and scale down if the glyph overflows
  const metrics = ctx.measureText(emoji);
  if (metrics.width > maxExtent) {
    fontSize = Math.floor(fontSize * (maxExtent / metrics.width));
    ctx.font = `${fontSize}px "Noto Color Emoji"`;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, size / 2, size / 2);

  return canvas.toBuffer("image/png");
};

const emojiToSvg = async (emoji: string): Promise<string> => {
  // Render through canvas with Noto Color Emoji for consistent quality
  const pngBuffer = await emojiToPng(emoji, 512);
  const base64 = pngBuffer.toString("base64");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<image href="data:image/png;base64,${base64}" width="512" height="512"/>
</svg>`;
};

const emojiToUnicode = (emoji: string): string =>
  Array.from(emoji)
    .map((char) => char.codePointAt(0)!.toString(16).toUpperCase())
    .join(" ")
    .toLowerCase();

const svgResponse = async (emoji: string): Promise<Response> =>
  new Response(await emojiToSvg(emoji), {
    headers: { "Content-Type": "image/svg+xml" },
  });

const pngResponse = async (emoji: string): Promise<Response> =>
  new Response(await emojiToPng(emoji), {
    headers: { "Content-Type": "image/png" },
  });

const gifResponse = async (emoji: string): Promise<Response> => {
  let url = `https://fonts.gstatic.com/s/e/notoemoji/latest/${emojiToUnicode(emoji)}/512.gif`;

  const head = await fetch(url, { method: "HEAD" });
  if (!head.ok) {
    url = `https://fonts.gstatic.com/s/e/notoemoji/latest/${emojiToUnicode(DEFAULT_EMOJI)}/512.gif`;
  }

  const gif = await fetch(url);
  const buffer = await gif.arrayBuffer();

  return new Response(buffer, {
    headers: { "Content-Type": "image/gif" },
  });
};

const randomResponse = async (emoji: string): Promise<Response> => {
  const responses = [
    () => svgResponse(emoji),
    () => pngResponse(emoji),
    () => gifResponse(emoji),
  ];
  const pick = responses[Math.floor(Math.random() * responses.length)];
  return pick();
};

export async function handler(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);

  const formatMatch = pathname.match(/^\/(svg|png|gif)\/(.+)$/);
  if (formatMatch) {
    const [, format, rawEmoji] = formatMatch;
    const emoji = fetchEmojiFromString(rawEmoji);

    if (format === "svg") return svgResponse(emoji);
    if (format === "png") return pngResponse(emoji);
    return gifResponse(emoji);
  }

  const emojiMatch = pathname.match(/^\/(.+)$/);
  if (emojiMatch) {
    const emoji = fetchEmojiFromString(emojiMatch[1]);
    return randomResponse(emoji);
  }

  const html = await readFile(
    path.join(process.cwd(), "index.html"),
    "utf-8",
  );

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

export default {
  async fetch(req: Request): Promise<Response> {
    return handler(req);
  },
};
