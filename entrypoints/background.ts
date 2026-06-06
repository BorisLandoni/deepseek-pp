import {
  getAllMemories,
  getMemoryById,
  saveMemory,
  updateMemory,
  deleteMemory,
  touchMemories,
  replaceAllMemories,
  archiveStaleMemories,
} from '../core/memory/store';
import {
  deleteGitHubSkillSource,
  getAllSkillSources,
  getAllSkills,
  getSkillLibrary,
  getUserSkills,
  replaceAllCustomSkills,
  replaceAllSkillSources,
  saveSkill,
  setSkillEnabled,
  deleteSkill,
} from '../core/skill/registry';
import {
  checkGitHubSkillSourceUpdates,
  importGitHubSkillSource,
  previewGitHubSkillSource,
  updateGitHubSkillSource,
} from '../core/skill/github-importer';
import {
  getAllPresets,
  savePreset,
  deletePreset,
  getActivePreset,
  setActivePresetId,
  replaceAllPresets,
} from '../core/preset/store';
import { getModelType, setModelType } from '../core/model/store';
import { getDeepSeekTheme, saveDeepSeekTheme } from '../core/theme/store';
import { getBackgroundConfig, saveBackgroundConfig, clearBackgroundConfig } from '../core/background/store';
import { getPetConfig, savePetConfig, clearPetConfig } from '../core/pet/store';
import { getExtensionVersion } from '../core/version';
import { parseSkillCommand } from '../core/skill/parser';
import { maybeCheckForUpdate, checkForUpdate, getStoredUpdateInfo, setStoredUpdateInfo } from '../core/update/checker';
import { getSyncConfig, saveSyncConfig } from '../core/sync/config';
import { webdavTest, webdavMkcol, webdavGet, webdavPut } from '../core/sync/webdav-client';
import { clearToolCallHistory, getToolCallHistory } from '../core/tool/history';
import {
  executeRuntimeToolCall,
  getRuntimeToolDescriptors,
  refreshRuntimeToolDescriptors,
} from '../core/tool/runtime';
import {
  createMcpServer,
  deleteMcpServer,
  getAllMcpServers,
  getMcpToolCache,
  getMcpServerById,
  updateMcpServer,
} from '../core/mcp/store';
import { refreshMcpServerDiscovery } from '../core/mcp/discovery';
import { getMcpOriginPattern, requestMcpServerOriginPermission } from '../core/mcp/transports';
import { SHELL_MCP_NATIVE_HOST, SHELL_MCP_SERVER_NAME, createShellMcpPresetInput } from '../core/shell';
import { getWebToolSettings, setWebToolEnabled } from '../core/tool/web-settings';
import { getAllScenarios, applyScenarioTemplate } from '../core/scenario/store';
import { getChatEnabled } from '../core/chat/store';
import {
  createAutomation,
  deleteAutomation,
  getAllAutomations,
  getAutomationById,
  getAutomationRuns,
  setAutomationStatus,
  updateAutomation,
} from '../core/automation/store';
import { runDeepSeekAutomation } from '../core/automation/runner';
import {
  AUTOMATION_WAKE_ALARM_NAME,
  AUTOMATION_WAKE_INTERVAL_MINUTES,
  refreshAutomationNextRunAt,
  runAutomation,
  scanDueAutomations,
} from '../core/automation/scheduler';
import { validateAutomationSchedule } from '../core/automation/schedule';
import {
  createChatSession,
  createPowHeaders,
  submitPromptStreaming,
  loadClientHeadersFromStorage,
} from '../core/deepseek/adapter';
import { buildPromptAugmentation } from '../core/prompt';
import { extractToolCalls } from '../core/interceptor/tool-parser';
import type { WebSearchToolName } from '../core/tool/web-search';
import type { BackgroundConfig, DeepSeekTheme, GitHubSkillImportRequest, GitHubSkillSource, Memory, ModelType, NewMemory, PetConfig, Skill, SyncConfig, SyncCounts, SystemPromptPreset, ToolCall, ToolDescriptor, ToolExecutionRecord, ToolResult } from '../core/types';
import type { McpServerCreateInput, McpServerUpdateInput } from '../core/mcp/types';
import type { AutomationCreateInput, AutomationRunnerRequest, AutomationRunnerResult, AutomationStatus, AutomationUpdateInput } from '../core/automation/types';

const DEEPSEEK_HOME_URL = 'https://chat.deepseek.com/';
let chatSessionId: string | null = null;
let chatParentMessageId: number | null = null;

// Storage keys for persisting chat session across service worker restarts.
// Chrome MV3 service workers are killed after ~30s of inactivity; without this,
// every message after a pause starts a fresh DeepSeek session, losing conversation context.
const CHAT_SESSION_STORAGE_KEY = 'deepseek_pp_chat_session_id';
const CHAT_PARENT_STORAGE_KEY = 'deepseek_pp_chat_parent_id';

/** Restore chatSessionId / chatParentMessageId from storage after a SW restart. */
async function restoreChatStateFromStorage(): Promise<void> {
  if (chatSessionId !== null) return; // Already in memory — nothing to restore
  try {
    const data = await chrome.storage.local.get([CHAT_SESSION_STORAGE_KEY, CHAT_PARENT_STORAGE_KEY]);
    const sid = data[CHAT_SESSION_STORAGE_KEY];
    const pid = data[CHAT_PARENT_STORAGE_KEY];
    if (typeof sid === 'string' && sid) chatSessionId = sid;
    if (typeof pid === 'number' && pid >= 0) chatParentMessageId = pid;
  } catch {}
}

/** Persist current session state so it survives a service worker restart. */
function persistChatState(): void {
  if (chatSessionId) {
    const toSave: Record<string, unknown> = { [CHAT_SESSION_STORAGE_KEY]: chatSessionId };
    if (chatParentMessageId !== null) toSave[CHAT_PARENT_STORAGE_KEY] = chatParentMessageId;
    chrome.storage.local.set(toSave).catch(() => {});
  } else {
    chrome.storage.local.remove([CHAT_SESSION_STORAGE_KEY, CHAT_PARENT_STORAGE_KEY]).catch(() => {});
  }
}
type SidePanelApi = {
  setPanelBehavior?: (options: { openPanelOnActionClick: boolean }) => Promise<void>;
};

