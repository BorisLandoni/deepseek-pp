import { useEffect, useRef, useState } from 'react';
import type { UpdateInfo } from '../../../core/update/checker';
import {
  DEFAULT_BACKGROUND_OPACITY,
  clampBackgroundOpacity,
  normalizeBackgroundConfig,
} from '../../../core/background/config';
import {
  DEFAULT_PET_CONFIG,
  clampPetOpacity,
  clampPetSize,
  normalizePetConfig,
} from '../../../core/pet/config';
import type { BackgroundConfig, Memory, PetConfig, PetPosition, SyncConfig, SyncCounts } from '../../../core/types';
import { SVG_PATHS } from '../constants';
import { getChatEnabled, setChatEnabled } from '../../../core/chat/store';
import ScenarioManager from '../components/ScenarioManager';
import { useLanguage } from '../../../core/i18n/context';
import type { Language } from '../../../core/i18n/translations';
import { LANGUAGE_NAMES } from '../../../core/i18n/translations';

const DEFAULT_SYNC_CONFIG: SyncConfig = {
  url: '',
  username: '',
  password: '',
  remotePath: 'DeepSeekPP',
  lastSyncAt: null,
};

const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  enabled: false,
  type: 'upload',
  url: '',
  imageData: '',
  opacity: DEFAULT_BACKGROUND_OPACITY,
};

