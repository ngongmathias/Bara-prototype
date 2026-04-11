import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';
import pt from '../locales/pt.json';
import sw from '../locales/sw.json';
import ar from '../locales/ar.json';
import rw from '../locales/rw.json';

const resources = {
  en: {
    translation: en
  },
  fr: {
    translation: fr
  },
  es: {
    translation: es
  },
  pt: {
    translation: pt
  },
  sw: {
    translation: sw
  },
  ar: {
    translation: ar
  },
  rw: {
    translation: rw
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
});

export default i18n; 