type SyncDataSnapshot = {
  memories: Omit<Memory, 'id'>[];
  skills: Skill[];
  skillSources: GitHubSkillSource[];
  presets: SystemPromptPreset[];
};

export default defineBackground(() => {
  enableSidePanelActionClick();
  registerAutomationAlarmListener();

  archiveStaleMemories().catch((error) => reportBackgroundStartupError('archive_stale_memories_failed', error));
  ensureShellMcpPreset().catch((error) => reportBackgroundStartupError('shell_mcp_preset_failed', error));

  // Check for updates in background (max once per hour, silent on failure)
  maybeCheckForUpdate(getExtensionVersion()).catch(() => {});
  createContextMenus().catch((error) => reportBackgroundStartupError('context_menus_failed', error));
  ensureAutomationWakeAlarm().catch((error) => reportBackgroundStartupError('automation_alarm_create_failed', error));
  scanDueAutomationsFromWake().catch((error) => reportBackgroundStartupError('automation_startup_scan_failed', error));

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender)
      .then(sendResponse)
      .catch((error) => sendResponse(createBackgroundErrorResponse(message, error)));
    return true;
  });

  chrome.storage.onChanged.addListener((changes) => {
    if ('deepseek_pp_chat_enabled' in changes) {
      createContextMenus().catch(() => {});
    }
  });
});

function registerAutomationAlarmListener() {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== AUTOMATION_WAKE_ALARM_NAME) return;
    scanDueAutomationsFromWake().catch((error) => reportBackgroundStartupError('automation_alarm_scan_failed', error));
  });
}

async function ensureAutomationWakeAlarm() {
  await chrome.alarms.create(AUTOMATION_WAKE_ALARM_NAME, {
    periodInMinutes: AUTOMATION_WAKE_INTERVAL_MINUTES,
  });
}

function enableSidePanelActionClick() {
  if (import.meta.env.FIREFOX) return;

  const sidePanel = (chrome as typeof chrome & { sidePanel?: SidePanelApi }).sidePanel;
  sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: true })
    .catch((error) => reportBackgroundStartupError('sidepanel_behavior_failed', error));
}

async function createContextMenus() {
  const chatEnabled = await getChatEnabled();
  if (!chatEnabled) {
    try { await chrome.contextMenus.removeAll(); } catch {}
    return;
  }
  try {
    await chrome.contextMenus.removeAll();
  } catch {}
  const scenarios = await getAllScenarios();
  const enabledScenarios = scenarios.filter((s) => s.enabled);

  chrome.contextMenus.create({
    id: 'send-to-chat',
    title: 'Send to chat',
    contexts: ['selection'],
  });

  if (enabledScenarios.length > 0) {
    chrome.contextMenus.create({
      id: 'separator-1',
      type: 'separator',
      contexts: ['selection'],
    });

    for (const scenario of enabledScenarios) {
      chrome.contextMenus.create({
        id: `scenario-${scenario.id}`,
        title: scenario.label,
        contexts: ['selection'],
      });
    }
  }
}

try {
  chrome.contextMenus.onClicked.addListener(async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    if (!info.selectionText) return;
    const selectedText = info.selectionText.trim();
    if (!selectedText) return;

    // Open sidebar before async boundary to preserve user gesture
    const tabId = tab?.id;
    if (tabId && chrome.sidePanel?.open) {
      chrome.sidePanel.open({ tabId }).catch(() => {});
    }

    const chatEnabled = await getChatEnabled();
    if (!chatEnabled) return;

    if (info.menuItemId === 'send-to-chat') {
      openSidePanelAndSendText(selectedText, tab).catch(() => {});
      return;
    }

    if (typeof info.menuItemId === 'string' && info.menuItemId.startsWith('scenario-')) {
      const scenarioId = info.menuItemId.slice('scenario-'.length);
      getAllScenarios()
        .then((scenarios) => {
          const scenario = scenarios.find((s) => s.id === scenarioId);
          if (!scenario) return;
          const processed = applyScenarioTemplate(scenario.template, selectedText);
          openSidePanelAndSendText(processed, tab);
        })
        .catch(() => {});
      return;
    }
  });
} catch {}

async function openSidePanelAndSendText(text: string, tab?: chrome.tabs.Tab) {
  // Write to storage as fallback: message may be lost if sidepanel is not yet ready
  try {
    await chrome.storage.local.set({ pendingChatText: text });
  } catch {}

  chrome.runtime.sendMessage({ type: 'OPEN_CHAT_WITH_TEXT', text }).catch(() => {});
}

async function ensureShellMcpPreset() {
  const servers = await getAllMcpServers();
  const exists = servers.some((s) =>
    s.displayName === SHELL_MCP_SERVER_NAME || s.transport.nativeHost === SHELL_MCP_NATIVE_HOST
  );
  if (!exists) {
    await createMcpServer(createShellMcpPresetInput({ enabled: false }));
  }
}

function reportBackgroundStartupError(code: string, error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`[DeepSeek++] ${code}: ${detail}`, error);
}

function createBackgroundErrorResponse(
  message: { type?: string } | unknown,
  error: unknown,
): ToolResult | { ok: false; error: string } | null {
  const detail = error instanceof Error ? error.message : String(error);

  if (!message || typeof message !== 'object') {
    return null;
  }

  const type = (message as { type?: string }).type;

  if (type === 'EXECUTE_TOOL_CALL') {
    return {
      ok: false,
      summary: 'Background tool execution failed',
      detail,
      error: {
        code: 'background_tool_execution_failed',
        message: detail,
        retryable: true,
      },
    };
  }

  // Sidepanel sync handlers check result?.ok; content scripts use sendRuntimeMessage
  // which guards against error responses. Return structured error for both.
  return { ok: false, error: detail };
}

