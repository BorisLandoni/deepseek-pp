# Changelog

All notable changes to this project are documented here.

Format: `## [version] - YYYY-MM-DD`

---

## [0.7.29] - 2026-07-06

### Fixed
- **Sidebar chat: leaked tool-call XML now also cleared from the persisted transcript**: 0.7.28 stripped tool XML from live broadcasts, but the sidebar saves and restores the chat transcript verbatim (`chrome.storage`), so a `<web_search>` / `<memory_save>` block already in the history kept reappearing on every reopen/reload. `ChatMessage` now strips tool XML at render time, and the transcript is sanitized when restored (which also purges the raw copy from storage). This closes the remaining paths — including messages captured by older builds and tags the source-side strip did not catch.

---

## [0.7.28] - 2026-07-06

### Fixed
- **Tool-call XML no longer leaks in the sidebar chat**: `<web_search>` / `<memory_save>` blocks the model emits could appear verbatim in the DeepSeek++ sidebar — a separate renderer from the DeepSeek page fixed in 0.7.27. The sidebar tool loop now strips tool XML at the source before displaying each streamed chunk, using a broad catalog (built-in + enabled tools), so even a tool that is emitted but not enabled (and therefore not executed) is hidden, and a not-yet-closed tag no longer flashes while streaming. Tool execution is unchanged (still uses only the enabled tools).

---

## [0.7.27] - 2026-07-06

### Fixed
- **Tool-call XML no longer leaks into answers**: `<memory_save>` / `<web_search>` blocks could sometimes appear verbatim in a reply. Two causes fixed: (1) history cleanup now strips tool XML across the whole reassembled fragment text instead of per-fragment, so a block straddling a persisted fragment boundary no longer survives and reappears on reload; (2) the DOM scrubber now scans the concatenation of all text nodes (mapping the surviving text back per node), so a tag split across DOM text nodes (`<memory` + `_save>`) is stripped while document structure is preserved. Fragment cleanup also reads/writes both `content` and `text`.

### Changed
- **Build tooling / CI hardening**: fixed a Windows-only path bug in four smoke scripts (`new URL('..').pathname` → `fileURLToPath`) that reported every file as missing; re-baselined the `prompt:freeze` hashes for the EN/IT prompts; made the automation-contract smoke assert the automation tab by stable key instead of the removed Chinese label; aligned `manifest-policy` with the shipped permission model (broad required host permissions, `scripting` + `tabs`, both used) plus usage cross-checks.
- Added `CLAUDE.md` documenting the architecture, the tool-call pipeline and these fixes.

---

## [0.7.26] - 2026-06-06

### Added
- **Image analysis (vision)**: you can now attach images in chat. They are uploaded to DeepSeek (via the reverse-engineered `upload_file` endpoint with its own PoW challenge) and referenced in the completion, so the model can actually see and analyze them. Up to 4 images, 8 MB each; image thumbnails show in the attachment chips. Combine with a question to ask about the image.

---

## [0.7.25] - 2026-06-06

