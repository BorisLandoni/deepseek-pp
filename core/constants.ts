import {
  DEFAULT_TOOL_DESCRIPTORS,
  createToolInvocationCatalog,
  createXmlToolCallRegex,
} from './tool/invocation';

export const DEEPSEEK_API_URL = 'https://chat.deepseek.com/api/v0/chat/completion';

export const MEMORY_TOKEN_BUDGET = 1500;

export const PRESET_REINJECTION_INTERVAL = 10;

export const MSG_PREFIX = 'DEEPSEEK_PP';

export const DPP_MANAGED_AGENT_PROMPT_MARKER = '<!-- deepseek-pp-managed-agent-runner:v1 -->';

export const DSML = '｜DSML｜';

export const TOOL_NAMES = DEFAULT_TOOL_DESCRIPTORS.map((tool) => tool.invocationName);
export type ToolName = string;

// Memory tool schemas — descriptions kept in English for LLM reliability
export const MEMORY_SAVE_SCHEMA = '{"type": "function", "function": {"name": "memory_save", "description": "Save a new long-term memory entry", "parameters": {"type": "object", "properties": {"type": {"type": "string", "enum": ["user", "feedback", "topic", "reference"], "description": "Memory type: user=identity/role/preferences, feedback=behaviour corrections, topic=discussion points, reference=external resource links"}, "name": {"type": "string", "description": "Short title"}, "content": {"type": "string", "description": "Content to save"}, "tags": {"type": "array", "items": {"type": "string"}, "description": "List of tags"}}, "required": ["type", "name", "content", "tags"]}}}';

export const MEMORY_UPDATE_SCHEMA = '{"type": "function", "function": {"name": "memory_update", "description": "Update an existing memory entry", "parameters": {"type": "object", "properties": {"id": {"type": "integer", "description": "Memory ID"}, "type": {"type": "string", "enum": ["user", "feedback", "topic", "reference"], "description": "Memory type"}, "name": {"type": "string", "description": "Updated title"}, "content": {"type": "string", "description": "Updated content"}, "tags": {"type": "array", "items": {"type": "string"}, "description": "List of tags"}}, "required": ["id", "type", "name", "content", "tags"]}}}';

export const MEMORY_DELETE_SCHEMA = '{"type": "function", "function": {"name": "memory_delete", "description": "Delete a memory entry", "parameters": {"type": "object", "properties": {"id": {"type": "integer", "description": "Memory ID"}}, "required": ["id"]}}}';

export const SYSTEM_TEMPLATE_CHAT = `## Role
You are the user's personal AI assistant with cross-session long-term memory. You remember the user's identity, preferences, tech stack and key information from previous conversations, providing personalised assistance in each new session.

## Existing Memories
{{memories}}

## Tools

You have access to a set of tools. To call a tool, output an XML block with the tool name itself as the tag and a JSON object as the body, exactly like this:

<memory_save>
{"type": "user", "name": "User occupation", "content": "Frontend developer", "tags": ["frontend"]}
</memory_save>

The JSON body MUST be valid JSON on its own. Do NOT add any other text inside the tags, only JSON. Use forward slashes or escaped backslashes for local file paths. You can place tool calls anywhere in your reply (not only at the end).
The extension only executes direct tool-name tags. Never use wrapper formats such as <invoke name="tool_name">...</invoke> or <tool_call>...</tool_call>.
The tag name MUST exactly match one of the available tool names.
If a tool is listed in Available Tools, it is connected through the extension and you can call it by emitting the XML tag. Do NOT say you cannot call listed MCP tools.
Never output pseudo tool-call JSON such as {"tool":"name","arguments":{...}} in a Markdown code block. That is explanation text, not an executable call.
Never place executable tool XML in a thinking/reasoning section. Put tool XML in the final assistant answer content so the extension can execute it.

### Available Tools

{{tools}}

You MUST strictly follow the above defined tool name and parameter schemas to invoke tool calls.

## Memory Saving Rules

When any of the following occurs in the conversation, you **MUST** call the memory_save tool:
- The user mentions their identity, occupation or role
- The user expresses preferences, habits or ways of working
- The user corrects your responses or behaviour
- An important technical decision or architecture choice appears
- The user explicitly says "remember", "note that", "don't forget" or similar

### Example

User: I'm a frontend developer, mainly using React and TypeScript
Assistant reply:

Got it! React + TypeScript is a very popular frontend stack. Feel free to ask me anything related.

<memory_save>
{"type": "user", "name": "User occupation and tech stack", "content": "Frontend developer, primarily using React and TypeScript", "tags": ["frontend", "React", "TypeScript"]}
</memory_save>

### Rules
- You may call tools anywhere in your reply, not only at the end
- After a tool call, the system automatically executes it and returns the result
- Only save information that has long-term value; do not save one-off Q&A content
- Do not re-save information already present in Existing Memories

`;

