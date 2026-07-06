# CLAUDE.md — DeepSeek++ (`deepseek-plus-plus`)

Guidance for AI assistants (and humans) working in this repository. Prefer this file
and the actual `core/*` / `entrypoints/*` code over the archived analysis docs under
`docs/archives/**`, which are auto-generated, partly Chinese-origin, and partly stale.

## What this project is

DeepSeek++ is a **WXT / Chrome MV3 browser extension** (Chrome, Edge, Firefox) that turns
the DeepSeek web UI at `chat.deepseek.com` into an agentic workstation. **It has no backend
and no model API of its own.** Everything is achieved by intercepting the page's own network
traffic to the DeepSeek API, injecting context into the outgoing prompt, and parsing/executing
XML "tool calls" the model emits.

It adds: long-term memory, a Skills system (`/skill`), system-prompt presets, built-in web
search/fetch, an MCP tool client, agentic multi-step execution, cron/RRULE automation, a
floating whale mascot, and optional WebDAV sync. This checkout is a **localized fork (IT/EN)**;
npm package `deepseek-plus-plus`, currently `v0.7.26`.

## Architecture — three runtime layers

The single most important mental model. Data flows: **page fetch → main-world hook → content
script → background worker**, and back.

1. **Main-world script** — `entrypoints/main-world.content.ts` (`world: 'MAIN'`, `document_start`).
   Runs in **page context with NO `chrome.*` APIs**. Monkey-patches `window.fetch`, `XHR`, and
   `IndexedDB` (`installFetchHook` in `core/interceptor/fetch-hook.ts`). This is where prompts are
   rewritten and the SSE response stream is filtered to strip tool XML. Detects tool calls and
   asks the isolated world to execute them via a `window.postMessage` request/response bridge
   (`executeToolCallViaContent`, 120s timeout). Runs the agentic inline-agent loop
   (`core/inline-agent/loop.ts`) entirely here.

2. **Content script (isolated world)** — `entrypoints/content.ts` (~3500 lines, `document_start`).
   Has `chrome.*` APIs. Bridges main-world ↔ background. Executes tool calls (delegating to
   background), renders the collapsible **"Tools executed (N)"** block into the DeepSeek DOM,
   restores tool/agent history after refresh, drives the pet mascot + `tok/s` badge + theme sync,
   and runs the **DOM scrubber** that removes any raw tool XML the stream filter missed. Pushes
   runtime state to the main world via a `SYNC_STATE` postMessage.

3. **Background service worker** — `entrypoints/background.ts`. Central
   `chrome.runtime.onMessage` router. Owns all persistence (Dexie memory store + `chrome.storage`
   config), the **real tool executor** (`executeRuntimeToolCall`), the automation alarm scheduler,
   context menus, GitHub skill import, update checker, and WebDAV sync. Also hosts a **second,
   independent completion path**: the sidebar Chat tab and automations talk to DeepSeek directly
   via `core/deepseek/adapter.ts` (NOT via the page DOM), each with its own tool loop.

> ⚠️ There are **two completion code paths** and they are easy to confuse:
> (a) user typing in the DeepSeek page → main-world fetch hook + inline-agent loop;
> (b) sidebar Chat tab **and** automations → background worker via `core/deepseek/adapter`.
> Behavioral changes to prompts/tools often must be made in **both**.

## Tool-call & memory pipeline (the core loop)

Tool calls are **not** a real function-calling API — they are XML tags the model is *prompted*
to emit: `<tool_name>{json}</tool_name>` (e.g. `<memory_save>{...}</memory_save>`,
`<web_search>{"query":"...","topK":5}</web_search>`). A legacy `｜DSML｜invoke` format is also parsed.

1. **INJECT** (outgoing, main world): `hookFetch` intercepts `POST /api/v0/chat/completion`,
   waits for initial state, then `modifyRequestBody` → `buildPromptAugmentation`
   (`core/prompt/augmentation.ts`). This selects memories (`selectMemories`: keyword + pin-weight
   + access-decay under a token budget), renders every **enabled** `ToolDescriptor` as an XML +
   JSON-schema spec, fills `SYSTEM_TEMPLATE_CHAT`/`_THINKING` (`core/constants.ts`), prepends the
   active preset (re-injected every `PRESET_REINJECTION_INTERVAL` = 10 messages), wraps the real
   user text in `<!-- deepseek-pp-visible-user-prompt:start/end -->` markers, and appends a
   tool-format reminder.
2. **STREAM-FILTER** (incoming, main world): `interceptFetchResponse` wraps the SSE stream.
   `XmlToolStreamFilter` (a state machine over `BATCH`/`fragment`/`APPEND` patch events)
   suppresses `<tool>...</tool>` blocks and the injected system text **before** the DeepSeek React
   app renders them. In parallel it accumulates the full assistant text for tool detection.
3. **EXECUTE**: on stream end, `extractToolCalls` (`core/interceptor/tool-parser.ts`, catalog-driven
   regex `createXmlToolCallRegex`) parses the accumulated text → `ToolCall` objects → main-world
   bridge → content.ts → background `executeRuntimeToolCall` (`core/tool/runtime.ts`). Dispatch by
   kind: memory (`core/tool/memory.ts` → Dexie), web (`core/tool/web-search.ts`), or MCP
   (`core/mcp/*`).
