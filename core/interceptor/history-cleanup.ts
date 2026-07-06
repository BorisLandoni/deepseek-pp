import { DPP_MANAGED_AGENT_PROMPT_MARKER } from '../constants';
import { sanitizeInternalPromptText } from '../prompt';
import type { ToolCallRestoreRecord, ToolDescriptor } from '../types';
import { createToolInvocationCatalog, hasXmlToolMarker } from '../tool';
import { extractToolCalls, stripToolCalls } from './tool-parser';

export interface HistoryCleanupOptions {
  toolDescriptors: readonly ToolDescriptor[];
  onToolCallsRestored: (records: ToolCallRestoreRecord[]) => void;
}

export function stripToolCallsFromHistory(json: any, options: HistoryCleanupOptions) {
  if (!json || !json.data) return;
  const data = json.data.biz_data || json.data;
  const messages = data.chat_messages;
  if (!Array.isArray(messages)) return;

  const restoredRecords: ToolCallRestoreRecord[] = [];
  stripMessageToolCalls(messages, restoredRecords, options.toolDescriptors);

  if (restoredRecords.length > 0) {
    options.onToolCallsRestored(restoredRecords);
  }
}

export function stripToolCallsFromIDBResult(result: any, options: HistoryCleanupOptions) {
  const restoredRecords: ToolCallRestoreRecord[] = [];

  if (Array.isArray(result)) {
    for (const item of result) {
      stripSingleIDBRecord(item, restoredRecords, options.toolDescriptors);
    }
  } else {
    stripSingleIDBRecord(result, restoredRecords, options.toolDescriptors);
  }

  if (restoredRecords.length > 0) {
    options.onToolCallsRestored(restoredRecords);
  }
}

function stripSingleIDBRecord(
  record: any,
  restoredRecords: ToolCallRestoreRecord[],
  toolDescriptors: readonly ToolDescriptor[],
) {
  if (!record || !record.data) return;
  const data = record.data;
  const messages = data.chat_messages;
  if (!Array.isArray(messages)) return;

  stripMessageToolCalls(messages, restoredRecords, toolDescriptors);
}

function stripMessageToolCalls(
  messages: any[],
  restoredRecords: ToolCallRestoreRecord[],
  toolDescriptors: readonly ToolDescriptor[],
) {
  const visibleMessages = messages.filter((msg: any) => !isInternalManagedAgentMessage(msg));
  if (visibleMessages.length !== messages.length) {
    messages.splice(0, messages.length, ...visibleMessages);
  }

  visibleMessages.forEach((msg: any, index: number) => {
    sanitizeStoredMessageInternalPrompt(msg);
    const messageKey = getMessageRestoreKey(msg, index);
    if (typeof msg.content === 'string' && hasToolCallMarker(msg.content, toolDescriptors)) {
      const record = collectToolCallRestoreRecord(msg.content, `${messageKey}:content`, toolDescriptors);
      if (record) restoredRecords.push(record);
      msg.content = stripToolCalls(msg.content, { descriptors: toolDescriptors });
    }
    if (Array.isArray(msg.fragments)) {
      // Strip across the WHOLE reassembled fragment text, not per-fragment. DeepSeek persists a
      // streamed answer as an array of fragments, so a <tool>...</tool> block routinely straddles a
      // fragment boundary; stripping each fragment in isolation leaves both halves intact and the
      // block reappears on reload. Join -> strip once -> redistribute (mirrors
      // sanitizeStoredMessageInternalPrompt). Reads/writes content OR text, like the SSE parser.
      const textFragments = msg.fragments.filter((frag: any) => typeof getFragmentText(frag) === 'string');
      if (textFragments.length > 0) {
        const joined = textFragments.map((frag: any) => getFragmentText(frag)).join('');
        if (hasToolCallMarker(joined, toolDescriptors)) {
          const stripped = stripToolCalls(joined, { descriptors: toolDescriptors });
          // Only rewrite the fragments when something was actually removed, so a lone/orphan close
          // tag does not needlessly collapse the fragment array or record a phantom tool block.
          if (stripped !== joined) {
            const record = collectToolCallRestoreRecord(joined, `${messageKey}:fragments`, toolDescriptors);
            if (record) restoredRecords.push(record);
            textFragments.forEach((frag: any, fragIndex: number) => {
              setFragmentText(frag, fragIndex === 0 ? stripped : '');
            });
          }
        }
      }
    }
  });
}

