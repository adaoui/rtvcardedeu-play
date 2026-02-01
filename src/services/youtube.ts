const API_BASE = "https://www.googleapis.com/youtube/v3";

function apiKey(): string {
  const key = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;
  if (!key) throw new Error("Falta VITE_YOUTUBE_API_KEY a .env.local");
  return key;
}

function channelId(): string {
  const id = import.meta.env.VITE_YOUTUBE_CHANNEL_ID as string | undefined;
  if (!id) throw new Error("Falta VITE_YOUTUBE_CHANNEL_ID a .env.local");
  return id;
}

function bestThumb(thumbs: any): string {
  return (
    thumbs?.maxres?.url ||
    thumbs?.standard?.url ||
    thumbs?.high?.url ||
    thumbs?.medium?.url ||
    thumbs?.default?.url ||
    ""
  );
}

/** ---------- Types ---------- */

export type LatestVideo = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
};

export type YouTubeChannelPlaylist = {
  playlistId: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  itemCount?: number;
};

export type YouTubePlaylistItem = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
};

/** ---------- Fetch helpers ---------- */

async function ytGet(url: URL) {
  const res = await fetch(url.toString());
  const json = await res.json().catch(() => ({}));

  // IMPORTANT: YouTube a vegades retorna 200 però amb { error: ... } en alguns entorns
  if (!res.ok || json?.error) {
    const msg =
      json?.error?.message ||
      (res.ok
        ? "YouTube API error (unknown)"
        : `YouTube API error (${res.status})`);
    throw new Error(msg);
  }

  return json;
}

/** ---------- Internal helpers ---------- */

async function getUploadsPlaylistId(): Promise<string> {
  const url = new URL(`${API_BASE}/channels`);
  url.searchParams.set("part", "contentDetails");
  url.searchParams.set("id", channelId());
  url.searchParams.set("key", apiKey());

  const json = await ytGet(url);
  const uploads = json?.items?.[0]?.contentDetails?.relatedPlaylists
    ?.uploads as string | undefined;

  if (!uploads) {
    throw new Error(
      "No he pogut obtenir la playlist d'uploads del canal. Revisa el VITE_YOUTUBE_CHANNEL_ID.",
    );
  }

  return uploads;
}

async function fetchUploadsAsLatest(max = 10): Promise<LatestVideo[]> {
  const uploadsPlaylistId = await getUploadsPlaylistId();

  // Reutilitzem playlistItems (és el més fiable)
  const items = await fetchPlaylistItems(uploadsPlaylistId, max);

  return items.map((it) => ({
    videoId: it.videoId,
    title: it.title,
    publishedAt: it.publishedAt,
    thumbnail: it.thumbnail,
  }));
}

/** ---------- Public API ---------- */

/**
 * Últims vídeos del canal (robust)
 * - Primer intent: uploads playlist (recomanat i estable)
 * - Fallback opcional: search (per si mai falla uploads)
 */
export async function fetchLatestVideos(max = 10): Promise<LatestVideo[]> {
  // ✅ Via uploads playlist (el bo)
  const latest = await fetchUploadsAsLatest(max);

  // Si encara així és buit, probablement el canal realment no té vídeos públics
  return latest;
}

/**
 * Playlists del canal (per construir categories / rails)
 */
export async function fetchChannelPlaylists(): Promise<
  YouTubeChannelPlaylist[]
> {
  let pageToken: string | undefined = undefined;
  const all: YouTubeChannelPlaylist[] = [];

  do {
    const url = new URL(`${API_BASE}/playlists`);
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("channelId", channelId());
    url.searchParams.set("maxResults", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    url.searchParams.set("key", apiKey());

    const json = await ytGet(url);

    const items = json.items ?? [];
    for (const it of items) {
      all.push({
        playlistId: it.id,
        title: it.snippet?.title ?? "Sense títol",
        publishedAt: it.snippet?.publishedAt ?? new Date(0).toISOString(),
        thumbnail: bestThumb(it.snippet?.thumbnails),
        itemCount: it.contentDetails?.itemCount,
      });
    }

    pageToken = json.nextPageToken;
  } while (pageToken);

  return all;
}

/**
 * Items d'una playlist (capítols)
 */
export async function fetchPlaylistItems(
  playlistId: string,
  max = 50,
): Promise<YouTubePlaylistItem[]> {
  let pageToken: string | undefined = undefined;
  const all: YouTubePlaylistItem[] = [];
  const want = Math.min(Math.max(max, 1), 200);

  do {
    const url = new URL(`${API_BASE}/playlistItems`);
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    url.searchParams.set("key", apiKey());

    const json = await ytGet(url);

    const items = json.items ?? [];
    for (const it of items) {
      const vid = it.contentDetails?.videoId || it.snippet?.resourceId?.videoId;
      if (!vid) continue;

      all.push({
        videoId: vid,
        title: it.snippet?.title ?? "Sense títol",
        publishedAt:
          it.contentDetails?.videoPublishedAt ??
          it.snippet?.publishedAt ??
          new Date(0).toISOString(),
        thumbnail: bestThumb(it.snippet?.thumbnails),
      });
    }

    pageToken = json.nextPageToken;
  } while (pageToken && all.length < want);

  return all.slice(0, want);
}

/**
 * Detall d'un vídeo (si ho necessites per watch)
 */
export async function fetchVideoDetails(videoId: string): Promise<any> {
  const url = new URL(`${API_BASE}/videos`);
  url.searchParams.set("part", "snippet,statistics,contentDetails");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", apiKey());

  const json = await ytGet(url);
  return json.items?.[0];
}
