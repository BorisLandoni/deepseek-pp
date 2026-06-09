import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLanguage } from '../../../core/i18n/context';
import type { ChatMessage as ChatMessageType, Skill } from '../../../core/types';
import ChatMessage from '../components/ChatMessage';
import { consumePendingText, onPendingText } from '../pending-text';

type NoticeMessage = { role: 'notice'; text: string };
type DisplayMessage = ChatMessageType | NoticeMessage;

// Persists the visible transcript so the chat survives closing/reopening the sidebar.
// Cleared only on "New session". The conversation memory (session id) lives in the
// background; this just keeps the on-screen messages in sync with it.
const CHAT_MESSAGES_KEY = 'deepseek_pp_chat_messages';

type SummaryLang = 'it' | 'en' | 'es' | 'fr' | 'de';
const SUMMARY_LANG_NAMES: Record<SummaryLang, string> = {
  it: 'italiano',
  en: 'English',
  es: 'español',
  fr: 'français',
  de: 'Deutsch',
};

interface Attachment {
  name: string;
  content: string;
  truncated: boolean;
}

const MAX_FILES = 5;
const MAX_FILE_CHARS = 200_000;
// Text-like file extensions we can read and inject directly.
const TEXT_FILE_EXT = /\.(txt|text|md|markdown|csv|tsv|json|jsonl|ndjson|xml|yaml|yml|ini|cfg|conf|env|log|sql|js|mjs|cjs|ts|tsx|jsx|py|java|c|h|cpp|hpp|cc|cs|go|rs|rb|php|swift|kt|sh|bash|zsh|bat|ps1|css|scss|less|html|htm|svg|toml|properties|gradle|dockerfile|gitignore|R|m|lua|pl)$/i;

