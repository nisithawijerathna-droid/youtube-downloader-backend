# TubeDrop — YouTube Downloader

A clean YouTube downloader with a Netlify Functions backend and a sleek dark frontend.

---

## Project Structure

```
tube-downloader/
├── frontend/
│   └── index.html          ← The frontend (open in browser or host anywhere)
└── backend/
    ├── netlify.toml         ← Netlify config
    ├── package.json
    └── netlify/
        └── functions/
            ├── info.js      ← POST /api/info
            └── download.js  ← POST /api/download
```

---

## Backend Deployment (Netlify)

### Prerequisites
- A [Netlify](https://netlify.com) account (free tier works)
- `yt-dlp` must be available in the Netlify build environment

### Steps

1. **Install Netlify CLI** on your machine:
   ```bash
   npm install -g netlify-cli
   ```

2. **Go to the backend folder:**
   ```bash
   cd backend
   npm install
   ```

3. **Deploy to Netlify:**
   ```bash
   netlify init       # links to your Netlify account
   netlify deploy --prod
   ```

4. **Add yt-dlp to Netlify:**
   In `netlify.toml`, add a build command that installs yt-dlp:
   ```toml
   [build]
     command = "pip install yt-dlp"
     functions = "netlify/functions"
   ```

   Or use a `netlify/functions/utils/yt-dlp` binary — download the Linux binary from:
   https://github.com/yt-dlp/yt-dlp/releases and place it at `netlify/functions/bin/yt-dlp`

5. Once deployed, **copy your site URL** (e.g. `https://your-site.netlify.app`)

---

## Frontend Setup

1. Open `frontend/index.html`
2. Find this line at the top of the `<script>` block:
   ```js
   const API_BASE = "https://YOUR-NETLIFY-SITE.netlify.app";
   ```
3. Replace it with your actual Netlify backend URL
4. Open `index.html` in a browser — done!

---

## API Endpoints

### `POST /api/info`
**Body:** `{ "url": "https://youtube.com/watch?v=..." }`

**Response:**
```json
{
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": "3:45",
  "uploader": "Channel Name",
  "formats": [...]
}
```

---

### `POST /api/download`
**Body:** `{ "url": "...", "format": "720p" }`

**Response:** Binary file (video/mp4 or audio/mpeg)

---

## Format Options
| ID         | Description           |
|------------|-----------------------|
| best_mp4   | Best available quality |
| 1080p      | 1080p MP4             |
| 720p       | 720p MP4              |
| 480p       | 480p MP4              |
| audio_mp3  | MP3 audio only        |

---

## Notes
- Netlify Functions have a **10 second timeout** on free plans. For video downloads, you may need a paid plan (26s timeout) or use Netlify's background functions.
- Large videos may time out. Consider linking to a direct yt-dlp stream URL instead of piping the whole file.
- For personal use only. Respect YouTube's Terms of Service and copyright law.
