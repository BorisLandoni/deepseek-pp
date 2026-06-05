import { useState } from 'react';
import type { Language } from '../../../core/i18n/translations';
import { LANGUAGE_NAMES, TRANSLATIONS } from '../../../core/i18n/translations';
import { useLanguage } from '../../../core/i18n/context';

export default function OnboardingModal() {
  const { setLanguage, completeOnboarding } = useLanguage();
  const [selected, setSelected] = useState<Language>('en');

  const t = TRANSLATIONS[selected];

  const handleConfirm = () => {
    setLanguage(selected);
    completeOnboarding();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-xs rounded-2xl p-6 space-y-5 shadow-xl"
        style={{ background: 'var(--ds-bg)', border: '1px solid var(--ds-border)' }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
            style={{ background: 'linear-gradient(135deg, var(--ds-blue), var(--ds-logo-gradient-end))' }}
          >
            D+
          </div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--ds-text)' }}>
            {t.onboardingTitle}
          </h1>
          <p className="text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
            {t.onboardingSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(LANGUAGE_NAMES) as [Language, string][]).map(([lang, name]) => (
            <button
              key={lang}
              type="button"
              onClick={() => setSelected(lang)}
              className="py-3 rounded-xl text-sm font-medium transition-all duration-150 border"
              style={{
                background: selected === lang ? 'var(--ds-blue-light)' : 'var(--ds-surface)',
                color: selected === lang ? 'var(--ds-blue)' : 'var(--ds-text-secondary)',
                borderColor: selected === lang ? 'var(--ds-selected-border)' : 'var(--ds-border)',
              }}
            >
              {name}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-center" style={{ color: 'var(--ds-text-tertiary)' }}>
          {t.onboardingChoose}
        </p>

        <button
          type="button"
          onClick={handleConfirm}
          className="ds-btn-primary w-full py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-150"
        >
          {t.onboardingConfirm}
        </button>
      </div>
    </div>
  );
}
