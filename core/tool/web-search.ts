import type {
  JsonValue,
  ToolCall,
  ToolDescriptor,
  ToolProviderIdentity,
  ToolResult,
} from './types';

export const WEB_SEARCH_TOOL_PROVIDER: ToolProviderIdentity = {
  kind: 'local',
  id: 'web',
  displayName: 'DeepSeek++ Web Search',
  transport: 'in_process',
};

export const WEB_SEARCH_TOOL_NAMES = ['web_search', 'web_fetch'] as const;

export type WebSearchToolName = typeof WEB_SEARCH_TOOL_NAMES[number];

export const WEB_SEARCH_TOOL_DESCRIPTORS: ToolDescriptor[] = [
  {
    id: 'local:web:web_search',
    provider: WEB_SEARCH_TOOL_PROVIDER,
    name: 'web_search',
    invocationName: 'web_search',
    title: 'Web Search',
    description: 'Search the internet and return titles, URLs and summaries of relevant web pages',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query keywords' },
        topK: { type: 'integer', description: 'Number of results to return, default 5' },
      },
      required: ['query'],
      additionalProperties: false,
    },
    execution: {
      mode: 'auto',
      enabled: true,
      risk: 'low',
    },
  },
  {
    id: 'local:web:web_fetch',
    provider: WEB_SEARCH_TOOL_PROVIDER,
    name: 'web_fetch',
    invocationName: 'web_fetch',
    title: 'Fetch Page',
    description: 'Download the content of a URL and return visible text (navigation, scripts and styles are automatically removed)',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Full URL to fetch (http:// or https://)' },
      },
      required: ['url'],
      additionalProperties: false,
    },
    execution: {
      mode: 'auto',
      enabled: true,
      risk: 'low',
    },
  },
];

export function isWebSearchToolName(name: string): name is WebSearchToolName {
  return (WEB_SEARCH_TOOL_NAMES as readonly string[]).includes(name);
}

export async function executeWebSearchToolCall(call: ToolCall): Promise<ToolResult> {
  switch (call.name) {
    case 'web_search':
      return performWebSearch(call);
    case 'web_fetch':
      return performWebFetch(call);
    default:
      return {
        ok: false,
        name: call.name,
        summary: 'Unsupported search tool',
        error: {
          code: 'web_tool_unsupported',
          message: `Unsupported web tool: ${call.name}`,
          retryable: false,
        },
      };
  }
}

// ---------------------------------------------------------------------------
// Web Search via Bing (no API key required)
// ---------------------------------------------------------------------------

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

async function performWebSearch(call: ToolCall): Promise<ToolResult> {
  const query = typeof call.payload.query === 'string' ? call.payload.query.trim() : '';
  if (!query) {
    return {
      ok: false,
      name: call.name,
      summary: 'Search query cannot be empty',
      error: { code: 'empty_query', message: 'query is required', retryable: false },
    };
  }

  const topK = typeof call.payload.topK === 'number'
    ? Math.min(Math.max(1, Math.floor(call.payload.topK)), 10)
    : 5;

  // Try multiple Bing domains as fallback.
  // Each domain times out in 8s; total stays under 20s.
  const domains = ['cn.bing.com', 'www.bing.com'];
  let lastError: string | null = null;
  const startTime = Date.now();

  for (let i = 0; i < domains.length; i++) {
    // Guard: if we've been searching for >18s, give up
    if (Date.now() - startTime > 18_000) {
      lastError = lastError || 'Search timed out (>18s)';
      break;
    }
    try {
      const results = await bingSearch(domains[i], query, topK);
      if (results.length === 0) {
        lastError = `${domains[i]} returned no parseable search results`;
        continue;
      }
      return {
        ok: true,
        name: call.name,
        summary: `Search complete, ${results.length} results found`,
        output: results as unknown as JsonValue,
        detail: results
          .map((r, i) => `${i + 1}. [${r.title}](${r.url})\n   ${r.snippet}`)
          .join('\n'),
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      // On permission error don't retry — user needs to reload the extension
      if (lastError.includes('opaque') || lastError.includes('status 0')) break;
      // On other errors try the next domain
    }
  }

  const isPermissionError =
    lastError?.includes('Failed to fetch') ||
    lastError?.includes('NetworkError') ||
    lastError?.includes('opaque') ||
    lastError?.includes('status 0');
  const hasNoParseableResults = lastError?.includes('no parseable search results') === true;

  return {
    ok: false,
    name: call.name,
    summary: hasNoParseableResults ? 'No search results' : 'Search failed',
    detail: isPermissionError
      ? `The extension does not have permission to access Bing. Please reload the extension from dist/chrome-mv3, or confirm that cn.bing.com is listed under site access in chrome://extensions → DeepSeek++ details.`
      : hasNoParseableResults
        ? `No parseable search results found: ${lastError}`
        : `Search failed: ${lastError}`,
    error: {
      code: isPermissionError
        ? 'search_permission_denied'
        : hasNoParseableResults
          ? 'search_no_results'
          : 'search_failed',
      message: lastError ?? 'unknown error',
      retryable: !isPermissionError,
    },
  };
}

async function bingSearch(domain: string, query: string, topK: number): Promise<SearchResult[]> {
  let url: URL;
  try {
    url = new URL(`https://${domain}/search`);
    url.searchParams.set('q', query);
  } catch {
    throw new Error(`Invalid search domain: ${domain}`);
  }

  // Manual AbortController for timeout (more compatible than AbortSignal.timeout)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8_000);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,it;q=0.8',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    if (response.status === 0) {
      throw new Error(`Host permission denied (opaque response) for ${domain}`);
    }
    throw new Error(`${domain} returned status ${response.status}`);
  }

  let html: string;
  try {
    html = await response.text();
  } catch {
    throw new Error(`${domain} response body unreadable`);
  }
  if (html.length < 200) {
    throw new Error(`${domain} returned an empty or blocked response (${html.length} bytes)`);
  }
  return parseBingResults(html, topK);
}

