// Import necessary modules
import { Context, Hono } from "hono"; // Importing Hono framework and Context type
import regexForEmoji from "npm:emoji-regex"; // Importing regex to detect emojis in strings
import { createCanvas } from "https://deno.land/x/canvas/mod.ts"; // Importing the canvas module to create PNGs

// Initialize Hono application
const app = new Hono();

// Default emoji to be used when no emoji is found in the string
const DEFAULT_EMOJI = "💩";

// Helper function to get a random element from an array
const getRandomElement = <T>(array: T[]): T => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

// Function to generate an SVG image containing the provided emoji
const emojiToSvg = (emoji: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width='128' height='145' viewBox="0 0 128 128">
<text x="50%"  y="50%" text-anchor="middle" dominant-baseline="middle" font-size="100">
  ${emoji}
</text>
</svg>`;

// Function to extract the first emoji from a string (or return the default emoji if none found)
const fetchEmojiFromString = (txt: string): string => {
  txt = decodeURIComponent(txt); // Decode the emoji from URI encoding

  // Match emojis in the string using the emoji regex
  const emojisPresentInString = txt.match(regexForEmoji());

  // Return the first emoji found or the default emoji if no emojis are found
  return emojisPresentInString?.length
    ? emojisPresentInString[0]
    : DEFAULT_EMOJI;
};

// Function to create a PNG image from an emoji
const emojiToPng = async (emoji: string) => {
  const size = 128; // Define canvas size
  const canvas = createCanvas(size, size); // Create a new canvas
  const ctx = canvas.getContext("2d"); // Get the 2D drawing context

  // Load the custom emoji font
  const font = await Deno.readFile("NotoColorEmoji-Regular.ttf");
  canvas.loadFont(font, { family: "Noto Color Emoji" });

  // Set the font size and style
  ctx.font = "100px Noto Color Emoji";

  // Draw the emoji at a fixed position on the canvas
  ctx.fillText(emoji, 0, 100); // This could be fixed to center the text, adjusted below

  // Return the canvas as a PNG image buffer
  return canvas.toBuffer("image/png");
};

// Function to convert an emoji to its Unicode code points in a readable format
const emojiToUnicode = (emoji: string): string => {
  return Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16).toUpperCase()) // Convert each character to hex Unicode
    .join(" ") // Join the code points with spaces
    .toLowerCase(); // Return in lowercase format
};

// Route to handle PNG image requests for emojis
const pngRoute = async (c: Context): Promise<Response> => {
  const emojiParam = c.req.param("emoji"); // Retrieve the emoji from the URL parameter
  const fetchedEmoji = fetchEmojiFromString(emojiParam); // Fetch the emoji (or default emoji if none found)

  c.header("Content-Type", "image/png"); // Set the response header to indicate PNG format

  // Return the PNG image generated from the emoji
  return c.body(await emojiToPng(fetchedEmoji));
};

const gifRoute = async (c: Context): Promise<Response> => {
  const emojiParam = c.req.param("emoji"); // Retrieve the emoji from the URL parameter
  const fetchedEmoji = fetchEmojiFromString(emojiParam); // Fetch the emoji (or default emoji if none found)

  // Convert the emoji to its Unicode code point format
  const emojiUnicode = emojiToUnicode(fetchedEmoji);

  // Construct the URL for the emoji GIF
  let gEmojiUrl =
    `https://fonts.gstatic.com/s/e/notoemoji/latest/${emojiUnicode}/512.gif`;

  // Check if the GIF URL is valid
  const res = await fetch(gEmojiUrl);
  if (!res.ok) {
    // Fallback to the default emoji GIF if the URL is invalid
    gEmojiUrl = `https://fonts.gstatic.com/s/e/notoemoji/latest/${
      emojiToUnicode(DEFAULT_EMOJI)
    }/512.gif`;
  }

  // Fetch the GIF image data
  const gifData = await fetch(gEmojiUrl);
  const gifBuffer = await gifData.arrayBuffer();

  // Send the GIF image directly as a response
  return new Response(gifBuffer, {
    headers: {
      "Content-Type": "image/gif",
    },
  });
};

// Route to handle SVG image requests for emojis
const svgRoute = (c: Context): Response => {
  const emojiParam = c.req.param("emoji"); // Retrieve the emoji from the URL parameter
  const fetchedEmoji = fetchEmojiFromString(emojiParam); // Fetch the emoji (or default emoji if none found)

  c.header("Content-Type", "image/svg+xml"); // Set the response header to indicate SVG format

  // Return the SVG image generated from the emoji
  return c.body(emojiToSvg(fetchedEmoji));
};

// Define routes for each image format (SVG, PNG, and GIF)
app.get("/svg/:emoji", svgRoute); // Route for SVG images
app.get("/gif/:emoji", gifRoute); // Route for GIF images
app.get("/png/:emoji", pngRoute); // Route for PNG images

// Route to handle general emoji requests, which returns a random format (SVG, PNG, or GIF)
app.get("/:emoji", (c) => {
  // Define the available routes for each image format
  const availableRoutes: Record<
    string,
    (c: Context) => Response | Promise<Response>
  > = {
    svg: svgRoute,
    gif: gifRoute,
    png: pngRoute,
  };

  // Randomly pick an image format (SVG, PNG, or GIF)
  const randomMethod: string = getRandomElement<string>(["svg", "png", "gif"]);

  // Call the selected route and return the response
  return availableRoutes[randomMethod](c);
});

// Basic home route to check if the server is running
app.get("/", async (c) => {
  return c.html(new TextDecoder().decode(await Deno.readFile('./index.html')));
});

// Start the server and listen for incoming requests
Deno.serve(app.fetch);
