import { reQuotes } from './constants';
import { asciiWords, baseGet, hasUnicodeWord, unicodeWords } from './internal';

export const toWords = (str: string, pattern?: string | RegExp) => {
  if (pattern === undefined) {
    const result = hasUnicodeWord(str) ? unicodeWords(str) : asciiWords(str);
    return result || [];
  }
  return str.match(pattern) || [];
};

export const toLowerCase = <TDestination>(str: keyof TDestination) =>
  toWords(`${str}`.replace(reQuotes, '')).reduce(
    (res: string, word: string, index: number) => res + (index ? ' ' : '') + word.toLowerCase(),
    ''
  );

export const toLowerCases = <TDestination>(str: keyof TDestination) => {
  return `${str}`
    .replace(reQuotes, '')
    .split(/([A-Z][a-z0-9]+)/)
    .filter(c => c)
    .map(w => w.toLowerCase());
};

export const tryGet = (object: any, path: string, defaultValue?: any) => {
  const result = !object ? null : baseGet(object, path);
  return !result ? defaultValue : result;
};