4. **HIDE + CONTINUE**: results are rendered as the collapsed "Tools executed" block; the
   `history_messages` and IndexedDB interceptors strip tool XML from DeepSeek's **saved** history
   so it stays clean across reloads. If a web/MCP tool ran, `runInlineAgentLoop` re-submits
   continuation prompts (with results) up to `INLINE_AGENT_MAX_STEPS`, each tagged with the
   `X-DPP-Bypass-Hook` header so its own requests are not re-hooked, until `<task_complete>`.

## Core module map

| Directory | Purpose |
|---|---|
| `core/interceptor/` | The heart. `fetch-hook.ts` (patches fetch/XHR/IndexedDB, prompt injection, SSE filtering), `tool-parser.ts` (extract/strip XML tool calls), `sse-parser.ts` (decode DeepSeek's SSE patch format), `history-cleanup.ts` (strip tool XML from saved history), `token-speed.ts`. |
| `core/prompt/` | `augmentation.ts` (build augmented prompt), `visibility.ts` (visible-user-prompt markers + sanitize injected text out of what the user sees). |
| `core/tool/` | `invocation.ts` (ToolDescriptor catalog + XML-tag regex builder, WeakMap-cached), `runtime.ts` (executor dispatcher), `memory.ts`, `web-search.ts`, `web-settings.ts`, `types.ts`. |
| `core/memory/` | `store.ts` (Dexie/IndexedDB), `selector.ts` (scoring under token budget), `injector.ts`. Four types: `user` / `feedback` / `topic` / `reference`. |
| `core/mcp/` | MCP client: `store.ts`, `discovery.ts`, `client.ts` (JSON-RPC), `transports/` (http, sse, bridge, native messaging). |
| `core/inline-agent/` | Agentic loop in the MAIN world: `loop.ts`, `prompt.ts`, `renderer.ts`. |
| `core/automation/` | `scheduler.ts` (chrome.alarms), `schedule.ts` (manual/cron/RRULE, 15-min min), `runner.ts` (runs a task in a dedicated DeepSeek session via the adapter), `store.ts`, `pow.ts`. |
| `core/deepseek/` | `adapter.ts` (direct DeepSeek API client for sidebar-chat/automation paths), `pow.ts` (solves proof-of-work locally via bundled WASM). |
| `core/skill/` | `registry.ts`, `parser.ts` (`/skillname args`), `github-importer.ts`, `builtin.ts`, `officecli-library.ts`. |
| `core/shell/` | Shell MCP native-host contracts (`shell_exec`/`shell_status`, OfficeCLI). |
| `entrypoints/sidepanel/` | React 19 + Tailwind side panel. `App.tsx` tab shell (chat/memory/skill/preset/automation/mcp/tools/settings), lazy-loaded; talks to background only via `chrome.runtime` messages. |

## Build & verify

```bash
npm install
npm run compile        # tsc --noEmit — the ONLY type-check gate (no unit-test runner)
npm run build:chrome   # → dist/chrome-mv3/   (also build:edge / build:firefox / build:all)
npm run dev            # WXT dev server
npm run zip:all        # package distributables
npm run ci:quality     # full gate (actionlint + audit + prompt:freeze + compile + smokes + builds)
```

Load unpacked from `dist/chrome-mv3/` (Chrome/Edge) or `dist/firefox-mv3/manifest.json`
(Firefox, temporary add-on). Node smoke scripts under `scripts/` back the `verify:*`/`smoke:*`
targets.

### Smoke-script notes (Windows path bug — FIXED)

Four scripts used to compute their repo root as `resolve(new URL('..', import.meta.url).pathname)`,
broken on Windows (`pathname` starts with `/C:/…` → `resolve` yields `C:\C:\…`, so every file read
as "missing"). Now fixed to `resolve(fileURLToPath(new URL('..', import.meta.url)))` in
`automation-contract-smoke.mjs`, `manifest-policy-check.mjs`, `package-sources.mjs`,
`release-assets-check.mjs` (matching `prompt-freeze.mjs` / `shell-smoke.mjs`).

`prompt:freeze` was re-baselined for this fork's EN/IT prompt sources. `automation-contract-smoke`
had a stale assertion for the removed Chinese tab label (`label: '自动化'`), now replaced with the
localization-agnostic `key: 'automation'`.

Still not green out of the box: `verify:manifest-policy` and `verify:release-assets` require
`npm run build:all` / `zip:all` first. **`verify:manifest-policy` additionally encodes the upstream
least-privilege policy (optional host permissions), which this fork intentionally diverged from** —
`wxt.config.ts` declares broad `http://*/*` + `https://*/*` directly on purpose. Reconciling that
guard with the fork's design is a deliberate decision, left open.

## Critical gotchas

- **Undocumented moving target.** The whole product mirrors DeepSeek's private request body,
  SSE patch format (`o:'BATCH'`, `response/fragments`, `APPEND` paths), and PoW scheme. If
  DeepSeek changes any of these, tool hiding/execution breaks. Much of `fetch-hook.ts` /
  `sse-parser.ts` is defensive parsing of that format (note the several `Format 1/2/3/4` branches).
- **MAIN world has no `chrome.*`.** All storage/tool execution round-trips MAIN → isolated
  content → background via `postMessage` + `chrome.runtime`. Origin is checked on every message.
- **MV3 service-worker death (~30s idle).** `background.ts` persists chat session id / parent
  message id to `chrome.storage` so threading survives restarts. Never keep session state only in
  module-level variables.
- **Bypass header.** The inline-agent loop re-issues completion requests from the page and MUST
  send `X-DPP-Bypass-Hook` (`BYPASS_HOOK_HEADER`), or the fetch hook recursively re-injects/re-filters
  its own requests.
- **Three places hide injected content.** Anything injected that must stay invisible has to be
  covered by (1) the SSE stream filter, (2) the visible-user-prompt markers (`core/prompt/visibility.ts`),
  and (3) the IndexedDB + `history_messages` interceptors — or it leaks into the UI or saved history.
- **Broad `host_permissions`.** `wxt.config.ts` declares `http://*/*` + `https://*/*` directly
  (not optional) on purpose, so `web_fetch`/`web_search` work for an unpacked extension without the
  runtime-grant + SW-restart dance.
- **`core/browser/safe-wxt-browser.ts`** is aliased over `wxt/browser` in vite; it Proxies the
  browser object to swallow "Extension context invalidated" errors on reload.

## Known issue: tool-call XML sometimes leaks into the visible answer

Symptom: a raw `<memory_save>{...}</memory_save>` or `<web_search>{...}</web_search>` block
appears verbatim in the answer, *sometimes*. Two distinct families (both real, verified against
the code):

1. **Persisted + reload (primary for `memory_save`).** The stream filter only rewrites the
   *delivered* response; the raw tag is always **stored server-side**. On reload,
   `stripToolCallsFromHistory` → `stripMessageToolCalls` (`core/interceptor/history-cleanup.ts:55-87`)
   strips each fragment **in isolation**, and the removal regex (`core/tool/invocation.ts:82`)
   needs the open **and** close tag in the *same* string. When the block straddles a persisted
   fragment boundary, no fragment holds a complete pair → nothing is stripped → the renderer
   reassembles the intact block. Intermittent because the fragment split is nondeterministic.
   **Fix:** in `stripMessageToolCalls`, join all fragment `content`/`text`, run `stripToolCalls`
   once on the join, then redistribute — mirroring the join-then-split already in
   `sanitizeStoredMessageInternalPrompt`. Also read/write both `frag.content` **and** `frag.text`.
2. **Unrecognized / mis-channeled tag (explains `web_search` leaked *and* not executed).** The
   filter and executor recognize only exact catalog tag names via `extractToolCalls(fullText)`,
   where `fullText` is built from **response** text only (not the reasoning/thinking channel). If
   the tag lands in a channel/format the hook doesn't capture, it is neither suppressed nor
   executed and DeepSeek renders it raw. The prompt already warns "never put tool XML in a
   thinking section" precisely because of this.

> ⚠️ **Two independent rendering surfaces.** The raw tag can appear on the **DeepSeek page**
> (main-world hook + `content.ts` DOM scrubber) OR in the **DeepSeek++ sidebar chat**
> (`background.ts` `runSidepanelToolLoop` → `ChatMessage.tsx`, which renders `message.text`
> verbatim via ReactMarkdown). These are separate code paths — a fix on one does **not** cover the
> other. The user-reported `web_search`/`memory_save` leaks were on the **sidebar**.

**Status — fixed:**
- **Sidebar chat** (the reported surface): `runSidepanelToolLoop` now strips tool XML at the source
  via `stripToolCallsForSidebar` (built-in ∪ enabled descriptors) before every `broadcastChatChunk`,
  so a `<web_search>`/`<memory_save>` block the model emits — even one not in the enabled set (hence
  not executed) — is hidden, and a not-yet-closed tag does not flash mid-stream
  (`entrypoints/background.ts`). Execution still uses only the enabled descriptors.
- **Page** history cleanup now **joins all fragments** before stripping and reads/writes `content`
  **or** `text` (`stripMessageToolCalls` / `sanitizeStoredMessageInternalPrompt`,
  `core/interceptor/history-cleanup.ts`) — removes the reload/persistence case.
- **Page** DOM scrubber now scans the **concatenation** of all text nodes and maps surviving text
  back per node (`stripToolCallTextNodes` + `computeToolCallSpans` / `subtractSpans`,
  `entrypoints/content.ts`) — strips tags split across text nodes, preserving structure.

Remaining defense-in-depth notes (low impact): the page end-of-stream `flush`
(`fetch-hook.ts:856-868`) can still emit a held partial-open at true end-of-stream;
`interceptHistoryResponse` (`fetch-hook.ts:1140`) is gated on a `json` content-type; and sidebar
*execution* of a tool the user disabled is intentionally not forced — only its display is hidden.
