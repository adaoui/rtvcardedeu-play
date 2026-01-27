export type YouTubePlaylistItem = {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    default?: string;
    medium?: string;
    high?: string;
    standard?: string;
    maxres?: string;
  };
};

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;
const API_BASE = "https://www.googleapis.com/youtube/v3";

function assertApiKey() {
  if (!API_KEY) {
    throw new Error(
      "Missing VITE_YOUTUBE_API_KEY. Add it to .env.local and restart `npm run dev`.",
    );
  }
}

function pickThumb(thumbnails: any) {
  return {
    default: thumbnails?.default?.url,
    medium: thumbnails?.medium?.url,
    high: thumbnails?.high?.url,
    standard: thumbnails?.standard?.url,
    maxres: thumbnails?.maxres?.url,
  };
}

export async function fetchPlaylistItems(
  playlistId: string,
  maxResults = 50,
): Promise<YouTubePlaylistItem[]> {
  assertApiKey();

  const url = new URL(`${API_BASE}/playlistItems`);
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("playlistId", playlistId);
  url.searchParams.set(
    "maxResults",
    String(Math.min(Math.max(maxResults, 1), 50)),
  );
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API error (${res.status}): ${text}`);
  }

  const data = await res.json();

  const items: YouTubePlaylistItem[] = (data.items ?? [])
    .map((it: any) => {
      const sn = it.snippet;
      const cd = it.contentDetails;
      const videoId = cd?.videoId;

      if (!videoId || !sn) return null;

      return {
        videoId,
        title: sn.title ?? "",
        description: sn.description ?? "",
        publishedAt: sn.publishedAt ?? "",
        thumbnails: pickThumb(sn.thumbnails),
      } as YouTubePlaylistItem;
    })
    .filter(Boolean);

  return items;
}

export function newestFirst(items: YouTubePlaylistItem[]) {
  return [...items].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function bestThumb(item: YouTubePlaylistItem): string | undefined {
  return (
    item.thumbnails.maxres ||
    item.thumbnails.standard ||
    item.thumbnails.high ||
    item.thumbnails.medium ||
    item.thumbnails.default
  );
}
