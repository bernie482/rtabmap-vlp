import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { merge } from 'lodash';

Vue.use(VueI18n);

function loadLocaleMessages() {
  const locales = require.context(
    './locales',
    true,
    /[A-Za-z0-9-_,\s]+\.json$/i
  );
  const messages = {};
  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });

  if (process.env.VUE_APP_ENV_NAME === 'insyde') {
    try {
      const insydeLocales = require.context(
        './env/insyde/locales',
        true,
        /[A-Za-z0-9-_,\s]+\.json$/i
      );
      insydeLocales.keys().forEach((key) => {
        const matched = key.match(/([A-Za-z0-9-_]+)\./i);
        if (matched && matched.length > 1) {
          const locale = matched[1];
          merge(messages[locale], insydeLocales(key));
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
  return messages;
}

export default new VueI18n({
  // Get default locale from local storage
  locale: window.localStorage.getItem('storedLanguage'),
  // Locales that don't exist will fallback to English
  fallbackLocale: 'en-US',
  // Falling back to fallbackLocale generates two console warnings
  // Silent fallback suppresses console warnings when using fallback
  silentFallbackWarn: true,
  messages: loadLocaleMessages(),
});
