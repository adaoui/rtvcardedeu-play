import "dotenv/config";
import express from "express";

const app = express();

const API_BASE = "https://www.googleapis.com/youtube/v3";
const PORT = Number(process.env.PORT || 8787);
const TTL = Number(process.env.CACHE_TTL_SECONDS || 60);

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

if (!YOUTUBE_API_KEY) throw new Error("Missing YOUTUBE_API_KEY in server/.env");
if (!YOUTUBE_CHANNEL_ID)
  throw new Error("Missing YOUTUBE_CHANNEL_ID in server/.env");

// Cache RAM
let latestCache = {
  expiresAt: 0,
  items: [],
};

let uploadsPlaylistCache = {
  expiresAt: 0,
  uploadsId: null,
};

function bestThumb(thumbs) {
  return (
    thumbs?.maxres?.url ||
    thumbs?.standard?.url ||
    thumbs?.high?.url ||
    thumbs?.medium?.url ||
    thumbs?.default?.url ||
    ""
  );
}

async function ytGet(url) {
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));

  if (!res.ok || json?.error) {
    const msg = json?.error?.message || `YouTube API error (${res.status})`;
    throw new Error(msg);
  }
  return json;
}

async function getUploadsPlaylistId() {
  const now = Date.now();
  if (uploadsPlaylistCache.uploadsId && now < uploadsPlaylistCache.expiresAt) {
    return uploadsPlaylistCache.uploadsId;
  }

  const url = new URL(`${API_BASE}/channels`);
  url.searchParams.set("part", "contentDetails");
  url.searchParams.set("id", YOUTUBE_CHANNEL_ID);
  url.searchParams.set("key", YOUTUBE_API_KEY);

  const json = await ytGet(url);
  const uploads = json?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploads) throw new Error("No uploads playlist found (check channel id)");

  uploadsPlaylistCache = {
    uploadsId: uploads,
    expiresAt: now + 24 * 3600 * 1000,
  };

  return uploads;
}

async function fetchLatestFromYouTube(max = 20) {
  const uploadsId = await getUploadsPlaylistId();

  const url = new URL(`${API_BASE}/playlistItems`);
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("playlistId", uploadsId);
  url.searchParams.set("maxResults", String(Math.min(Math.max(max, 1), 50)));
  url.searchParams.set("key", YOUTUBE_API_KEY);

  const json = await ytGet(url);

  const items = (json.items ?? [])
    .map((it) => {
      const videoId =
        it.contentDetails?.videoId || it.snippet?.resourceId?.videoId;
      if (!videoId) return null;

      return {
        videoId,
        title: it.snippet?.title ?? "Sense títol",
        publishedAt:
          it.contentDetails?.videoPublishedAt ??
          it.snippet?.publishedAt ??
          new Date(0).toISOString(),
        thumbnail: bestThumb(it.snippet?.thumbnails),
      };
    })
    .filter(Boolean);

  return items;
}

app.get("/health", (_, res) => res.json({ ok: true }));

app.get("/api/latest", async (req, res) => {
  try {
    const max = Number(req.query.max || 20);
    const refresh = req.query.refresh === "1";

    const now = Date.now();
    if (!refresh && now < latestCache.expiresAt && latestCache.items.length) {
      return res.json({
        source: "cache",
        ttlSeconds: TTL,
        items: latestCache.items,
      });
    }

    const items = await fetchLatestFromYouTube(max);

    latestCache = {
      items,
      expiresAt: now + TTL * 1000,
    };

    res.json({
      source: "youtube",
      ttlSeconds: TTL,
      items,
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`RTVCPlay cache backend: http://localhost:${PORT}`);
});
