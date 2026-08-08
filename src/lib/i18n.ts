import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English is the only language that can be active today (`lng: 'en'` below
// forces it), so it is the only one bundled up front. The other six are 407 KB
// of JSON that no user could ever reach, and they were being shipped in the
// entry chunk on every first paint.
//
// They are NOT deleted — they remain complete, real translations (including
// Kinyarwanda) and are loaded on demand by loadLocale() below. The moment a
// language switcher exists, calling i18n.changeLanguage('rw') fetches rw.json
// as its own chunk and everything works.
import en from '../locales/en.json';

const resources = {
  en: {
    translation: en
  }
};

// Vite turns this into one dynamic-import chunk per locale file; nothing is
// fetched until a locale is actually requested.
const localeLoaders = import.meta.glob<{ default: Record<string, unknown> }>(
  '../locales/*.json'
);

const loaded = new Set(['en']);

/** Fetch and register a locale bundle. No-op for English or an unknown code. */
export const loadLocale = async (lng: string): Promise<void> => {
  if (loaded.has(lng)) return;
  const loader = localeLoaders[`../locales/${lng}.json`];
  if (!loader) return;

  loaded.add(lng);
  try {
    const mod = await loader();
    i18n.addResourceBundle(lng, 'translation', mod.default, true, true);
    // The bundle landed after i18next had already resolved this language, so
    // nudge consumers to re-render against the strings that just arrived.
    if (i18n.language === lng) await i18n.changeLanguage(lng);
  } catch (error) {
    loaded.delete(lng); // let a later attempt retry
    console.error(`Failed to load locale "${lng}":`, error);
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Force English until custom language switcher (9.10) is built
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  // Pull in the bundle for any non-English language the app switches to.
  void loadLocale(lng);
});

export default i18n; 