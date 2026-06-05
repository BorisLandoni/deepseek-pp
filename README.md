<p align="center">
  <img src="assets/readme-header.png" width="860" alt="DeepSeek++">
</p>

<h1 align="center">DeepSeek++</h1>

<p align="center">
  <strong>Extends the DeepSeek web interface into a full AI Agent workstation with memory, tools, MCP, Skills and automation</strong>
</p>

<p align="center">
  <a href="https://github.com/BorisLandoni/deepseek-pp/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/BorisLandoni/deepseek-pp?style=flat-square"></a>
  <a href="https://github.com/BorisLandoni/deepseek-pp/releases"><img alt="Release" src="https://img.shields.io/github/v/release/BorisLandoni/deepseek-pp?style=flat-square&label=release"></a>
  <a href="#license"><img alt="License" src="https://img.shields.io/badge/license-MIT-2563eb?style=flat-square"></a>
  <a href="https://chat.deepseek.com"><img alt="DeepSeek" src="https://img.shields.io/badge/DeepSeek-web-4f46e5?style=flat-square"></a>
</p>

<p align="center">
  🇬🇧 English &nbsp;·&nbsp;
  <a href="README_IT.md">🇮🇹 Italiano</a> &nbsp;·&nbsp;
  <a href="#features">Features</a> &nbsp;·&nbsp;
  <a href="#installation">Installation</a> &nbsp;·&nbsp;
  <a href="#credits">Credits</a>
</p>

