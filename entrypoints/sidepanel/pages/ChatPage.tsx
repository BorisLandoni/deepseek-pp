import { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../../../core/i18n/context';
import type { ChatMessage as ChatMessageType, Skill } from '../../../core/types';
import ChatMessage from '../components/ChatMessage';
import { consumePendingText, onPendingText } from '../pending-text';

export default function ChatPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load skills on mount
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_SKILL_LIBRARY' })
      .then((list: Skill[]) => setSkills(list ?? []))
      .catch(() => {});
  }, []);

  // Consume pending text from right-click on mount + register live callback
  useEffect(() => {
    const text = consumePendingText();
    if (text) { setInputText(text); inputRef.current?.focus(); }
    return onPendingText((text) => { setInputText(text); inputRef.current?.focus(); });
  }, []);

  // Check auth status on mount
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' })
      .then((resp: { hasToken?: boolean } | undefined) => setHasToken(resp?.hasToken ?? false))
      .catch(() => setHasToken(false));
  }, []);

  // Listen for streaming chunks
  useEffect(() => {
    const handler = (msg: { type: string; text?: string; done?: boolean; error?: string; hasToken?: boolean }) => {
      if (msg.type === 'CHAT_SET_INPUT_TEXT' && typeof msg.text === 'string') {
        setInputText(msg.text); inputRef.current?.focus(); return;
      }
      if (msg.type === 'AUTH_STATUS_CHANGED') { setHasToken(msg.hasToken ?? false); return; }
      if (msg.type === 'CHAT_STREAM_CHUNK') {
        if (msg.error) { setError(msg.error); setIsStreaming(false); return; }
        if (msg.done) { setIsStreaming(false); return; }
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { role: 'assistant', text: last.text + (msg.text ?? '') }];
          }
          return [...prev, { role: 'assistant', text: msg.text ?? '' }];
        });
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  // --- Skill autocomplete logic ---

  // While typing "/query" with no space yet → show suggestions
  const skillQuery = useMemo(() => {
    if (!inputText.startsWith('/')) return null;
    const afterSlash = inputText.slice(1);
    if (afterSlash.includes(' ')) return null; // space means skill already chosen
    return afterSlash.toLowerCase();
  }, [inputText]);

  const suggestions = useMemo(() => {
    if (skillQuery === null) return [];
    return skills
      .filter((s) => s.enabled !== false && s.name.startsWith(skillQuery))
      .slice(0, 8);
  }, [skillQuery, skills]);

  // Active skill: "/skillname " (with trailing space or more text)
  const activeSkill = useMemo(() => {
    const match = inputText.match(/^\/(\S+)(\s|$)/);
    if (!match) return null;
    return skills.find((s) => s.name === match[1] && s.enabled !== false) ?? null;
  }, [inputText, skills]);

  // Unknown skill warning: starts with /something but no match
  const unknownSkill = useMemo(() => {
    const match = inputText.match(/^\/(\S+)\s/);
    if (!match) return null;
    const name = match[1];
    const found = skills.some((s) => s.name === name && s.enabled !== false);
    return found ? null : name;
  }, [inputText, skills]);

  // Reset suggestion index when suggestions change
  useEffect(() => { setSelectedSuggestion(0); }, [suggestions.length]);

  const applySuggestion = (skill: Skill) => {
    setInputText(`/${skill.name} `);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || isStreaming) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInputText('');
    setIsStreaming(true);
    setError(null);

    chrome.runtime.sendMessage({ type: 'CHAT_SUBMIT_PROMPT', payload: { text } })
      .catch((err: Error) => { setError(err.message); setIsStreaming(false); });
  };

  const newSession = () => {
    chrome.runtime.sendMessage({ type: 'CHAT_NEW_SESSION' }).catch(() => {});
    setMessages([]);
    setError(null);
    setIsStreaming(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && suggestions.length > 0 && skillQuery !== null)) {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestion]);
        return;
      }
      if (e.key === 'Escape') {
        setInputText('');
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (hasToken === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-sm mb-3" style={{ color: 'var(--ds-text-secondary)' }}>{t.chatLoginRequired}</p>
        <p className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>{t.chatLoginNote}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--ds-border)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--ds-text)' }}>{t.chatTitle}</span>
        <button
          onClick={newSession}
          className="text-xs px-2.5 py-1 rounded-md"
          style={{ color: 'var(--ds-text-tertiary)', background: 'var(--ds-surface)' }}
          title={t.chatNewSession}
        >
          {t.chatNewSession}
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-3">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full gap-1.5">
            <div className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
              {t.chatEmptyHint}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--ds-text-tertiary)', opacity: 0.7 }}>
              {t.chatSkillHint}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}
        {error && <div className="text-xs text-red-400 text-center mt-2">{error}</div>}
      </div>

      {/* Input area */}
      <div className="p-3" style={{ borderTop: '1px solid var(--ds-border)' }}>

        {/* Active skill badge */}
        {activeSkill && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: 'var(--ds-blue)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[11px] font-medium" style={{ color: 'var(--ds-blue)' }}>
              {t.chatSkillActive.replace('{name}', activeSkill.name)}
            </span>
            {activeSkill.description && (
              <span className="text-[11px] truncate" style={{ color: 'var(--ds-text-tertiary)' }}>
                — {activeSkill.description}
              </span>
            )}
          </div>
        )}

        {/* Unknown skill warning */}
        {unknownSkill && (
          <div className="text-[11px] mb-1.5" style={{ color: 'var(--ds-warning)' }}>
            {t.chatSkillNotFound.replace('{name}', unknownSkill)}
          </div>
        )}

        {/* Skill autocomplete dropdown */}
        {suggestions.length > 0 && (
          <div
            className="mb-2 rounded-xl border overflow-hidden"
            style={{ background: 'var(--ds-bg)', borderColor: 'var(--ds-border)', boxShadow: 'var(--ds-shadow-md)' }}
          >
            {suggestions.map((skill, i) => (
              <button
                key={skill.name}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applySuggestion(skill); }}
                className="w-full flex items-start gap-2.5 px-3 py-2 text-left transition-colors"
                style={{
                  background: i === selectedSuggestion ? 'var(--ds-blue-light)' : 'transparent',
                  borderBottom: i < suggestions.length - 1 ? '1px solid var(--ds-border)' : 'none',
                }}
              >
                <code
                  className="text-[12px] font-mono font-semibold shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
                  style={{
                    background: i === selectedSuggestion ? 'var(--ds-blue)' : 'var(--ds-surface)',
                    color: i === selectedSuggestion ? '#fff' : 'var(--ds-blue)',
                  }}
                >
                  /{skill.name}
                </code>
                <span className="text-[11px] leading-relaxed line-clamp-1 mt-0.5" style={{ color: 'var(--ds-text-secondary)' }}>
                  {skill.description || '—'}
                </span>
              </button>
            ))}
            <div className="px-3 py-1 text-[10px]" style={{ color: 'var(--ds-text-tertiary)', background: 'var(--ds-surface)' }}>
              ↑↓ Navigate · Tab/Enter Select · Esc Cancel
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.chatInputPlaceholder}
            rows={2}
            className="flex-1 resize-none rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--ds-surface)', color: 'var(--ds-text)', border: '1px solid var(--ds-border)' }}
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !inputText.trim()}
            className="self-end px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ background: 'var(--ds-accent)', color: '#fff' }}
          >
            {isStreaming ? t.chatSending : t.chatSend}
          </button>
        </div>
      </div>
    </div>
  );
}
