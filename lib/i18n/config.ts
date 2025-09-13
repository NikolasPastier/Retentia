import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import resourcesToBackend from "i18next-resources-to-backend"

// Supported languages with their native names
export const languages = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  ru: "Русский",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
  ar: "العربية",
  hi: "हिन्दी",
  tr: "Türkçe",
  pl: "Polski",
  nl: "Nederlands",
}

export const defaultLanguage = "en"
export const supportedLanguages = Object.keys(languages)

export const supportedLocales = supportedLanguages
export const defaultLocale = defaultLanguage

const createI18nInstance = () => {
  const instance = i18n.createInstance()

  if (typeof window !== "undefined") {
    instance
      .use(LanguageDetector)
      .use(initReactI18next)
      .use(
        resourcesToBackend((language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)),
      )
      .init({
        lng: defaultLanguage,
        fallbackLng: defaultLanguage,
        supportedLngs: supportedLanguages,

        detection: {
          order: ["localStorage", "navigator", "htmlTag"],
          caches: ["localStorage"],
          lookupLocalStorage: "i18nextLng",
        },

        interpolation: {
          escapeValue: false,
        },

        react: {
          useSuspense: false,
        },

        ns: ["common", "navigation", "forms", "dashboard"],
        defaultNS: "common",
      })
  } else {
    instance.use(initReactI18next).init({
      lng: defaultLanguage,
      fallbackLng: defaultLanguage,
      supportedLngs: supportedLanguages,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      ns: ["common", "navigation", "forms", "dashboard"],
      defaultNS: "common",
      resources: {}, // Empty resources for SSR
    })
  }

  return instance
}

export default createI18nInstance()
