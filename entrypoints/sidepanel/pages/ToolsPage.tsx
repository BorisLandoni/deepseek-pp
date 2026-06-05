import { useEffect, useState } from 'react';
import { useLanguage } from '../../../core/i18n/context';

type PermissionState = 'idle' | 'granting' | 'granted' | 'denied' | 'error';
type DiagState = 'idle' | 'running' | 'done' | 'err';
type DiagResult = Record<string, { status: number; length: number; error?: string; preview?: string }>;

function DiagSearch() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<DiagState>('idle');
  const [result, setResult] = useState<DiagResult | null>(null);

  const run = async () => {
    setState('running');
    setResult(null);
    try {
      const res = await chrome.runtime.sendMessage({ type: 'DIAGNOSE_WEB_SEARCH', payload: { query } });
      setResult(res as DiagResult);
      setState('done');
    } catch {
      setState('err');
    }
  };

  const inputStyle = {
    background: 'var(--ds-bg)',
    borderColor: 'var(--ds-border)',
    color: 'var(--ds-text)',
  };

  return (
    <div className="ds-surface-panel rounded-xl p-4 space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && run()}
          placeholder={t.toolsDiagPlaceholder}
          className="flex-1 px-3 py-2 text-xs rounded-lg border outline-none"
          style={inputStyle}
        />
        <button
          onClick={run}
          disabled={state === 'running' || !query.trim()}
          className="ds-btn-secondary shrink-0 px-3 py-2 text-[11px] font-medium rounded-lg disabled:opacity-40"
        >
          {state === 'running' ? t.toolsDiagRunning : t.toolsDiagRun}
        </button>
      </div>
      {result && (
        <div className="text-[11px] space-y-2">
          {Object.entries(result).map(([domain, info]) => (
            <div key={domain} className="rounded-lg px-3 py-2" style={{
              background: info.status >= 200 && info.status < 400 ? 'var(--ds-success-bg)' : 'var(--ds-danger-bg)',
            }}>
              <div style={{ fontWeight: 600, color: 'var(--ds-text)' }}>{domain}</div>
              <div style={{ color: 'var(--ds-text-secondary)' }}>
                HTTP {info.status} · {info.length} {t.toolsDiagBytes}
                {info.error && <span style={{ color: 'var(--ds-danger)' }}> · {t.toolsDiagError}: {info.error}</span>}
              </div>
              {info.preview && (
                <div className="mt-1 p-2 rounded text-[10px] leading-relaxed" style={{
                  background: 'var(--ds-bg)', color: 'var(--ds-text-secondary)', maxHeight: 80, overflow: 'hidden',
                }}>
                  {info.preview.slice(0, 300)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type ToolKey = 'web_search' | 'web_fetch';

export default function ToolsPage() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<Record<ToolKey, boolean>>({
    web_search: true,
    web_fetch: true,
  });
  const [permState, setPermState] = useState<PermissionState>('idle');
  const [permUrl, setPermUrl] = useState('');
  const [allSitesState, setAllSitesState] = useState<PermissionState>('idle');

  const TOOLS = [
    {
      key: 'web_search' as ToolKey,
      name: t.toolsWebSearchName,
      description: t.toolsWebSearchDesc,
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    },
    {
      key: 'web_fetch' as ToolKey,
      name: t.toolsWebFetchName,
      description: t.toolsWebFetchDesc,
      icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
  ];

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_WEB_TOOL_SETTINGS' }).then((result: Record<string, boolean>) => {
      if (result) setSettings((prev) => ({ ...prev, ...result }));
    });
  }, []);

  const handleToggle = async (key: ToolKey, enabled: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: enabled }));
    await chrome.runtime.sendMessage({ type: 'SET_WEB_TOOL_SETTING', payload: { name: key, enabled } });
  };

  const handleGrantPermission = async () => {
    const trimmed = permUrl.trim();
    if (!trimmed) return;
    let origin: string;
    try {
      origin = new URL(trimmed).origin + '/*';
    } catch {
      setPermState('error');
      return;
    }
    setPermState('granting');
    const result = await chrome.runtime.sendMessage({
      type: 'REQUEST_HOST_PERMISSION',
      payload: { origins: [origin] },
    });
    setPermState(result?.ok ? 'granted' : 'denied');
  };

  const handleGrantAllSites = async () => {
    setAllSitesState('granting');
    const result = await chrome.runtime.sendMessage({
      type: 'REQUEST_HOST_PERMISSION',
      payload: { origins: ['http://*/*', 'https://*/*'] },
    });
    setAllSitesState(result?.ok ? 'granted' : 'denied');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <h2 className="text-[13px] font-medium" style={{ color: 'var(--ds-text)' }}>
          {t.toolsTitle}
        </h2>
        <p className="text-[11px]" style={{ color: 'var(--ds-text-tertiary)' }}>
          {t.toolsDescription}
        </p>
      </div>

      <div className="space-y-2">
        {TOOLS.map((tool) => (
          <div key={tool.key} className="ds-surface-panel rounded-xl p-4 flex items-start gap-3">
            <svg
              className="w-5 h-5 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ color: settings[tool.key] ? 'var(--ds-blue)' : 'var(--ds-text-tertiary)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} />
            </svg>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium truncate" style={{ color: 'var(--ds-text)' }}>
                  {tool.name}
                </div>
                <button
                  onClick={() => handleToggle(tool.key, !settings[tool.key])}
                  className="relative shrink-0 w-10 h-[22px] rounded-full transition-colors duration-200"
                  style={{ background: settings[tool.key] ? 'var(--ds-blue)' : 'var(--ds-border)' }}
                >
                  <span
                    className="ds-switch-thumb absolute top-[3px] left-[3px] w-4 h-4 rounded-full transition-transform duration-200"
                    style={{ transform: settings[tool.key] ? 'translateX(18px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
              <div className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--ds-text-secondary)' }}>
                {tool.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[11px] px-3 py-2 rounded-lg" style={{ color: 'var(--ds-text-tertiary)', background: 'var(--ds-surface)' }}>
        {t.toolsDisabledNote}
      </div>

      <section className="space-y-2">
        <h2 className="text-[13px] font-medium" style={{ color: 'var(--ds-text)' }}>
          {t.toolsDiagTitle}
        </h2>
        <p className="text-[11px]" style={{ color: 'var(--ds-text-tertiary)' }}>
          {t.toolsDiagDescription}
        </p>
        <DiagSearch />
      </section>

      <section className="space-y-2">
        <h2 className="text-[13px] font-medium" style={{ color: 'var(--ds-text)' }}>
          {t.toolsPermTitle}
        </h2>
        <p className="text-[11px]" style={{ color: 'var(--ds-text-tertiary)' }}>
          {t.toolsPermDescription}
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com"
            value={permUrl}
            onChange={(e) => { setPermUrl(e.target.value); setPermState('idle'); }}
            onKeyDown={(e) => e.key === 'Enter' && handleGrantPermission()}
            className="flex-1 px-3 py-2 text-xs rounded-lg border outline-none transition-colors focus:border-[var(--ds-blue)]"
            style={{ background: 'var(--ds-bg)', borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }}
          />
          <button
            onClick={handleGrantPermission}
            disabled={!permUrl.trim() || permState === 'granting'}
            className="ds-btn-secondary shrink-0 px-3 py-2 text-[11px] font-medium rounded-lg transition-all duration-150 disabled:opacity-40 flex items-center gap-1.5"
          >
            {permState === 'granting' && (
              <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {t.toolsPermGrant}
          </button>
        </div>
        {permState === 'granted' && (
          <div className="text-[11px] px-3 py-2 rounded-lg" style={{ color: 'var(--ds-success)', background: 'var(--ds-success-bg)' }}>
            {t.toolsPermGranted}
          </div>
        )}
        {permState === 'denied' && (
          <div className="text-[11px] px-3 py-2 rounded-lg" style={{ color: 'var(--ds-danger)', background: 'var(--ds-danger-bg)' }}>
            {t.toolsPermDenied}
          </div>
        )}
        {permState === 'error' && (
          <div className="text-[11px] px-3 py-2 rounded-lg" style={{ color: 'var(--ds-danger)', background: 'var(--ds-danger-bg)' }}>
            {t.toolsPermInvalidUrl}
          </div>
        )}

        <div className="pt-1">
          <button
            onClick={handleGrantAllSites}
            disabled={allSitesState === 'granting' || allSitesState === 'granted'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[12px] font-medium rounded-xl transition-all duration-150 disabled:opacity-50"
            style={{
              background: allSitesState === 'granted' ? 'var(--ds-success-bg)' : 'var(--ds-surface)',
              color: allSitesState === 'granted' ? 'var(--ds-success)' : 'var(--ds-blue)',
              border: `1px solid ${allSitesState === 'granted' ? 'var(--ds-success-border)' : 'var(--ds-blue)'}`,
            }}
          >
            {allSitesState === 'granting' ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : allSitesState === 'granted' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {allSitesState === 'granting'
              ? t.toolsGrantAllSitesGranting
              : allSitesState === 'granted'
                ? t.toolsGrantAllSitesGranted
                : t.toolsGrantAllSites}
          </button>
          <p className="text-[10px] mt-1.5 text-center" style={{ color: 'var(--ds-text-tertiary)' }}>
            {t.toolsGrantAllSitesHint}
          </p>
        </div>
      </section>
    </div>
  );
}
