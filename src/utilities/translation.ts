import { baseOtpTranslation } from '../translation/index.js'

export type SupportedLanguage = 'en' | 'ar'

/**
 * Parse Accept-Language header and return the best matching supported language
 * @param acceptLanguageHeader - The Accept-Language header value
 * @returns The best matching supported language, defaults to 'en'
 */
export function parseAcceptLanguage(acceptLanguageHeader?: string): SupportedLanguage {
  if (!acceptLanguageHeader) {
    return 'en'
  }

  // Parse Accept-Language header format: "en-US,en;q=0.9,ar;q=0.8"
  const languages = acceptLanguageHeader
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';')
      const quality = qValue ? parseFloat(qValue.split('=')[1]) : 1.0
      return {
        code: code.split('-')[0].toLowerCase(), // Extract main language code
        quality
      }
    })
    .sort((a, b) => b.quality - a.quality) // Sort by quality (preference)

  // Find the first supported language
  for (const lang of languages) {
    if (lang.code === 'ar' || lang.code === 'en') {
      return lang.code as SupportedLanguage
    }
  }

  // Default to English if no supported language found
  return 'en'
}

/**
 * Get translated message based on language and key path
 * @param language - The target language
 * @param keyPath - Dot notation path to the translation key (e.g., "otp.expired_message")
 * @param fallbackMessage - Fallback message if translation not found
 * @returns Translated message or fallback
 */
export function getTranslation(
  language: SupportedLanguage,
  keyPath: string,
  fallbackMessage?: string
): string {
  const translations = baseOtpTranslation[language]
  
  if (!translations) {
    return fallbackMessage || keyPath
  }

  // Navigate through nested object using dot notation
  const keys = keyPath.split('.')
  let current: any = translations
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return fallbackMessage || keyPath
    }
  }

  return typeof current === 'string' ? current : (fallbackMessage || keyPath)
}

/**
 * Get translated message from request headers
 * @param headers - Request headers containing Accept-Language
 * @param keyPath - Dot notation path to the translation key
 * @param fallbackMessage - Fallback message if translation not found
 * @returns Translated message
 */
export function getTranslationFromHeaders(
  headers: Headers | Record<string, string>,
  keyPath: string,
  fallbackMessage?: string
): string {
  const acceptLanguage = headers instanceof Headers 
    ? headers.get('Accept-Language') 
    : headers['accept-language'] || headers['Accept-Language']
    
  const language = parseAcceptLanguage(acceptLanguage || undefined)
  return getTranslation(language, keyPath, fallbackMessage)
}

/**
 * Create a translation helper bound to specific request headers
 * @param headers - Request headers containing Accept-Language
 * @returns Translation helper function
 */
export function createTranslationHelper(headers: Headers | Record<string, string>) {
  const acceptLanguage = headers instanceof Headers 
    ? headers.get('Accept-Language') 
    : headers['accept-language'] || headers['Accept-Language']
    
  const language = parseAcceptLanguage(acceptLanguage || undefined)
  
  return {
    language,
    t: (keyPath: string, fallbackMessage?: string) => getTranslation(language, keyPath, fallbackMessage)
  }
}