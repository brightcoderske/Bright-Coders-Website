import axios from "axios";

const DEFAULT_MAX_AGE_MS = 1000 * 60 * 30;

const readCache = (key) => {
  try {
    const cached = JSON.parse(localStorage.getItem(key));
    if (!cached || !Array.isArray(cached.data)) return null;
    return cached;
  } catch {
    return null;
  }
};

const writeCache = (key, data) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        savedAt: Date.now(),
      }),
    );
  } catch {
    // Storage can be unavailable in private browsing. Fresh network data still works.
  }
};

export const loadCachedList = async ({
  cacheKey,
  url,
  onData,
  mapData = (data) => data,
  maxAgeMs = DEFAULT_MAX_AGE_MS,
}) => {
  const cached = readCache(cacheKey);
  const hasFreshCache = cached && Date.now() - cached.savedAt < maxAgeMs;

  if (cached) {
    onData(cached.data, { fromCache: true });
  }

  if (hasFreshCache) {
    return cached.data;
  }

  const response = await axios.get(url);
  const nextData = mapData(response.data);
  writeCache(cacheKey, nextData);
  onData(nextData, { fromCache: false });
  return nextData;
};