### Fixed
- **Skills now work on attached files and the current page**: previously, combining a skill with the "Ask about page" toggle wrapped the prompt so the `/skill` prefix was no longer at the start and the skill wasn't triggered. The user's text (including any `/skill` command) now always stays at the front, with page/file content appended in a single `[CONTENUTO REALE]` block — the same marker used by URL auto-fetch — so skills apply uniformly to pasted text, URLs, attached files and the displayed page.
- Attached files and page content now share one consistent context marker (previously `[FILE ALLEGATI]` / `[CONTENUTO PAGINA]` / `[CONTENUTO REALE DELLE PAGINE]` were inconsistent and didn't match what skills looked for).

### Changed
- Updated `skills-export/futura-skills.json` so the Futura skills reference the unified `[CONTENUTO REALE]` block and explicitly handle text, URL, file and page sources. Re-import to update.

---

## [0.7.24] - 2026-06-06

### Fixed
- **Answers about attached files now respect the selected language**: previously the model mirrored the file's language (e.g. a Chinese file produced a Chinese reply). The attachment prompt now forces the reply into the selected language (default = extension language), while still quoting file contents verbatim when asked to show them.

---

## [0.7.23] - 2026-06-06

### Added
- **PDF attachments**: you can now attach PDF files in chat. Text is extracted with pdf.js (loaded on demand as a separate chunk, so startup stays light; runs within the extension CSP). Up to 50 pages / 200k chars; scanned/image-only PDFs are reported as having no extractable text. Great for datasheets and product specs.

---

## [0.7.22] - 2026-06-06

### Added
- **Attach files in chat**: an "Attach" button lets you add text-based files (txt, md, csv, json, code, log, html, xml, yaml…) to your message. The file content is injected into the prompt so you can ask questions about it or run skills on it (e.g. `/proofreading` + a file). Up to 5 files, 200k chars each; binary and unsupported types (PDF/Word/images) are reported with a notice. Attached files show as removable chips above the input.

---

## [0.7.21] - 2026-06-06

### Added
- **Summarize the current browser page**: a "Summarize page" button in the chat reads the visible text of your active browser tab and produces a structured summary. A language selector (defaulting to the extension language chosen at startup) controls the summary language (Italian, English, Spanish, French, German).
- **Ask about the current page**: an "Ask about page" toggle — when on, your typed questions are answered using the content of the page open in the browser, in the selected language.
- Requires the `scripting` and `tabs` permissions to read the active tab (restricted pages like chrome:// and the Web Store are reported with a clear notice).

---

## [0.7.20] - 2026-06-06

### Added
- **Chat transcript persists across open/close**: the visible messages now survive closing and reopening the sidebar, so you can tell at a glance that the conversation is still in memory. The transcript is restored on open and cleared only when you press "New session" (which also resets the conversation memory).

---

## [0.7.19] - 2026-06-06

### Changed
- **Copy keeps formatting**: the per-message Copy button now copies the rendered response as rich text (`text/html` + clean `text/plain`), so pasting into Gmail, Word, WordPress, etc. preserves bold, headings and lists instead of showing raw Markdown. Falls back to a selection-based copy when the async clipboard API is unavailable.

---

## [0.7.18] - 2026-06-06

### Fixed
- **Auto-fetch now recognizes URLs without a protocol**: pasting `fnirsi.com/products/x` (no `https://`) previously wasn't detected, so the page wasn't fetched and the model fell back to guessing/calling web_fetch itself. The URL matcher now catches protocol-less URLs (`domain.tld/path`) and `www.` URLs, normalizes them to `https://`, and ignores emails and false positives like `config.json/x`.

---

## [0.7.17] - 2026-06-06

### Added
- **Import/Export skills from file**: the Skill page now has Import and Export buttons. Export saves all custom skills to a JSON file; Import loads skills from a JSON file (accepts single skill, array, `{skills:[]}`, or a full backup). Lets you move skills between installs and keep them version-controlled.
- **Ready-to-import skill pack**: `skills-export/futura-skills.json` contains the Futura Group editorial skills (electronews-creator, crea-schede-prodotto, proofreading) adapted for the sidebar with auto-fetch awareness and anti-hallucination rules.

---

## [0.7.16] - 2026-06-06

### Added
- **Full backup export/import**: Settings → Data now has "Export backup" / "Import backup" buttons that save and restore all memories, custom skills and presets in a single JSON file. This protects custom skills (stored in chrome.storage.local) from being lost when the extension is removed and reinstalled.

---

## [0.7.15] - 2026-06-06

### Added
- **Anti-hallucination guard**: when a skill is active and every URL in the message fails to fetch (bot protection, network error), the extension no longer sends the request to DeepSeek at all — it stops with a clear message asking the user to paste the page text. This prevents the model from fabricating content from memory while claiming it read the page.
- **Copy entire conversation**: a "Copy" button in the chat header copies the full transcript (user + assistant turns, excluding warning banners) to the clipboard.

---

## [0.7.14] - 2026-06-05

### Added
- **Visible warning banner when a page can't be fetched**: when an auto-fetched URL is blocked by bot protection or fails, the sidebar chat now shows an inline warning banner (e.g. "⚠️ excelitas.com è protetto da anti-bot… incolla il testo della pagina") above the response, so it's immediately clear the page wasn't read.

---

## [0.7.13] - 2026-06-05

### Fixed
- **Bot-protected pages no longer cause fabricated content**: `web_fetch` now detects anti-bot / JavaScript-challenge interstitials (Cloudflare "Just a moment…", "Checking your browser", near-empty HTML, etc.) and returns a clear non-retryable error instead of handing the challenge placeholder to the model. This prevents the model from treating a challenge page as real content or hallucinating product data from memory when a page (e.g. excelitas.com) cannot actually be read.

---

## [0.7.12] - 2026-06-05

### Added
- **Copy button on chat responses**: each assistant message in the sidebar chat now shows a "Copy" button on hover that copies the full response to the clipboard, with a "Copied" confirmation. Includes a fallback for contexts where the async clipboard API is unavailable.

---

## [0.7.11] - 2026-06-05

### Added
- **Automatic URL fetching in sidebar chat**: when a message contains one or more URLs, the extension now fetches their real page content in the background and injects it into the prompt before sending it to DeepSeek. This fixes the core reliability problem where DeepSeek would inconsistently skip the `web_fetch` tool and fabricate page content while claiming it had read the page. Up to 3 URLs per message are fetched; a "🔄 Recupero pagina…" status is shown while fetching.

---

## [0.7.10] - 2026-06-05

### Changed
- **web_fetch diagnostics**: added a host-permission pre-check that distinguishes "web access not active (reinstall needed)" from a genuine network failure, with a precise actionable message. Timeouts are now reported distinctly (extended to 25s). The real fetch error is logged to the service worker console (`[DPP-web_fetch]`).

---

## [0.7.9] - 2026-06-05

### Fixed
- **web_fetch / web_search still blocked by CORS after granting access**: in Manifest V3, host permissions granted at runtime are not reliably applied to the already-running service worker's `fetch()`, leaving requests blocked by CORS. Broad host access (`http://*/*`, `https://*/*`) is now declared directly in the manifest. For unpacked (locally-loaded) extensions Chrome grants this automatically at load time, so web_fetch works immediately after reload — no button, no service-worker-restart timing issue.

### Changed
- The "Web access" settings section is now a status indicator (the permission is granted via the manifest) instead of a grant/revoke button.

---

## [0.7.8] - 2026-06-05

### Fixed
- **Skill edit button appeared to do nothing**: the create/edit form renders near the top of the Skill page, so on a long, scrolled list it opened off-screen. The form now scrolls into view when opened and shows an "Edit · /skill-name" header so it's clear which skill is being edited.

---

## [0.7.7] - 2026-06-05

### Fixed
- **First character of every response was dropped (definitive fix)**: confirmed via raw SSE capture that DeepSeek emits the initial character(s) inside a stream-opening snapshot object `{"v":{"response":{"fragments":[{content:"C"}]}}}`, then APPENDs the rest. The parser ignored this snapshot because `v` was an object, not a string — so "Ciao" became "iao". `extractResponseTextFromParsed` now extracts the initial text from `response.fragments` (excluding thinking fragments).

---

## [0.7.6] - 2026-06-05

### Added
- **Web access setting**: new "Web access" section in Settings with a one-click "Enable access to all sites" button. Grants the optional host permission (`http://*/*`, `https://*/*`) needed for `web_fetch` / `web_search` to read pages outside DeepSeek. Without it, the browser blocks fetches with a CORS error.

### Fixed
- `web_fetch` permission errors are now non-retryable and return a clear, actionable message (telling the user to enable web access) instead of causing the model to loop on failed retries.

---

## [0.7.5] - 2026-06-05

### Fixed
- **First character(s) of streaming responses dropped**: `extractResponseTextFromParsed` now accepts any SSE patch operation (APPEND, SET, etc.) on response text paths, not just APPEND — DeepSeek uses SET to initialise the first character before switching to APPEND for subsequent deltas. Also added handling for `response/fragments/N` (specific fragment index) patches with object values.

---

## [0.7.4] - 2026-06-05

### Fixed
- **First characters of AI responses were dropped**: background now broadcasts the full accumulated text on each streaming chunk (instead of only the delta), and the frontend replaces the last message instead of appending — eliminates any race condition or accumulation bug that could cause the beginning of a response to be silently lost

---

## [0.7.3] - 2026-06-05

### Fixed
- **Conversation memory lost between messages**: Chrome MV3 service workers are killed after ~30 seconds of inactivity and restart with cleared state. `chatSessionId` and `chatParentMessageId` are now persisted to `chrome.storage.local` and restored on every message, so conversation context survives service worker restarts
- Session state is saved immediately after creating a new session and after each successful response turn
- Session state is cleared from storage on auth/session errors and when starting a new session manually

---

## [0.7.2] - 2026-06-05

### Changed
- Improved login screen in sidebar chat: 3-step guide, "Open DeepSeek" button, spinner while waiting for credentials, retry button

---

## [0.7.1] - 2026-06-05

### Fixed
- Auto-update now copies built files to the Chrome load folder if different from `dist\chrome-mv3`
- Added "Chrome load folder" setting to configure where Chrome loads the unpacked extension from

---

## [0.7.0] - 2026-06-05

### Changed
- **New icon**: replaced the horizontal DeepSeek text logo with the official DeepSeek circular icon (from Wikimedia Commons)
- Icon applied consistently across: browser toolbar, sidepanel header, Settings About section, onboarding modal, all Chrome icon sizes (16, 32, 48, 96, 128 px)

---

## [0.6.9] - 2026-06-05

### Added
- **Auto-update via Shell MCP** in Settings → Updates:
  - Configure the local repo path once (e.g. `C:\Users\...\deepseek-pp`)
  - When a new version is available, click "⚡ Aggiorna automaticamente"
  - Runs `git pull origin main` + `npm run build:chrome` via Shell MCP
  - Calls `chrome.runtime.reload()` — no Chrome restart needed
  - Requires Shell MCP active (configure in the MCP page)
  - Live progress: pulling → building → reloading

---

## [0.6.7] - 2026-06-05

### Fixed
- **Sidebar chat: conversation memory not maintained across messages** — two root causes:
  1. `chatParentMessageId` was overwritten with `null` when the stream did not return a `responseMessageId`, breaking the DeepSeek conversation thread; it is now only updated when a valid ID is received
  2. The full system prompt (memories, preset, skill instructions) was injected with every message, causing DeepSeek to treat each turn as a fresh context; system context is now only injected on the first turn of a session — subsequent turns send only the user message and tool schemas

---

## [0.6.6] - 2026-06-05

### Fixed
- **Sidebar chat: last few characters missing from responses** — two root causes fixed:
  1. `TextDecoder` was not flushed after the stream loop: multi-byte UTF-8 characters (e.g. Italian `è`, `à`, `ù`) split across chunk boundaries could lose their final bytes
  2. ChatPage discarded the complete text carried by the `done: true` message; it now uses it to sync the final message, restoring any characters dropped during streaming

---

## [0.6.5] - 2026-06-05

### Added
- **Orange badge dot** on the Settings tab icon (⚙) when an update is available — always visible, not dismissible

### Changed
- Update check on sidepanel open now **bypasses the 1-hour cache** (calls GitHub API directly every time) so the notification appears immediately when a new version is published

---

## [0.6.4] - 2026-06-05

### Added
- **Check for updates** section in Settings (before Language)
  - Shows installed version and latest available version
  - "Check for updates" button forces an immediate check (bypasses 1-hour cache)
  - Shows ✓ Up to date or ↓ Available vX.X.X with download button
  - Shows last checked time

### Fixed
- Automatic update banner (yellow bar) now only appears when a newer version exists on GitHub

---

## [0.6.3] - 2026-06-05

### Added
- **Skills in sidebar chat**: type `/skillname args` in the sidebar chat to activate a skill
- Skill autocomplete dropdown appears when typing `/` — ↑↓ to navigate, Tab/Enter to select, Esc to cancel
- Active skill badge shows below the chat input with skill name and description
- Warning shown if `/unknown-skill` is typed but not found
- Memory injection respected: skills with `memoryEnabled: true` also inject relevant memories
- Skill instructions stack with the active preset (skill takes precedence)

---

## [0.6.2] - 2026-06-05

### Fixed
- `TypeError: Cannot read properties of undefined (reading 'local')` on chat.deepseek.com — `chrome.storage` is not available in the main-world content script context; added guards to `getChatEnabled()`, `setChatEnabled()` and `saveClientHeadersToStorage()` to silently skip when called from the main world

---

## [0.6.1] - 2026-06-05

### Added
- Full **Italian and English UI** — all Chinese text removed from the interface
- **Language selector**: onboarding modal on first run + permanent selector in Settings
- **Auto-update system**: extension checks GitHub releases on open and shows a yellow banner when a newer version is available; one click downloads the zip
- **GitHub Actions**: automatic build and release on every push to `main`
- Pet mascot lines translated to **IT + EN**; language follows the selected UI language
- Fork and translation credits added to the About section

### Changed
- Sidebar tabs now show **icons only** — no overlapping text at any width
- **Tooltip on hover** (CSS speech bubble) shows the tab name
- **Chat tab enabled by default** — no longer requires manual activation in Settings
- AI system prompts translated to English for better LLM performance
- CI workflow simplified: TypeScript check + Chrome build (removed Go/actionlint dependency)

---

## [0.6.0] - 2024-11-xx

### Added
- **Sidebar chat** — new Chat tab (enable in Settings); send messages, create sessions, view streaming replies
- **Right-click to send** — select text on any page and send it to the sidebar chat
- **Context menu scenarios** — configure prompt templates; selected text is injected automatically
- GitHub Skill import: preview and import Skills from repos, directories or `SKILL.md` files
- `web_fetch` per-site permission management and bulk "authorise all" option

### Changed
- Skill management: edit, enable, disable and delete custom Skills
- Fixed tool output assigned to wrong reply node during multi-step execution

---

## [0.5.1] - 2024-10-xx

### Added
- Built-in **web search** (`web_search`) via Bing — no API key required
- Built-in **web fetch** (`web_fetch`) — retrieves visible text from any URL
- New **Tools page** in the sidebar: toggle tools, grant site permissions, run search diagnostics
- Agentic continuation: web tool results feed back into the same session

### Changed
- Search falls back to alternative sources when no parseable results are returned
- Fixed duplicate body rendering after tool continuation

---

## [0.5.0] - 2024-09-xx

### Added
- Sidebar pages lazy-loaded for faster initial open

### Changed
- Automation: more reliable session links and history snapshots after task runs
- Tool continuation: consistent execution rhythm for automation and manual agent tasks
- Internal prompts hidden from session history

---

## [0.4.4] - 2024-08-xx

### Added
- `deepseek-pp-shell-host` npm installer — `npx deepseek-pp-shell-host install ...`
- Shell Host installs to user directory, no longer depends on plugin source folder
- Sidebar MCP page auto-fills the current extension ID

---

## [0.4.3] - 2024-07-xx

### Added
- Pet mascot **speech bubbles** — short lines cycle during thinking, working and idle states
- Standard issue form and template enforcement

### Changed
- Updated local verification calculation to reduce interruptions during long tasks
- Multi-step continuation now includes automatic pauses between requests

---

## [0.4.2] - 2024-06-xx

### Added
- Chrome Web Store listing copy, privacy policy, submission workflow and screenshot assets
- Session history and local cache hide internal prompts and raw tool call markers

---

## [0.4.1] - 2024-05-xx

### Added
- **Floating mascot** — DeepSeek whale follows AI states: thinking, working, success, error
- Pet settings: position (bottom-left / bottom-right), drag to custom position, size, opacity, floating animation

---

## [0.4.0] - 2024-04-xx

### Added
- OfficeCLI built-in Skills and style library
- Shell MCP preset and install script
- **Agentic continuous execution** — model continues based on tool results (like Claude Code / Codex)
- Step folding: completed steps collapse automatically
- Real-time `tok/s` speed indicator
- Automation: cron/RRULE scheduling, pause/resume, independent DeepSeek sessions

---

## [0.3.0] - 2024-03-xx

### Added
- **Chrome, Edge and Firefox** multi-browser build and packaging
- Stable tab navigation component with icons and semantic current-page marker

### Changed
- DeepSeek page theme now syncs to the sidebar (dark/light)
- All UI components (memory, MCP, settings, skill popup) adapted to dark/light theme

---

## [0.2.0] - 2024-02-xx

### Added
- **MCP tool system**: server configuration, tool discovery, health check, call history, size limits, timeouts
- **Automation tasks**: sidebar automation page, task editor, cron/RRULE scheduling, run history
- Memory update/delete tools; improved relevant memory filtering
- Skill `/` autocomplete panel; built-in and custom skill management
- System prompt presets; DeepSeek Expert mode toggle
- **WebDAV sync** for memories, Skills and presets
- Custom background image for the DeepSeek page (URL or upload, opacity control)
