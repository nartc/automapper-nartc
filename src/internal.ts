import {
  charCodeOfDot,
  INFINITY,
  MAX_MEMOIZE_SIZE,
  reEscapeChar,
  reIsDeepProp,
  reIsPlainProp,
  rePropName,
  rsBreak,
  rsDigit,
  rsEmoji,
  rsLower,
  rsMiscLower,
  rsMiscUpper,
  rsOptContrLower,
  rsOptContrUpper,
  rsOrdLower,
  rsOrdUpper,
  rsUpper
} from './constants';

export const unicodeWords = RegExp.prototype.exec.bind(
  RegExp(
    [
      `${rsUpper}?${rsLower}+${rsOptContrLower}(?=${[rsBreak, rsUpper, '$'].join('|')})`,
      `${rsMiscUpper}+${rsOptContrUpper}(?=${[rsBreak, rsUpper + rsMiscLower, '$'].join('|')})`,
      `${rsUpper}?${rsMiscLower}+${rsOptContrLower}`,
      `${rsUpper}+${rsOptContrUpper}`,
      rsOrdUpper,
      rsOrdLower,
      `${rsDigit}+`,
      rsEmoji
    ].join('|'),
    'g'
  )
);

export const asciiWords = RegExp.prototype.exec.bind(/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g);

export const hasUnicodeWord = RegExp.prototype.test.bind(
  /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/
);

export const toString = Object.prototype.toString;

export const getTag = (value: any): string => {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }

  return toString.call(value);
};

export const isSymbol = (value: any): boolean => {
  const type = typeof value;
  return (
    type === 'symbol' || (type === 'object' && value != null && getTag(value) === '[object Symbol]')
  );
};

export const isKey = (value: any, object: any): boolean => {
  if (Array.isArray(value)) {
    return false;
  }

  const type = typeof value;
  if (type === 'number' || type === 'boolean' || value == null || isSymbol(value)) {
    return true;
  }

  return (
    reIsPlainProp.test(value) ||
    !reIsDeepProp.test(value) ||
    (object != null && value in Object(object))
  );
};

interface InternalMemoizedFn {
  (...args: any[]): any;

  cache?: Map<any, any> | WeakMap<any, any> | any;
}

interface MemoizedFn {
  (fn: (...args: any[]) => any, resolve: (...args: any[]) => any): InternalMemoizedFn;

  Cache: MapConstructor | WeakMapConstructor | any;
}

const _memoize: MemoizedFn = (fn: (...args: any[]) => any, resolver: (...args: any[]) => any) => {
  if (typeof fn !== 'function' || (resolver != null && typeof resolver !== 'function')) {
    throw new TypeError('Expected a function');
  }

  const memoized: InternalMemoizedFn = function(...args: any[]): ReturnType<typeof fn> {
    // @ts-ignore
    const key = resolver ? resolver.apply(this, args) : args[0];
    const cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }

    // @ts-ignore
    const result = fn.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };

  memoized.cache = new _memoize.Cache();
  return memoized;
};

_memoize.Cache = Map;

export const memoize = _memoize;

export const memoizedCapped = (fn: (...args: any[]) => any) => {
  const result = memoize(fn, key => {
    const { cache } = result;
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }

    return key;
  });

  return result;
};

export const stringToPath = memoizedCapped((str: string) => {
  const result = [];
  if (str.charCodeAt(0) === charCodeOfDot) {
    result.push('');
  }

  str.replace(rePropName, (match, expression, quote, subString) => {
    let key = match;
    if (quote) {
      key = subString.replace(reEscapeChar, '$1');
    } else if (expression) {
      key = expression.trim();
    }
    result.push(key);
    return key;
  });
  return result;
});

export const castPath = (value: any, object: any) => {
  if (Array.isArray(value)) {
    return value;
  }

  return isKey(value, object) ? [value] : stringToPath(value);
};

export const toKey = (value: any) => {
  if (typeof value === 'string' || isSymbol(value)) {
    return value;
  }
  const result = `${value}`;
  return result === '0' && 1 / value === -INFINITY ? '-0' : result;
};

export const baseGet = (object: any, path: string) => {
  path = castPath(path, object);

  let index = 0;
  const length = path.length;

  while (object !== null && index < length) {
    object = object[toKey(path[index++])];
  }

  return index && index === length ? object : null;
};
