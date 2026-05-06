const { execSync } = require("child_process");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { url } = JSON.parse(event.body);
    if (!url) return { statusCode: 400, body: JSON.stringify({ error: "No URL provided" }) };

    // Get video info using yt-dlp
    const infoJson = execSync(
      `yt-dlp --dump-json --no-playlist "${url}"`,
      { timeout: 30000 }
    ).toString();

    const info = JSON.parse(infoJson);

    // Build format list
    const formats = [];

    // Best video+audio combos
    const qualities = [
      { label: "Best Quality (MP4)", format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best", id: "best_mp4" },
      { label: "1080p (MP4)", format: "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]", id: "1080p" },
      { label: "720p (MP4)", format: "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]", id: "720p" },
      { label: "480p (MP4)", format: "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]", id: "480p" },
      { label: "Audio Only (MP3)", format: "bestaudio/best", id: "audio_mp3" },
    ];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration_string || "",
        uploader: info.uploader || "",
        formats: qualities,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to fetch video info", details: err.message }),
    };
  }
};