async function handleMessage(
  message: { type: string; payload?: unknown },
  sender: chrome.runtime.MessageSender,
) {
  switch (message.type) {
    case 'GET_MEMORIES':
      return getAllMemories();

    case 'GET_MEMORY_BY_ID': {
      const { id: memId } = message.payload as { id: number };
      return getMemoryById(memId) ?? null;
    }

    case 'SAVE_MEMORY': {
      const id = await saveMemory(message.payload as NewMemory);
      await broadcastStateUpdate(sender.tab?.id);
      return { id };
    }

    case 'UPDATE_MEMORY': {
      await updateMemory(message.payload as Memory);
      await broadcastStateUpdate(sender.tab?.id);
      return { ok: true };
    }

    case 'DELETE_MEMORY': {
      const { id } = message.payload as { id: number };
      await deleteMemory(id);
      await broadcastStateUpdate(sender.tab?.id);
      return { ok: true };
    }

    case 'TOUCH_MEMORIES': {
      const { ids } = message.payload as { ids: number[] };
      await touchMemories(ids);
      return { ok: true };
    }

    case 'GET_SKILLS':
      return getAllSkills();

    case 'GET_SKILL_LIBRARY':
      return getSkillLibrary();

    case 'GET_GITHUB_SKILL_SOURCES':
      return getAllSkillSources();

    case 'SAVE_SKILL': {
      const payload = message.payload as Skill | { skill: Skill; previousName?: string };
      const { skill, previousName } = 'skill' in payload ? payload : { skill: payload, previousName: undefined };
      await saveSkill(skill, previousName);
      await broadcastStateUpdate(sender.tab?.id);
      return { ok: true };
    }

    case 'DELETE_SKILL': {
      const { name } = message.payload as { name: string };
      await deleteSkill(name);
      await broadcastStateUpdate(sender.tab?.id);
      return { ok: true };
    }

    case 'SET_SKILL_ENABLED': {
      const { name, enabled } = message.payload as { name: string; enabled: boolean };
      await setSkillEnabled(name, enabled);
      await broadcastStateUpdate(sender.tab?.id);
      return { ok: true };
    }

    case 'PREVIEW_GITHUB_SKILL_SOURCE': {
      const { url } = message.payload as { url: string };
      return previewGitHubSkillSource(url);
    }

    case 'IMPORT_GITHUB_SKILL_SOURCE': {
      const result = await importGitHubSkillSource(message.payload as GitHubSkillImportRequest);
      await broadcastStateUpdate(sender.tab?.id);
      return result;
    }

    case 'CHECK_GITHUB_SKILL_SOURCE_UPDATES': {
      const { sourceId } = message.payload as { sourceId: string };
      return checkGitHubSkillSourceUpdates(sourceId);
    }

    case 'UPDATE_GITHUB_SKILL_SOURCE': {
      const { sourceId } = message.payload as { sourceId: string };
      const result = await updateGitHubSkillSource(sourceId);
      await broadcastStateUpdate(sender.tab?.id);
      return result;
    }

    case 'DELETE_GITHUB_SKILL_SOURCE': {
      const { sourceId } = message.payload as { sourceId: string };
      await deleteGitHubSkillSource(sourceId);
      await broadcastStateUpdate(sender.tab?.id);
      return { ok: true };
    }

    case 'GET_PRESETS':
      return getAllPresets();

    case 'SAVE_PRESET': {
      await savePreset(message.payload as SystemPromptPreset);
      await broadcastStateUpdate(sender.tab?.id);
      return { ok: true };
    }

    case 'DELETE_PRESET': {
      const { id: presetId } = message.payload as { id: string };
      await deletePreset(presetId);
      await broadcastStateUpdate(sender.tab?.id);
      return { ok: true };
    }

    case 'SET_ACTIVE_PRESET': {
      const { id: activeId } = message.payload as { id: string | null };
      await setActivePresetId(activeId);
      await broadcastStateUpdate(sender.tab?.id);
      return { ok: true };
    }

    case 'GET_ACTIVE_PRESET':
      return getActivePreset();

    case 'GET_MCP_SERVERS':
      return getAllMcpServers();

    case 'GET_MCP_SERVER': {
      const { id } = message.payload as { id: string };
      return getMcpServerById(id);
    }

    case 'CREATE_MCP_SERVER': {
      const server = await createMcpServer(message.payload as McpServerCreateInput);
      await broadcastMcpServersUpdate(sender.tab?.id);
      await broadcastToolDescriptorsUpdate(sender.tab?.id);
      return server;
    }

    case 'UPDATE_MCP_SERVER': {
      const { id, patch } = message.payload as { id: string; patch: McpServerUpdateInput };
      const server = await updateMcpServer(id, patch);
      await broadcastMcpServersUpdate(sender.tab?.id);
      await broadcastToolDescriptorsUpdate(sender.tab?.id);
      return server;
    }

    case 'DELETE_MCP_SERVER': {
      const { id } = message.payload as { id: string };
      await deleteMcpServer(id);
      await broadcastMcpServersUpdate(sender.tab?.id);
      await broadcastToolDescriptorsUpdate(sender.tab?.id);
      return { ok: true };
    }

    case 'GET_MCP_TOOL_CACHE': {
      const { serverId } = message.payload as { serverId: string };
      return getMcpToolCache(serverId);
    }

    case 'REFRESH_MCP_SERVER_TOOLS': {
      const { serverId } = message.payload as { serverId: string };
      const cache = await refreshMcpServerDiscovery(serverId);
      await broadcastMcpServersUpdate(sender.tab?.id);
      await broadcastToolDescriptorsUpdate(sender.tab?.id);
      return cache;
    }

    case 'REQUEST_MCP_SERVER_PERMISSION': {
      const { serverId } = message.payload as { serverId: string };
      const server = await getMcpServerById(serverId);
      if (!server) return { ok: false, error: 'mcp_server_not_found' };
      if (server.transport.kind === 'native_messaging') return { ok: true, origin: null };
      try {
        const origin = getMcpOriginPattern(server);
        const ok = await requestMcpServerOriginPermission(server);
        return { ok, origin };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    }

    case 'TEST_MCP_SERVER_CONNECTION': {
      const { serverId } = message.payload as { serverId: string };
      const cache = await refreshMcpServerDiscovery(serverId);
      await broadcastMcpServersUpdate(sender.tab?.id);
      await broadcastToolDescriptorsUpdate(sender.tab?.id);
      return {
        ok: cache.health.status === 'ready',
        cache,
        health: cache.health,
      };
    }

    case 'GET_WEB_TOOL_SETTINGS':
      return getWebToolSettings();

    case 'SET_WEB_TOOL_SETTING': {
      const { name, enabled } = message.payload as { name: WebSearchToolName; enabled: boolean };
      await setWebToolEnabled(name, enabled);
      await broadcastToolDescriptorsUpdate(sender.tab?.id);
      return { ok: true };
    }

    case 'DIAGNOSE_WEB_SEARCH': {
      const q = typeof (message.payload as { query?: string })?.query === 'string'
        ? (message.payload as { query: string }).query : 'test';
      const diags: Record<string, { status: number; length: number; error?: string; preview?: string }> = {};
      for (const domain of ['cn.bing.com', 'www.bing.com']) {
        const url = `https://${domain}/search?q=${encodeURIComponent(q)}`;
        try {
          const resp = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept-Language': 'zh-CN,zh;q=0.9',
            },
            signal: AbortSignal.timeout(10_000),
          });
          const text = await resp.text();
          diags[domain] = {
            status: resp.status,
            length: text.length,
            preview: text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200),
          };
        } catch (e) {
          diags[domain] = {
            status: 0,
            length: 0,
            error: e instanceof Error ? e.message.slice(0, 150) : String(e).slice(0, 150),
          };
        }
      }
      return diags;
    }

    case 'REQUEST_HOST_PERMISSION': {
      const { origins } = message.payload as { origins: string[] };
      if (!origins?.length) return { ok: false, error: 'no_origins' };
      try {
        const granted = await chrome.permissions.request({ origins }).catch(() => false);
        return { ok: granted, origins };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    }

    case 'GET_TOOL_DESCRIPTORS':
      return getRuntimeToolDescriptors();

    case 'REFRESH_TOOL_DESCRIPTORS': {
      const tools = await refreshRuntimeToolDescriptors();
      await broadcastToolDescriptorsUpdate(sender.tab?.id);
      await broadcastMcpServersUpdate(sender.tab?.id);
      return tools;
    }

    case 'EXECUTE_TOOL_CALL': {
      const call = message.payload as ToolCall;
      const result = await executeRuntimeToolCall(call, call.source?.trigger ?? 'manual_chat');
      await broadcastToolCallHistoryUpdate(sender.tab?.id);
      return result;
    }

    case 'GET_TOOL_CALL_HISTORY': {
      const { limit } = (message.payload as { limit?: number } | undefined) ?? {};
      return getToolCallHistory(limit);
    }

    case 'CLEAR_TOOL_CALL_HISTORY': {
      await clearToolCallHistory();
      await broadcastToolCallHistoryUpdate(sender.tab?.id);
      return { ok: true };
    }

    case 'GET_CONFIG':
      return { version: getExtensionVersion() };

    case 'CHECK_FOR_UPDATE':
      return maybeCheckForUpdate(getExtensionVersion());

    case 'FORCE_CHECK_FOR_UPDATE':
      // Bypasses the 1-hour cache — triggered by the manual button in Settings
      return checkForUpdate(getExtensionVersion()).then(async (info) => {
        if (info) await setStoredUpdateInfo(info);
        return info;
      });

    case 'GET_UPDATE_INFO':
      return getStoredUpdateInfo();

    case 'GET_AUTO_UPDATE_PATH': {
      const data = await chrome.storage.local.get('deepseek_pp_auto_update_path');
      return { path: (data.deepseek_pp_auto_update_path as string | undefined) ?? '' };
    }

    case 'SET_AUTO_UPDATE_PATH': {
      const { path } = message.payload as { path: string };
      await chrome.storage.local.set({ deepseek_pp_auto_update_path: path });
      return { ok: true };
    }

    case 'AUTO_UPDATE_VIA_GIT': {
      const { path, installPath } = message.payload as { path: string; installPath?: string };
      if (!path?.trim()) return { ok: false, error: 'no_path' };

      // Check that shell_exec tool is available
      const descriptors = await getRuntimeToolDescriptors();
      const hasShell = descriptors.some((d) => d.name === 'shell_exec' || d.invocationName === 'shell_exec');
      if (!hasShell) return { ok: false, error: 'no_shell' };

      const broadcast = (status: string) =>
        chrome.runtime.sendMessage({ type: 'AUTO_UPDATE_PROGRESS', status }).catch(() => {});

      // The dist output folder (always inside the repo)
      const distPath = `${path}\\dist\\chrome-mv3`;
      // If Chrome loads from a different folder, we copy dist there after building
      const needsCopy = installPath?.trim() && installPath.trim().toLowerCase() !== distPath.toLowerCase();

      try {
        // Step 1: git pull
        broadcast('pulling');
        const pullResult = await executeRuntimeToolCall({
          name: 'shell_exec',
          payload: { command: `git -C "${path}" pull origin main`, timeout_ms: 60000 },
          raw: '',
        }, 'sidepanel_chat');
        if (!pullResult.ok) {
          broadcast('error');
          return { ok: false, error: pullResult.error?.message ?? pullResult.summary };
        }

        // Step 2: npm run build:chrome
        broadcast('building');
        const buildResult = await executeRuntimeToolCall({
          name: 'shell_exec',
          payload: { command: `Set-Location "${path}"; npm run build:chrome`, timeout_ms: 180000 },
          raw: '',
        }, 'sidepanel_chat');
        if (!buildResult.ok) {
          broadcast('error');
          return { ok: false, error: buildResult.error?.message ?? buildResult.summary };
        }

        // Step 3 (optional): copy dist to Chrome's load folder if different
        if (needsCopy) {
          broadcast('copying');
          const copyResult = await executeRuntimeToolCall({
            name: 'shell_exec',
            payload: {
              command: `Copy-Item "${distPath}\\*" "${installPath!.trim()}\\" -Recurse -Force`,
              timeout_ms: 30000,
            },
            raw: '',
          }, 'sidepanel_chat');
          if (!copyResult.ok) {
            broadcast('error');
            return { ok: false, error: copyResult.error?.message ?? copyResult.summary };
          }
        }

        // Step 4: reload extension
        broadcast('reloading');
        setTimeout(() => chrome.runtime.reload(), 800);
        return { ok: true };
      } catch (err) {
        broadcast('error');
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    }

    case 'GET_DEEPSEEK_THEME':
      return getDeepSeekTheme();

    case 'SET_DEEPSEEK_THEME': {
      const { theme } = message.payload as { theme?: DeepSeekTheme };
      if (theme !== 'light' && theme !== 'dark') return { ok: false, error: 'invalid_theme' };
      const current = await getDeepSeekTheme();
      if (current === theme) return { ok: true };
      await saveDeepSeekTheme(theme);
      await broadcastThemeUpdate(theme, sender.tab?.id);
      return { ok: true };
    }

    case 'GET_MODEL_TYPE':
      return getModelType();

    case 'SET_MODEL_TYPE': {
      const newModelType = message.payload as ModelType;
      const current = await getModelType();
      if (newModelType === current) return { ok: true };
      await setModelType(newModelType);
      await broadcastStateUpdate(sender.tab?.id);
      return { ok: true };
    }

    case 'GET_BACKGROUND':
      return getBackgroundConfig();

    case 'SAVE_BACKGROUND': {
      const bgConfig = message.payload as BackgroundConfig;
      await saveBackgroundConfig(bgConfig);
      await broadcastBackgroundUpdate(bgConfig);
      return { ok: true };
    }

    case 'CLEAR_BACKGROUND': {
      await clearBackgroundConfig();
      await broadcastBackgroundUpdate(null);
      return { ok: true };
    }

    case 'GET_PET':
      return getPetConfig();

    case 'SAVE_PET': {
      const petConfig = message.payload as PetConfig;
      await savePetConfig(petConfig);
      await broadcastPetUpdate(petConfig);
      return { ok: true };
    }

    case 'CLEAR_PET': {
      await clearPetConfig();
      await broadcastPetUpdate(await getPetConfig());
      return { ok: true };
    }

    case 'GET_SYNC_CONFIG':
      return getSyncConfig();

    case 'SAVE_SYNC_CONFIG': {
      await saveSyncConfig(message.payload as SyncConfig);
      return { ok: true };
    }

    case 'WEBDAV_TEST': {
      await webdavTest(message.payload as SyncConfig);
      return { ok: true };
    }

    case 'WEBDAV_UPLOAD_LOCAL': {
      const config = await getSyncConfig();
      if (!config) throw new Error('WebDAV not configured');

      const [, snapshot] = await Promise.all([
        webdavMkcol(config),
        getLocalSyncDataSnapshot(),
      ]);

      await uploadSyncDataSnapshot(config, snapshot);

      const now = Date.now();
      await saveSyncConfig({ ...config, lastSyncAt: now });
      return { ok: true, lastSyncAt: now, counts: getSyncCounts(snapshot) };
    }

    case 'WEBDAV_DOWNLOAD_REMOTE': {
      const config = await getSyncConfig();
      if (!config) throw new Error('WebDAV not configured');

      const snapshot = await getRemoteSyncDataSnapshot(config);

      await Promise.all([
        replaceAllMemories(snapshot.memories),
        replaceAllCustomSkills(snapshot.skills),
        replaceAllSkillSources(snapshot.skillSources),
        replaceAllPresets(snapshot.presets),
      ]);

      const now = Date.now();
      await saveSyncConfig({ ...config, lastSyncAt: now });
      await broadcastStateUpdate(sender.tab?.id);
      return { ok: true, lastSyncAt: now, counts: getSyncCounts(snapshot) };
    }

    case 'CHAT_SUBMIT_PROMPT': {
      const { text } = message.payload as { text: string };
      if (!(await getChatEnabled())) {
        return { ok: false, error: 'chat_disabled' };
      }
      if (!text?.trim()) return { ok: false, error: 'empty_prompt' };
      // Fire and forget — the streaming response is broadcast
      handleChatSubmitPrompt(text, sender.tab?.id).catch(() => {});
      return { ok: true };
    }

    case 'CHAT_NEW_SESSION':
      chatSessionId = null;
      chatParentMessageId = null;
      chrome.storage.local.remove([CHAT_SESSION_STORAGE_KEY, CHAT_PARENT_STORAGE_KEY]).catch(() => {});
      return { ok: true };

    case 'GET_AUTH_STATUS': {
      const headers = await loadClientHeadersFromStorage();
      return { ok: true, hasToken: !!headers };
    }

    case 'AUTH_STATUS_CHANGED': {
      const newHeaders = await loadClientHeadersFromStorage();
      broadcastToTabs({ type: 'AUTH_STATUS_CHANGED', hasToken: !!newHeaders }).catch(() => {});
      return { ok: true };
    }

    case 'GET_AUTOMATIONS':
      return getAllAutomations();

    case 'GET_AUTOMATION_RUNS': {
      const { automationId, limit } = message.payload as { automationId: string; limit?: number };
      return getAutomationRuns({ automationId, limit });
    }

    case 'CREATE_AUTOMATION': {
      const input = message.payload as AutomationCreateInput;
      validateAutomationInput(input);
      const automation = await createAutomation(input);
      const refreshed = await refreshAutomationNextRunAt(automation.id);
      await broadcastAutomationUpdate(sender.tab?.id);
      return refreshed ?? automation;
    }

    case 'UPDATE_AUTOMATION': {
      const { id, patch } = message.payload as { id: string; patch: AutomationUpdateInput };
      validateAutomationPatch(patch);
      const automation = await updateAutomation(id, patch);
      if (!automation) return { ok: false, error: 'automation_not_found' };
      const refreshed = await refreshAutomationNextRunAt(id);
      await broadcastAutomationUpdate(sender.tab?.id);
      return refreshed ?? automation;
    }

    case 'SET_AUTOMATION_STATUS': {
      const { id, status } = message.payload as { id: string; status: AutomationStatus };
      if (!isAutomationStatus(status)) return { ok: false, error: 'invalid_automation_status' };
      const automation = await setAutomationStatus(id, status);
      if (!automation) return { ok: false, error: 'automation_not_found' };
      const refreshed = await refreshAutomationNextRunAt(id);
      await broadcastAutomationUpdate(sender.tab?.id);
      return refreshed ?? automation;
    }

    case 'DELETE_AUTOMATION': {
      const { id } = message.payload as { id: string };
      await deleteAutomation(id);
      await broadcastAutomationUpdate(sender.tab?.id);
      await broadcastAutomationRunsUpdate(sender.tab?.id);
      return { ok: true };
    }

    case 'RUN_AUTOMATION_NOW': {
      const { id } = message.payload as { id: string };
      return runAutomationNow(id, sender.tab?.id);
    }

    case 'SCENARIOS_UPDATED':
      await createContextMenus();
      return { ok: true };

    default:
      return null;
  }
}

