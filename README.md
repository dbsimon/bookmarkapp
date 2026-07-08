# My Tools Hub

My Tools Hub is a mobile-friendly, tile-based dashboard for launching frequently used tools and websites.

It is designed to be simple, visual, and fast:
- Big colorful tiles
- Tap a tile to open a tool
- Categories and pinned tools
- Local browser storage
- Optional sync with Google Sheets through Google Apps Script

This version is optimized for iPhone-style usage and keeps secondary actions inside a floating bottom-right menu instead of showing too many buttons on each tile.

---

## Features

- Tile-based dashboard UI
- Large tool titles
- Pinned section and All Tools section
- Category filter tabs
- Search tools by title, tags, or description
- Add, edit, pin, archive, and reorder tools
- JSON export and import
- Local persistence with `localStorage`
- Optional remote sync with Google Apps Script Web App

---

## Project Structure

```text
.
├── index.html
├── styles.css
├── app.js
└── README.md
```

- `index.html` — main page structure
- `styles.css` — all visual styles and responsive layout
- `app.js` — tool logic, storage, UI behavior, and sync actions
- `README.md` — introduction and deployment notes

---

## How It Works

This app stores tool data in the browser using `localStorage`, so it works immediately without a database or backend.[web:144]

If sync is configured, the app can:
- check remote metadata,
- preview pull or push changes,
- and sync tool data through a Google Apps Script Web App endpoint.[web:29]

---

## Local Run

You can run it locally by simply opening `index.html` in a browser.

For a cleaner development setup, you can also serve the folder with any static server, for example:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

---

## Static Deployment

This project can be deployed as a static website because the frontend only needs HTML, CSS, and JavaScript.[web:153]

### Option 1: GitHub Pages

1. Create a GitHub repository.
2. Upload:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
3. Go to **Settings** -> **Pages**.
4. Under **Build and deployment**, choose:
   - Source: **Deploy from a branch**
   - Branch: your main branch
   - Folder: `/ (root)`
5. Save and wait for GitHub Pages to publish the site.[web:153]

Your site will then be available at a GitHub Pages URL.

### Option 2: Any Static Host

You can also deploy this project to:
- Netlify
- Cloudflare Pages
- Vercel
- any normal web server

Just upload the same files to the site root.

---

## Google Apps Script Sync Setup

Remote sync is optional.

To enable sync, you need a Google Apps Script Web App URL.[web:29]

### Basic steps

1. Open your Apps Script project.
2. Click **Deploy** -> **New deployment**.
3. Select **Web app**.
4. Set access and execution options as needed.
5. Deploy and copy the Web App URL.[web:29]

If you update the Apps Script later, use **Manage deployments** and create a **new version** to keep the same URL active.[web:29]

### In this app

Open the floating action menu, then go to **Settings** -> **Sync**, and enter:

- **Google Apps Script Web App URL**
- **Sync Token**

The Sync Token should match the `SYNC_TOKEN` stored in your Apps Script `Script Properties`.

---

## Notes

- The app is browser-based, so each browser/device has its own local copy until sync is used.[web:144]
- If sync is not configured, the app still works fully as a local launcher.
- For best mobile experience, keep `viewport-fit=cover` and safe-area CSS support enabled.[cite:6]
- Large tiles and floating action controls are tuned for mobile-first usage, especially iPhone-style layouts.[cite:6]

---

## Recommended Files to Keep Together

Make sure these files stay in the same folder:

```text
index.html
styles.css
app.js
```

Because `index.html` loads:

- `styles.css` with `<link rel="stylesheet" href="styles.css">`
- `app.js` with `<script src="app.js"></script>`

If you move files into subfolders later, update the paths accordingly.

---

## Future Improvements

Possible next enhancements:
- icon upload support
- dark mode
- multiple tile size modes
- category management improvements
- background sync status indicator
- better desktop layout presets

---

## License

Private/internal use unless you decide to publish it with your own license.
