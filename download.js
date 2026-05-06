const { execSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "yt-"));

  try {
    const { url, format } = JSON.parse(event.body);
    if (!url) return { statusCode: 400, body: JSON.stringify({ error: "No URL provided" }) };

    let formatArg = "";
    let isAudio = false;

    switch (format) {
      case "audio_mp3":
        formatArg = `-x --audio-format mp3`;
        isAudio = true;
        break;
      case "1080p":
        formatArg = `-f "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]"`;
        break;
      case "720p":
        formatArg = `-f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]"`;
        break;
      case "480p":
        formatArg = `-f "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]"`;
        break;
      default:
        formatArg = `-f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"`;
    }

    const outputTemplate = path.join(tmpDir, "%(title)s.%(ext)s");
    const cmd = `yt-dlp ${formatArg} --merge-output-format mp4 -o "${outputTemplate}" --no-playlist "${url}"`;

    execSync(cmd, { timeout: 120000 });

    const files = fs.readdirSync(tmpDir);
    if (!files.length) throw new Error("No file downloaded");

    const filePath = path.join(tmpDir, files[0]);
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(files[0]).slice(1);
    const filename = files[0];

    const contentType = isAudio ? "audio/mpeg" : "video/mp4";

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Access-Control-Allow-Origin": "*",
      },
      body: fileBuffer.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Download failed", details: err.message }),
    };
  }
};
