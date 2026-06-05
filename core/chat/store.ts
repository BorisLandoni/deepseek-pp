const STORAGE_KEY = 'deepseek_pp_chat_enabled';

// Must match STORAGE_HEADERS_KEY in core/deepseek/adapter.ts
const STORAGE_HEADERS_KEY = 'deepseekCachedClientHeaders';

export async function getChatEnabled(): Promise<boolean> {
  // chrome.storage is not available in the main-world content script context
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return true;
  const data = await chrome.storage.local.get(STORAGE_KEY) as Record<string, unknown>;
  // Default to enabled when no value has been stored yet
  return data[STORAGE_KEY] !== false;
}

export async function setChatEnabled(enabled: boolean): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
  await chrome.storage.local.set({ [STORAGE_KEY]: enabled });
  if (!enabled) {
    try {
      await chrome.storage.local.remove(STORAGE_HEADERS_KEY);
    } catch {}
  }
}