async function broadcastToTabs(payload: Record<string, unknown>, excludeTabId?: number) {
  chrome.runtime.sendMessage(payload).catch(() => {});

  const tabs = await chrome.tabs.query({ url: '*://chat.deepseek.com/*' });
  for (const tab of tabs) {
    if (tab.id && tab.id !== excludeTabId) {
      chrome.tabs.sendMessage(tab.id, payload).catch(() => {});
    }
  }
  if (excludeTabId) {
    chrome.tabs.sendMessage(excludeTabId, payload).catch(() => {});
  }
}

async function broadcastStateUpdate(excludeTabId?: number) {
  const [memories, skills, activePreset, modelType] = await Promise.all([
    getAllMemories(),
    getAllSkills(),
    getActivePreset(),
    getModelType(),
  ]);
  await broadcastToTabs({ type: 'STATE_UPDATED', memories, skills, activePreset, modelType }, excludeTabId);
}

async function broadcastBackgroundUpdate(config: BackgroundConfig | null) {
  await broadcastToTabs({ type: 'BACKGROUND_UPDATED', config });
}

async function broadcastPetUpdate(config: PetConfig) {
  await broadcastToTabs({ type: 'PET_UPDATED', config });
}

async function broadcastThemeUpdate(theme: DeepSeekTheme, excludeTabId?: number) {
  await broadcastToTabs({ type: 'THEME_UPDATED', theme }, excludeTabId);
}