function parseBingResults(html: string, topK: number): SearchResult[] {
  const results: SearchResult[] = [];

  // Bing search results structure:
  // <li class="b_algo">
  //   <h2><a href="URL">Title</a></h2>
  //   <div class="b_caption"><p>Snippet...</p></div>
  // </li>
  const algoRegex = /<li[^>]*class="[^"]*\bb_algo\b[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;

  let match: RegExpExecArray | null;
  while ((match = algoRegex.exec(html)) !== null && results.length < topK) {
    const block = match[1];

    // Extract title link: <h2><a href="URL">Title</a></h2>
    const titleLink = /<h2[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h2>/i.exec(block);
    if (!titleLink) continue;

    let url = titleLink[1];
    const title = stripHtml(titleLink[2]).replace(/\s+/g, ' ').trim();

    // Extract snippet from b_caption
    const captionBlock = /<div[^>]*class="[^"]*\bb_caption\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(block);
    let snippet = '';
    if (captionBlock) {
      // Try <p> inside caption first, otherwise full caption text
      const paraText = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(captionBlock[1]);
      snippet = paraText
        ? stripHtml(paraText[1]).replace(/\s+/g, ' ').trim()
        : stripHtml(captionBlock[1]).replace(/\s+/g, ' ').trim();
    }

    // Bing results sometimes have protocol-relative URLs
    if (url.startsWith('//')) url = 'https:' + url;

    if (title && url) {
      results.push({ title, url, snippet });
    }
  }

  return results.slice(0, topK);
}

// ---------------------------------------------------------------------------
// Web Fetch: download a URL and extract visible text
// ---------------------------------------------------------------------------

