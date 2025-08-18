import { enTranslations } from '@payloadcms/translations/languages/en'
import { arTranslations } from '@payloadcms/translations/languages/ar'
import type { NestedKeysStripped } from '@payloadcms/translations'
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// import enLocale from './en.json';
// import arLocale from "./ar.json";
const enLocale = JSON.parse(
  readFileSync(path.join(__dirname, 'en.json'), 'utf-8')
);
const arLocale = JSON.parse(
  readFileSync(path.join(__dirname, 'ar.json'), 'utf-8')
);
export const baseOtpTranslation = {
  en: enLocale,
  ar: arLocale
}

// Merge custom translations with base translations
export const otpTranslation = {
  en: {
    ...enTranslations,
    ...baseOtpTranslation.en,
  },
  ar: {
    ...arTranslations,
    ...baseOtpTranslation.ar,
  }
}

export type OtpTranslationsObject = typeof baseOtpTranslation.en & typeof enTranslations

export type OtpTranslationsKeys = NestedKeysStripped<OtpTranslationsObject>