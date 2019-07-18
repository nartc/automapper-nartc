/** Used to compose unicode character classes. */
export const rsAstralRange = '\\ud800-\\udfff';
export const rsComboMarksRange = '\\u0300-\\u036f';
export const reComboHalfMarksRange = '\\ufe20-\\ufe2f';
export const rsComboSymbolsRange = '\\u20d0-\\u20ff';
export const rsComboMarksExtendedRange = '\\u1ab0-\\u1aff';
export const rsComboMarksSupplementRange = '\\u1dc0-\\u1dff';
export const rsComboRange =
  rsComboMarksRange +
  reComboHalfMarksRange +
  rsComboSymbolsRange +
  rsComboMarksExtendedRange +
  rsComboMarksSupplementRange;
export const rsDingbatRange = '\\u2700-\\u27bf';
export const rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff';
export const rsMathOpRange = '\\xac\\xb1\\xd7\\xf7';
export const rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf';
export const rsPunctuationRange = '\\u2000-\\u206f';
export const rsSpaceRange =
  ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000';
export const rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde';
export const rsVarRange = '\\ufe0e\\ufe0f';
export const rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

/** Used to compose unicode capture groups. */
export const rsApos = "['\u2019]";
export const rsBreak = `[${rsBreakRange}]`;
export const rsCombo = `[${rsComboRange}]`;
export const rsDigit = '\\d';
export const rsDingbat = `[${rsDingbatRange}]`;
export const rsLower = `[${rsLowerRange}]`;
export const rsMisc = `[^${rsAstralRange}${rsBreakRange +
  rsDigit +
  rsDingbatRange +
  rsLowerRange +
  rsUpperRange}]`;
export const rsFitz = '\\ud83c[\\udffb-\\udfff]';
export const rsModifier = `(?:${rsCombo}|${rsFitz})`;
export const rsNonAstral = `[^${rsAstralRange}]`;
export const rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
export const rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
export const rsUpper = `[${rsUpperRange}]`;
export const rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
export const rsMiscLower = `(?:${rsLower}|${rsMisc})`;
export const rsMiscUpper = `(?:${rsUpper}|${rsMisc})`;
export const rsOptContrLower = `(?:${rsApos}(?:d|ll|m|re|s|t|ve))?`;
export const rsOptContrUpper = `(?:${rsApos}(?:D|LL|M|RE|S|T|VE))?`;
export const reOptMod = `${rsModifier}?`;
export const rsOptVar = `[${rsVarRange}]?`;
export const rsOptJoin = `(?:${rsZWJ}(?:${[rsNonAstral, rsRegional, rsSurrPair].join(
  '|'
)})${rsOptVar + reOptMod})*`;
export const rsOrdLower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])';
export const rsOrdUpper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])';
export const rsSeq = rsOptVar + reOptMod + rsOptJoin;
export const rsEmoji = `(?:${[rsDingbat, rsRegional, rsSurrPair].join('|')})${rsSeq}`;

export const reQuotes = /['\u2019]/g;

export const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
export const reIsPlainProp = /^\w*$/;

/** Used as the maximum memoize cache size. */
export const MAX_MEMOIZE_SIZE = 500;

export const charCodeOfDot = '.'.charCodeAt(0);
export const reEscapeChar = /\\(\\)?/g;
export const rePropName = RegExp(
  // Match anything that isn't a dot or bracket.
  '[^.[\\]]+' +
    '|' +
    // Or match property names within brackets.
    '\\[(?:' +
    // Match a non-string expression.
    '([^"\'][^[]*)' +
    '|' +
    // Or match strings (supports escaping characters).
    '(["\'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2' +
    ')\\]' +
    '|' +
    // Or match "" as the space between consecutive dots or empty brackets.
    '(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))',
  'g'
);

/** Used as references for various `Number` constants. */
export const INFINITY = 1 / 0;
