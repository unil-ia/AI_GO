/* AI_GO typography tool. Copyright (c) 2026, Université de Lausanne, Cellule stratégique IA.
 * SPDX-License-Identifier: BSD-3-Clause. Redistribution and use, with or without modification,
 * are permitted under the three conditions stated in LICENSE, which also carries the warranty
 * disclaimer; LICENSE must accompany any redistribution of this file, in source or in binary.
 * Usage: node tools/typographie.mjs ai-go.html
 * Between AI_GO-CONTENT-BEGIN and AI_GO-CONTENT-END, inside double-quoted strings and nowhere else,
 * it rewrites as the six characters \u00a0 every space you typed before : ; ? ! % or a closing
 * guillemet and after an opening one, and every no-break space you typed anywhere in those strings.
 * It adds none where you typed no space at all: docs/DEMARRER.md counts why.
 * It writes nothing, and exits 2, when the file is not valid UTF-8; when one of the six AI_GO
 * markers appears twice, out of order, not alone on its line, or with one half of a comment wrapper
 * and not the other; or when a single byte outside the content block would have moved. That last
 * comparison, and not a deduction from the markers, is what keeps the engine untouched.
 * Idempotent; on the file as delivered not a byte moves. */
import { readFileSync, writeFileSync } from 'node:fs';
const ESC = '\\u00a0';                          // the six characters we want in the file
const TYPED = /[\u00a0\u202f]/g;                // no-break space, narrow no-break space, anywhere
const BEFORE = / ([:;?!%\u00bb])/g;             // an ordinary space before : ; ? ! % or a closing guillemet
const AFTER = /(\u00ab) /g;                     // an ordinary space after an opening guillemet
// TYPED runs last and takes U+00A0 and U+202F wherever they sit, which leaves the two rules above
// only the ordinary space to convert: widening their classes again would be dead code, not safety.
const MARKS = ['AI_GO-BEGIN', 'AI_GO-CONTENT-BEGIN', 'AI_GO-CONTENT-END', 'AI_GO-ENGINE-BEGIN',
  'AI_GO-ENGINE-END', 'AI_GO-END'];
const TAIL = /^(?:[0-9][0-9.]* h:[0-9a-f]+)?$/; // only AI_GO-ENGINE-BEGIN carries a version and a hash
const marker = (line) => {                      // the whole line, and both comment halves or neither
  const t = line.trim(), open = t.startsWith('/*'), close = t.endsWith('*/');
  const s = open !== close ? '' : open ? t.slice(2, -2).trim() : t, word = s.split(' ')[0];
  return MARKS.includes(word) && TAIL.test(s.slice(word.length).trim()) ? word : '';
};
const file = process.argv[2] || 'ai-go.html', input = readFileSync(file);
const stop = (why) => {
  console.error(file + ': refused, nothing written, so nothing changed, the engine included. ' + why
    + ' Expected ' + MARKS.join(', ') + ', in that order, each at most once and the two content ones'
    + ' present, alone on its line, with the comment slashes both there or both absent.');
  process.exit(2);
};
let text = '';
try { text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(input); }
catch (err) { stop('The file is not valid UTF-8, and reading it would replace the bytes it holds.'); }
const seen = new Map();
let at = 0;
for (const line of text.split('\n')) {
  const word = marker(line);
  if (word && seen.has(word)) stop('The marker ' + word + ' appears more than once.');
  if (word) seen.set(word, at);
  at += line.length + 1;
}
const order = MARKS.filter((k) => seen.has(k));
if (!seen.has('AI_GO-CONTENT-BEGIN') || !seen.has('AI_GO-CONTENT-END'))
  stop('Found ' + order.filter((k) => k.includes('-CONTENT-')).length + ' of the two content markers.');
if (order.some((k, i) => i > 0 && seen.get(k) < seen.get(order[i - 1])))
  stop('The markers found are ' + order.join(', ') + ', which is not that order.');
const b = seen.get('AI_GO-CONTENT-BEGIN'), e = seen.get('AI_GO-CONTENT-END');
const was = text.slice(b, e), now = was.replace(/"(?:[^"\\]|\\.)*"/g, (s) =>
  s.replace(BEFORE, ESC + '$1').replace(AFTER, '$1' + ESC).replace(TYPED, ESC));
const out = Buffer.from(text.slice(0, b) + now + text.slice(e), 'utf8');
const head = Buffer.byteLength(text.slice(0, b));
if (!out.subarray(0, head).equals(input.subarray(0, head)) ||
  !out.subarray(head + Buffer.byteLength(now)).equals(input.subarray(head + Buffer.byteLength(was))))
  stop('A byte outside the content block would have moved, and the engine lives outside it.');
writeFileSync(file, out);
const nb = (s) => (s.match(/\\u00a0/g) || []).length;
console.log(nb(now) - nb(was) + ' non-breaking space(s) written as ' + ESC + ' in ' + file);