async function broadcastMcpServersUpdate(excludeTabId?: number) {
  const servers = await getAllMcpServers();
  await broadcastToTabs({ type: 'MCP_SERVERS_UPDATED', servers }, excludeTabId);
}

async function broadcastToolDescriptorsUpdate(excludeTabId?: number) {
  const toolDescriptors = await getRuntimeToolDescriptors();
  await broadcastToTabs({ type: 'TOOL_DESCRIPTORS_UPDATED', toolDescriptors }, excludeTabId);
}

async function broadcastToolCallHistoryUpdate(excludeTabId?: number) {
  await broadcastToTabs({ type: 'TOOL_CALL_HISTORY_UPDATED' }, excludeTabId);
}

async function broadcastAutomationUpdate(excludeTabId?: number) {
  const automations = await getAllAutomations();
  await broadcastToTabs({ type: 'AUTOMATIONS_UPDATED', automations }, excludeTabId);
}

async function broadcastAutomationRunsUpdate(excludeTabId?: number) {
  await broadcastToTabs({ type: 'AUTOMATION_RUNS_UPDATED' }, excludeTabId);
}

async function scanDueAutomationsFromWake() {
  const result = await scanDueAutomations(executeAutomationWithContext);
  if (result.initialized > 0 || result.started > 0 || result.failed > 0) {
    await broadcastAutomationUpdate();
  }
  if (result.started > 0 || result.failed > 0) {
    await broadcastAutomationRunsUpdate();
    await broadcastToolCallHistoryUpdate();
  }
  return result;
}

