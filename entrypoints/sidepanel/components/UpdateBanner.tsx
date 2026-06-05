import { useState } from 'react';
import type { UpdateInfo } from '../../../core/update/checker';
import { useLanguage } from '../../../core/i18n/context';

interface Props {
  update: UpdateInfo;
  onDismiss: () => void;
}

export default function UpdateBanner({ update, onDismiss }: Props) {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    // Open download URL in a new tab — browser handles the download natively
    await chrome.tabs.create({ url: update.downloadUrl, active: false });
    setDownloading(false);
    setDownloaded(true);
  };

  return (
    <div
      className="flex items-start gap-2 px-3 py-2 text-[11px]"
      style={{
        background: 'var(--ds-warning-bg)',
        borderBottom: '1px solid var(--ds-warning)',
        color: 'var(--ds-text)',
      }}
    >
      <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--ds-warning)' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>

      <div className="flex-1 min-w-0">
        {downloaded ? (
          <span style={{ color: 'var(--ds-success)' }}>{t.updateInstallHint}</span>
        ) : (
          <span>{t.updateAvailable.replace('{version}', update.latestVersion)}</span>
        )}
      </div>

      {!downloaded && (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="shrink-0 px-2 py-0.5 rounded text-[10px] font-medium transition-all duration-150 disabled:opacity-50"
          style={{ background: 'var(--ds-warning)', color: '#fff' }}
        >
          {downloading ? '...' : t.updateDownload}
        </button>
      )}

      <button
        onClick={onDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        title={t.updateDismiss}
        style={{ color: 'var(--ds-text-secondary)' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