async function performWebFetch(call: ToolCall): Promise<ToolResult> {
  const url = typeof call.payload.url === 'string' ? call.payload.url.trim() : '';
  if (!url) {
    return {
      ok: false,
      name: call.name,
      summary: 'URL cannot be empty',
      error: { code: 'empty_url', message: 'url is required', retryable: false },
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      ok: false,
      name: call.name,
      summary: 'Invalid URL',
      detail: `Cannot parse URL: ${url}`,
      error: { code: 'invalid_url', message: `Invalid URL: ${url}`, retryable: false },
    };
  }

  // Definitive permission pre-check: distinguishes "host permission not active"
  // (needs reinstall) from a genuine network failure. Without this, a CORS block and a
  // timeout both surface as a vague "Failed to fetch".
  const hasHostPermission = await checkHostPermission(parsedUrl.origin);
  if (!hasHostPermission) {
    return {
      ok: false,
      name: call.name,
      summary: 'Web access not active',
      detail: `The extension does not have active host access for ${parsedUrl.origin}. Do NOT retry. Tell the user to REMOVE and RE-ADD the extension in chrome://extensions (loading from dist\\chrome-mv3), then accept the "read all sites" prompt. A simple reload is not enough after a manifest permission change.`,
      error: {
        code: 'fetch_permission_inactive',
        message: `Host permission for ${parsedUrl.origin} is not active. The user must remove and reinstall the extension.`,
        retryable: false,
      },
    };
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(25_000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    let text: string;

    if (contentType.includes('text/html') || contentType.includes('text/plain') || contentType.includes('application/json')) {
      text = await response.text();
    } else {
      return {
        ok: true,
        name: call.name,
        summary: `Page type: ${contentType}`,
        detail: `Content-Type: ${contentType}\nURL: ${url}\n(Non-text content, cannot display)`,
        output: { url, contentType } as unknown as JsonValue,
      };
    }

    const extracted = contentType.includes('text/html') ? extractTextFromHtml(text) : text;

    // Detect bot-protection / JS-challenge pages (Cloudflare, etc.). These return a tiny
    // placeholder ("Just a moment… Enable JavaScript") instead of the real content. Returning
    // it as success would let the model treat the challenge text as the page — or worse,
    // ignore it and fabricate. Surface it as a clear, non-retryable failure instead.
    if (isBotChallengePage(text, extracted)) {
      return {
        ok: false,
        name: call.name,
        summary: 'Page blocked by bot protection',
        detail: `${url} is protected by an anti-bot / JavaScript challenge (e.g. Cloudflare) and cannot be read automatically. Do NOT generate any content from memory. Tell the user this page cannot be fetched and ask them to paste the page text directly.`,
        error: {
          code: 'fetch_bot_challenge',
          message: `${url} returned a bot-protection challenge page; real content is not accessible. Retrying will not help.`,
          retryable: false,
        },
      };
    }

    const maxLength = 50_000;
    const truncated = extracted.length > maxLength;
    const outputText = truncated
      ? extracted.slice(0, maxLength) +
        `\n\n... [content truncated, total ${extracted.length} characters]`
      : extracted;

    return {
      ok: true,
      name: call.name,
      summary: `Fetched ${url}`,
      detail: truncated
        ? `Page length ${extracted.length} chars, truncated to ${maxLength} chars`
        : `Page length ${extracted.length} chars`,
      output: { url, content: outputText, contentType, truncated } as unknown as JsonValue,
    };
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === 'TimeoutError';
    const message = isTimeout
      ? 'Request timed out after 25 seconds'
      : error instanceof Error ? error.message : String(error);
    const isPermissionError =
      !isTimeout && (
        message.includes('Failed to fetch') ||
        message.includes('NetworkError') ||
        message.includes('opaque') ||
        message.includes('status 0')
      );
    // Surface the real error in the service worker console for diagnosis.
    console.error(`[DPP-web_fetch] ${parsedUrl.href} failed: ${message}`, error);
    return {
      ok: false,
      name: call.name,
      summary: isTimeout ? 'Page fetch timed out' : 'Failed to fetch page',
      detail: isPermissionError
        ? `Cannot access ${url}: the browser blocked the request (CORS / missing host permission). Do NOT retry. Tell the user to REMOVE and RE-ADD the extension from dist\\chrome-mv3 in chrome://extensions.`
        : isTimeout
          ? `The page ${url} did not respond within 25 seconds. It may be slow or blocking automated requests. You may inform the user and suggest trying again.`
          : `Network error while fetching ${url}: ${message}`,
      error: {
        code: isPermissionError ? 'fetch_permission_denied' : isTimeout ? 'fetch_timeout' : 'fetch_failed',
        message,
        retryable: false,
      },
    };
  }
}

/**
 * Heuristically detects anti-bot / JavaScript-challenge interstitials (Cloudflare,
 * "Just a moment…", "Checking your browser", etc.). These pages contain almost no real
 * text but return HTTP 200, so they must be caught explicitly.
 */
function isBotChallengePage(rawHtml: string, extractedText: string): boolean {
  const haystack = `${rawHtml.slice(0, 4000)} ${extractedText}`.toLowerCase();
  const markers = [
    'just a moment',
    'enable javascript and cookies to continue',
    'checking your browser before accessing',
    'cf-browser-verification',
    'cf-challenge',
    'challenge-platform',
    'attention required! | cloudflare',
    'ddos protection by',
    'please turn javascript on',
    'verifying you are human',
    'needs to review the security of your connection',
  ];
  if (markers.some((m) => haystack.includes(m))) return true;
  // An HTML page that reduces to almost no visible text is almost always an interstitial.
  if (rawHtml.length > 0 && extractedText.length < 80) return true;
  return false;
}

/** Returns true if the extension currently has active host access for the given origin. */
async function checkHostPermission(origin: string): Promise<boolean> {
  try {
    if (typeof chrome === 'undefined' || !chrome.permissions?.contains) return true;
    return await chrome.permissions.contains({ origins: [`${origin}/*`] });
  } catch {
    // If the check itself fails, don't block the fetch — let it try and surface a real error.
    return true;
  }
}

function extractTextFromHtml(html: string): string {
  // Strip scripts and styles
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ');
  text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ' ');
  text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ' ');
  text = text.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, ' ');

  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');

  // Collapse whitespace
  text = text.replace(/[\r\n]+/g, '\n');
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n\s+\n/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}