async function runAutomationNow(id: string, excludeTabId?: number) {
  const automation = await getAutomationById(id);
  if (!automation) return { ok: false, error: 'automation_not_found' };

  const run = await runAutomation({
    automationId: id,
    trigger: 'manual',
    scheduledFor: null,
    executor: executeAutomationWithContext,
  });

  await broadcastAutomationUpdate(excludeTabId);
  await broadcastAutomationRunsUpdate(excludeTabId);
  await broadcastToolCallHistoryUpdate(excludeTabId);

  return run ?? { ok: false, error: 'automation_already_running' };
}

async function executeAutomationWithContext(
  request: AutomationRunnerRequest,
): Promise<AutomationRunnerResult> {
  const [memories, activePreset, toolDescriptors] = await Promise.all([
    getAllMemories(),
    getActivePreset(),
    getRuntimeToolDescriptors(),
  ]);
  const enabledDescriptors = toolDescriptors.filter((descriptor) => descriptor.execution.enabled);

  return runDeepSeekAutomation({
    ...request,
    promptContext: {
      memories,
      presetContent: activePreset?.content ?? null,
      toolDescriptors: enabledDescriptors,
    },
  }, {
    executeToolCall: (call) => executeRuntimeToolCall(call, 'automation'),
  });
}

function validateAutomationInput(input: AutomationCreateInput) {
  if (!input || typeof input !== 'object') throw new Error('Invalid automation input');
  validateNonEmptyString(input.name, 'Automation name');
  validateNonEmptyString(input.prompt, 'Automation prompt');
  validateAutomationScheduleInput(input.schedule);
}

function validateAutomationPatch(patch: AutomationUpdateInput) {
  if (!patch || typeof patch !== 'object') throw new Error('Invalid automation patch');
  if (patch.name !== undefined) validateNonEmptyString(patch.name, 'Automation name');
  if (patch.prompt !== undefined) validateNonEmptyString(patch.prompt, 'Automation prompt');
  if (patch.status !== undefined && !isAutomationStatus(patch.status)) {
    throw new Error('Invalid automation status');
  }
  if (patch.schedule !== undefined) validateAutomationScheduleInput(patch.schedule);
}