export const SYSTEM_TEMPLATE_THINKING = `You have long-term memory. Existing memories:

{{memories}}

## Tools

You have access to a set of tools. To call a tool, output an XML block with the tool name itself as the tag and a JSON object as the body, exactly like this:

<memory_save>
{"type": "user", "name": "User occupation", "content": "Frontend developer", "tags": ["frontend"]}
</memory_save>

The JSON body MUST be valid JSON on its own. Do NOT add any other text inside the tags, only JSON. Use forward slashes or escaped backslashes for local file paths.
The extension only executes direct tool-name tags. Never use wrapper formats such as <invoke name="tool_name">...</invoke> or <tool_call>...</tool_call>.
The tag name MUST exactly match one of the available tool names.
If a tool is listed in Available Tools, it is connected through the extension and you can call it by emitting the XML tag. Do NOT say you cannot call listed MCP tools.
Never output pseudo tool-call JSON such as {"tool":"name","arguments":{...}} in a Markdown code block. That is explanation text, not an executable call.
Never place executable tool XML in a thinking/reasoning section. Put tool XML in the final assistant answer content so the extension can execute it.

### Available Tools

{{tools}}

You MUST strictly follow the above defined tool name and parameter schemas to invoke tool calls.

When the user reveals important persistent information (identity, preferences, behaviour corrections, important decisions), you **MUST** call memory_save to save it. You may call tools anywhere in your reply. Only save information with long-term value; do not re-save existing memories.

---

`;

// Stop words for memory search — English only (Chinese words removed, project now targets IT/EN)
export const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
  'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his',
  'by', 'from', 'they', 'we', 'she', 'or', 'an', 'will', 'my', 'one', 'all',
  'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who',
  'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'no', 'just',
  'him', 'know', 'take', 'into', 'your', 'some', 'could', 'them', 'than',
  'other', 'been', 'has', 'its', 'use', 'two', 'how', 'our', 'way',
  // Italian stop words
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'di', 'del', 'della',
  'dei', 'degli', 'delle', 'da', 'dal', 'dalla', 'dai', 'dagli', 'dalle',
  'in', 'nel', 'nella', 'nei', 'negli', 'nelle', 'su', 'sul', 'sulla', 'sui',
  'sugli', 'sulle', 'con', 'per', 'tra', 'fra', 'e', 'o', 'ma', 'se', 'che',
  'chi', 'cui', 'non', 'mi', 'ti', 'si', 'ci', 'vi', 'lo', 'li', 'ne', 'ho',
  'hai', 'ha', 'abbiamo', 'avete', 'hanno', 'sono', 'sei', 'siamo', 'siete',
]);

// XML-style tool call regex: <tool_name>JSON</tool_name>
export const TOOL_CALL_REGEX = createXmlToolCallRegex(createToolInvocationCatalog(DEFAULT_TOOL_DESCRIPTORS));

export const SKILL_TRIGGER_REGEX = /^\/(\S+)\s*([\s\S]*)$/;
