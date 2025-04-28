import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources directly
import translationEN from '../../public/locales/en/translation.json';
import translationAR from '../../public/locales/ar/translation.json';

// Resources containing translation data
const resources = {
  en: {
    translation: translationEN
  },
  ar: {
    translation: translationAR
  }
};

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    supportedLngs: ['en', 'ar'],
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    // language detector options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    // react-i18next options
    react: {
      useSuspense: false,
    }
  });

// Function to update document direction based on language
export const updateDocumentDirection = (lng: string) => {
  if (lng === 'ar') {
    document.documentElement.dir = 'rtl';
    document.documentElement.classList.add('rtl');
    document.documentElement.classList.remove('ltr');
  } else {
    document.documentElement.dir = 'ltr';
    document.documentElement.classList.add('ltr');
    document.documentElement.classList.remove('rtl');
  }
};

// Update direction on language change
i18n.on('languageChanged', updateDocumentDirection);

// Set initial direction
updateDocumentDirection(i18n.language);

export default i18n;