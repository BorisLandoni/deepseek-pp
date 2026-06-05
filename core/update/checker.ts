const GITHUB_REPO = 'BorisLandoni/deepseek-pp';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const STORAGE_KEY = 'deepseek_pp_update_info';

// Minimum interval between checks: 1 hour
const CHECK_INTERVAL_MS = 60 * 60 * 1000;

export interface UpdateInfo {
  available: boolean;
  latestVersion: string;
  currentVersion: string;
  downloadUrl: string;
  releaseUrl: string;
  checkedAt: number;
}

/** Compare two semver strings. Returns true if `latest` is strictly newer than `current`. */
function isNewer(latest: string, current: string): boolean {
  const parse = (v: string) => v.replace(/^v/, '').split('.').map(Number);
  const [la, lb, lc = 0] = parse(latest);
  const [ca, cb, cc = 0] = parse(current);
  if (la !== ca) return la > ca;
  if (lb !== cb) return lb > cb;
  return lc > cc;
}

/** Fetch the latest release info from GitHub and compare with the current version. */
export async function checkForUpdate(currentVersion: string): Promise<UpdateInfo | null> {
  try {
    const response = await fetch(API_URL, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!response.ok) return null;

    const data = await response.json() as {
      tag_name?: string;
      html_url?: string;
      assets?: Array<{ name: string; browser_download_url: string }>;
    };

    const latestVersion = (data.tag_name ?? '').replace(/^v/, '');
    if (!latestVersion) return null;

    const zipAsset = data.assets?.find((a) => a.name.endsWith('-chrome.zip'));
    const downloadUrl = zipAsset?.browser_download_url ?? data.html_url ?? '';
    const releaseUrl = data.html_url ?? `https://github.com/${GITHUB_REPO}/releases/latest`;

    return {
      available: isNewer(latestVersion, currentVersion),
      latestVersion,
      currentVersion,
      downloadUrl,
      releaseUrl,
      checkedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

/** Load cached update info from storage. */
export async function getStoredUpdateInfo(): Promise<UpdateInfo | null> {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return (data[STORAGE_KEY] as UpdateInfo | undefined) ?? null;
}

/** Persist update info to storage. */
export async function setStoredUpdateInfo(info: UpdateInfo): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: info });
}

/**
 * Run an update check if we haven't checked recently.
 * Returns the update info (from cache or fresh check).
 */
export async function maybeCheckForUpdate(currentVersion: string): Promise<UpdateInfo | null> {
  const cached = await getStoredUpdateInfo();

  // Use cache if it's fresh enough
  if (cached && Date.now() - cached.checkedAt < CHECK_INTERVAL_MS) {
    return cached;
  }

  const fresh = await checkForUpdate(currentVersion);
  if (fresh) {
    await setStoredUpdateInfo(fresh);
    return fresh;
  }

  return cached;
}