> **Fork** of [zhu1090093659/deepseek-pp](https://github.com/zhu1090093659/deepseek-pp) — IT/EN translation by Boris Landoni & AI.

DeepSeek++ is a Chrome / Edge / Firefox browser extension for [DeepSeek](https://chat.deepseek.com). It adds a sidebar, native-style tool calls, built-in web tools, an MCP tool system, long-term memory, Skills, system prompt presets, agentic continuous execution and scheduled automation.

---

## Features

| Need | DeepSeek++ provides |
|------|---------------------|
| DeepSeek Chrome extension | Sidebar chat, right-click text sending, tool execution display, multi-browser support |
| DeepSeek MCP tools | Manage MCP servers, tool permissions and execution status from the sidebar; results feed back into the same session |
| DeepSeek memory | Auto-save, filter and inject long-term memory so preferences and project context persist across sessions |
| DeepSeek Skills / `/skill` workflows | Switch expert modes and task templates via built-in, custom or GitHub-imported Skills |
| DeepSeek automation | Schedule tasks to run in their own DeepSeek session — on-demand, cron or RRULE |
| Web search / fetch | Search the internet or fetch page text when real-time information is needed |

---

## Core features

### Sidebar chat
- **Optional entry point** — enable in Settings to show a Chat tab in the sidebar
- **Right-click to send** — select text on any page, right-click and send it to the sidebar
- **Context menu scenarios** — configure prompt templates; selected text is injected automatically
- **New sessions** — create a fresh session from the sidebar at any time
- **Streaming display** — responses stream live in the sidebar

### Native-style tool calls
- **Auto-detect and execute** — the extension detects and runs tool calls without user interaction
- **Clean output** — raw tool call syntax is hidden; only the result is shown
- **Native look** — results render as collapsible blocks (e.g. "Tools executed (2)")
- **Multi-tool chains** — multiple tool calls per reply (e.g. save several memories at once)
- **Restore on refresh** — tool execution history survives page refreshes
- **Speed indicator** — real-time `tok/s` shown next to the input box

<p align="center">
  <img src="assets/screenshot-inline-tools.svg" width="720" alt="Tool execution and speed display">
</p>

### Built-in web tools
- **Web search** — `web_search` lets the model search Bing for real-time information
- **Web fetch** — `web_fetch` retrieves the visible text of any URL for summarisation or analysis
- **Auto continuation** — results feed back into the same session and the model continues
- **Tool toggles** — enable or disable individual tools from the sidebar Tools page
- **Permission management** — grant per-site access for `web_fetch` directly from the sidebar
- **Diagnostics** — built-in search diagnostic to verify network and permission status

### Agentic continuous execution
- **Multi-step tasks** — like Claude Code / Codex, the model decides the next step based on tool results
- **Step folding** — completed steps fold automatically so long tasks stay readable
- **Pacing** — automatic pauses between requests reduce platform throttling
- **Restore on refresh** — the execution trace and final state survive page refreshes
- **Manual stop** — stop a running task at any time

<p align="center">
  <img src="assets/screenshot-inline-tools.svg" width="720" alt="Agentic execution">
</p>

### Floating mascot 🐳
- **State sync** — the DeepSeek whale follows AI states: thinking, working, speaking, success, error, idle
- **Speech bubbles** — short lines appear and cycle during long thinking or working phases
- **Repositionable** — pin to bottom-left or bottom-right, or drag to a custom position
- **Customisable** — adjust size, opacity and floating animation in Settings
- **Persistent** — position and appearance settings are saved locally

<p align="center">
  <img src="public/pet/deepseek-whale-pet-states.png" width="420" alt="DeepSeek whale mascot states">
</p>

### MCP tool system
- **Flexible connections** — add remote or local MCP servers (HTTP, SSE, Stdio Bridge, Native Messaging)
- **Auto-execution by default** — new servers run automatically; switch to manual per-server or per-tool
- **Permission management** — authorise, test, refresh tools and view status from the sidebar
- **Result feed-back** — tool results return to the same session for continued generation
- **Agentic support** — MCP results drive multi-step execution for long tasks

<p align="center">
  <img src="assets/screenshot-sidepanel-mcp.svg" width="300" alt="MCP sidebar">
</p>

### OfficeCLI document tools
- **Built-in `/officecli` skill** — inspect, locate issues, validate and make controlled edits to `.docx`, `.xlsx`, `.pptx`
- **Official Skill library** — DOCX, XLSX, PPTX, Pitch Deck, Academic Paper, Financial Model, Dashboard, Morph PPT
- **Official style library** — PPT style index and descriptions, chainable with `/officecli-pptx /officecli-styles ...`
- **Via Shell MCP** — the model calls the local OfficeCLI binary through `shell_exec`
- **Auto-install** — `deepseek-pp-shell-host` installs the correct single binary for your OS and CPU

Install Shell Native Host:
```bash
npx deepseek-pp-shell-host install --browser chrome --extension-id <EXTENSION_ID>
```
The sidebar MCP page auto-fills your current extension ID. After installation restart the browser, then click **Shell** in the MCP page to create the preset, then test and refresh tools.

### Memory system
- **Auto-memory** — key information is saved automatically during conversation
- **Smart injection** — relevant memories are selected by keyword match, pin weight and access frequency
- **Four types** — `user` (identity/preferences), `feedback` (behaviour corrections), `topic` (discussion context), `reference` (external resources)
- **Sidebar management** — view, edit, pin, delete, filter by type and manage tags
- **Import / export** — bulk backup and restore as JSON

<p align="center">
  <img src="assets/screenshot-sidepanel-memory.png" width="300" alt="Memory sidebar">
</p>

### Skill system
- **Built-in skills** — ready-to-use general and OfficeCLI skills out of the box
- **Custom skills** — create skills with your own system instructions directly in the sidebar
- **GitHub import** — preview and import Skills from a GitHub repo, directory or single `SKILL.md` file
- **Source tracking** — repository, version, licence, sync time and upstream update check
- **Enable/disable** — custom and imported Skills can be toggled individually
- **`/` trigger** — type `/` in the chat box for autocomplete, then the system prompt is injected automatically
- **Memory integration** — optionally inject memory context alongside the skill

<p align="center">
  <img src="assets/screenshot-skill-popup.png" width="600" alt="Skill autocomplete popup">
</p>

### System prompt presets
- **Multiple presets** — create several system prompt presets for different roles or task types
- **One active at a time** — activate one preset; it is injected before the first message of each new conversation
- **Works alongside Skills** — preset content stacks with Skill instructions and memory context

### Automation
- **Manual or scheduled** — create tasks in the Automation page; run immediately or set a cron/RRULE schedule
- **Dedicated sessions** — each task gets its own DeepSeek session, reused on subsequent runs
- **Flexible scheduling** — manual, cron (e.g. `0 9 * * *`) and RRULE (e.g. `FREQ=HOURLY;INTERVAL=1`), minimum interval 15 minutes
- **Full task control** — pause, edit, delete tasks and open their session directly from the task card
- **Status tracking** — next run, last run, recent status and error messages displayed on each card
- **Full pipeline** — automation triggers also pass through presets, memory, MCP tools and agentic execution

<p align="center">
  <img src="assets/screenshot-sidepanel-automation.svg" width="300" alt="Automation sidebar">
</p>

### Cloud sync (optional)
- **WebDAV sync** — back up and sync memories, Skills and presets to any WebDAV server (Nextcloud, ownCloud, etc.)
- **Useful for** — sharing your configuration between multiple computers
- **Not required** — if you use a single machine, you can ignore this section entirely

---

## Auto-update

When a new version is released on GitHub, the extension shows a yellow banner at the top of the sidebar. Click **Download & update** to get the new zip, then reload the extension in `chrome://extensions`.

---

## Installation

### From the GitHub release (recommended)

1. Download `deepseek-plus-plus-X.X.X-chrome.zip` from [Releases](https://github.com/BorisLandoni/deepseek-pp/releases/latest)
2. Extract to a folder
3. Open Chrome → `chrome://extensions` → enable **Developer mode**
4. Click **Load unpacked** → select the extracted folder

### Build from source

```bash
git clone https://github.com/BorisLandoni/deepseek-pp.git
cd deepseek-pp
npm install
npm run build:chrome
```

| Browser | Load page | Build directory |
|---------|-----------|-----------------|
| Chrome | `chrome://extensions/` → Load unpacked | `dist/chrome-mv3/` |
| Edge | `edge://extensions/` → Load unpacked | `dist/edge-mv3/` |
| Firefox | `about:debugging#/runtime/this-firefox` → Load temporary add-on | `dist/firefox-mv3/manifest.json` |

---

## Changelog

<details>
<summary>v0.6.1 — IT/EN localisation + auto-update</summary>

| Area | Changes |
|------|---------|
| Localisation | Full Italian and English UI — all Chinese text removed from the interface |
| Language selector | Onboarding modal on first run + permanent selector in Settings |
| Auto-update | Extension checks GitHub releases on open and shows a banner when a newer version is available |
| Pet mascot | Lines translated to IT + EN; language follows the selected UI language |
| AI prompts | System prompts translated to English for better LLM performance |
| GitHub Actions | Automatic build and release on every push to `main` |
| About section | Fork credits and translation credits added |

</details>

<details>
<summary>v0.6.0 — Sidebar chat + Skill workflow</summary>

| Area | Changes |
|------|---------|
| Sidebar chat | New Chat tab (enable in Settings) — send messages, create sessions, view streaming replies |
| Context menu | Right-click selected text to send to sidebar; custom scenario templates supported |
| Skill management | Edit, enable, disable and delete custom Skills |
| GitHub import | Preview and import Skills from GitHub repos, directories or `SKILL.md` files |
| web_fetch permissions | Per-site authorisation and bulk "authorise all" option in the Tools page |
| Tool result display | Fixed tool output assigned to wrong reply node during multi-step execution |

</details>

<details>
<summary>v0.5.1 — Built-in web tools</summary>

| Area | Changes |
|------|---------|
| Web tools | Added `web_search` and `web_fetch` for live search and page text retrieval |
| Agentic continuation | Web tool results feed back into the session for continued generation |
| Tool management | New Tools page: toggle tools, grant site permissions, run search diagnostics |
| Search stability | Falls back to alternative search sources when no parseable results are returned |
| Output display | Fixed duplicate body rendering after tool continuation |

</details>

<details>
<summary>v0.5.0 — Automation and execution stability</summary>

| Area | Changes |
|------|---------|
| Automation | More reliable session links, parent messages and history snapshots after task runs |
| Tool continuation | Consistent execution and result feed-back rhythm for automation and manual agent tasks |
| History display | Internal prompts and raw tool call markers hidden from session history |
| Response feedback | Speed display consistent across streaming and compatible request paths |
| Sidebar performance | Pages lazy-loaded for faster initial open |

</details>

---

## Credits

- **Original project:** [zhu1090093659/deepseek-pp](https://github.com/zhu1090093659/deepseek-pp)
- **This fork:** [BorisLandoni/deepseek-pp](https://github.com/BorisLandoni/deepseek-pp)
- **IT/EN translation:** Boris Landoni & AI

## Related projects

- [OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) — AI-friendly CLI for Office document processing

## License

MIT
