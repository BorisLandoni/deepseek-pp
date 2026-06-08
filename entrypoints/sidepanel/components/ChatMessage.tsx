import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage as ChatMessageType } from '../../../core/types';
import { useLanguage } from '../../../core/i18n/context';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export default function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const { language } = useLanguage();
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const proseRef = useRef<HTMLDivElement>(null);

  const copyLabel = language === 'it' ? 'Copia' : 'Copy';
  const copiedLabel = language === 'it' ? 'Copiato' : 'Copied';

  const markCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopy = async () => {
    const node = proseRef.current;
    const html = node?.innerHTML ?? '';
    // Plain fallback: rendered text (no markdown symbols) so plain-text targets stay clean.
    const plain = node?.innerText ?? message.text;

    // Preferred path: write BOTH text/html (keeps bold, headings, lists when pasted into
    // rich editors like Gmail/Word/WordPress) and text/plain (for plain fields).
    try {
      if (html && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([plain], { type: 'text/plain' }),
          }),
        ]);
        markCopied();
        return;
      }
    } catch {
      /* fall through to selection-based copy */
    }

    // Fallback: select the rendered node and use execCommand — this also carries formatting.
    try {
      if (node) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.execCommand('copy');
        selection?.removeAllRanges();
        markCopied();
        return;
      }
    } catch {
      /* last resort below */
    }

    try {
      await navigator.clipboard.writeText(message.text);
      markCopied();
    } catch {
      /* ignore */
    }
  };

  const showCopy = !isUser && !isStreaming && message.text.trim().length > 0;

  return (
    <div className={`group flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-[var(--ds-surface)] text-[var(--ds-text)] rounded-bl-sm'
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.text}</span>
        ) : (
          <div
            ref={proseRef}
            className="prose prose-sm max-w-none [&_pre]:overflow-x-auto [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:bg-[var(--ds-bg)] [&_code]:text-sm"
          >
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}
        {isStreaming && !isUser && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-[var(--ds-text)] animate-pulse" />
        )}
      </div>

      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? copiedLabel : copyLabel}
          aria-label={copied ? copiedLabel : copyLabel}
          className="mt-1 flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md transition-all duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100"
          style={{ color: copied ? 'var(--ds-success, #16a34a)' : 'var(--ds-text-tertiary)' }}
        >
          {copied ? (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16h8M8 12h8m-7-8h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
          )}
          {copied ? copiedLabel : copyLabel}
        </button>
      )}
    </div>
  );
}
