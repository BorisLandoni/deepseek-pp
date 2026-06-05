import type { ToolRiskLevel } from '../tool/types';

export const SHELL_MCP_SERVER_NAME = 'Shell Local';
export const SHELL_MCP_NATIVE_HOST = 'com.deepseek_pp.shell';

export const OFFICECLI_BIN_PATH = 'officecli';

export const SHELL_TOOL_NAMES = ['shell_exec', 'shell_status'] as const;
export type ShellToolName = typeof SHELL_TOOL_NAMES[number];

export interface ShellToolSpec {
  name: ShellToolName;
  title: string;
  description: string;
  risk: ToolRiskLevel;
}

export const SHELL_TOOL_SPECS: readonly ShellToolSpec[] = [
  {
    name: 'shell_exec',
    title: 'Execute command',
    description: 'Execute a shell command on the local system, returning stdout, stderr, and the exit code.',
    risk: 'high',
  },
  {
    name: 'shell_status',
    title: 'Host status',
    description: 'Report the Native Host health status, platform, shell type, and working directory.',
    risk: 'low',
  },
] as const;
