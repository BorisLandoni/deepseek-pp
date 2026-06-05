import type { ToolExecutionRecord } from '../types';

const PENDING_ACTION_RE = /(?:我(?:将|会|先|直接|现在|继续|尝试|开始|需要)|(?:接下来|下一步|然后).{0,24}(?:调用|创建|编辑|检查|验证|生成|保存|尝试)|(?:i(?:'ll| will| need to)|let me|next,? i).{0,48}(?:call|create|edit|inspect|validate|generate|save|try))/i;
const FINALISH_RE = /(?:已(?:完成|创建|生成|保存|验证|写入|更新)|完成了|保存于|输出文件|最终|final answer|done|completed|created|saved|validated|written)/i;
const TASK_COMPLETE_RE = /<task_complete>\s*([\s\S]*?)\s*<\/task_complete>/;

export function extractTaskCompleteSignal(text: string): { summary: string; artifacts: string[] } | null {
  const match = TASK_COMPLETE_RE.exec(text);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary : match[1].trim(),
      artifacts: Array.isArray(parsed.artifacts) ? parsed.artifacts.filter((a: unknown) => typeof a === 'string') : [],
    };
  } catch {
    return { summary: match[1].trim(), artifacts: [] };
  }
}

export function shouldNudge(
  originalTask: string,
  executions: ToolExecutionRecord[],
  visibleText: string,
  nudgeCount: number,
): boolean {
  if (extractTaskCompleteSignal(visibleText)) return false;
  if (!visibleText) return true;
  if (PENDING_ACTION_RE.test(visibleText)) return true;
  return nudgeCount === 0 && !FINALISH_RE.test(visibleText);
}

export function buildContinuationPrompt(originalTask: string, executions: ToolExecutionRecord[]): string {
  const hasFailures = executions.some((e) => !e.result.ok);
  const results = renderToolResults(executions);

  return [
    'The following are the tool results just executed by the tool continuation task. Act like a real Agent and continue making progress based on the original task and these tool results.',
    'If the results are sufficient, output the final conclusion; only continue calling tools when more information, verification, or file modifications are truly needed.',
    'Do not ask the user to click continue, and do not output fake tool-call JSON; when further action is needed, only output executable XML tool tags.',
    '',
    '<original_task>',
    clampText(originalTask, 8000),
    '</original_task>',
    ...(hasFailures ? [
      'At least one tool execution failed. Do not stop because of a recoverable error; read the summary/detail/error, then correct the parameters or use an appropriate next step to continue completing the task.',
    ] : []),
    '',
    '<tool_results>',
    JSON.stringify(results, null, 2),
    '</tool_results>',
  ].join('\n');
}

export function buildNudgePrompt(
  originalTask: string,
  previousText: string,
  executions: ToolExecutionRecord[],
  nudgeCount: number,
): string {
  const results = renderToolResults(executions);

  return [
    'The previous reply did not contain any executable tool XML, so the automated continuation cannot proceed.',
    'Based on the original task and tool results, choose one of the following:',
    '1. If the task is not yet complete, this turn must directly output the next executable tool XML.',
    '2. If the task is already complete, output <task_complete>{"summary":"..."}</task_complete>.',
    `This is nudge correction #${nudgeCount + 1} with no tool calls.`,
    '',
    '<original_task>',
    clampText(originalTask, 8000),
    '</original_task>',
    '',
    '<previous_assistant_text>',
    clampText(previousText, 4000),
    '</previous_assistant_text>',
    '',
    '<tool_results_so_far>',
    JSON.stringify(results, null, 2),
    '</tool_results_so_far>',
  ].join('\n');
}

export function buildFinalizationPrompt(originalTask: string, executions: ToolExecutionRecord[]): string {
  const results = renderToolResults(executions);

  return [
    'The following are the tool results that were just automatically executed. Please provide the final answer based on the original task and these results.',
    'This is the final answer turn: do not call any more tools.',
    '',
    '<original_task>',
    clampText(originalTask, 8000),
    '</original_task>',
    '',
    '<tool_results>',
    JSON.stringify(results, null, 2),
    '</tool_results>',
  ].join('\n');
}

function renderToolResults(executions: ToolExecutionRecord[]) {
  return executions.map((e) => ({
    tool: e.name,
    provider: e.provider?.displayName,
    ok: e.result.ok,
    summary: e.result.summary,
    detail: clampText(e.result.detail, 4000),
    error: e.result.error,
    output: clampText(
      e.result.output === undefined ? undefined : JSON.stringify(e.result.output),
      8000,
    ),
    truncated: e.result.truncated === true,
  }));
}

function clampText(value: string | undefined, maxLength: number): string | undefined {
  if (!value) return value;
  return value.length > maxLength ? `${value.slice(0, maxLength)}\n...[truncated]` : value;
}
