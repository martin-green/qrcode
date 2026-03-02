# QR Code Generator

A free, client-side QR code generator. No login, no server — everything runs entirely in your browser.

## Features

- **Generate QR codes** from any URL
- **URL validation** — checks for valid `http://` or `https://` URLs
- **Error correction levels** — L (7%), M (15%), Q (25%), H (30%) with M pre-selected
- **Download as SVG or PNG** (1024×1024 px)
- **Localized** in English and Swedish (auto-detected from browser, saved in localStorage)
- **Responsive** design that works on desktop and mobile
- **Privacy-first** — no data ever leaves your browser

## Getting Started

### Open directly

Just open `index.html` in a browser. No build step required.

### Local dev server

```bash
npx http-server -p 3000 -c-1
```

Then visit [http://localhost:3000](http://localhost:3000).

## Hosting on GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to the **main** branch, root folder (`/`)
4. Your site will be live at `https://<username>.github.io/<repo>/`

## Tech Stack

| What | Details |
|------|---------|
| HTML / CSS / JS | Plain, no frameworks |
| QR library | [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT, loaded from CDN) |

## Project Structure

```
index.html   – Page markup
style.css    – Styling
app.js       – QR generation, validation, i18n, downloads
```

## License

MIT
