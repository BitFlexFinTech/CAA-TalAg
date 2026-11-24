export interface ResolvedPortraitResult {
  url: string;
  credit: string;
  pageUrl: string;
}

const MEMORY_CACHE = new Map<string, ResolvedPortraitResult | null>();

/**
 * Live browser-safe Wikipedia / Wikimedia portrait lookup used when:
 * 1) A user adds a new public talent via "Add Talent & Auto-Discover"
 * 2) A user clicks "Auto-Fetch Photo" on a public talent profile
 * 3) A cached image fails to load for a verifiable public figure
 */
export async function fetchWikipediaPortrait(
  talentName: string
): Promise<ResolvedPortraitResult | null> {
  const cleanName = talentName.trim();
  if (!cleanName) return null;

  const cacheKey = cleanName.toLowerCase();
  if (MEMORY_CACHE.has(cacheKey)) {
    return MEMORY_CACHE.get(cacheKey) ?? null;
  }

  try {
    const slug = encodeURIComponent(cleanName.replace(/\s+/g, '_'));
    const restRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`
    );

    if (restRes.ok) {
      const data = await restRes.json();
      if (data?.type !== 'disambiguation' && data?.thumbnail?.source) {
        const result: ResolvedPortraitResult = {
          url: data.thumbnail.source,
          credit: `Wikipedia / Wikimedia Commons · ${data.title || cleanName}`,
          pageUrl:
            data.content_urls?.desktop?.page ||
            `https://en.wikipedia.org/wiki/${slug}`,
        };
        MEMORY_CACHE.set(cacheKey, result);
        return result;
      }
    }

    // Fallback search query via MediaWiki Action API (supports CORS via origin=*)
    const searchUrl =
      `https://en.wikipedia.org/w/api.php?action=query&generator=search` +
      `&gsrsearch=${encodeURIComponent(cleanName)}&gsrlimit=2` +
      `&prop=pageimages|info&inprop=url&piprop=thumbnail&pithumbsize=480` +
      `&format=json&origin=*`;

    const searchRes = await fetch(searchUrl);
    if (searchRes.ok) {
      const sData = await searchRes.json();
      const pages = Object.values(
        (sData?.query?.pages ?? {}) as Record<
          string,
          {
            index?: number;
            title?: string;
            fullurl?: string;
            thumbnail?: { source?: string };
          }
        >
      ).sort((a, b) => (a.index ?? 99) - (b.index ?? 99));

      const matched = pages.find((p) => Boolean(p.thumbnail?.source));
      if (matched?.thumbnail?.source) {
        const result: ResolvedPortraitResult = {
          url: matched.thumbnail.source,
          credit: `Wikipedia / Wikimedia Commons · ${matched.title || cleanName}`,
          pageUrl:
            matched.fullurl || `https://en.wikipedia.org/wiki/${slug}`,
        };
        MEMORY_CACHE.set(cacheKey, result);
        return result;
      }
    }
  } catch {
    // Silent fallback so UI gracefully retains manual upload / monogram
  }

  MEMORY_CACHE.set(cacheKey, null);
  return null;
}