type SyncStatus = 'idle' | 'testing' | 'uploading' | 'downloading' | 'success' | 'error';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const [memoryCount, setMemoryCount] = useState(0);
  const [version, setVersion] = useState('');
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(DEFAULT_SYNC_CONFIG);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [expertMode, setExpertMode] = useState(false);
  const [bgEnabled, setBgEnabled] = useState(false);
  const [bgType, setBgType] = useState<'upload' | 'url'>('upload');
  const [bgUrl, setBgUrl] = useState('');
  const [bgImageData, setBgImageData] = useState('');
  const [bgOpacity, setBgOpacity] = useState(DEFAULT_BACKGROUND_OPACITY);
  const [petEnabled, setPetEnabled] = useState(DEFAULT_PET_CONFIG.enabled);
  const [petPosition, setPetPosition] = useState<PetPosition>(DEFAULT_PET_CONFIG.position);
  const [petSize, setPetSize] = useState(DEFAULT_PET_CONFIG.size);
  const [petOpacity, setPetOpacity] = useState(DEFAULT_PET_CONFIG.opacity);
  const [petMotion, setPetMotion] = useState(DEFAULT_PET_CONFIG.motion);
  const [chatEnabled, setChatEnabledState] = useState(false);

  useEffect(() => {
    getChatEnabled().then(setChatEnabledState);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgConfigRef = useRef<BackgroundConfig>(DEFAULT_BACKGROUND_CONFIG);
  const petConfigRef = useRef<PetConfig>(DEFAULT_PET_CONFIG);

  const bgPreview = bgType === 'url' ? bgUrl : bgImageData;
  const syncBusy = syncStatus === 'testing' || syncStatus === 'uploading' || syncStatus === 'downloading';

  const syncBgState = (config: BackgroundConfig) => {
    bgConfigRef.current = config;
    setBgEnabled(config.enabled);
    setBgType(config.type);
    setBgUrl(config.url ?? '');
    setBgImageData(config.imageData ?? '');
    setBgOpacity(config.opacity);
  };

  const syncPetState = (config: PetConfig) => {
    petConfigRef.current = config;
    setPetEnabled(config.enabled);
    setPetPosition(config.position);
    setPetSize(config.size);
    setPetOpacity(config.opacity);
    setPetMotion(config.motion);
  };

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_MEMORIES' }).then((list: Memory[]) => {
      setMemoryCount(list?.length ?? 0);
    });
    chrome.runtime.sendMessage({ type: 'GET_CONFIG' }).then((cfg: { version: string }) => {
      setVersion(cfg?.version ?? '');
    });
    chrome.runtime.sendMessage({ type: 'GET_SYNC_CONFIG' }).then((cfg: SyncConfig | null) => {
      if (cfg) setSyncConfig(cfg);
    });
    chrome.runtime.sendMessage({ type: 'GET_MODEL_TYPE' }).then((val: string | null) => {
      setExpertMode(val === 'expert');
    });
    chrome.runtime.sendMessage({ type: 'GET_BACKGROUND' }).then((cfg: BackgroundConfig | null) => {
      const normalized = normalizeBackgroundConfig(cfg);
      if (normalized) syncBgState(normalized);
    });
    chrome.runtime.sendMessage({ type: 'GET_PET' }).then((cfg: PetConfig | null) => {
      syncPetState(normalizePetConfig(cfg));
    });

    const handlePetUpdate = (message: { type?: string; config?: PetConfig | null }) => {
      if (message.type === 'PET_UPDATED') {
        syncPetState(normalizePetConfig(message.config));
      }
    };
    chrome.runtime.onMessage.addListener(handlePetUpdate);
    return () => { chrome.runtime.onMessage.removeListener(handlePetUpdate); };
  }, []);

  const handleExpertToggle = async (enabled: boolean) => {
    setExpertMode(enabled);
    await chrome.runtime.sendMessage({ type: 'SET_MODEL_TYPE', payload: enabled ? 'expert' : null });
  };

  const saveBgConfig = async (patch: Partial<BackgroundConfig>) => {
    const config = normalizeBackgroundConfig({ ...bgConfigRef.current, ...patch });
    if (!config) return;
    bgConfigRef.current = config;
    await chrome.runtime.sendMessage({ type: 'SAVE_BACKGROUND', payload: config });
  };

  const handleBgToggle = async (enabled: boolean) => {
    setBgEnabled(enabled);
    await saveBgConfig({ enabled });
  };

  const resizeImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const MAX = 1920;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          const scale = Math.min(MAX / width, MAX / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')); };
      img.src = objectUrl;
    });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    let data: string;
    try { data = await resizeImage(file); } catch { return; }
    setBgType('upload');
    setBgImageData(data);
    setBgEnabled(true);
    bgConfigRef.current = { ...bgConfigRef.current, enabled: true, type: 'upload', imageData: data, url: '' };
    await saveBgConfig({ enabled: true, type: 'upload', imageData: data, url: '' });
    e.target.value = '';
  };

  const handleUrlConfirm = async () => {
    if (!bgUrl.trim()) return;
    setBgType('url');
    setBgImageData('');
    setBgEnabled(true);
    bgConfigRef.current = { ...bgConfigRef.current, enabled: true, type: 'url', url: bgUrl, imageData: '' };
    await saveBgConfig({ enabled: true, type: 'url', url: bgUrl, imageData: '' });
  };

  const handleOpacityChange = (val: number) => {
    const opacity = clampBackgroundOpacity(val);
    setBgOpacity(opacity);
    bgConfigRef.current = { ...bgConfigRef.current, opacity };
    void saveBgConfig({ opacity });
  };

  const handleClearBg = async () => {
    setBgEnabled(false); setBgType('upload'); setBgUrl(''); setBgImageData(''); setBgOpacity(DEFAULT_BACKGROUND_OPACITY);
    bgConfigRef.current = DEFAULT_BACKGROUND_CONFIG;
    await chrome.runtime.sendMessage({ type: 'CLEAR_BACKGROUND' });
  };

  const savePetConfig = async (patch: Partial<PetConfig>) => {
    const config = normalizePetConfig({ ...petConfigRef.current, ...patch });
    petConfigRef.current = config;
    await chrome.runtime.sendMessage({ type: 'SAVE_PET', payload: config });
  };

  const handlePetToggle = async (enabled: boolean) => {
    setPetEnabled(enabled);
    await savePetConfig({ enabled });
  };

  const handlePetPositionChange = async (position: Exclude<PetPosition, 'custom'>) => {
    setPetPosition(position);
    await savePetConfig({ position });
  };

  const handlePetSizeChange = (value: number) => {
    const size = clampPetSize(value);
    setPetSize(size);
    petConfigRef.current = { ...petConfigRef.current, size };
    void savePetConfig({ size });
  };

  const handlePetOpacityChange = (value: number) => {
    const opacity = clampPetOpacity(value);
    setPetOpacity(opacity);
    petConfigRef.current = { ...petConfigRef.current, opacity };
    void savePetConfig({ opacity });
  };

  const handlePetMotionToggle = async (motion: boolean) => {
    setPetMotion(motion);
    await savePetConfig({ motion });
  };

  const updateField = (field: keyof SyncConfig, value: string) => {
    setSyncConfig((prev) => ({ ...prev, [field]: value }));
  };

  const requestPermission = async (url: string): Promise<boolean> => {
    try {
      const origin = new URL(url).origin + '/*';
      return await chrome.permissions.request({ origins: [origin] });
    } catch { return false; }
  };

  const runSyncAction = async (
    status: 'testing' | 'uploading' | 'downloading',
    action: () => Promise<void>,
  ) => {
    if (!syncConfig.url) return;
    setSyncStatus(status);
    setSyncMessage('');
    const granted = await requestPermission(syncConfig.url);
    if (!granted) {
      setSyncStatus('error');
      setSyncMessage(t.settingsSyncPermError);
      return;
    }
    try {
      await chrome.runtime.sendMessage({ type: 'SAVE_SYNC_CONFIG', payload: syncConfig });
      await action();
    } catch (e) {
      setSyncStatus('error');
      setSyncMessage((e as Error).message || t.settingsSyncFailed);
    }
  };

  const formatSyncCounts = (counts?: SyncCounts) => {
    if (!counts) return '';
    return t.settingsSyncCountFmt
      .replace('{memories}', String(counts.memories))
      .replace('{skills}', String(counts.skills))
      .replace('{presets}', String(counts.presets));
  };

  const handleTest = () => {
    void runSyncAction('testing', async () => {
      const result = await chrome.runtime.sendMessage({ type: 'WEBDAV_TEST', payload: syncConfig });
      if (result?.ok) {
        setSyncStatus('success');
        setSyncMessage(t.settingsSyncTestSuccess);
      } else {
        throw new Error(result?.error || t.settingsSyncFailed);
      }
    });
  };

  const handleUploadLocal = () => {
    if (!confirm(t.settingsSyncUploadConfirm)) return;
    void runSyncAction('uploading', async () => {
      const result = await chrome.runtime.sendMessage({ type: 'WEBDAV_UPLOAD_LOCAL' });
      if (result?.ok) {
        setSyncConfig((prev) => ({ ...prev, lastSyncAt: result.lastSyncAt }));
        setSyncStatus('success');
        setSyncMessage(t.settingsSyncUploadSuccess.replace('{counts}', formatSyncCounts(result.counts)));
      } else {
        throw new Error(result?.error || t.settingsSyncFailed);
      }
    });
  };

  const handleDownloadRemote = () => {
    if (!confirm(t.settingsSyncDownloadConfirm)) return;
    void runSyncAction('downloading', async () => {
      const result = await chrome.runtime.sendMessage({ type: 'WEBDAV_DOWNLOAD_REMOTE' });
      if (result?.ok) {
        setSyncConfig((prev) => ({ ...prev, lastSyncAt: result.lastSyncAt }));
        setSyncStatus('success');
        setSyncMessage(t.settingsSyncDownloadSuccess.replace('{counts}', formatSyncCounts(result.counts)));
        setMemoryCount(result.counts?.memories ?? 0);
      } else {
        throw new Error(result?.error || t.settingsSyncFailed);
      }
    });
  };

  const handleExport = async () => {
    const memories: Memory[] = await chrome.runtime.sendMessage({ type: 'GET_MEMORIES' });
    const blob = new Blob([JSON.stringify(memories, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepseek-pp-memories-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const memories: Memory[] = JSON.parse(text);
        for (const mem of memories) {
          const { id, createdAt, updatedAt, accessCount, lastAccessedAt, ...rest } = mem;
          await chrome.runtime.sendMessage({ type: 'SAVE_MEMORY', payload: rest });
        }
        setMemoryCount((c) => c + memories.length);
      } catch {
        alert(t.settingsJsonError);
      }
    };
    input.click();
  };

  const handleExportBackup = async () => {
    const resp = await chrome.runtime.sendMessage({ type: 'EXPORT_LOCAL_BACKUP' });
    if (!resp?.ok || !resp.snapshot) {
      alert(language === 'it' ? 'Esportazione backup non riuscita.' : 'Backup export failed.');
      return;
    }
    const payload = {
      _type: 'deepseek-pp-backup',
      _version: version,
      exportedAt: new Date().toISOString(),
      data: resp.snapshot,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepseek-pp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      let parsed: { _type?: string; data?: unknown } ;
      try {
        parsed = JSON.parse(await file.text());
      } catch {
        alert(t.settingsJsonError);
        return;
      }
      const snapshot = parsed?._type === 'deepseek-pp-backup' ? parsed.data : parsed;
      if (!confirm(language === 'it'
        ? 'Importare il backup? Sostituirà memorie, skill personalizzate e preset attuali.'
        : 'Import backup? This will replace current memories, custom skills and presets.')) return;
      const resp = await chrome.runtime.sendMessage({ type: 'IMPORT_LOCAL_BACKUP', payload: snapshot });
      if (resp?.ok) {
        setMemoryCount(resp.counts?.memories ?? 0);
        alert(language === 'it'
          ? `Backup importato: ${resp.counts?.memories ?? 0} memorie, ${resp.counts?.skills ?? 0} skill, ${resp.counts?.presets ?? 0} preset.`
          : `Backup imported: ${resp.counts?.memories ?? 0} memories, ${resp.counts?.skills ?? 0} skills, ${resp.counts?.presets ?? 0} presets.`);
      } else {
        alert(language === 'it' ? 'Importazione non riuscita.' : 'Import failed.');
      }
    };
    input.click();
  };

  const handleClearAll = async () => {
    if (!confirm(t.settingsClearConfirm)) return;
    const memories: Memory[] = await chrome.runtime.sendMessage({ type: 'GET_MEMORIES' });
    for (const mem of memories) {
      await chrome.runtime.sendMessage({ type: 'DELETE_MEMORY', payload: { id: mem.id } });
    }
    setMemoryCount(0);
  };

  const formatTime = (ts: number | null) => {
    if (!ts) return t.settingsSyncNever;
    return new Date(ts).toLocaleString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const inputClass = 'w-full px-3 py-2 text-xs rounded-lg border outline-none transition-colors focus:border-[var(--ds-blue)]';
  const inputStyle = { background: 'var(--ds-bg)', borderColor: 'var(--ds-border)', color: 'var(--ds-text)' };

  const petPositionItems: Array<{ key: PetPosition; label: string }> = [
    { key: 'bottom-right', label: t.settingsPetPositionRight },
    { key: 'bottom-left', label: t.settingsPetPositionLeft },
  ];
  if (petPosition === 'custom') {
    petPositionItems.push({ key: 'custom', label: t.settingsPetPositionCustom });
  }
  const petPositionGridClass = `grid gap-2 ${petPosition === 'custom' ? 'grid-cols-3' : 'grid-cols-2'}`;

  return (
    <div className="p-4 space-y-5">
      {/* Updates */}
      <UpdateSection />

      {/* Language */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-medium" style={{ color: 'var(--ds-text)' }}>
          {t.settingsLanguageSection}
        </h2>
        <div className="ds-surface-panel rounded-xl p-4">
          <label className="block text-[11px] mb-2" style={{ color: 'var(--ds-text-secondary)' }}>
            {t.settingsLanguageLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(LANGUAGE_NAMES) as [Language, string][]).map(([lang, name]) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className="py-2 rounded-lg text-xs font-medium transition-all duration-150 border"
                style={{
                  background: language === lang ? 'var(--ds-blue-light)' : 'var(--ds-bg)',
                  color: language === lang ? 'var(--ds-blue)' : 'var(--ds-text-secondary)',
                  borderColor: language === lang ? 'var(--ds-selected-border)' : 'var(--ds-border)',
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Model */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-medium" style={{ color: 'var(--ds-text)' }}>
          {t.settingsModelSection}
        </h2>
        <div className="ds-surface-panel rounded-xl p-4 space-y-3">
          <Toggle label={t.settingsExpertMode} description={t.settingsExpertModeDesc} checked={expertMode} onChange={handleExpertToggle} />
          <Toggle label={t.settingsSidebarChat} description={t.settingsSidebarChatDesc} checked={chatEnabled}
            onChange={async (next) => { setChatEnabledState(next); await setChatEnabled(next); }} />
          <Toggle label={t.settingsPet} description={t.settingsPetDesc} checked={petEnabled} onChange={handlePetToggle} />
        </div>
      </section>

      {/* Web access */}
      <WebAccessSection />

      {/* Background */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-medium" style={{ color: 'var(--ds-text)' }}>
          {t.settingsBgSection}
        </h2>
        <div className="ds-surface-panel rounded-xl p-4 space-y-3">
          <Toggle label={t.settingsBgEnabled} description={t.settingsBgEnabledDesc} checked={bgEnabled && !!bgPreview} onChange={handleBgToggle} disabled={!bgPreview} />

          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="ds-btn-secondary flex-1 py-2 text-[11px] font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={SVG_PATHS.upload} />
              </svg>
              {t.settingsBgUpload}
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              placeholder={t.settingsBgUrlPlaceholder}
              value={bgUrl}
              onChange={(e) => setBgUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlConfirm()}
              className={inputClass}
              style={inputStyle}
            />
            <button
              onClick={handleUrlConfirm}
              disabled={!bgUrl.trim()}
              className="ds-btn-secondary shrink-0 px-3 py-2 text-[11px] font-medium rounded-lg transition-all duration-150 disabled:opacity-40"
            >
              {t.settingsBgConfirm}
            </button>
          </div>

          {bgPreview && (
            <div className="relative rounded-lg overflow-hidden border" style={{ borderColor: 'var(--ds-border)', height: '120px' }}>
              <img src={bgPreview} alt={t.settingsBgPreview} className="w-full h-full object-cover" onError={() => { setBgUrl(''); setBgImageData(''); }} />
              <div
                className="absolute inset-0 flex items-center justify-center text-[10px]"
                style={{
                  background: `rgba(var(--ds-bg-rgb), ${(1 - bgOpacity).toFixed(3)})`,
                  backdropFilter: `blur(${((1 - bgOpacity) * 8).toFixed(1)}px)`,
                  WebkitBackdropFilter: `blur(${((1 - bgOpacity) * 8).toFixed(1)}px)`,
                  color: 'var(--ds-text-secondary)',
                  pointerEvents: 'none',
                }}
              >
                {t.settingsBgPreview}
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px]" style={{ color: 'var(--ds-text-secondary)' }}>{t.settingsBgOpacity}</label>
              <span className="text-[11px] font-mono" style={{ color: 'var(--ds-text-tertiary)' }}>{bgOpacity.toFixed(2)}</span>
            </div>
            <input type="range" min="0.05" max="1" step="0.05" value={bgOpacity}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, var(--ds-blue) ${bgOpacity * 100}%, var(--ds-border) ${bgOpacity * 100}%)` }}
            />
          </div>

          {bgPreview && (
            <button onClick={handleClearBg} className="ds-btn-danger w-full py-2 text-[11px] font-medium rounded-lg transition-all duration-150">
              {t.settingsBgClear}
            </button>
          )}
        </div>
      </section>

      {/* Pet */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-medium" style={{ color: 'var(--ds-text)' }}>{t.settingsPetSection}</h2>
        <div className="ds-surface-panel rounded-xl p-4 space-y-3">
          <div className={petPositionGridClass}>
            {petPositionItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { if (item.key !== 'custom') void handlePetPositionChange(item.key); }}
                className={['py-2 text-[11px] font-medium rounded-lg border transition-all duration-150', item.key === 'custom' ? 'cursor-default' : ''].filter(Boolean).join(' ')}
                style={{
                  background: petPosition === item.key ? 'var(--ds-blue-light)' : 'var(--ds-bg)',
                  color: petPosition === item.key ? 'var(--ds-blue)' : 'var(--ds-text-secondary)',
                  borderColor: petPosition === item.key ? 'var(--ds-selected-border)' : 'var(--ds-border)',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <RangeRow label={t.settingsPetSize} value={`${petSize}px`}>
            <input type="range" min="84" max="220" step="4" value={petSize}
              onChange={(e) => handlePetSizeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, var(--ds-blue) ${((petSize - 84) / (220 - 84)) * 100}%, var(--ds-border) ${((petSize - 84) / (220 - 84)) * 100}%)` }}
            />
          </RangeRow>

          <RangeRow label={t.settingsPetOpacity} value={petOpacity.toFixed(2)}>
            <input type="range" min="0.45" max="1" step="0.05" value={petOpacity}
              onChange={(e) => handlePetOpacityChange(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, var(--ds-blue) ${((petOpacity - 0.45) / (1 - 0.45)) * 100}%, var(--ds-border) ${((petOpacity - 0.45) / (1 - 0.45)) * 100}%)` }}
            />
          </RangeRow>

          <Toggle label={t.settingsPetMotion} description={t.settingsPetMotionDesc} checked={petMotion} onChange={handlePetMotionToggle} />
        </div>
      </section>

      {/* Sync */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-medium" style={{ color: 'var(--ds-text)' }}>{t.settingsSyncSection}</h2>
        <div className="ds-surface-panel rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-[11px] mb-1" style={{ color: 'var(--ds-text-secondary)' }}>{t.settingsSyncWebdavUrl}</label>
            <input type="url" placeholder="https://dav.example.com/dav/" value={syncConfig.url}
              onChange={(e) => updateField('url', e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] mb-1" style={{ color: 'var(--ds-text-secondary)' }}>{t.settingsSyncUsername}</label>
              <input type="text" value={syncConfig.username} onChange={(e) => updateField('username', e.target.value)} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-[11px] mb-1" style={{ color: 'var(--ds-text-secondary)' }}>{t.settingsSyncPassword}</label>
              <input type="password" value={syncConfig.password} onChange={(e) => updateField('password', e.target.value)} className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] mb-1" style={{ color: 'var(--ds-text-secondary)' }}>{t.settingsSyncRemotePath}</label>
            <input type="text" value={syncConfig.remotePath} onChange={(e) => updateField('remotePath', e.target.value)} className={inputClass} style={inputStyle} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleTest} disabled={!syncConfig.url || syncBusy}
            className="ds-btn-secondary col-span-2 py-2.5 text-xs font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-40">
            {syncStatus === 'testing'
              ? <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            {t.settingsSyncTest}
          </button>
          <button onClick={handleUploadLocal} disabled={!syncConfig.url || syncBusy}
            className="ds-btn-secondary py-2.5 text-xs font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-40"
            style={syncConfig.url && !syncBusy ? { background: 'var(--ds-blue)', color: 'var(--ds-text-on-primary)', borderColor: 'var(--ds-blue)' } : undefined}>
            {syncStatus === 'uploading'
              ? <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={SVG_PATHS.upload} /></svg>}
            {t.settingsSyncUpload}
          </button>
          <button onClick={handleDownloadRemote} disabled={!syncConfig.url || syncBusy}
            className="ds-btn-secondary py-2.5 text-xs font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-40">
            {syncStatus === 'downloading'
              ? <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={SVG_PATHS.download} /></svg>}
            {t.settingsSyncDownload}
          </button>
        </div>

        {syncMessage && (
          <div className="text-[11px] px-3 py-2 rounded-lg"
            style={{ color: syncStatus === 'error' ? 'var(--ds-danger)' : 'var(--ds-success)', background: syncStatus === 'error' ? 'var(--ds-danger-bg)' : 'var(--ds-success-bg)' }}>
            {syncMessage}
          </div>
        )}

        <div className="text-[11px] text-center" style={{ color: 'var(--ds-text-tertiary)' }}>
          {t.settingsSyncLastSync.replace('{time}', formatTime(syncConfig.lastSyncAt))}
        </div>
      </section>

      {/* Data */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-medium" style={{ color: 'var(--ds-text)' }}>{t.settingsDataSection}</h2>
        <div className="ds-surface-panel rounded-xl p-4">
          <div className="flex justify-between items-center text-sm">
            <span style={{ color: 'var(--ds-text-secondary)' }}>{t.settingsMemoryTotal}</span>
            <span className="text-lg font-semibold" style={{ color: 'var(--ds-blue)' }}>{memoryCount}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport}
            className="ds-btn-secondary flex-1 py-2.5 text-xs font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={SVG_PATHS.download} /></svg>
            {t.settingsExportMemory}
          </button>
          <button onClick={handleImport}
            className="ds-btn-secondary flex-1 py-2.5 text-xs font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={SVG_PATHS.upload} /></svg>
            {t.settingsImportMemory}
          </button>
        </div>
        {/* Full backup (memories + skills + presets) */}
        <div className="ds-surface-panel rounded-xl p-3 space-y-2">
          <div className="text-[11px] font-medium" style={{ color: 'var(--ds-text)' }}>
            {language === 'it' ? 'Backup completo' : 'Full backup'}
          </div>
          <p className="text-[10px]" style={{ color: 'var(--ds-text-tertiary)' }}>
            {language === 'it'
              ? 'Salva o ripristina memorie, skill personalizzate e preset in un unico file. Utile prima di rimuovere l’estensione.'
              : 'Save or restore memories, custom skills and presets in one file. Useful before removing the extension.'}
          </p>
          <div className="flex gap-2">
            <button onClick={handleExportBackup}
              className="ds-btn-secondary flex-1 py-2 text-[11px] font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={SVG_PATHS.download} /></svg>
              {language === 'it' ? 'Esporta backup' : 'Export backup'}
            </button>
            <button onClick={handleImportBackup}
              className="ds-btn-secondary flex-1 py-2 text-[11px] font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={SVG_PATHS.upload} /></svg>
              {language === 'it' ? 'Importa backup' : 'Import backup'}
            </button>
          </div>
        </div>

        <button onClick={handleClearAll} className="ds-btn-danger w-full py-2.5 text-xs font-medium rounded-lg transition-all duration-150">
          {t.settingsClearAll}
        </button>
      </section>

      {/* About */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-medium" style={{ color: 'var(--ds-text)' }}>{t.settingsAbout}</h2>
        <div className="ds-surface-panel rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="DeepSeek++" className="w-8 h-8" />
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--ds-text)' }}>DeepSeek++ v{version}</div>
              <div className="text-[11px]" style={{ color: 'var(--ds-text-tertiary)' }}>{t.settingsAboutDesc}</div>
            </div>
          </div>

          {/* This fork */}
          <a href="https://github.com/BorisLandoni/deepseek-pp" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] mt-1 transition-colors hover:opacity-80"
            style={{ color: 'var(--ds-text-secondary)' }}>
            <GitHubIcon />
            GitHub (BorisLandoni/deepseek-pp)
          </a>

          {/* Original fork source */}
          <div className="text-[11px] mt-1 flex items-center gap-1.5" style={{ color: 'var(--ds-text-tertiary)' }}>
            <span>{t.aboutFork}</span>
            <a href="https://github.com/zhu1090093659/deepseek-pp" target="_blank" rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity underline underline-offset-2"
              style={{ color: 'var(--ds-text-secondary)' }}>
              zhu1090093659/deepseek-pp
            </a>
          </div>

          {/* Translation credit */}
          <div className="text-[11px] mt-1" style={{ color: 'var(--ds-text-tertiary)' }}>
            {t.aboutTranslation}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <ScenarioManager />
      </section>
    </div>
  );
}

function UpdateSection() {
  const { t } = useLanguage();
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<'ok' | 'error' | null>(null);
  const checkResultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [repoPath, setRepoPath] = useState('');
  const [installPath, setInstallPath] = useState('');
  const [autoUpdateStatus, setAutoUpdateStatus] = useState<string | null>(null);
  const version = chrome.runtime.getManifest().version;

  // Load stored paths
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_AUTO_UPDATE_PATH' })
      .then((r: { path: string }) => setRepoPath(r.path ?? ''))
      .catch(() => {});
    chrome.storage.local.get('deepseek_pp_install_path')
      .then((d) => setInstallPath((d.deepseek_pp_install_path as string) ?? ''))
      .catch(() => {});
  }, []);

  // Listen for auto-update progress broadcasts
  useEffect(() => {
    const handler = (msg: { type?: string; status?: string }) => {
      if (msg.type !== 'AUTO_UPDATE_PROGRESS') return;
      switch (msg.status) {
        case 'pulling':   setAutoUpdateStatus(t.settingsAutoUpdatePulling); break;
        case 'building':  setAutoUpdateStatus(t.settingsAutoUpdateBuilding); break;
        case 'copying':   setAutoUpdateStatus('Copia file in corso…'); break;
        case 'reloading': setAutoUpdateStatus(t.settingsAutoUpdateReloading); break;
        case 'error':     setAutoUpdateStatus(null); break;
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, [t]);

  const saveRepoPath = async (p: string) => {
    setRepoPath(p);
    await chrome.runtime.sendMessage({ type: 'SET_AUTO_UPDATE_PATH', payload: { path: p } });
  };

  const saveInstallPath = async (p: string) => {
    setInstallPath(p);
    await chrome.storage.local.set({ deepseek_pp_install_path: p });
  };

  const handleAutoUpdate = async () => {
    setAutoUpdateStatus(t.settingsAutoUpdatePulling);
    const result: { ok: boolean; error?: string } = await chrome.runtime.sendMessage({
      type: 'AUTO_UPDATE_VIA_GIT',
      payload: { path: repoPath.trim(), installPath: installPath.trim() || undefined },
    });
    if (!result.ok) {
      setAutoUpdateStatus(null);
      if (result.error === 'no_shell') alert(t.settingsAutoUpdateNoShell);
      else alert(`${t.settingsAutoUpdateErrorShell}\n\n${result.error ?? ''}`);
    }
    // On success the extension reloads itself — no further UI needed
  };

  // Load cached update info on mount
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_UPDATE_INFO' })
      .then((info: UpdateInfo | null) => setUpdateInfo(info))
      .catch(() => {});
  }, []);

  const handleCheck = async () => {
    setChecking(true);
    setCheckResult(null);
    if (checkResultTimer.current) clearTimeout(checkResultTimer.current);
    try {
      const info: UpdateInfo | null = await chrome.runtime.sendMessage({ type: 'FORCE_CHECK_FOR_UPDATE' });
      // Always update state — even if result is identical, the checkedAt timestamp changes
      setUpdateInfo(info ?? { available: false, latestVersion: version, currentVersion: version, downloadUrl: '', releaseUrl: '', checkedAt: Date.now() });
      setCheckResult('ok');
    } catch {
      setCheckResult('error');
    } finally {
      setChecking(false);
      // Auto-clear the result indicator after 4 seconds
      checkResultTimer.current = setTimeout(() => setCheckResult(null), 4000);
    }
  };

  const handleDownload = async () => {
    if (updateInfo?.downloadUrl) {
      await chrome.tabs.create({ url: updateInfo.downloadUrl, active: false });
    }
  };

  const formatCheckedTime = (ts: number) =>
    new Date(ts).toLocaleString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <section className="space-y-3">
      <h2 className="text-[13px] font-medium" style={{ color: 'var(--ds-text)' }}>
        {t.settingsUpdateSection}
      </h2>
      <div className="ds-surface-panel rounded-xl p-4 space-y-3">

        {/* Current version row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px]" style={{ color: 'var(--ds-text-secondary)' }}>
            {t.settingsUpdateCurrent}
          </span>
          <span className="text-[12px] font-mono font-semibold" style={{ color: 'var(--ds-blue)' }}>
            v{version}
          </span>
        </div>

        {/* Status row */}
        {updateInfo && (
          <div className="flex items-center justify-between">
            <span
              className="text-[12px] font-medium"
              style={{ color: updateInfo.available ? 'var(--ds-warning)' : 'var(--ds-success)' }}
            >
              {updateInfo.available
                ? t.settingsUpdateAvailable.replace('{version}', updateInfo.latestVersion)
                : t.settingsUpdateUpToDate}
            </span>
            {updateInfo.available && (
              <button
                onClick={handleDownload}
                className="ds-btn-primary px-3 py-1 text-[11px] font-medium text-white rounded-lg transition-all duration-150 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t.settingsUpdateDownload.replace('{version}', updateInfo.latestVersion)}
              </button>
            )}
          </div>
        )}

        {/* Last checked + button */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px]" style={{ color: 'var(--ds-text-tertiary)' }}>
            {updateInfo?.checkedAt
              ? t.settingsUpdateLastChecked.replace('{time}', formatCheckedTime(updateInfo.checkedAt))
              : t.settingsUpdateNeverChecked}
          </span>
          <button
            onClick={handleCheck}
            disabled={checking}
            className="ds-btn-secondary px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all duration-150 disabled:opacity-50 flex items-center gap-1.5"
            style={checkResult === 'ok' ? { borderColor: 'var(--ds-success)', color: 'var(--ds-success)' } : checkResult === 'error' ? { borderColor: 'var(--ds-danger)', color: 'var(--ds-danger)' } : undefined}
          >
            {checking ? (
              <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : checkResult === 'ok' ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : checkResult === 'error' ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {checking
              ? t.settingsUpdateChecking
              : checkResult === 'ok'
                ? (updateInfo?.available ? t.settingsUpdateAvailable.replace('{version}', updateInfo.latestVersion) : t.settingsUpdateUpToDate)
                : checkResult === 'error'
                  ? t.settingsUpdateError
                  : t.settingsUpdateCheck}
          </button>
        </div>

      </div>

      {/* Auto-update via Shell MCP */}
      <div className="ds-surface-panel rounded-xl p-4 space-y-3">
        <div className="text-[12px] font-medium" style={{ color: 'var(--ds-text)' }}>
          {t.settingsAutoUpdateSection}
        </div>

        {/* Repo path */}
        <div className="space-y-1.5">
          <label className="text-[11px]" style={{ color: 'var(--ds-text-secondary)' }}>
            {t.settingsAutoUpdatePathLabel}
          </label>
          <input
            type="text"
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            onBlur={(e) => saveRepoPath(e.target.value)}
            placeholder={t.settingsAutoUpdatePathPlaceholder}
            className="w-full px-3 py-2 text-xs rounded-lg border outline-none transition-colors focus:border-[var(--ds-blue)]"
            style={{ background: 'var(--ds-bg)', borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }}
          />
          <p className="text-[10px]" style={{ color: 'var(--ds-text-tertiary)' }}>
            {t.settingsAutoUpdatePathHint}
          </p>
        </div>

        {/* Chrome load folder (if different from dist\chrome-mv3 inside the repo) */}
        <div className="space-y-1.5">
          <label className="text-[11px]" style={{ color: 'var(--ds-text-secondary)' }}>
            Cartella caricata da Chrome <span style={{ color: 'var(--ds-text-tertiary)' }}>(se diversa da dist\chrome-mv3)</span>
          </label>
          <input
            type="text"
            value={installPath}
            onChange={(e) => setInstallPath(e.target.value)}
            onBlur={(e) => saveInstallPath(e.target.value)}
            placeholder="C:\...\Release\deepseek-plus-plus-X.X.X-chrome"
            className="w-full px-3 py-2 text-xs rounded-lg border outline-none transition-colors focus:border-[var(--ds-blue)]"
            style={{ background: 'var(--ds-bg)', borderColor: 'var(--ds-border)', color: 'var(--ds-text)' }}
          />
          <p className="text-[10px]" style={{ color: 'var(--ds-text-tertiary)' }}>
            Dopo la build, i file vengono copiati qui prima del reload. Vedi Dettagli in chrome://extensions.
          </p>
        </div>

        {autoUpdateStatus ? (
          <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--ds-blue)' }}>
            <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
            {autoUpdateStatus}
          </div>
        ) : (
          <button
            onClick={handleAutoUpdate}
            disabled={!repoPath.trim() || !updateInfo?.available}
            className="w-full ds-btn-primary py-2.5 text-[12px] font-medium text-white rounded-xl transition-all duration-150 disabled:opacity-40"
          >
            {updateInfo?.available
              ? t.settingsAutoUpdateButton
              : `${t.settingsAutoUpdateButton} — ${t.settingsUpdateUpToDate}`}
          </button>
        )}
      </div>

    </section>
  );
}

function WebAccessSection() {
  const { language } = useLanguage();
  const [granted, setGranted] = useState<boolean | null>(null);

  const ALL_ORIGINS = ['http://*/*', 'https://*/*'];

  useEffect(() => {
    chrome.permissions.contains({ origins: ALL_ORIGINS })
      .then(setGranted)
      .catch(() => setGranted(false));
  }, []);

  const txt = language === 'it'
    ? {
        section: 'Accesso web',
        title: 'Lettura pagine web (web_fetch / web_search)',
        descGranted: 'Attivo. L\'assistente può leggere qualsiasi pagina web e fare ricerche.',
        descMissing: 'Accesso non attivo. Ricarica l\'estensione in chrome://extensions: per le estensioni caricate localmente l\'accesso viene concesso automaticamente al caricamento.',
      }
    : {
        section: 'Web access',
        title: 'Read web pages (web_fetch / web_search)',
        descGranted: 'Active. The assistant can read any web page and run searches.',
        descMissing: 'Access not active. Reload the extension in chrome://extensions: for locally-loaded extensions, access is granted automatically at load time.',
      };

  return (
    <section className="space-y-3">
      <h2 className="text-[13px] font-medium" style={{ color: 'var(--ds-text)' }}>{txt.section}</h2>
      <div className="ds-surface-panel rounded-xl p-4">
        <div className="flex items-start gap-2">
          <span
            className="shrink-0 mt-0.5 w-2 h-2 rounded-full"
            style={{ background: granted ? 'var(--ds-success, #16a34a)' : 'var(--ds-warning, #f59e0b)' }}
          />
          <div>
            <div className="text-xs font-medium" style={{ color: 'var(--ds-text)' }}>{txt.title}</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--ds-text-tertiary)' }}>
              {granted ? txt.descGranted : txt.descMissing}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GitHubIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function Toggle({ label, description, checked, onChange, disabled }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <div className="text-xs font-medium" style={{ color: 'var(--ds-text)' }}>{label}</div>
        <div className="text-[11px] mt-0.5" style={{ color: 'var(--ds-text-tertiary)' }}>{description}</div>
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className="relative shrink-0 w-10 h-[22px] rounded-full transition-colors duration-200 disabled:opacity-40"
        style={{ background: checked ? 'var(--ds-blue)' : 'var(--ds-border)' }}
      >
        <span className="ds-switch-thumb absolute top-[3px] left-[3px] w-4 h-4 rounded-full transition-transform duration-200"
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(0)' }} />
      </button>
    </div>
  );
}

function RangeRow({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-[11px]" style={{ color: 'var(--ds-text-secondary)' }}>{label}</label>
        <span className="text-[11px] font-mono" style={{ color: 'var(--ds-text-tertiary)' }}>{value}</span>
      </div>
      {children}
    </div>
  );
}