function getFragmentText(frag: any): string | null {
  if (!frag || typeof frag !== 'object') return null;
  if (typeof frag.content === 'string') return frag.content;
  if (typeof frag.text === 'string') return frag.text;
  return null;
}

function setFragmentText(frag: any, value: string): void {
  if (!frag || typeof frag !== 'object') return;
  // Write back to whichever field originally held the string.
  if (typeof frag.text === 'string' && typeof frag.content !== 'string') {
    frag.text = value;
    return;
  }
  frag.content = value;
}

function hasToolCallMarker(text: string, toolDescriptors: readonly ToolDescriptor[]): boolean {
  const catalog = createToolInvocationCatalog(toolDescriptors);
  if (hasXmlToolMarker(text, catalog)) return true;
  return text.includes('｜DSML｜');
}

function hashString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function getMessageRestoreKey(msg: any, index: number): string {
  return String(msg?.id ?? msg?.message_id ?? msg?.uuid ?? msg?.parent_message_id ?? index);
}

function collectToolCallRestoreRecord(
  text: string,
  key: string,
  toolDescriptors: readonly ToolDescriptor[],
): ToolCallRestoreRecord | null {
  if (!hasToolCallMarker(text, toolDescriptors)) return null;

  const calls = extractToolCalls(text, { descriptors: toolDescriptors });
  if (calls.length === 0) return null;

  const content = stripToolCalls(text, { descriptors: toolDescriptors });
  const id = hashString(`${key}\n${content}\n${calls.map((call) => call.raw).join('\n')}`);
  return {
    id,
    calls,
    content,
    source: 'history',
  };
}

function sanitizeStoredMessageInternalPrompt(msg: any) {
  if (!msg || typeof msg !== 'object') return;

  if (typeof msg.content === 'string') {
    msg.content = sanitizeInternalPromptText(msg.content);
  }

  if (!Array.isArray(msg.fragments)) return;

  const textFragments = msg.fragments
    .filter((frag: any) => typeof getFragmentText(frag) === 'string');

  if (textFragments.length === 0) return;

  const joined = textFragments.map((frag: any) => getFragmentText(frag)).join('');
  const sanitizedJoined = sanitizeInternalPromptText(joined);
  if (sanitizedJoined !== joined) {
    textFragments.forEach((frag: any, index: number) => {
      setFragmentText(frag, index === 0 ? sanitizedJoined : '');
    });
    return;
  }

  for (const frag of textFragments) {
    setFragmentText(frag, sanitizeInternalPromptText(getFragmentText(frag) as string));
  }
}

function isInternalManagedAgentMessage(msg: any): boolean {
  if (!msg || typeof msg !== 'object') return false;
  if (typeof msg.content === 'string' && isInternalManagedAgentContent(msg.content)) return true;
  if (!Array.isArray(msg.fragments)) return false;
  return msg.fragments.some((frag: any) => typeof frag?.content === 'string' && isInternalManagedAgentContent(frag.content));
}

function isInternalManagedAgentContent(content: string): boolean {
  if (content.includes(DPP_MANAGED_AGENT_PROMPT_MARKER)) return true;
  if (content.includes('DeepSeek++ Managed Agent Runner') && content.includes('<tool_results>')) return true;
  return content.includes('Tool call format reminder:') &&
    content.includes('Available tool tag names:') &&
    content.includes('<original_user_task>') &&
    content.includes('</original_user_task>');
}
