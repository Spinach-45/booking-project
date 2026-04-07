import { zh } from './zh';
import { en } from './en';

export const translations = { zh, en };

export function t(lang, key) {
  const keys = key.split('.');
  let result = translations[lang];
  for (const k of keys) {
    if (result === undefined) return key;
    result = result[k];
  }
  return result ?? key;
}
