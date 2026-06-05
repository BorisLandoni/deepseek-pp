import type { Memory, MemoryType, NewMemory } from '../types';
import type {
  JsonValue,
  ToolCall,
  ToolDescriptor,
  ToolProvider,
  ToolProviderIdentity,
  ToolResult,
} from './types';

const MEMORY_TYPES: MemoryType[] = ['user', 'feedback', 'topic', 'reference'];

export const MEMORY_TOOL_PROVIDER: ToolProviderIdentity = {
  kind: 'local',
  id: 'memory',
  displayName: 'DeepSeek++ Memory',
  transport: 'in_process',
};

export const MEMORY_TOOL_NAMES = ['memory_save', 'memory_update', 'memory_delete'] as const;

export type MemoryToolName = typeof MEMORY_TOOL_NAMES[number];

export interface MemoryToolSaveConfirmation {
  id: number;
}

export interface MemoryToolRuntime {
  saveMemory(input: NewMemory): Promise<MemoryToolSaveConfirmation | null>;
  getMemoryById(id: number): Promise<Memory | null>;
  updateMemory(memory: Memory): Promise<void>;
  deleteMemory(id: number): Promise<void>;
}

export const MEMORY_TOOL_DESCRIPTORS: ToolDescriptor[] = [
  {
    id: 'local:memory:memory_save',
    provider: MEMORY_TOOL_PROVIDER,
    name: 'memory_save',
    invocationName: 'memory_save',
    title: 'Save memory',
    description: 'Save a new long-term memory entry',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: MEMORY_TYPES,
          description: 'Memory type: user=identity/role/preference, feedback=behaviour correction, topic=discussion points, reference=external resource link',
        },
        name: { type: 'string', description: 'Short title' },
        content: { type: 'string', description: 'Content to save' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tag list',
        },
      },
      required: ['type', 'name', 'content', 'tags'],
      additionalProperties: false,
    },
    execution: {
      mode: 'auto',
      enabled: true,
      risk: 'low',
    },
  },
  {
    id: 'local:memory:memory_update',
    provider: MEMORY_TOOL_PROVIDER,
    name: 'memory_update',
    invocationName: 'memory_update',
    title: 'Update memory',
    description: 'Update an existing memory entry',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'integer', description: 'Memory ID' },
        type: { type: 'string', enum: MEMORY_TYPES, description: 'Memory type' },
        name: { type: 'string', description: 'Updated title' },
        content: { type: 'string', description: 'Updated content' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tag list',
        },
      },
      required: ['id', 'type', 'name', 'content', 'tags'],
      additionalProperties: false,
    },
    execution: {
      mode: 'auto',
      enabled: true,
      risk: 'medium',
    },
  },
  {
    id: 'local:memory:memory_delete',
    provider: MEMORY_TOOL_PROVIDER,
    name: 'memory_delete',
    invocationName: 'memory_delete',
    title: 'Delete memory',
    description: 'Delete a memory entry',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'integer', description: 'Memory ID' },
      },
      required: ['id'],
      additionalProperties: false,
    },
    execution: {
      mode: 'auto',
      enabled: true,
      risk: 'medium',
    },
  },
];

export function isMemoryToolName(name: string): name is MemoryToolName {
  return (MEMORY_TOOL_NAMES as readonly string[]).includes(name);
}

export function createMemoryToolProvider(runtime: MemoryToolRuntime): ToolProvider {
  return {
    identity: MEMORY_TOOL_PROVIDER,
    async listTools() {
      return MEMORY_TOOL_DESCRIPTORS;
    },
    execute(call) {
      return executeMemoryToolCall(runtime, call);
    },
  };
}

export async function executeMemoryToolCall(
  runtime: MemoryToolRuntime,
  call: ToolCall,
): Promise<ToolResult> {
  if (call.name === 'memory_save') {
    return saveMemory(runtime, call);
  }

  if (call.name === 'memory_update') {
    return updateExistingMemory(runtime, call);
  }

  if (call.name === 'memory_delete') {
    return deleteExistingMemory(runtime, call);
  }

  return {
    ok: false,
    name: call.name,
    summary: 'Unsupported memory tool',
    error: {
      code: 'memory_tool_unsupported',
      message: `Unsupported memory tool: ${call.name}`,
      retryable: false,
    },
  };
}

async function saveMemory(runtime: MemoryToolRuntime, call: ToolCall): Promise<ToolResult> {
  const payload = call.payload;
  const name = stringValue(payload.name) || 'unnamed';
  const saved = await runtime.saveMemory({
    type: memoryTypeValue(payload.type) || 'topic',
    name,
    content: stringValue(payload.content),
    description: name,
    tags: stringArrayValue(payload.tags),
    pinned: false,
  });

  if (!saved?.id) {
    return failure(call, 'memory_save_failed', 'Save failed', 'No save confirmation received', true);
  }

  return success(call, 'Saved', name, { id: saved.id });
}

async function updateExistingMemory(runtime: MemoryToolRuntime, call: ToolCall): Promise<ToolResult> {
  const payload = call.payload;
  const id = numberValue(payload.id);
  if (!id) return failure(call, 'memory_invalid_id', 'Invalid ID', undefined, false);

  const existing = await runtime.getMemoryById(id);
  if (!existing) return failure(call, 'memory_not_found', 'Memory not found', `ID ${id} does not exist`, false);

  const name = stringValue(payload.name) || existing.name;
  await runtime.updateMemory({
    ...existing,
    type: memoryTypeValue(payload.type) || existing.type,
    name,
    content: stringValue(payload.content) || existing.content,
    description: name || existing.description,
    tags: Array.isArray(payload.tags) ? stringArrayValue(payload.tags) : existing.tags,
  });

  return success(call, 'Updated', name);
}

async function deleteExistingMemory(runtime: MemoryToolRuntime, call: ToolCall): Promise<ToolResult> {
  const id = numberValue(call.payload.id);
  if (!id) return failure(call, 'memory_invalid_id', 'Invalid ID', undefined, false);

  await runtime.deleteMemory(id);
  return success(call, 'Deleted', `#${id}`);
}

function success(call: ToolCall, summary: string, detail?: string, output?: JsonValue): ToolResult {
  return {
    ok: true,
    name: call.name,
    callId: call.id,
    descriptorId: call.descriptorId,
    provider: call.provider ?? MEMORY_TOOL_PROVIDER,
    summary,
    detail,
    output,
  };
}

function failure(
  call: ToolCall,
  code: string,
  summary: string,
  detail: string | undefined,
  retryable: boolean,
): ToolResult {
  return {
    ok: false,
    name: call.name,
    callId: call.id,
    descriptorId: call.descriptorId,
    provider: call.provider ?? MEMORY_TOOL_PROVIDER,
    summary,
    detail,
    error: {
      code,
      message: detail ?? summary,
      retryable,
    },
  };
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function memoryTypeValue(value: unknown): MemoryType | null {
  return typeof value === 'string' && MEMORY_TYPES.includes(value as MemoryType)
    ? value as MemoryType
    : null;
}

function stringArrayValue(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}