export default function ChatPage() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  // Summary/page-question language: defaults to the extension language chosen at startup.
  const [summaryLang, setSummaryLang] = useState<SummaryLang>((language as SummaryLang) ?? 'en');
  const [usePage, setUsePage] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore persisted messages on mount (before allowing any persistence to run).
  useEffect(() => {
    chrome.storage.local.get(CHAT_MESSAGES_KEY)
      .then((data) => {
        const saved = data[CHAT_MESSAGES_KEY];
        if (Array.isArray(saved) && saved.length > 0) setMessages(saved as DisplayMessage[]);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  // Persist the transcript on every change (chrome.storage.local has no write rate limit).
  // Notices are excluded so stale warnings don't reappear on reopen.
  useEffect(() => {
    if (!hydrated) return;
    const toSave = messages.filter((m) => m.role !== 'notice');
    if (toSave.length === 0) {
      chrome.storage.local.remove(CHAT_MESSAGES_KEY).catch(() => {});
    } else {
      chrome.storage.local.set({ [CHAT_MESSAGES_KEY]: toSave }).catch(() => {});
    }
  }, [messages, hydrated]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [waitingForToken, setWaitingForToken] = useState(false);
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
      if (msg.type === 'AUTH_STATUS_CHANGED') {
        setHasToken(msg.hasToken ?? false);
        if (msg.hasToken) setWaitingForToken(false);
        return;
      }
      if (msg.type === 'CHAT_NOTICE' && typeof msg.text === 'string') {
        // Insert a notice banner before any in-progress assistant message.
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          const notice: NoticeMessage = { role: 'notice', text: msg.text! };
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), notice, last];
          }
          return [...prev, notice];
        });
        return;
      }
      if (msg.type === 'CHAT_STREAM_CHUNK') {
        if (msg.error) {
          setIsStreaming(false);
          // If it's an auth error, go back to the login screen
          if (msg.error.toLowerCase().includes('log in') || msg.error.toLowerCase().includes('auth') || msg.error.toLowerCase().includes('token') || msg.error.toLowerCase().includes('credential')) {
            setHasToken(false);
            setMessages([]);
          } else {
            setError(msg.error);
          }
          return;
        }
        if (msg.done) {
          setIsStreaming(false);
          // Final authoritative full text — replace the last assistant message.
          if (msg.text) {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return [...prev.slice(0, -1), { role: 'assistant', text: msg.text! }];
              }
              return prev;
            });
          }
          return;
        }
        // Background now sends full accumulated text (not a delta), so we always
        // replace — not append — to avoid any character-dropping accumulation bugs.
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { role: 'assistant', text: msg.text ?? '' }];
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

  // Submit a prompt while showing a (possibly shorter) label as the user bubble.
  const submitPrompt = (displayText: string, fullText: string, opts?: { skipAutoFetch?: boolean }) => {
    if (isStreaming) return;
    setMessages((prev) => [...prev, { role: 'user', text: displayText }]);
    setIsStreaming(true);
    setError(null);
    chrome.runtime.sendMessage({ type: 'CHAT_SUBMIT_PROMPT', payload: { text: fullText, skipAutoFetch: opts?.skipAutoFetch } })
      .catch((err: Error) => { setError(err.message); setIsStreaming(false); });
  };

  const pageErrorText = (error?: string) => {
    const it = language === 'it';
    switch (error) {
      case 'restricted_page': return it ? 'Questa pagina del browser non è accessibile (es. chrome://, Web Store, pagine dell’estensione).' : 'This browser page is not accessible (e.g. chrome://, Web Store, extension pages).';
      case 'empty_page': return it ? 'La pagina non contiene testo leggibile.' : 'The page has no readable text.';
      case 'no_active_tab': return it ? 'Nessuna scheda attiva trovata.' : 'No active tab found.';
      default: return it ? `Impossibile leggere la pagina${error ? ': ' + error : ''}.` : `Could not read the page${error ? ': ' + error : ''}.`;
    }
  };

  const showPageNotice = (error?: string) => {
    setMessages((prev) => [...prev, { role: 'notice', text: '⚠️ ' + pageErrorText(error) }]);
  };

  const getPage = async (): Promise<{ ok: boolean; url?: string; title?: string; text?: string; error?: string }> => {
    try {
      return await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_PAGE_CONTENT' });
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  };

  const handleSummarize = async () => {
    if (isStreaming) return;
    const page = await getPage();
    if (!page?.ok || !page.text) { showPageNotice(page?.error); return; }
    const langName = SUMMARY_LANG_NAMES[summaryLang];
    const where = page.title || page.url || '';
    const display = language === 'it'
      ? `📄 Riassumi questa pagina (${langName})${where ? ' — ' + where : ''}`
      : `📄 Summarize this page (${langName})${where ? ' — ' + where : ''}`;
    const full = `Fai un riassunto chiaro e ben strutturato della pagina web qui sotto, usando titoletti ed elenchi puntati dove utile. Riporta i punti chiave e i dati principali (prezzi, specifiche, date) SOLO se presenti nel testo. Rispondi in ${langName}.\n\n[CONTENUTO PAGINA: ${page.title ?? ''} — ${page.url ?? ''}]\n${page.text}\n[/CONTENUTO PAGINA]`;
    submitPrompt(display, full, { skipAutoFetch: true });
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const next: Attachment[] = [...attachments];
    for (const file of Array.from(fileList)) {
      if (next.length >= MAX_FILES) {
        showPageNotice(language === 'it' ? `Massimo ${MAX_FILES} file.` : `Max ${MAX_FILES} files.`);
        break;
      }
      // PDF: extract text via the lazily-loaded pdf.js helper.
      const isPdf = /\.pdf$/i.test(file.name) || file.type === 'application/pdf';
      if (isPdf) {
        if (next.some((a) => a.name === file.name)) continue;
        try {
          const { extractPdfText } = await import('../../../core/file/pdf');
          const result = await extractPdfText(file);
          if (!result.text.trim()) {
            setMessages((prev) => [...prev, { role: 'notice', text: '⚠️ ' + (language === 'it'
              ? `"${file.name}": nessun testo estraibile (probabilmente un PDF scansionato/immagine).`
              : `"${file.name}": no extractable text (likely a scanned/image PDF).`) }]);
            continue;
          }
          let content = result.text;
          const truncated = content.length > MAX_FILE_CHARS || result.pagesRead < result.pages;
          if (content.length > MAX_FILE_CHARS) content = content.slice(0, MAX_FILE_CHARS);
          next.push({ name: file.name, content, truncated });
        } catch (e) {
          setMessages((prev) => [...prev, { role: 'notice', text: '⚠️ ' + (language === 'it'
            ? `Impossibile leggere il PDF "${file.name}": ${e instanceof Error ? e.message : String(e)}`
            : `Could not read PDF "${file.name}": ${e instanceof Error ? e.message : String(e)}`) }]);
        }
        continue;
      }

      const isTextLike = TEXT_FILE_EXT.test(file.name)
        || file.type.startsWith('text/')
        || file.type === 'application/json'
        || file.type === 'application/xml';
      if (!isTextLike) {
        setMessages((prev) => [...prev, { role: 'notice', text: '⚠️ ' + (language === 'it'
          ? `"${file.name}": tipo non supportato. Sono supportati file di testo (txt, md, csv, json, codice…) e PDF. Word/immagini non ancora.`
          : `"${file.name}": unsupported type. Text files (txt, md, csv, json, code…) and PDF are supported. Word/images not yet.`) }]);
        continue;
      }
      try {
        let content = await file.text();
        if (content.includes('\u0000')) {
          setMessages((prev) => [...prev, { role: 'notice', text: '⚠️ ' + (language === 'it'
            ? `"${file.name}" sembra un file binario, non leggibile come testo.`
            : `"${file.name}" looks like a binary file, not readable as text.`) }]);
          continue;
        }
        const truncated = content.length > MAX_FILE_CHARS;
        if (truncated) content = content.slice(0, MAX_FILE_CHARS);
        if (next.some((a) => a.name === file.name)) continue; // avoid duplicates
        next.push({ name: file.name, content, truncated });
      } catch {
        setMessages((prev) => [...prev, { role: 'notice', text: '⚠️ ' + (language === 'it'
          ? `Impossibile leggere "${file.name}".`
          : `Could not read "${file.name}".`) }]);
      }
    }
    setAttachments(next);
    inputRef.current?.focus();
  };

  const removeAttachment = (name: string) => setAttachments((prev) => prev.filter((a) => a.name !== name));

  // File blocks only (the shared [CONTENUTO REALE] wrapper is added in sendMessage).
  const buildAttachmentBlocks = (): string => {
    if (attachments.length === 0) return '';
    return '\n\n' + attachments
      .map((a) => `<file nome="${a.name}"${a.truncated ? ' troncato="true"' : ''}>\n${a.content}\n</file>`)
      .join('\n\n');
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if ((!text && attachments.length === 0) || isStreaming) return;

    // Gather context from attachments and/or the active page into one shared block.
    let context = '';
    const labels: string[] = [];

    if (attachments.length > 0) {
      context += buildAttachmentBlocks();
      labels.push(`📎 ${attachments.map((a) => a.name).join(', ')}`);
    }

    if (usePage) {
      const page = await getPage();
      if (!page?.ok || !page.text) { showPageNotice(page?.error); return; }
      const safeTitle = (page.title ?? '').replace(/"/g, "'");
      context += `\n\n<pagina titolo="${safeTitle}" url="${page.url ?? ''}">\n${page.text}\n</pagina>`;
      labels.push(`📄 ${page.title || page.url}`);
    }

    const hasContext = context.length > 0;
    const langName = SUMMARY_LANG_NAMES[summaryLang];

    // The user's typed text (which may start with a /skill command) MUST stay at the very
    // start so the skill parser detects it. The provided content goes AFTER, in a single
    // [CONTENUTO REALE] block — the same marker the auto-fetch/skills already use — so skills
    // work uniformly on pasted text, URLs, attached files and the current page.
    const userPart = text || (language === 'it'
      ? 'Analizza il contenuto fornito qui sotto e dimmi cosa contiene.'
      : 'Analyze the provided content below and tell me what it contains.');

    let full = userPart;
    if (hasContext) {
      full = `${userPart}\n\n[CONTENUTO REALE — fonte fornita dal sistema (pagina e/o file). Usa ESCLUSIVAMENTE questo testo come fonte, non inventare. Rispondi in ${langName}. Se l'utente chiede di mostrare il contenuto, riportalo così com'è senza tradurlo.]${context}\n[/CONTENUTO REALE]`;
    }

    const display = labels.length > 0
      ? (text ? `${text}\n\n${labels.join('   ')}` : labels.join('   '))
      : text;

    setInputText('');
    setAttachments([]);
    submitPrompt(display, full, { skipAutoFetch: hasContext });
  };

  const newSession = () => {
    chrome.runtime.sendMessage({ type: 'CHAT_NEW_SESSION' }).catch(() => {});
    setMessages([]);
    setError(null);
    setIsStreaming(false);
    inputRef.current?.focus();
  };

  const copyConversation = async () => {
    const transcript = messages
      .filter((m) => m.role !== 'notice')
      .map((m) => `${m.role === 'user' ? '👤' : '🤖'} ${m.text}`)
      .join('\n\n');
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = transcript;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
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

  const handleOpenDeepSeek = useCallback(() => {
    chrome.tabs.create({ url: 'https://chat.deepseek.com', active: true });
    setWaitingForToken(true);
  }, []);

  const handleRetryAuth = useCallback(() => {
    chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' })
      .then((resp: { hasToken?: boolean } | undefined) => {
        setHasToken(resp?.hasToken ?? false);
        setWaitingForToken(false);
      })
      .catch(() => setHasToken(false));
  }, []);

  if (hasToken === false) {
    return (
      <div className="flex flex-col h-full p-5 gap-4">
        {/* Icon + title */}
        <div className="flex flex-col items-center pt-6 gap-2 text-center">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} style={{ color: 'var(--ds-text-tertiary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <p className="text-sm font-medium" style={{ color: 'var(--ds-text)' }}>
            {t.chatLoginRequired}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--ds-text-tertiary)' }}>
            {t.chatLoginNote}
          </p>
        </div>

        {/* Steps */}
        <div className="ds-surface-panel rounded-xl p-4 space-y-2.5">
          {[t.chatLoginStep1, t.chatLoginStep2, t.chatLoginStep3].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
              <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: 'var(--ds-blue-light)', color: 'var(--ds-blue)' }}>
                {i + 1}
              </span>
              <span className="leading-relaxed pt-0.5">{step.replace(/^\d+\.\s*/, '')}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        {waitingForToken ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 text-[12px]" style={{ color: 'var(--ds-text-tertiary)' }}>
              <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {t.chatLoginWaiting}
            </div>
            <button
              onClick={handleRetryAuth}
              className="ds-btn-primary w-full py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-150"
            >
              {t.chatLoginRetry}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleOpenDeepSeek}
              className="ds-btn-primary w-full py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-150 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {t.chatLoginOpen}
            </button>
            <button
              onClick={handleRetryAuth}
              className="ds-btn-secondary w-full py-2 text-xs rounded-xl transition-all duration-150"
            >
              {t.chatLoginRetry}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--ds-border)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--ds-text)' }}>{t.chatTitle}</span>
        <div className="flex items-center gap-1.5">
          {messages.some((m) => m.role !== 'notice') && (
            <button
              onClick={copyConversation}
              className="text-xs px-2.5 py-1 rounded-md flex items-center gap-1"
              style={{ color: copiedAll ? 'var(--ds-success, #16a34a)' : 'var(--ds-text-tertiary)', background: 'var(--ds-surface)' }}
              title={language === 'it' ? 'Copia conversazione' : 'Copy conversation'}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={copiedAll ? 'M5 13l4 4L19 7' : 'M8 16h8M8 12h8m-7-8h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2z'} />
              </svg>
              {copiedAll ? (language === 'it' ? 'Copiato' : 'Copied') : (language === 'it' ? 'Copia' : 'Copy')}
            </button>
          )}
          <button
            onClick={newSession}
            className="text-xs px-2.5 py-1 rounded-md"
            style={{ color: 'var(--ds-text-tertiary)', background: 'var(--ds-surface)' }}
            title={t.chatNewSession}
          >
            {t.chatNewSession}
          </button>
        </div>
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
        {messages.map((msg, i) =>
          msg.role === 'notice' ? (
            <div
              key={i}
              className="mb-3 mx-1 rounded-lg px-3 py-2 text-[11px] leading-relaxed flex items-start gap-1.5"
              style={{
                background: 'var(--ds-warning-bg, rgba(245,158,11,0.12))',
                color: 'var(--ds-warning, #b45309)',
                border: '1px solid var(--ds-warning, #f59e0b)',
              }}
            >
              <span>{msg.text}</span>
            </div>
          ) : (
            <ChatMessage
              key={i}
              message={msg}
              isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
            />
          )
        )}
        {error && <div className="text-xs text-red-400 text-center mt-2">{error}</div>}
      </div>

      {/* Page tools: summarize current page + language + ask-about-page toggle */}
      <div className="px-3 pt-2 flex items-center gap-1.5 flex-wrap" style={{ borderTop: '1px solid var(--ds-border)' }}>
        <button
          onClick={handleSummarize}
          disabled={isStreaming}
          className="ds-btn-secondary px-2.5 py-1 text-[11px] font-medium rounded-lg flex items-center gap-1 disabled:opacity-40"
          title={language === 'it' ? 'Riassumi la pagina aperta nel browser' : 'Summarize the page open in the browser'}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V18a2 2 0 01-2 2z" />
          </svg>
          {language === 'it' ? 'Riassumi pagina' : 'Summarize page'}
        </button>

        <select
          value={summaryLang}
          onChange={(e) => setSummaryLang(e.target.value as SummaryLang)}
          className="text-[11px] rounded-lg px-1.5 py-1 outline-none"
          style={{ background: 'var(--ds-surface)', color: 'var(--ds-text-secondary)', border: '1px solid var(--ds-border)' }}
          title={language === 'it' ? 'Lingua del riassunto' : 'Summary language'}
        >
          {(Object.keys(SUMMARY_LANG_NAMES) as SummaryLang[]).map((code) => (
            <option key={code} value={code}>{SUMMARY_LANG_NAMES[code]}</option>
          ))}
        </select>

        <button
          onClick={() => setUsePage((v) => !v)}
          className="px-2.5 py-1 text-[11px] font-medium rounded-lg flex items-center gap-1 border transition-colors"
          style={{
            background: usePage ? 'var(--ds-blue-light)' : 'var(--ds-surface)',
            color: usePage ? 'var(--ds-blue)' : 'var(--ds-text-tertiary)',
            borderColor: usePage ? 'var(--ds-selected-border, var(--ds-blue))' : 'var(--ds-border)',
          }}
          title={language === 'it' ? 'Se attivo, le tue domande vengono risposte usando la pagina aperta nel browser' : 'When on, your questions are answered using the page open in the browser'}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          {language === 'it' ? 'Chiedi sulla pagina' : 'Ask about page'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ''; }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming}
          className="ds-btn-secondary px-2.5 py-1 text-[11px] font-medium rounded-lg flex items-center gap-1 disabled:opacity-40"
          title={language === 'it' ? 'Allega file di testo (txt, md, csv, json, codice…)' : 'Attach text files (txt, md, csv, json, code…)'}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          {language === 'it' ? 'Allega' : 'Attach'}
        </button>
      </div>

      {/* Input area */}
      <div className="p-3">

        {/* Attached files */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {attachments.map((a) => (
              <span
                key={a.name}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                style={{ background: 'var(--ds-blue-light)', color: 'var(--ds-blue)' }}
                title={a.truncated ? (language === 'it' ? 'File troncato (troppo lungo)' : 'File truncated (too long)') : a.name}
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V18a2 2 0 01-2 2z" />
                </svg>
                <span className="max-w-[120px] truncate">{a.name}</span>
                {a.truncated && <span className="opacity-70">✂</span>}
                <button
                  type="button"
                  onClick={() => removeAttachment(a.name)}
                  className="ml-0.5 hover:opacity-70"
                  aria-label={language === 'it' ? 'Rimuovi' : 'Remove'}
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

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
            disabled={isStreaming || (!inputText.trim() && attachments.length === 0)}
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