function validateAutomationScheduleInput(schedule: AutomationCreateInput['schedule']) {
  if (!schedule || typeof schedule !== 'object') throw new Error('Invalid automation schedule');
  const result = validateAutomationSchedule(schedule);
  if (!result.ok) throw new Error(result.error.message);
}

function validateNonEmptyString(value: unknown, label: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} is required`);
  }
}

function isAutomationStatus(status: unknown): status is AutomationStatus {
  return status === 'active' || status === 'paused' || status === 'archived';
}

async function getLocalSyncDataSnapshot(): Promise<SyncDataSnapshot> {
  const [memories, userSkills, skillSources, presets] = await Promise.all([
    getAllMemories(),
    getUserSkills(),
    getAllSkillSources(),
    getAllPresets(),
  ]);

  return {
    memories: memories.map(({ id, ...memory }) => memory),
    skills: userSkills,
    skillSources,
    presets,
  };
}

async function uploadSyncDataSnapshot(config: SyncConfig, snapshot: SyncDataSnapshot): Promise<void> {
  await Promise.all([
    webdavPut(config, 'memories.json', JSON.stringify(snapshot.memories)),
    webdavPut(config, 'skills.json', JSON.stringify(snapshot.skills)),
    webdavPut(config, 'skill-sources.json', JSON.stringify(snapshot.skillSources)),
    webdavPut(config, 'presets.json', JSON.stringify(snapshot.presets)),
  ]);
}

async function getRemoteSyncDataSnapshot(config: SyncConfig): Promise<SyncDataSnapshot> {
  const [remoteMemJson, remoteSkillJson, remotePresetJson, remoteSkillSourceJson] = await Promise.all([
    webdavGetRequired(config, 'memories.json'),
    webdavGetRequired(config, 'skills.json'),
    webdavGetRequired(config, 'presets.json'),
    webdavGet(config, 'skill-sources.json'),
  ]);

  const memories = parseRemoteArray<Memory>('memories.json', remoteMemJson)
    .map(({ id, ...memory }) => memory);

  return {
    memories,
    skills: parseRemoteArray<Skill>('skills.json', remoteSkillJson),
    skillSources: remoteSkillSourceJson === null
      ? []
      : parseRemoteArray<GitHubSkillSource>('skill-sources.json', remoteSkillSourceJson),
    presets: parseRemoteArray<SystemPromptPreset>('presets.json', remotePresetJson),
  };
}

async function webdavGetRequired(config: SyncConfig, file: string): Promise<string> {
  const content = await webdavGet(config, file);
  if (content === null) {
    throw new Error(`Cloud is missing ${file}; download stopped to avoid overwriting local data`);
  }
  return content;
}

function parseRemoteArray<T>(file: string, content: string): T[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`Cloud ${file} is not valid JSON; download stopped`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Cloud ${file} has wrong format (expected array); download stopped`);
  }

  return parsed as T[];
}

function getSyncCounts(snapshot: SyncDataSnapshot): SyncCounts {
  return {
    memories: snapshot.memories.length,
    skills: snapshot.skills.length,
    presets: snapshot.presets.length,
  };
}

