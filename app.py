from flask import Flask, request, jsonify, send_file
import yt_dlp
import os
import uuid

app = Flask(__name__)

DOWNLOAD_FOLDER = "downloads"
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

def get_video_info(url):
    ydl_opts = {'quiet': True, 'no_warnings': True}

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

        formats = []
        for f in info.get("formats", []):
            if f.get("vcodec") != "none":
                formats.append({
                    "id": f.get("format_id"),
                    "label": f"{f.get('format_note') or ''} {f.get('ext')}",
                    "size": f.get("filesize") or 0
                })

        return {
            "title": info.get("title"),
            "thumbnail": info.get("thumbnail"),
            "uploader": info.get("uploader"),
            "duration": info.get("duration_string"),
            "formats": formats[:10]
        }

@app.route("/api/info", methods=["POST"])
def info():
    data = request.json
    result = get_video_info(data["url"])
    return jsonify({"status": "success", **result})


@app.route("/api/download", methods=["POST"])
def download():
    data = request.json
    url = data["url"]
    format_id = data["format"]

    filename = str(uuid.uuid4()) + ".mp4"
    filepath = os.path.join(DOWNLOAD_FOLDER, filename)

    ydl_opts = {
        'format': format_id,
        'outtmpl': filepath,
        'quiet': True,
        'no_warnings': True
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    return send_file(filepath, as_attachment=True)


if __name__ == "__main__":
    app.run()