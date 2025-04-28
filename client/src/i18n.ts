import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // load translations using http (default public/locales/{lng}/translation.json)
  .use(Backend)
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
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

    // backend options
    backend: {
      loadPath: '/locales/{{lng}}/translation.json'
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