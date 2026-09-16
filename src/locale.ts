export type Locale = 'he' | 'en';

export function isLocale(value: unknown): value is Locale {
  return value === 'he' || value === 'en';
}

export function detectLocale(
  saved: string | null,
  timeZone: string | undefined,
  languages: readonly string[],
): Locale {
  if (isLocale(saved)) return saved;
  if (timeZone && ['Asia/Jerusalem', 'Asia/Tel_Aviv', 'Israel'].includes(timeZone)) return 'he';
  if (timeZone && timeZone !== 'UTC' && timeZone !== 'Etc/UTC') return 'en';
  const primaryLanguage = languages[0];
  if (!primaryLanguage) return 'he';
  return /^he(?:-|$)/i.test(primaryLanguage) || /-IL$/i.test(primaryLanguage) ? 'he' : 'en';
}

export function initialLocale(): Locale {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('zarabi-language');
  } catch (error) {
    console.warn('Language preference storage is unavailable; using browser settings.', error);
  }
  return detectLocale(saved, Intl.DateTimeFormat().resolvedOptions().timeZone, navigator.languages);
}

export function saveLocale(locale: Locale): void {
  try {
    localStorage.setItem('zarabi-language', locale);
  } catch (error) {
    console.warn('Language preference could not be saved; the current URL preserves the selection.', error);
  }
}
