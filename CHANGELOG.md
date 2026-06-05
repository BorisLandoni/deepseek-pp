# Changelog

All notable changes to this project are documented here.

Format: `## [version] - YYYY-MM-DD`

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
