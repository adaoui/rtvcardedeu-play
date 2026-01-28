const API_BASE = "https://www.googleapis.com/youtube/v3";

function assertApiKey() {
  if (!import.meta.env.VITE_YOUTUBE_API_KEY) {
    throw new Error("Missing VITE_YOUTUBE_API_KEY");
  }
}

export type LatestVideo = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
};

export async function fetchLatestVideos(max = 12): Promise<LatestVideo[]> {
  assertApiKey();

  const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
  if (!channelId) {
    throw new Error("Missing VITE_YOUTUBE_CHANNEL_ID");
  }

  const url = new URL(`${API_BASE}/search`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("channelId", channelId);
  url.searchParams.set("order", "date");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(max));
  url.searchParams.set("key", import.meta.env.VITE_YOUTUBE_API_KEY);

  const res = await fetch(url.toString());
  const data = await res.json();

  return (data.items ?? []).map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt,
    thumbnail:
      item.snippet.thumbnails?.high?.url ??
      item.snippet.thumbnails?.medium?.url,
  }));
}
