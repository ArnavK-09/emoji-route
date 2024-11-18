<h1 align="center">🎈 emoji-route 🎈</h1>
<h2 align="center">The Ultimate Route for Generating Emoji Images</h2>

<p align="center">
    <img alt="hero" width="450" src="https://github.com/ArnavK-09.png" />
</p>

> [!NOTE] **emoji-route** allows users to request images of emojis in multiple
> formats including PNG, SVG, and GIF. This is perfect for applications that
> need dynamic emoji handling or custom emoji display in different formats.

## 🌟 Features

> **emoji-route** offers several unique features for handling and generating
> emojis:

- **SVG Emoji Generation** – Generates an SVG image containing the requested
  emoji.
- **PNG Emoji Generation** – Creates a PNG image using the `canvas` module with
  custom fonts for emojis.
- **GIF Emoji Fetching** – Fetches and serves emoji GIFs directly from a
  reliable source.
- **Random Format Response** – Allows users to get a random emoji format (SVG,
  PNG, or GIF) with just one request.
- **Fallbacks for Missing Emojis** – In case an emoji isn't found, the app uses
  a default emoji (💩) to ensure smooth operation.

## 🔄 Routes

> **emoji-route** has the following routes for different emoji formats:

### 1. SVG Route (`/svg/:emoji`)

Generates an SVG image of the requested emoji.

- Example: `/svg/❤️`
- Response: SVG containing the ❤️ emoji.

### 2. PNG Route (`/png/:emoji`)

Generates a PNG image of the requested emoji.

- Example: `/png/💻`
- Response: PNG image of the 💻 emoji.

### 3. GIF Route (`/gif/:emoji`)

Fetches the emoji GIF from a reliable source and returns it. Powered by google
fonts.

- Example: `/gif/😂`
- Response: GIF of the 😂 emoji.

### 4. Random Emoji Route (`/:emoji`)

Returns a random image format (SVG, PNG, or GIF) for the requested emoji.

- Example: `/😊`
- Response: A randomly selected image format (SVG, PNG, or GIF) of the 😊 emoji.

## 🧑‍💻 Stack

This project uses the following technologies:

- **Hono** – A minimal web framework for building APIs.
- **Deno** – JavaScript and TypeScript runtime.
- **Canvas** – For generating PNG images with custom fonts.
- **Emoji Regex** – To detect and extract emojis from strings.
- **NotoColorEmoji-Regular.ttf** – Font for rendering emojis.

---

## 🛠 Installation

> You can add **emoji-route** with one command via:

###### terminal

```bash
# Command For Installation
npm i
```

---

## 💻 Contributing

> [!TIP]\
> We welcome contributions to improve **emoji-route**! If you have suggestions,
> bug fixes, or new feature ideas, follow these steps:

1. **Fork the Repository**\
   Click the **Fork** button at the top-right of the repo page.

2. **Clone Your Fork**\
   Clone the repo locally:

   ```bash
   git clone https://github.com/ArnavK-09/emoji-route.git
   ```

3. **Create a Branch**\
   Create a new branch for your changes:

   ```bash
   git checkout -b your-feature-branch
   ```

4. **Make Changes**\
   Implement your changes (bug fixes, features, etc.).

5. **Commit and Push**\
   Commit your changes and push the branch:

   ```bash
   git commit -m "feat(scope): description"
   git push origin your-feature-branch
   ```

6. **Open a Pull Request**\
   Open a PR with a detailed description of your changes.

7. **Collaborate and Merge**\
   The maintainers will review your PR, request changes if needed, and merge it
   once approved.

## 🙋‍♂️ Issues

Found a bug or need help? Please create an issue on the
[GitHub repository](https://github.com/ArnavK-09/emoji-route/issues) with a
detailed description.

## 👤 Author

<table>
  <tbody>
    <tr>
        <td align="center" valign="top" width="14.28%"><a href="https://github.com/ArnavK-09"><img src="https://github.com/ArnavK-09.png?s=100" width="130px;" alt="Arnav K"/></a><br /><a href="https://github.com/ArnavK-09"><h4><b>Arnav K</b></h4></a></td>
    </tr>
  </tbody>
</table>

---

<h3 align="center">💖 Thanks for Using emoji-route!</h3>

<p align="center">
    <strong>If you find this project helpful, please give it a ⭐ on GitHub!</strong>
</p>