const URL_REGEX = /https?:\/\/[^\s<>"')]+/gi;

/**
 * Extracts up to 3 URLs from the prompt, fetches each via the web_fetch tool, and returns
 * a context block with the real page content. This makes URL-based answers reliable instead
 * of depending on the model to (inconsistently) decide to call web_fetch itself.
 * Returns an empty string when there are no URLs or web_fetch is unavailable.
 */
async function autoFetchPromptUrls(
  prompt: string,
  descriptors: ToolDescriptor[],
  excludeTabId?: number,
): Promise<string> {
  const hasWebFetch = descriptors.some((d) => (d.invocationName ?? d.name) === 'web_fetch');
  if (!hasWebFetch) return '';

  const urls = Array.from(new Set(prompt.match(URL_REGEX) ?? []))
    .map((u) => u.replace(/[.,;]+$/, '')) // strip trailing punctuation
    .slice(0, 3);
  if (urls.length === 0) return '';

  // Show a transient status while fetching (replaced by the real answer once streaming starts)
  broadcastChatChunk({ text: `🔄 Recupero ${urls.length > 1 ? 'pagine' : 'pagina'}…`, done: false }, excludeTabId);

  const blocks: string[] = [];
  for (const url of urls) {
    try {
      const result = await executeRuntimeToolCall(
        { name: 'web_fetch', payload: { url }, raw: '' },
        'sidepanel_chat',
      );
      const content = result.ok ? ((result.output as { content?: string } | undefined)?.content ?? '') : '';
      if (result.ok && content) {
        blocks.push(`<pagina url="${url}">\n${content}\n</pagina>`);
      } else {
        blocks.push(`<pagina url="${url}" errore="true">Impossibile recuperare la pagina: ${result.error?.message ?? result.summary ?? 'errore sconosciuto'}</pagina>`);
      }
    } catch (err) {
      blocks.push(`<pagina url="${url}" errore="true">Impossibile recuperare la pagina: ${err instanceof Error ? err.message : String(err)}</pagina>`);
    }
  }

  return blocks.join('\n\n');
}

async function handleChatSubmitPrompt(prompt: string, excludeTabId?: number) {
  const headers = await loadClientHeadersFromStorage();
  if (!headers) {
    broadcastChatChunk({ text: '', done: true, error: 'Please log in to chat.deepseek.com and send a message first to obtain authentication credentials' }, excludeTabId);
    return;
  }

  try {
    // Restore session/threading state that may have been lost when the service worker was restarted.
    // Chrome MV3 kills service workers after ~30s of inactivity; this ensures conversation context
    // is maintained across those restarts.
    await restoreChatStateFromStorage();

    // Track whether this is the first turn in the session
    const isFirstTurn = !chatSessionId || chatParentMessageId === null;

    if (!chatSessionId) {
      chatSessionId = await createChatSession(headers);
      chatParentMessageId = null;
      persistChatState(); // Persist new session ID immediately
    }

    // Detect skill trigger (/skillname args)
    const skillInvocation = parseSkillCommand(prompt);
    let effectivePrompt = prompt;
    let skillInstructions: string | null = null;
    let skillMemoryEnabled = false;

    if (skillInvocation) {
      const skills = await getSkillLibrary();
      const skill = skills.find((s) => s.name === skillInvocation.skillName && s.enabled !== false);
      if (skill) {
        skillInstructions = skill.instructions;
        skillMemoryEnabled = skill.memoryEnabled ?? false;
        // Use the arguments as the actual prompt; fall back to skill name if no args
        effectivePrompt = skillInvocation.args.trim() || skillInvocation.skillName;
      }
    }

    const [memories, activePreset, toolDescriptors] = await Promise.all([
      getAllMemories(),
      getActivePreset(),
      getRuntimeToolDescriptors(),
    ]);

    const enabledDescriptors = toolDescriptors.filter((t) => t.execution.enabled);

    // Auto-fetch any URLs in the prompt and inject their content directly.
    // DeepSeek calls web_fetch unreliably (often skipping it and hallucinating while
    // claiming it fetched), so we pre-fetch URLs in the background and hand the model the
    // real page content. This guarantees grounded answers regardless of the model's choice.
    const fetchedContext = await autoFetchPromptUrls(effectivePrompt, enabledDescriptors, excludeTabId);
    const promptWithContext = fetchedContext
      ? `${effectivePrompt}\n\n[CONTENUTO REALE DELLE PAGINE — usa ESCLUSIVAMENTE questi dati, non inventare]\n${fetchedContext}\n[/CONTENUTO REALE]`
      : effectivePrompt;

    // On first turn: inject full system context (memories, preset/skill, tools).
    // On subsequent turns: only inject tools so the model can still call them,
    // but skip the system preamble to avoid confusing the conversation context.
    const presetContent = isFirstTurn
      ? (skillInstructions
          ? skillInstructions + (activePreset?.content ? `\n\n---\n\n${activePreset.content}` : '')
          : activePreset?.content ?? null)
      : null;

    const injectMemories = isFirstTurn && (skillMemoryEnabled || !skillInvocation)
      ? memories
      : [];

    const { augmented } = buildPromptAugmentation(promptWithContext, {
      memories: injectMemories,
      presetContent,
      toolDescriptors: enabledDescriptors,
      thinkingEnabled: false,
    });

    const powHeaders = await createPowHeaders(headers);

    const initialInput = {
      chatSessionId,
      parentMessageId: chatParentMessageId,
      modelType: null,
      prompt: augmented,
      refFileIds: [],
      thinkingEnabled: false,
      searchEnabled: false,
      clientHeaders: headers,
      powHeaders,
    };

    await runSidepanelToolLoop(initialInput, enabledDescriptors, excludeTabId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    broadcastChatChunk({ text: '', done: true, error: msg }, excludeTabId);
    if (msg.includes('auth') || msg.includes('token') || msg.includes('401') || msg.includes('session')) {
      chatSessionId = null;
      chatParentMessageId = null;
      persistChatState(); // Clear persisted state on auth/session errors
    }
  }
}

async function runSidepanelToolLoop(
  input: {
    chatSessionId: string;
    parentMessageId: number | null;
    modelType: string | null;
    prompt: string;
    refFileIds: string[];
    thinkingEnabled: boolean;
    searchEnabled: boolean;
    clientHeaders: Record<string, string>;
    powHeaders: Record<string, string>;
  },
  toolDescriptors: ToolDescriptor[],
  excludeTabId?: number,
) {
  const MAX_STEPS = 20;
  const allExecutions: ToolExecutionRecord[] = [];
  let currentInput = input;

  for (let step = 0; step < MAX_STEPS; step++) {
    let accumulated = '';
    const turn = await submitPromptStreaming(currentInput, {
      onTextChunk(_newText: string, fullText: string) {
        accumulated = fullText;
        // Broadcast the full accumulated text (not just the delta) so the frontend
        // can simply replace the last message on each chunk — immune to any ordering
        // or accumulation issues that could cause dropped first characters.
        broadcastChatChunk({ text: fullText, done: false }, excludeTabId);
      },
    });

    // Only update the parent ID if the stream returned a valid response ID.
    // Never overwrite with null — that would break conversation threading.
    if (turn.responseMessageId !== null) {
      chatParentMessageId = turn.responseMessageId;
      persistChatState(); // Persist after each successful turn so SW restarts don't lose context
    }
    const fullText = accumulated || turn.assistantText;

    if (!fullText) {
      broadcastChatChunk({ text: '', done: true }, excludeTabId);
      return;
    }

    const toolCalls = extractToolCalls(fullText, { descriptors: toolDescriptors });

    if (toolCalls.length === 0) {
      broadcastChatChunk({ text: fullText, done: true }, excludeTabId);
      return;
    }

    const execs: ToolExecutionRecord[] = [];
    for (const call of toolCalls) {
      const result = await executeRuntimeToolCall(call, 'sidepanel_chat');
      execs.push({
        name: call.name,
        result: {
          ok: result.ok,
          summary: result.summary,
          detail: result.detail,
          output: result.output,
          truncated: result.truncated,
          error: result.error,
        },
      });
    }
    allExecutions.push(...execs);

    const toolResultsText = execs.map((e) =>
      `<${e.name}_result>\n${JSON.stringify(e.result)}\n</${e.name}_result>`
    ).join('\n');

    const continuationPrompt = `[TOOL_RESULTS]\n${toolResultsText}\n[/TOOL_RESULTS]\n\nPlease continue your answer based on the above tool execution results.`;

    currentInput = {
      ...currentInput,
      prompt: continuationPrompt,
      parentMessageId: chatParentMessageId,
    };
  }

  broadcastChatChunk({ text: '(Maximum tool call steps reached, conversation ended)', done: true }, excludeTabId);
}

function broadcastChatChunk(
  chunk: { text: string; done: boolean; error?: string },
  excludeTabId?: number,
) {
  chrome.runtime.sendMessage({ type: 'CHAT_STREAM_CHUNK', ...chunk }).catch(() => {});
}
