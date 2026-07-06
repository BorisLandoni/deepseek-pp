#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Re-baselined for the IT/EN fork: the prompt templates were translated from the original
// Chinese, so these hashes reflect the current EN/IT prompt sources. Re-run and update after any
// intentional edit to core/constants.ts, core/prompt/augmentation.ts, or core/inline-agent/prompt.ts.
const EXPECTED_HASHES = {
  systemTemplateChat: '0142ccc4280cbf8b624a03049a159f5bb39a9e9e0640b9b54751e6e88063ddfb',
  systemTemplateThinking: '30241a565deba2c8c43dd3116aa99ec40936730361cc3bee7dd9e0c2808eee79',
  memoryToolSchemas: '3a04b9efec1d0e78392c79fe582e028b343451e092e6630a59136eafb52fb982',
  promptAugmentationBuild: '1b42d5b8df743388dfb86ee83e055e00a56fb5389bd7df1afd961c57b45b2335',
  promptToolSchemaRenderer: '4b21928666e28cce6079db921b87011b341f5c2d01ecfa81754afd28ec8a97b4',
  inlineAgentContinuationPrompt: '9d69b34acce9c2ec00bc8af8e0692cb5d6be1981943cadffaad494971bda9b24',
  inlineAgentNudgePrompt: '0a4164a55f22f012b44f590dd9f6ac38da6b942357a189a4072b2f4d8440d3d7',
  inlineAgentFinalizationPrompt: 'e65e1d27a69889d751f050b18737c7ce9fda8008d5f36cd6c157ef4e316524d7',
  inlineAgentPromptHelpers: 'cdb723464379a5ead572eff1d93fd4585d7f845739d67fa214fbbdc0694153c6',
};

const sources = {
  constants: readSource('core/constants.ts'),
  augmentation: readSource('core/prompt/augmentation.ts'),
  inlinePrompt: readSource('core/inline-agent/prompt.ts'),
};

const cases = {
  systemTemplateChat: extractRegex(
    'SYSTEM_TEMPLATE_CHAT',
    sources.constants,
    /export const SYSTEM_TEMPLATE_CHAT = `[\s\S]*?`;\n/,
  ),
  systemTemplateThinking: extractRegex(
    'SYSTEM_TEMPLATE_THINKING',
    sources.constants,
    /export const SYSTEM_TEMPLATE_THINKING = `[\s\S]*?`;\n/,
  ),
  memoryToolSchemas: [
    extractRegex('MEMORY_SAVE_SCHEMA', sources.constants, /export const MEMORY_SAVE_SCHEMA = '[\s\S]*?';\n/),
    extractRegex('MEMORY_UPDATE_SCHEMA', sources.constants, /export const MEMORY_UPDATE_SCHEMA = '[\s\S]*?';\n/),
    extractRegex('MEMORY_DELETE_SCHEMA', sources.constants, /export const MEMORY_DELETE_SCHEMA = '[\s\S]*?';\n/),
  ].join('\n'),
  promptAugmentationBuild: extractFunction('buildPromptAugmentation', sources.augmentation),
  promptToolSchemaRenderer: [
    extractFunction('renderToolSchemas', sources.augmentation),
    extractFunction('renderWebSearchGuidance', sources.augmentation),
    extractFunction('renderToolSchema', sources.augmentation),
    extractFunction('renderShellMcpHint', sources.augmentation),
    extractFunction('renderToolFormatReminder', sources.augmentation),
    extractFunction('createExamplePayload', sources.augmentation),
    extractFunction('exampleValue', sources.augmentation),
  ].join('\n\n'),
  inlineAgentContinuationPrompt: extractFunction('buildContinuationPrompt', sources.inlinePrompt),
  inlineAgentNudgePrompt: extractFunction('buildNudgePrompt', sources.inlinePrompt),
  inlineAgentFinalizationPrompt: extractFunction('buildFinalizationPrompt', sources.inlinePrompt),
  inlineAgentPromptHelpers: [
    extractFunction('extractTaskCompleteSignal', sources.inlinePrompt),
    extractFunction('shouldNudge', sources.inlinePrompt),
    extractFunction('renderToolResults', sources.inlinePrompt),
    extractFunction('clampText', sources.inlinePrompt),
  ].join('\n\n'),
};

const failures = [];
for (const [name, text] of Object.entries(cases)) {
  const actual = sha256(text);
  const expected = EXPECTED_HASHES[name];
  if (actual !== expected) {
    failures.push(`${name}: expected ${expected}, got ${actual}`);
  }
}

if (failures.length > 0) {
  console.error('Prompt freeze failed: prompt-generating source changed.');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Prompt freeze passed: ${Object.keys(cases).length} cases`);

function readSource(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function extractRegex(name, text, regex) {
  const match = regex.exec(text);
  if (!match) throw new Error(`Prompt freeze case not found: ${name}`);
  return match[0];
}

function extractFunction(name, text) {
  const start = text.indexOf(`function ${name}`);
  if (start < 0) throw new Error(`Prompt freeze function not found: ${name}`);

  const openingBrace = text.indexOf('{', start);
  if (openingBrace < 0) throw new Error(`Prompt freeze function has no body: ${name}`);

  let depth = 0;
  for (let i = openingBrace; i < text.length; i++) {
    const char = text[i];
    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  throw new Error(`Prompt freeze function is not closed: ${name}`);
}
