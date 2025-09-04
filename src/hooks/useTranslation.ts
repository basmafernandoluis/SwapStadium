import { useState, useEffect } from 'react';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

// Import des traductions
import fr from '../locales/fr.json';
import en from '../locales/en.json';

const i18n = new I18n({
  fr,
  en
});

// Définir la langue par défaut
i18n.defaultLocale = 'fr';

export const useTranslation = () => {
  const [locale, setLocale] = useState(Localization.getLocales()[0]?.languageCode || 'fr');

  useEffect(() => {
    // Déterminer la langue en fonction des préférences du device
    const deviceLocale = Localization.getLocales()[0]?.languageCode || 'fr';
    const supportedLocale = ['fr', 'en'].includes(deviceLocale) ? deviceLocale : 'fr';
    
    i18n.locale = supportedLocale;
    setLocale(supportedLocale);
  }, []);

  const t = (key: string, options?: any) => {
    return i18n.t(key, options);
  };

  const changeLanguage = (newLocale: string) => {
    if (['fr', 'en'].includes(newLocale)) {
      i18n.locale = newLocale;
      setLocale(newLocale);
    }
  };

  return {
    t,
    locale,
    changeLanguage,
    isRTL: false // Français et anglais sont LTR
  };
};
