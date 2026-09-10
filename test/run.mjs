// Copyright (c) 2026, Université de Lausanne, Cellule stratégique IA.
// SPDX-License-Identifier: BSD-3-Clause. Redistribution and use, with or without
// modification, are permitted under the three conditions stated in LICENSE, which
// also carries the warranty disclaimer; LICENSE must accompany any redistribution
// of this file, in source or in binary.
// Test harness. No dependency. Run: node test/run.mjs
// Exit code 1 on any failure. Every agent touching this repository keeps it green.
//
// There is one engine in this repository and one path enumerator, and both are
// taken from the files that ship: the engine out of the block of ai-go.html,
// the enumerator out of the inline script of check.html. Nothing here is a
// parallel copy that could pass while the shipped file is broken.
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
// pathname leaves an URL-encoded string: from a directory whose name holds a
// space or an accent, every read threw ENOENT on a %20 before one test ran.
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = f => readFileSync(join(ROOT, f), 'utf8');
const cp = o => JSON.parse(JSON.stringify(o));
// Same object without one key: the sweeps below take a key out of a session.
const dropKey = (o, k) => { const c = { ...o }; delete c[k]; return c; };
// Written as codes, never as characters: this file is scanned by its own rules.
const EM_DASH = String.fromCharCode(0x2014);
const NBSP = String.fromCharCode(0x00a0);
const OTHER_NAME = new RegExp('guide' + 'post|\\bgp' + '-|guide' + '-donnees', 'i');
// Assembled from pieces, and from code points, so that this file is not itself
// a hit for the two rules it enforces on the repository.
// NOT global: `.test()` on a /g regex keeps lastIndex between calls, so a match
// in one file made the harness start mid-way through the next one and miss it.
const ASSISTANT = new RegExp('Cla' + 'ude');
const assistantCount = s => (s.match(new RegExp('Cla' + 'ude', 'g')) || []).length;
const ACCENTS = /[\u00e0\u00e2\u00e4\u00e6\u00e7\u00e8\u00e9\u00ea\u00eb\u00ee\u00ef\u00f4\u00f6\u00f9\u00fb\u00fc\u00ff\u0153]/i;

let fails = 0, n = 0;
// Declared, never recomputed: the last line of this file compares it with what
// the run actually counted, so the changelog's figure and this harness cannot
// drift apart in silence.
const ASSERTIONS = 664;
const own = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);
const ok = (name, cond, detail) => {
  n++; if (!cond) fails++;
  console.log(`  ${cond ? 'ok ' : 'FAIL'} ${name}${!cond && detail ? '  <- ' + detail : ''}`);
};
// A section that throws must not take the rest of the run with it. One missing
// attribute used to raise a TypeError here and the ninety assertions that came
// after it never ran, while the exit code said nothing about them.
const section = fn => {
  try { fn(); }
  catch (e) { ok('this section of the harness ran to its end', false,
    (e && e.stack ? String(e.stack).split('\n')[0] : String(e))); }
};

const PAGES = ['ai-go.html', 'check.html'];
const html = read('ai-go.html');
const checkHtml = read('check.html');
const SCRIPT_RE = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
const bodiesOf = src => [...src.matchAll(SCRIPT_RE)].map(m => m[1]);

// The validator's pure half: marker parsing, block extraction, path enumeration,
// the extra coherence checks and the source lint. Exercised here, so the page
// cannot rot unnoticed.
const CHECK = new Function(bodiesOf(checkHtml)[0] + '\n;return AI_GO_CHECK;')();

// The engine, extracted exactly the way check.html and a browser extract it.
const engineLoad = CHECK.loadEngine(html);
const AI_GO = engineLoad.value;
const engineBlock = CHECK.engineBlock(html);
// Only a line that BEGINS with // is a comment here. Stripping every "//" made
// a string holding an https:// URL swallow the rest of its own line, and a call
// written after such a string was invisible to every rule below.
const engineCode = CHECK.innerScript(engineBlock)
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// The content the file is delivered with, and a signed variant of it. The
// fixture is made from the DELIVERED content, in memory: it cannot drift from
// what an institution downloads, the way a separate example file would.
const loadedContent = CHECK.loadContent(html);
const starter = loadedContent.value;
// A file whose questionnaire cannot be read at all: a renamed container, a
// syntax error, a variable declared with `let` in a block. Everything below
// reads `starter`, so the run used to die on a TypeError forty lines later and
// print a stack trace at somebody who had mistyped an attribute. It stops here
// instead, and says what check.html would have said.
if (!starter || typeof starter !== 'object' || Array.isArray(starter)) {
  console.log('\n  ai-go.html carries no questionnaire this run can read.');
  console.log('  ' + (loadedContent.hint || loadedContent.head ||
    (loadedContent.error && loadedContent.error.message) || 'no reason given'));
  console.log('\n  Nothing was checked. Fix that first, then run this again.');
  process.exit(2);
}

// The engine assertions further down are written against the SHAPE of that
// example: three questions, two results, two links, five paths. Run on an
// institution's own tree they used to crash on a node name that no longer
// exists, so they fall back to this fixture, which has the same shape and no
// other purpose. While the file still carries the shipped example the fixture is
// unused and an assertion below proves the two shapes agree, so it cannot drift.
const FIXTURE = {
  id: 'fixture', version: '1.0.0', langs: ['en'], defaultLang: 'en', start: 'q1',
  publisher: { name: 'TO_FILL_IN', domains: ['TO_FILL_IN'] },
  review: { by: 'TO_FILL_IN', date: 'TO_FILL_IN' },
  jurisdiction: 'TO_FILL_IN', legalBasis: ['TO_FILL_IN'],
  disclaimer: 'Disclaimer: an example. TO_FILL_IN',
  steps: [{ id: 's1', name: 'One' }, { id: 's2', name: 'Two' }, { id: 's3', name: 'Three' }],
  links: {
    guide: { label: 'Internal guide', external: true, href: 'https://example.org/guide' },
    contact: { label: 'Contact the relevant unit', external: true, href: 'https://example.org/contact' }
  },
  nodes: {
    q1: { type: 'single', step: 's1', title: 'Does your data concern people?', help: 'Directly or indirectly.',
      answers: [{ value: 'yes', to: 'q2', detail: 'Yes' }, { value: 'no', to: 'q3', detail: 'No' }] },
    q2: { type: 'multi', step: 's2', polarity: 'direct', title: 'Does this data fall into a sensitive category?',
      help: '**Tick everything that applies, or continue if nothing applies.**',
      options: [{ value: 'health', label: 'Health' }, { value: 'opinions', label: 'Opinions or beliefs' },
        { value: 'legal', label: 'Legal proceedings' }],
      next: { ifAnyResult: 'restricted', else: 'q3' } },
    q3: { type: 'single', step: 's3', title: 'Is sharing of this data restricted?', help: 'For example: professional secrecy.',
      answers: [{ value: 'yes', result: 'restricted', detail: 'At least one restriction applies' },
        { value: 'no', result: 'open', detail: 'Sharing is unrestricted' }] }
  },
  results: {
    open: { level: 'success', title: 'No particular restriction', summary: 'No constraint found.',
      solution: { label: 'plain', text: 'Unrestricted use' }, allowed: ['guide'] },
    restricted: { level: 'warning', title: 'Restricted use', summary: 'Particular care is required.',
      solution: { label: 'legal', text: 'Internal solutions only' }, allowed: ['guide', 'contact'],
      forbidden: ['No external service without a contract'],
      alert: { level: 'warning', text: '**To check:** an example.' } }
  }
};

// Recognised by the fingerprint of the shipped example plus the placeholders it
// still carries, not by node names: an institution that keeps the ids q1..q3 and
// rewrites the texts had every assertion below fired at it, red, while the guide
// promised the opposite. Change the example content and this constant moves with
// it, the same way the engine hash sits in the AI_GO-ENGINE-BEGIN line.
const STARTER_FINGERPRINT = '88f86726cce74d8b';
// The fingerprint signs start, nodes, results and links, and nothing else, so
// an adopter who renames the tree keeps it. The id is checked here as well: the
// pair is what says "this is still the shipped example", and one of them alone
// let a renamed tree stay in delivered mode and fail on a count it no longer had.
const asDelivered =
  AI_GO.fingerprint(starter) === STARTER_FINGERPRINT &&
  starter.id === 'my-questionnaire' &&
  JSON.stringify(starter).indexOf('TO_FILL_IN') >= 0;
// A run against an adapted file checks fewer things. Saying so is the point:
// a green line under a reduced set reads exactly like a green line under all.
const skipped = [];
const onlyDelivered = label => { if (!asDelivered) skipped.push(label); return asDelivered; };
const base = asDelivered ? starter : FIXTURE;
// Replacing STARTER_FINGERPRINT with a wrong value used to take 23 assertions
// away and still print a green line with exit 0. An assertion below says that in
// THIS repository the example is the delivered one, so the constant cannot rot
// quietly: change the example on purpose and that assertion names the new value.
const signed = cp(base);
signed.id = 'hes-example-ia';
signed.publisher = { name: 'Example University of Applied Sciences', domains: ['hes-example.ch'] };
signed.review = { by: 'Legal service', date: '2026-06-01' };
signed.jurisdiction = 'CH-VD';
signed.legalBasis = ['FADP'];
signed.disclaimer = '**Disclaimer:** our own text.';
// A signed variant is a file whose content was actually adapted, not one whose
// signature was filled while the example's links and remarks stayed in place:
// those now count as placeholders, and rightly so.
Object.keys(signed.links).forEach(k => {
  signed.links[k] = { label: 'Our ' + k, external: true, href: 'https://hes-example.ch/' + k };
});
Object.values(signed.results).forEach(r => {
  if (r.alert) r.alert.text = '**To check:** our own remark.';
});

// The same content with its signature back in placeholders: the state every file
// is in before anyone fills it, whoever wrote the questions. The preview and
// strict-mode assertions below need unsigned content, not the shipped example, or
// they only hold for the file this repository happens to ship.
const unsigned = cp(base);
unsigned.publisher = { name: 'TO_FILL_IN', domains: ['TO_FILL_IN'] };
unsigned.review = { by: 'TO_FILL_IN', date: 'TO_FILL_IN' };

// The licence asks an adopting institution to drop reference/: it is published
// for reading, not for reuse. Doing so used to end the harness on a Node stack
// trace. Everything that does not need the origin's questionnaire still runs.
let unil = null, oracle = null;
const refFiles = ['reference/aigo-unil.js', 'reference/aigo-unil.paths.js'];
const refPresent = refFiles.filter(f => { try { statSync(join(ROOT, f)); return true; } catch (e) { return false; } });
if (refPresent.length === refFiles.length) {
  // Present but unreadable is a broken repository, not an institution that
  // dropped the origin's questionnaire: let it throw rather than go quiet.
  unil = require(join(ROOT, 'reference/aigo-unil.js'));
  oracle = require(join(ROOT, 'reference/aigo-unil.paths.js'));
} else if (refPresent.length) {
  throw new Error('reference/ is half there: ' + refPresent.join(', ') + ' without the other');
}
const hasReference = !!unil && !!oracle;

const errs = t => AI_GO.structure(t);
const paths = t => CHECK.paths(t);
// Position of a marker LINE, never the first textual match: the file's own
// instructions name every marker in prose above the markers themselves.
const at = tok => CHECK.markers(html).found.find(f => f.token === tok).hits[0].index;

// Mechanically turns a one-language tree into a two-language one, so that the
// bilingual format is tested on the SAME tree as the single-language format.
const bilingual = (tree, second) => {
  const t = cp(tree);
  // The delivered example used to be written in one language, so adding a second
  // meant wrapping plain strings. It now ships in two, so a text reaching here is
  // as often an object as a string, and the added language is derived from what
  // the tree already says in its own: wrapping an object in an object produced a
  // tree that declared a language none of its texts carried.
  const base = tree.defaultLang || (tree.langs || ['en'])[0];
  const langs = (tree.langs || [base]).slice();
  if (langs.indexOf(second) < 0) langs.push(second);
  const mark = v => (typeof v === 'string' ? 'X ' + v : v);
  const w = v => {
    if (v == null) return v;
    if (typeof v === 'string' || Array.isArray(v)) {
      const o = {}; langs.forEach(l => { o[l] = l === second ? mark(v) : v; }); return o;
    }
    if (typeof v === 'object') {
      const src = v[base] !== undefined ? v[base] : v[Object.keys(v)[0]];
      const o = {}; langs.forEach(l => { o[l] = v[l] !== undefined ? v[l] : (l === second ? mark(src) : src); });
      return o;
    }
    return v;
  };
  t.langs = langs; t.defaultLang = base;
  t.disclaimer = w(t.disclaimer);
  (t.steps || []).forEach(s => { s.name = w(s.name); });
  Object.values(t.links || {}).forEach(l => { l.label = w(l.label); });
  Object.values(t.nodes || {}).forEach(node => {
    node.title = w(node.title); if (node.help) node.help = w(node.help);
    (node.answers || []).forEach(a => { if (a.label) a.label = w(a.label); if (a.detail) a.detail = w(a.detail); });
    (node.options || []).forEach(o => { o.label = w(o.label); });
  });
  Object.values(t.results || {}).forEach(r => {
    r.title = w(r.title); if (r.summary) r.summary = w(r.summary);
    if (r.solution) r.solution.text = w(r.solution.text);
    if (r.alert) r.alert.text = w(r.alert.text);
    if (r.forbidden) r.forbidden = r.forbidden.map(w);
  });
  return t;
};

console.log('file: the six markers and the two blocks');
section(() => {
  const mk = CHECK.markers(html);
  ok('ai-go.html carries the six markers, once each, in order', mk.ok, mk.wrong.join(', '));
  ok('the six markers are the documented ones', CHECK.MARKS.join(',') ===
    'AI_GO-BEGIN,AI_GO-CONTENT-BEGIN,AI_GO-CONTENT-END,AI_GO-ENGINE-BEGIN,AI_GO-ENGINE-END,AI_GO-END');
  ok('the content block evaluates and exports an object',
    !!starter && typeof starter === 'object' && !Array.isArray(starter));
  ok('the engine block evaluates and exports the public API',
    !!AI_GO && ['version', 'UI', 'POLICY', 'mount', 'mountAll', 'structure', 'guard', 'fingerprint', 'hash']
      .every(k => k in AI_GO));
  ok('the engine block declares its own version and hash', !!engineLoad.declared);
  ok('the declared engine hash matches the block',
    engineLoad.declared && engineLoad.declared.h === engineLoad.computed,
    engineLoad.declared ? `declared ${engineLoad.declared.h}, computed ${engineLoad.computed}: paste the computed value into the AI_GO-ENGINE-BEGIN line` : 'no marker');
  ok('the declared engine version matches the engine',
    engineLoad.declared && engineLoad.declared.v === AI_GO.version);
  ok('engine version string is a release number', /^\d+\.\d+\.\d+$/.test(AI_GO.version));
  // Only true of the file this repository ships. An adopter has filled them in,
  // and check.html is where their own content is judged.
  if (onlyDelivered('the placeholders of the shipped example')) ok('ai-go.html is delivered with its placeholders intact',
    AI_GO.guard(starter, '').some(i => /TO_FILL_IN/.test(i.message)),
    'without them every adopter would publish a signed example under its own name');
});

console.log('engine: static guarantees');
ok('no innerHTML / outerHTML / insertAdjacentHTML / document.write / eval in the engine',
  !/innerHTML|outerHTML|insertAdjacentHTML|document\.write|\beval\(/.test(engineCode));
ok('no network API in the engine, however it is spelled',
  // Matching "fetch(" let window['fetch'](...) straight through. The NAME is what
  // matters: none of these words has any business appearing in this engine at
  // all. A determined author could still split the string, but a determined
  // author owns the file they publish; this catches the accidental import.
  !/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts)\b/.test(engineCode),
  (engineCode.match(/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts)\b/) || [])[0]);
ok('no global document.querySelector in the engine', !/document\.querySelector/.test(engineCode));
ok('the only outbound message is the iframe height, and there is one of it',
  (engineCode.match(/postMessage/g) || []).length === 1 &&
  /aigo: 'height'/.test(engineCode));
ok('no localStorage in the engine: answers die with the tab',
  !/localStorage/.test(engineCode) && /sessionStorage/.test(engineCode));
ok('the engine calls the requestAnimationFrame it tested, never a bare global',
  /var raf = window\.requestAnimationFrame/.test(engineCode) && !/\brequestAnimationFrame\(/.test(engineCode.replace(/window\.requestAnimationFrame/g, '')));

console.log('pages: what a single file must never contain');
for (const page of PAGES) {
  const src = read(page);
  const bodies = bodiesOf(src);
  ok(`${page}: has at least one inline script`, bodies.length > 0);
  bodies.forEach((code, i) => {
    let err = null;
    try { new Function(code); } catch (e) { err = e.message; }
    ok(`${page}: inline script ${i + 1} parses`, err === null, err);
  });
  // A stray closing script tag inside a string closes the block mid-object and
  // the page dies before anything runs. It is the failure mode this form adds,
  // and it applies to the ENGINE as much as to the content.
  // CASE-INSENSITIVE, because the parser is. A closing tag typed in capitals
  // inside a comment closed the block in Chrome while this count stayed even and
  // this assertion stayed green: the shipped validator did not start, and the
  // harness said nothing. The browser does not care how the tag is typed, so
  // neither does this.
  const opens = (src.match(/<script/gi) || []).length;
  const closes = (src.match(/<\/script/gi) || []).length;
  ok(`${page}: script tags pair up (${opens} open, ${closes} close)`, opens === closes && opens === bodies.length);
  ok(`${page}: no script tag or comment opener inside a script body, in any case`,
    bodies.every(b => !/<script/i.test(b) && !/<\/script/i.test(b) && b.indexOf('<!--') < 0));
  ok(`${page}: declares its Content Security Policy`, /default-src 'none'/.test(src));
  ok(`${page}: loads nothing from anywhere`, !/\ssrc\s*=/.test(src) && !/<link\b/.test(src));
  ok(`${page}: no literal non-breaking space`, !src.includes(NBSP));
  // A house rule of this repository, not a rule of the format: an institution
  // writing its own questions may use whatever punctuation it likes.
  if (asDelivered || page !== 'ai-go.html') ok(`${page}: no em dash`, !src.includes(EM_DASH));
}

console.log('pages: the two halves of ai-go.html');
section(() => {
  // The adopter's half is what lies between the end of the content block and the
  // start of the engine block.
  const themeBlock = html.slice(at('AI_GO-CONTENT-END'), at('AI_GO-ENGINE-BEGIN'));
  ok('the adopter half sits before the engine, and both are found by marker line',
    at('AI_GO-BEGIN') < at('AI_GO-CONTENT-BEGIN') && at('AI_GO-CONTENT-END') < at('AI_GO-ENGINE-BEGIN') &&
    at('AI_GO-ENGINE-END') < at('AI_GO-END'));
  ok('the adopter half redefines no accessibility rule',
    !themeBlock.includes('.aigo-sr-only') && !themeBlock.includes(':focus-visible'));
  ok('the adopter half carries a container that names its content variable',
    /data-ai-go="[A-Za-z_$][\w$]*"/.test(themeBlock));
  ok('the base layer survives inside the engine block',
    ['.aigo-sr-only', ':focus-visible', 'pointer: coarse', 'prefers-reduced-motion', '.aigo-error', ':where(.aigo)']
      .every(c => engineBlock.includes(c)));
  ok('the engine block marks where the base layer ends',
    /EDIT NOTHING ABOVE THIS LINE/.test(engineBlock));
  ok('the engine block styles the refusal box, the preview banner and the footer',
    ['.aigo-error', '.aigo-banner', '.aigo-review-expired', '.aigo-attribution', '.aigo-content-id', '.aigo-disclaimer']
      .every(c => engineBlock.includes(c)));
  const themeVars = [...new Set(engineBlock.match(/--aigo-[a-z-]+(?=:)/g) || [])];
  ok(`the theme still exposes its ${themeVars.length} variables, so a visual identity needs no engine edit`,
    themeVars.length === 23, themeVars.join(' '));
  // Two things that describe the file THIS repository ships and not every adopter's:
  // the commented theme variables and the commented German interface example are
  // there to be read, and deleting them once read is a legitimate edit.
  if (onlyDelivered('the example content of ai-go.html')) {
    ok('the adopter half carries the commented theme variables', /--aigo-accent/.test(themeBlock));
    ok('the content block shows how to add an interface language without touching the engine',
      /ui: \{ de: \{/.test(html.slice(at('AI_GO-CONTENT-BEGIN'), at('AI_GO-CONTENT-END'))));
  }
});

// Everything above tests the ENGINE and the shape of the file, and holds whatever
// content the file carries. Only the block just below is written against the
// three-question example this repository ships: an institution that replaced it
// has not broken anything, it has moved beyond what that block can assert. The
// engine, the guard, the frozen UNIL tree and, when this is still this
// repository, the documentation rules all keep running either way. Exiting early
// here used to skip them, so a starter edited by mistake turned every other rule
// in this file green at once.
if (onlyDelivered('the shipped example, read as a tree')) {
  console.log('content: the file as delivered');
  ok('starter: 0 structural errors', errs(starter).length === 0, errs(starter).map(e => e.path).join(','));
  ok('starter: 5 paths', paths(starter).length === 5, String(paths(starter).length));
  // Seven signature fields, plus the example's own id, links and remark: the
  // engine refuses a file that was signed and otherwise left as delivered.
  // Twelve signature points, plus the thirteenth that refuses the example as a
  // whole: filling the signature is not a way to publish somebody else's questions.
  // Et ce que la feuille de départ promet à ce sujet : treize points, dont huit
  // que la signature règle et cinq qui demandent d'écrire son propre contenu.
  {
    const filled = cp(starter);
    filled.publisher = { name: 'Example UAS', domains: ['hes-example.ch'] };
    filled.review = { by: 'Legal', date: '2026-06-01' };
    filled.jurisdiction = 'CH-VD'; filled.legalBasis = ['FADP'];
    filled.disclaimer = { fr: 'Avertissement.', en: 'Disclaimer.' };
    const left = AI_GO.guard(filled, 'hes-example.ch').length;
    const guide = read('docs/DEMARRER.md');
    ok(`filling the signature leaves ${left} points, which is what docs/DEMARRER.md says`,
      left === 5 && /porte \*\*treize\*\*/.test(guide) && /que huit/.test(guide) &&
      /\*\*Les cinq autres\*\*/.test(guide), String(left));
  }
  ok('starter: refused for publication, 13 points', AI_GO.guard(starter, '').length === 13,
    AI_GO.guard(starter, '').map(i => i.path).join(','));
  ok('starter: a placeholder review date is reported once, as a placeholder',
    AI_GO.guard(starter, '').filter(i => i.path === 'review.date').length === 1);
  // The example ships in the two languages the reader of this repository speaks,
  // French first, because a francophone institution handed an English toy stopped
  // reading there. Every text has to carry both, or the engine serves one language
  // silently in place of the other.
  const bothLangs = [];
  AI_GO.walkStrings ? null : null;
  const carries = (v, path) => {
    if (v == null) return;
    if (typeof v === 'string') { bothLangs.push(path); return; }
    if (Array.isArray(v)) return;
    starter.langs.forEach(l => { if (typeof v[l] === 'undefined') bothLangs.push(path + '.' + l); });
  };
  Object.keys(starter.nodes).forEach(id => {
    const n = starter.nodes[id];
    carries(n.title, 'nodes.' + id + '.title');
    if (n.help) carries(n.help, 'nodes.' + id + '.help');
  });
  Object.keys(starter.results).forEach(id => carries(starter.results[id].title, 'results.' + id + '.title'));
  ok(`starter: ${starter.langs.length} languages, ${JSON.stringify(starter.langs)}, and every text carries both`,
    starter.langs.length === 2 && starter.defaultLang === 'fr' && bothLangs.length === 0 &&
    !CHECK.extras(starter, paths(starter)).some(i => /Untranslated/.test(i.message)),
    bothLangs.join(', '));
  ok('signed variant: 0 structural errors and 5 paths', errs(signed).length === 0 && paths(signed).length === 5);
  ok('signed variant: guard passes on its own domain', AI_GO.guard(signed, 'www.hes-example.ch').length === 0,
    AI_GO.guard(signed, 'www.hes-example.ch').map(i => i.path + ': ' + i.message).join(' | '));
  const shape = t => JSON.stringify([Object.keys(t.nodes), Object.keys(t.results), Object.keys(t.links),
    Object.values(t.nodes).map(x => (x.options || []).map(o => o.value).join('|') + '/' +
      (x.answers || []).map(a => a.value + '>' + (a.to || a.result)).join('|')), paths(t).length]);
  ok('the fallback fixture still has the shape of the shipped example, so it cannot drift',
    shape(FIXTURE) === shape(starter), shape(FIXTURE) + ' vs ' + shape(starter));
} else {
  console.log(`content: yours (${AI_GO.fingerprint(starter)}), not the one this file was delivered with (${STARTER_FINGERPRINT})`);
  ok('your content loads and has no structural error', errs(starter).length === 0,
    errs(starter).map(e => e.path + ': ' + e.message).join(' | '));
  ok('your content has at least one reachable path', paths(starter).length > 0);
  ok('your content reaches every result it declares',
    Object.keys(starter.results).every(id => paths(starter).some(p => p.result === id)),
    Object.keys(starter.results).filter(id => !paths(starter).some(p => p.result === id)).join(','));
}

if (!hasReference) skipped.push('the frozen questionnaire of reference/, its 20-path oracle and everything read from them');
if (!hasReference) console.log('reference/ is not here: the assertions about the origin questionnaire are skipped');
if (hasReference) section(() => {
console.log('content: the frozen UNIL tree, bilingual, on the same engine');
ok('aigo-unil: content fingerprint is cbdb4863aed9f778', AI_GO.fingerprint(unil) === 'cbdb4863aed9f778', AI_GO.fingerprint(unil));
ok('aigo-unil: 0 structural errors', errs(unil).length === 0, errs(unil).map(e => e.path).join(','));
ok('aigo-unil: exactly 20 paths', paths(unil).length === 20, String(paths(unil).length));
ok('aigo-unil: enumeration not truncated', paths(unil).truncated === false);
ok('the frozen oracle holds exactly 20 paths', oracle.length === 20);
ok('aigo-unil: conforms to the frozen oracle, path for path',
  JSON.stringify(paths(unil).map(CHECK.pathKey).sort()) === JSON.stringify(oracle.slice().sort()),
  'the oracle is frozen: record the change, do not regenerate it');
ok('aigo-unil: 11 questions, 7 results, 10 steps',
  Object.keys(unil.nodes).length === 11 && Object.keys(unil.results).length === 7 && unil.steps.length === 10);
ok('aigo-unil: still declares two languages and writes every text as an object',
  JSON.stringify(unil.langs) === JSON.stringify(['fr', 'en']) &&
  typeof unil.nodes.q1.title === 'object' && !!unil.nodes.q1.title.fr && !!unil.nodes.q1.title.en);
ok('aigo-unil: guard passes on unil.ch', AI_GO.guard(unil, 'www.unil.ch').length === 0,
  AI_GO.guard(unil, 'www.unil.ch').map(i => i.path).join(','));
ok('aigo-unil: guard passes on a local preview', AI_GO.guard(unil, 'localhost').length === 0);
// The hole this closes: an empty hostname used to read as "local", which handed
// the origin its own exemption. check.html passed "" and therefore declared a
// verbatim copy of the origin's questionnaire publishable anywhere; so did any
// about:srcdoc or blob: frame inside somebody else's site.
ok('an unknown hostname is not a local machine and gets no origin exemption',
  AI_GO.guard(unil, '').length > 0, String(AI_GO.guard(unil, '').length));
ok('an unknown hostname still skips the domain declaration, and only that',
  !AI_GO.guard(unil, '').some(i => i.path === 'publisher.domains'),
  AI_GO.guard(unil, '').map(i => i.path).join(','));
section(() => {
  // Classes of refusal, not a magic total: a count turns every widening of the
  // scan into a red test, and tells nobody what was actually caught.
  const away = AI_GO.guard(unil, 'www.hes-example.ch');
  const tops = new Set(away.map(i => i.path.split(/[.[]/)[0]));
  ok('aigo-unil: guard refuses a verbatim copy elsewhere', away.length > 0);
  ok('aigo-unil: the refusal names the domain, the reserved id and the origin links',
    tops.has('publisher') && tops.has('id') && tops.has('links'), [...tops].join(','));
  // The reference tree happens to name nobody in its disclaimer, so the widening
  // is proved where it bites: on a copy that moved the origin's name out of the
  // questions and into the fields the scan used to ignore.
  const moved = cp(unil);
  moved.title = { fr: 'Outil de l\u2019Universite de Lausanne', en: 'A University of Lausanne tool' };
  moved.disclaimer = { fr: 'Repris de l\u2019UNIL.', en: 'Adapted from UNIL.' };
  const movedTops = new Set(AI_GO.guard(moved, 'www.hes-example.ch').map(i => i.path.split(/[.[]/)[0]));
  ok('the origin is caught in the title and the disclaimer, not only in the questions',
    movedTops.has('title') && movedTops.has('disclaimer'), [...movedTops].join(','));
  // The refusal is written in the tree's own language, so the sentence is
  // matched against every wording the engine ships, never one hard-coded here.
  const RESERVED_TERM = Object.keys(AI_GO.UI)
    .map(l => AI_GO.UI[l].msg && AI_GO.UI[l].msg.reservedTerm).filter(Boolean)
    .map(t => t.split('{')[0]);
  ok('aigo-unil: a lowercased copy of the origin name is caught too',
    AI_GO.guard(JSON.parse(JSON.stringify(unil).replace(/UNIL/g, 'unil')), 'www.hes-example.ch')
      .some(i => RESERVED_TERM.some(t => i.message.startsWith(t)) || i.path.startsWith('nodes')));
});
ok('aigo-unil: the content block of ai-go.html and the reference file share one variable name',
  /var AI_GO_CONTENT = \{/.test(read('reference/aigo-unil.js')) && /var AI_GO_CONTENT = \{/.test(html));
section(() => {
  // The engine ships one language of content in its starter file. This proves
  // the two-language format is still a first-class citizen of the SAME engine:
  // the routing of the frozen tree is identical whichever language is picked.
  const fr = paths(unil).map(CHECK.pathKey).sort();
  const both = bilingual(signed, 'de');
  ok('a mechanically bilingual tree keeps 0 structural errors and the same routing',
    errs(both).length === 0 &&
    JSON.stringify(paths(both).map(CHECK.pathKey).sort()) === JSON.stringify(paths(signed).map(CHECK.pathKey).sort()),
    errs(both).map(e => e.path).join(','));
  ok('the frozen bilingual routing does not depend on the language it is read in',
    JSON.stringify(fr) === JSON.stringify(oracle.slice().sort()));
});
});

console.log('guard: the shapes a value can take, and the writings a name can take');
section(() => {
  // Written after the fact, because the teammate who hardened the engine was cut
  // off before delivering them. Each one is a defect an audit reproduced first.
  const mk = extra => Object.assign({
    id: 'heg', langs: ['en'], defaultLang: 'en', start: 'q1', steps: [{ id: 's1', name: 'S' }],
    publisher: { name: 'HEG', domains: ['evil.example'] }, review: { by: 'HEG', date: '2026-01-01' },
    nodes: { q1: { type: 'single', step: 's1', title: 'Q',
      answers: [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }] } },
    results: { r: { level: 'info', title: 'R', solution: { text: 'S' } } }, links: {}, disclaimer: 'D'
  }, extra || {});
  const refused = t => { try { return AI_GO.structure(t).length + AI_GO.guard(t, 'evil.example').length; }
                         catch (e) { return 'threw: ' + e.message; } };
  const NAME = 'AI_GO, UNIL, Universite de Lausanne';

  // A value the renderer reads and the checks did not: three shapes, one rule.
  const shapes = [];
  { const t = mk(); t.nodes.q1.title = new String(NAME); shapes.push(['a String object', t]); }
  { const t = mk(); const o = {};
    Object.defineProperty(o, 'en', { enumerable: false, get() { return NAME; } });
    t.nodes.q1.title = o; shapes.push(['a language key that is a hidden getter', t]); }
  { const t = mk(); t.nodes.q1 = Object.assign(Object.create({ title: NAME }),
      { type: 'single', step: 's1', answers: t.nodes.q1.answers });
    shapes.push(['a title inherited from a prototype', t]); }
  { const t = mk(); const n = t.nodes; n.q1.title = NAME; delete t.nodes;
    Object.defineProperty(t, 'nodes', { value: n, enumerable: false, writable: true, configurable: true });
    shapes.push(['the whole nodes map, made non-enumerable', t]); }
  const shown = shapes.filter(([, t]) => refused(t) === 0);
  ok(`the ${shapes.length} shapes that reach a reader without being read are refused`,
    shown.length === 0, shown.map(s => s[0]).join(', '));

  // THE READING ITSELF. The renderer composes bold from ** and drops the markers;
  // the guard used to read the string with them still in, so a pair of empty ones
  // hid four reserved names at once and the page drew them in full. Whatever the
  // inline syntax becomes, these two have to answer the same question.
  {
    const NAMES = 'Adapte du questionnaire de l Universite de Lausanne (DCSR), moteur AI_GO.';
    const hidden = 'Adapte du questionnaire de l Universit****e de Lausanne (DC****SR), moteur AI****_GO.';
    const seen = txt => { const t = mk(); t.results.r.summary = txt;
      return AI_GO.guard(t, 'evil.example').filter(i => /results/.test(i.path)).length; };
    ok('a name split by empty bold markers is refused exactly like the name written plainly',
      seen(hidden) === seen(NAMES) && seen(NAMES) > 0, seen(hidden) + ' vs ' + seen(NAMES));
    // And the reading the guard uses is the reading the reader gets, not a third one.
    ok('the engine spells what it draws, markers dropped, for the guard to read',
      AI_GO.plain(hidden)[0].indexOf('*') < 0 &&
      AI_GO.plain(hidden)[0] === AI_GO.plain(NAMES)[0], AI_GO.plain(hidden)[0]);
  }

  // The name, in every writing that reads as the name on screen. A hand-written
  // table of twins was widened twice and still missed whole alphabets, so the
  // rule now reads a skeleton. What matters is that it holds in BOTH directions.
  const names = t => AI_GO.guard(t, 'evil.example').filter(i => /nodes/.test(i.path)).length > 0;
  const titled = txt => { const t = mk(); t.nodes.q1.title = txt; return t; };
  const MUST_REFUSE = ['Guide UNIL', 'Guide UNІL', 'Guide ꓴꓠꓲꓡ',
    'Guide ᴜɴɪʟ', 'Guide UNIL_2026', 'Guide _UNIL', 'Guide UNIL2026',
    'Le questionnaire AI_GO', 'Universite de Lausanne', 'la DCSR', 'Ünïl'];
  const MUST_PASS = ['Данные и наука',
    'УНИЛ', 'Πανεπιστήμιο',
    'بيانات', 'Universite de Geneve',
    'Haute ecole de gestion', 'unilateral decision', 'UNIX et Linux', 'Universal Design',
    'Un Nouvel Institut Local', 'Anil Kumar', 'util.js', 'DATA_TEST'];
  // LE PRIX DE LA FERMETURE, ECRIT PLUTOT QUE TU. Un mot de quatre lettres dans
  // une ecriture qu'aucune langue declaree n'emploie est refuse, parce que
  // quatre lettres illisibles sont quatre lettres illisibles, qu'il y ait ou non
  // une lettre latine ailleurs dans la chaine. L'exemption « pas de lettre
  // latine, donc de la prose » etait vraie d'une phrase et fausse d'un champ :
  // `publisher.name` en porte quatre et rien d'autre, et une institution
  // signait sa page du nom de l'origine sans declarer une seule langue. Ce qui
  // est refuse ici l'est avec la phrase qui nomme le remede.
  // Quatre LETTRES apres lecture : le coreen est ecarte de cette liste parce que
  // la decomposition rend dix jamo de ces quatre syllabes, et dix lettres ne
  // sont pas quatre.
  const NEEDS_ITS_LANGUAGE = ['\u500b\u4eba\u60c5\u5831', '\u05de\u05d9\u05d3\u05e2',
    '\u1d1c\u0274\u026a\u029f', '\ua4ea\ua420\ua430\ua461', '\u13a2\u13a0\u13a1\u13a3'];
  const quiet = NEEDS_ITS_LANGUAGE.filter(x => {
    const hit = AI_GO.guard(titled(x), 'evil.example').filter(i => /nodes/.test(i.path))[0];
    return !hit || !/langs/.test(hit.message);
  });
  ok(`a four-letter word in a script no declared language uses is refused, and told what lifts it`,
    quiet.length === 0, quiet.map(JSON.stringify).join(', '));
  const leaked = MUST_REFUSE.filter(x => !names(titled(x)));
  const punished = MUST_PASS.filter(x => names(titled(x)));
  ok(`the ${MUST_REFUSE.length} writings of the origin name that read as the name are refused`,
    leaked.length === 0, leaked.map(JSON.stringify).join(', '));
  ok(`and the ${MUST_PASS.length} innocent texts, Cyrillic, Greek, Japanese and Arabic included, are not`,
    punished.length === 0, punished.map(JSON.stringify).join(', '));

  // THE RECEIPT COVERS WHAT THE READER SEES. The fingerprint signs the questions,
  // the answers and the results; the signature signs the rest of what is drawn.
  // Step names and interface labels were outside both, so a copy renamed its steps
  // to "No personal data / Free use / Publication allowed" and its Continue button
  // to "Publish unchecked" and produced a receipt identical to the original's.
  // Each field is moved on its own: a projection that drops one of them silently
  // is a receipt about another page.
  {
    const moves = (name, mut) => { const t = mk(); const before = AI_GO.signature(t);
      mut(t); return { name: name, moved: AI_GO.signature(t) !== before }; };
    const fields = [
      moves('publisher', t => { t.publisher.name = 'Autre'; }),
      moves('review', t => { t.review.by = 'Autre'; }),
      moves('disclaimer', t => { t.disclaimer = 'Autre avertissement.'; }),
      moves('derivedFrom', t => { t.derivedFrom = { name: 'Une source' }; }),
      moves('jurisdiction', t => { t.jurisdiction = 'CH-GE'; }),
      moves('legalBasis', t => { t.legalBasis = ['LPD']; }),
      moves('steps', t => { t.steps[0].name = 'Publication autorisée'; }),
      moves('ui', t => { t.ui = { en: { continue: 'Publier sans contrôle' } }; }),
      moves('id', t => { t.id = 'autre-id'; }),
      moves('langs', t => { t.langs = ['en', 'fr']; })
    ];
    const still = fields.filter(f => !f.moved).map(f => f.name);
    ok(`each of the ${fields.length} fields the receipt covers moves it on its own`,
      still.length === 0, 'ne bougent pas : ' + still.join(', '));
    // And the fingerprint stays what it was: the questions did not move.
    ok('while the content fingerprint answers only for the questions, and did not move',
      AI_GO.fingerprint(mk()) === AI_GO.fingerprint((() => { const t = mk(); t.steps[0].name = 'X'; t.id = 'y'; return t; })()));
  }

  // A VALUE THE READER CAN ACTUALLY SEND. The radio carries a string and the
  // router compares with ===, so a numeric value made a branch nobody could take
  // with a keyboard: the validator counted the path, the receipt signed it, and
  // Continue answered "choose an answer" for ever. Three signed paths out of five.
  {
    const numeric = mk(); numeric.nodes.q1.answers[0].value = 1;
    const boolean = mk(); boolean.nodes.q1.answers[0].value = true;
    const boxed = mk();
    boxed.nodes.q1 = { type: 'multi', step: 's1', title: 'Q',
      options: [{ value: 2, label: 'deux' }], next: { ifAnyResult: 'r', elseResult: 'r' } };
    const flagged = t => AI_GO.structure(t).some(i => /answers\[0\]|options\[0\]/.test(i.path));
    ok('an answer value that is not a string is refused, not signed as a path nobody can take',
      flagged(numeric) && flagged(boolean) && flagged(boxed),
      [flagged(numeric), flagged(boolean), flagged(boxed)].join('/'));
  }

  // WHAT THE TREE SAYS IT IS WRITTEN IN decides one ambiguous case, and only one.
  // Four letters of an unreadable script are four wildcards, and four wildcards
  // match UNIL: right for a tree in French and English, where such a run is an
  // imitation and nothing else; wrong for a tree in Chinese, where nine ordinary
  // sentences out of twenty were refused, a Japanese personal name among them.
  // The plain name is refused either way: the declaration buys ambiguity, never
  // the name itself.
  {
    const said = (txt, langs) => { const t = mk(); t.langs = langs; t.defaultLang = langs[0];
      t.results.r.summary = txt;
      return AI_GO.guard(t, 'evil.example').filter(i => /results/.test(i.path)).length > 0; };
    const LATIN = ['fr', 'en'], CHINESE = ['zh', 'en'];
    const IMITATIONS = ['Guide UNIL', 'Guide \ua4f4\ua4e0\ua4f2\ua4e1', 'Guide \u1d1c\u0274\u026a\u029f',
      'Guide UN****IL'];
    ok(`the ${IMITATIONS.length} imitations of the name are refused to a tree written in Latin script`,
      IMITATIONS.every(t => said(t, LATIN)), IMITATIONS.filter(t => !said(t, LATIN)).join(' | '));
    ok('a tree that declares Chinese may write Chinese, and is still refused the name itself',
      !said('\u6570\u636e\u5b89\u5168 (PDF)', CHINESE) && said('Guide UNIL', CHINESE));
    ok('and the declaration is read from langs, so it is on the page for anyone to see',
      said('\u6570\u636e\u5b89\u5168 (PDF)', LATIN));
  }

  // The origin's link, which survived a copy as soon as one wrote www.
  const linked = href => { const t = mk(); t.links = { m: { label: 'L', href: href } };
    t.results.r.allowed = ['m']; return AI_GO.guard(t, 'evil.example').filter(i => /links/.test(i.path)).length > 0; };
  const ORIGIN_LINK = ['https://padlet.com/ai_research/board', 'https://www.padlet.com/ai_research/board',
    'https://padlet.com./ai_research/board', 'https://padlet.com:443/ai_research/board',
    'https://padlet.com/%61i_research/board'];
  ok('the origin link is caught host and path apart, through www., a dot, a port and an escape',
    ORIGIN_LINK.every(linked), ORIGIN_LINK.filter(h => !linked(h)).join(' | '));
  ok('and a link to the same host that is not the origin resource still passes',
    !linked('https://padlet.com/quelque-autre/board'));

  // The exemption that grew by prefix: publisher.domains is a hostname, not prose,
  // and publisher.domainsNote used to inherit the exemption for the same reason.
  const noted = mk(); noted.publisher.domainsNote = 'Universite de Lausanne';
  ok('only publisher.domains is exempt, not every path that begins with it',
    AI_GO.guard(noted, 'evil.example').some(i => i.path.indexOf('publisher.domainsNote') === 0));

  // On the origin's own domain, naming the origin is the point, and a faculty of
  // it publishing its own variant is the likeliest reader of all.
  const at = (id, host, title) => { const t = mk(); t.id = id; t.publisher.domains = [host];
    t.nodes.q1.title = title; return AI_GO.guard(t, host).length; };
  ok('a faculty of the origin, on a sub-domain of it, may name its own university',
    at('hec-ia', 'hec.unil.ch', 'Guide UNIL') === 0, String(at('hec-ia', 'hec.unil.ch', 'Guide UNIL')));
  ok('and off that domain the same page is refused',
    at('hec-ia', 'evil.example', 'Guide UNIL') > 0);
});

console.log('guard: individual locks');
let t;
t = cp(signed); t.review.by = 'TO_FILL_IN';
ok('placeholder in review.by refused', AI_GO.guard(t, 'hes-example.ch').some(i => i.path === 'review.by'));

/* LES TABLES DU POLICY SE PARCOURENT, ELLES NE S'ECHANTILLONNENT PAS. Une seule
 * sentinelle sur quatre et un seul domaine reserve sur huit etaient eprouves :
 * retirer n'importe lequel des autres ne faisait rougir aucune ligne. Les deux
 * listes sont ecrites ICI, comme le seuil de 548 jours l'est plus bas : une
 * table qui s'eprouve contre elle-meme ne prouve rien. */
{
  const SENTINELS = ['TO_FILL_IN', 'PLACEHOLDER', 'my-questionnaire', 'this text is an example'];
  const DOC_DOMAINS = ['example.com', 'example.net', 'example.org', 'example.edu',
    'example', 'invalid', 'test', 'localhost'];
  const heldWord = w => { const t9 = cp(signed); t9.disclaimer = 'Texte ' + w + ' à remplacer'; return t9; };
  const passees = SENTINELS.filter(w =>
    !AI_GO.guard(heldWord(w), 'hes-example.ch').some(i => /disclaimer/.test(i.path)));
  ok(`each of the ${SENTINELS.length} placeholders the policy names is refused wherever it stands`,
    passees.length === 0, passees.join(', '));
  const offered = d => { const t9 = cp(signed); t9.links.guide.href = 'https://' + d + '/page'; return t9; };
  const admis = DOC_DOMAINS.filter(d =>
    !AI_GO.guard(offered(d), 'hes-example.ch').some(i => i.path === 'links.guide.href'));
  ok(`each of the ${DOC_DOMAINS.length} domains the standards keep for examples is refused when a result offers it`,
    admis.length === 0, admis.join(', '));
  /* ET LA LISTE DE DOMAINES VIDE, DITE EN APERCU LOCAL. Sur un vrai hote les
   * deux branches ecrivent le meme chemin ; c'est l'apercu, nom d'hote vide, qui
   * distingue « aucun domaine declare » de « ce domaine-ci n'est pas couvert ». */
  const sansDomaine = cp(signed); sansDomaine.publisher.domains = [];
  ok('an empty domain list is named as such, local preview included',
    AI_GO.guard(sansDomaine, '').some(i => i.path === 'publisher.domains'),
    JSON.stringify(AI_GO.guard(sansDomaine, '').map(i => i.path)));
}
t = cp(signed); t.links.guide.href = 'https://wp.unil.ch/x';
ok('a link to the origin institution refused elsewhere', AI_GO.guard(t, 'hes-example.ch').some(i => i.path === 'links.guide.href'));
t = cp(signed); t.links.guide.href = 'https://padlet.com/AI_research/x';
ok('the reserved link prefix is refused elsewhere too', AI_GO.guard(t, 'hes-example.ch').some(i => i.path === 'links.guide.href'));
t = cp(signed); t.results.open.summary = 'See the DCSR for details';
ok('a reserved term in content refused', AI_GO.guard(t, 'hes-example.ch').some(i => i.path.startsWith('results')));
t = cp(signed); t.id = 'aigo-unil';
ok('a reserved id refused', AI_GO.guard(t, 'hes-example.ch').some(i => i.path === 'id'));
t = cp(signed); delete t.disclaimer;
ok('a missing disclaimer refused', AI_GO.guard(t, 'hes-example.ch').some(i => i.path.startsWith('disclaimer')));
t = bilingual(signed, 'de'); delete t.disclaimer.de;
ok('a disclaimer missing in one declared language refused',
  AI_GO.guard(t, 'hes-example.ch').some(i => i.path === 'disclaimer.de'));
t = cp(signed); t.review.date = 'yesterday';
ok('an unparseable review date refused', AI_GO.guard(t, 'hes-example.ch').some(i => i.path === 'review.date'));
t = cp(signed); delete t.publisher.name;
ok('a missing publisher name refused', AI_GO.guard(t, 'hes-example.ch').some(i => i.path === 'publisher.name'));
// The signature is what the reader sees under every result. Leaving it exempt let
// a copy go live signed by the origin, which is what this lock is for.
t = cp(signed); t.review.by = 'Universite de Lausanne (external review)';
ok('the origin name in the reviewer field is refused off its own domain',
  AI_GO.guard(t, 'hes-example.ch').some(i => i.path === 'review.by'));
t = cp(signed); t.publisher.name = 'Universite de Lausanne';
ok('the origin name in the publisher field is refused off its own domain',
  AI_GO.guard(t, 'hes-example.ch').some(i => i.path === 'publisher.name'));
// The same words, spelled with what a keyboard and a copy-paste actually produce.
// Invisible on screen and invisible to \s: each of these used to cut the origin's
// name in two and walk it past the lock.
['Universit\u00e9\u00a0de Lausanne', 'Universit\u00e9  de Lausanne', 'Universite\u0301 de Lausanne',
 'Universit\u00e9\tde Lausanne', 'Universit\u00e9\u200bde Lausanne', 'UN\u00adIL',
 'UNI\u2060L', 'Universit\u00e9\ufeffde Lausanne', 'UNI\u2063L', 'UNI\u2062L',
 'UNI\ufe0fL', 'UNI\u180eL', 'UNI\u061cL'].forEach(function (name, i) {
  const v = cp(signed); v.publisher.name = name;
  ok('the origin name is caught however it is spaced or accented (' + (i + 1) + ')',
    AI_GO.guard(v, 'hes-example.ch').some(x => x.path === 'publisher.name'));
});
t = cp(signed); t.nodes.q2.options[1].value = t.nodes.q2.options[0].value;
ok('two checkboxes sharing one value are refused: the routing would read none',
  errs(t).some(e => /options\[1\]/.test(e.path)), errs(t).map(e => e.path).join(','));
t = cp(signed); t.nodes.q1.title = '';
ok('an empty title is refused: a question with no words is not a question',
  errs(t).some(e => e.path === 'nodes.q1.title'), errs(t).map(e => e.path).join(','));
t = cp(signed); t.nodes.q1.step = 'nowhere';
ok('a question pointing at a step that is not declared is refused',
  errs(t).some(e => e.path === 'nodes.q1.step'), errs(t).map(e => e.path).join(','));
t = cp(signed); t.langs = ['en', 'de']; t.nodes.q1.title = { en: 'Q?', de: null };
ok('a language declared and given nothing is refused, not counted as translated',
  errs(t).some(e => /nodes\.q1\.title/.test(e.path)), errs(t).map(e => e.path).join(','));
t = cp(signed); t.derivedFrom = '\u200b';
ok('a source named with an invisible character names nobody',
  errs(t).some(e => e.path === 'derivedFrom'), errs(t).map(e => e.path).join(','));
t = cp(signed); t.derivedFrom = { url: 'https://x.example' };
ok('derivedFrom must name a source, or the mention it buys says nothing',
  errs(t).some(e => e.path === 'derivedFrom'), errs(t).map(e => e.path).join(','));
t = cp(signed); t.nodes.q2.options[0].value = '__proto__'; t.nodes.q2.options[1].value = '__proto__';
ok('and the same holds for a value a plain object answers for, like __proto__',
  errs(t).some(e => /options\[1\]/.test(e.path)), errs(t).map(e => e.path).join(','));
t = cp(signed); t.publisher.name = 'Haute ecole de Lausanne';
ok('a name that merely sounds like the origin is not refused',
  !AI_GO.guard(t, 'hes-example.ch').some(x => x.path === 'publisher.name'));
t = cp(signed); t.derivedFrom = 'AI_GO, Universite de Lausanne';
ok('derivedFrom may name the origin: that is what it is for',
  !AI_GO.guard(t, 'hes-example.ch').some(i => i.path.indexOf('derivedFrom') === 0));
if (hasReference) ok('the frozen tree still passes on its own domain, signature included',
  AI_GO.guard(unil, 'www.unil.ch').length === 0, AI_GO.guard(unil, 'www.unil.ch').map(i => i.path).join(','));
ok('an undeclared domain refused', AI_GO.guard(signed, 'other.example').some(i => i.path === 'publisher.domains'));
ok('dot boundary: evilhes-example.ch is not hes-example.ch',
  AI_GO.guard(signed, 'evilhes-example.ch').some(i => i.path === 'publisher.domains'));

// ---- T2, point 2: a declared domain that is not a name ----------------------
// `publisher.domains: ['ch']` was accepted, and the file then ran on every .ch
// host there is, the origin's own included: one entry, and the first lock of the
// device was off. The engine has no network and no public suffix list, so it
// verifies SHAPE and the refusal says which shape.
t = cp(signed); t.publisher.domains = ['ch'];
ok('a bare extension is not a domain: it is refused at its own index',
  AI_GO.guard(t, 'nimporte-quoi.ch').some(i => i.path === 'publisher.domains[0]'),
  AI_GO.guard(t, 'nimporte-quoi.ch').map(i => i.path).join(','));
ok('and it declares nothing, so the host it was covering stays undeclared',
  AI_GO.guard(t, 'nimporte-quoi.ch').some(i => i.path === 'publisher.domains') &&
  AI_GO.guard(t, 'unil.ch').some(i => i.path === 'publisher.domains'),
  AI_GO.guard(t, 'unil.ch').map(i => i.path).join(','));
// The sentence comes back in the tree's language, and this tree is French by
// default, so it is recognised by what the engine ships in either.
const SHAPE = Object.keys(AI_GO.UI)
  .map(l => AI_GO.UI[l].msg && AI_GO.UI[l].msg.publisherDomains).filter(Boolean);
ok('the refusal says what it verifies, so it is not read as a claim of ownership',
  AI_GO.guard(t, 'nimporte-quoi.ch').some(i => SHAPE.some(m => i.message === m)) &&
  SHAPE.every(m => /two labels at least|deux \u00e9tiquettes au moins/.test(m)),
  AI_GO.guard(t, 'nimporte-quoi.ch').map(i => i.message).join(' | '));
ok('a name with its extension, and any sub-domain of it, still pass',
  AI_GO.guard(signed, 'hes-example.ch').length === 0 &&
  AI_GO.guard(signed, 'fac.hes-example.ch').length === 0,
  AI_GO.guard(signed, 'fac.hes-example.ch').map(i => i.path).join(','));
t = cp(signed); t.publisher.domains = ['192.168.1.1'];
ok('an address is not a name either',
  AI_GO.guard(t, 'x.192.168.1.1').some(i => i.path === 'publisher.domains[0]'),
  AI_GO.guard(t, 'x.192.168.1.1').map(i => i.path).join(','));
t = cp(signed); t.publisher.domains = ['hes-example.ch', 'ch'];
ok('one good entry does not launder a bad one, and does not lose its own effect',
  AI_GO.guard(t, 'hes-example.ch').length === 1 &&
  AI_GO.guard(t, 'hes-example.ch')[0].path === 'publisher.domains[1]',
  AI_GO.guard(t, 'hes-example.ch').map(i => i.path).join(','));
t = cp(signed); t.publisher.domains = ['TO_FILL_IN'];
ok('an unfilled entry is said once, as a placeholder, and not twice',
  AI_GO.guard(t, 'hes-example.ch').filter(i => i.path.indexOf('publisher.domains[') === 0).length === 1,
  AI_GO.guard(t, 'hes-example.ch').map(i => i.path + ' ' + i.message).join(' | '));
// THE LIMIT OF THE RULE, asserted so nobody takes it for more than it is: a
// two-label public suffix passes, and closing that would take the public suffix
// list, which no single file can carry and keep true.
t = cp(signed); t.publisher.domains = ['co.uk'];
ok('a two-label public suffix is NOT caught, and the engine never claims it is',
  AI_GO.guard(t, 'anything.co.uk').length === 0,
  AI_GO.guard(t, 'anything.co.uk').map(i => i.path).join(','));

// ---- WHAT A REAL INSTITUTION WRITES, THIS FILE ACCEPTS ---------------------
// Two rules meant to stop a forged sentence refused twenty-six real values
// instead. A shape that asked a licence to carry a version number, a hyphen or a
// short initialism refused Unlicense, Licence Ouverte, Open Government Licence,
// Crown copyright and the full name of CC BY 4.0; a rule that read a full stop
// followed by a word as a second sentence refused the Universität St. Gallen.
// The forgery is answered by quoting the licence where it is drawn, not by
// guessing at its grammar, and these lists are here so the guess never returns.
{
  const derived = d => {
    const t3 = cp(signed);
    t3.derivedFrom = d;
    return AI_GO.structure(t3).filter(i => i.path.indexOf('derivedFrom') === 0).map(i => i.path);
  };
  const NAMES = ['Universität St. Gallen', 'St. Andrews University',
    'Consiglio Nazionale delle Ricerche, Istituto A. Faedo',
    'Universität Wien. Zentrum für Lehrer:innenbildung',
    'Universitatea Babeș-Bolyai', 'Uniwersytet Jagielloński',
    'Universitat Autònoma de Barcelona', 'Haute école de gestion (HEG-GE)',
    'Katholieke Universiteit Leuven', 'Norges teknisk-naturvitenskapelige universitet'];
  const refusedNames = NAMES.filter(n => derived({ name: n }).length > 0);
  ok(`the ${NAMES.length} real institution names tried here can name themselves`,
    refusedNames.length === 0, refusedNames.join(' | '));
  const LICENCES = ['CC BY 4.0', 'CC-BY-SA-4.0', 'Apache-2.0', 'MIT', 'Unlicense',
    'Licence Ouverte', 'Open Government Licence', 'Crown copyright', 'Public domain',
    'Domaine public', 'Tous droits réservés', 'All rights reserved', 'EUPL-1.2',
    'ODbL 1.0', 'WTFPL', 'ISC', 'CC BY', 'CC0 1.0',
    'Creative Commons Attribution 4.0 International',
    'Datenlizenz Deutschland \u2013 Namensnennung \u2013 Version 2.0'];
  const refusedLic = LICENCES.filter(l => derived({ name: 'S', licence: l }).length > 0);
  ok(`and the ${LICENCES.length} real licence names tried here are accepted`,
    refusedLic.length === 0, refusedLic.join(' | '));
  // What is still refused is a value that is not one: several lines, or longer
  // than a name or a licence has any reason to be.
  const NOT_VALUES = [{ name: 'A\nB' }, { name: 'N'.repeat(201) },
    { name: 'S', licence: 'L\nM' }, { name: 'S', licence: 'C'.repeat(101) },
    { name: 'S', licence: '' }];
  const slipped = NOT_VALUES.filter(d => derived(d).length === 0);
  ok('and a value on several lines, or longer than a name or a licence ever is, is not',
    slipped.length === 0, slipped.map(d => JSON.stringify(d).slice(0, 40)).join(' | '));
}

// ---- THE INLINE SYNTAX IS MARKUP ONLY WHEN IT CLOSES ------------------------
// A bare split treated every pair of stars as an opening marker, so a power, a
// glob pattern and a note reference all lost characters -- silently, and in one
// case the number the reader was shown changed. An odd count of markers means
// the author typed stars.
{
  const KEPT = ['Formule : 2**8 octets', 'Voir la note**', 'Les champs marques ** sont requis',
    'Recherche par motif *.csv ou **/*.json', 'Oui**', 'un ** seul', '**ouvert sans fin'];
  const eaten = KEPT.filter(t => AI_GO.plain(t)[0].indexOf('**') < 0);
  ok(`the ${KEPT.length} readings where the markers do not close are drawn as the author typed them`,
    eaten.length === 0, eaten.join(' | '));
  const DRAWN = [['**Attention** ici', 'Attention ici'], ['a**b**c', 'abc'],
    ['**gras** et **encore**', 'gras et encore']];
  const wrong = DRAWN.filter(([t, want]) => AI_GO.plain(t)[0] !== want);
  ok('and where they do close, the markers are read and never shown',
    wrong.length === 0, wrong.map(x => x[0]).join(' | '));
}

// ---- A DATE MAY CARRY A TIME, AND STILL BE ONE DAY --------------------------
// Refusing everything but YYYY-MM-DD refused `2026-06-01T00:00:00Z` too, which
// is the same day written by a spreadsheet and ambiguous to nobody.
{
  const dated = d => {
    const t3 = cp(signed); t3.review.date = d;
    return AI_GO.guard(t3, 'hes-example.ch').filter(i => i.path === 'review.date').length === 0;
  };
  const ISO = ['2026-06-01', '2026-06-01T00:00:00Z', '2026-06-01T14:30:00+02:00'];
  const AMBIGUOUS = ['2026-6-1', '01.06.2026', '06/01/2026', '2026-02-30'];
  const badly = ISO.filter(d => !dated(d)).concat(AMBIGUOUS.filter(d => dated(d)));
  ok('a date written in full ISO is one day, and a date this file would have to guess at is none',
    badly.length === 0, badly.join(' | '));
  const withTime = cp(signed); withTime.review.date = '2026-06-01T14:30:00+02:00';
  const plainDay = cp(signed); plainDay.review.date = '2026-06-01';
  ok('and the review clock counts from the same day in both forms',
    AI_GO.reviewAgeDays(withTime) === AI_GO.reviewAgeDays(plainDay),
    AI_GO.reviewAgeDays(withTime) + ' vs ' + AI_GO.reviewAgeDays(plainDay));
  /* ET CELLE QU'ECRIT UN TABLEUR, separee par une espace et non par un T. Le
   * fichier la coupe expres sur /[T ]/, et rien ne l'eprouvait : la moitie de
   * cette classe de caracteres pouvait donc disparaitre sans un rouge. */
  const spaced = cp(signed); spaced.review.date = '2026-06-01 00:00:00';
  ok('and a date a spreadsheet timestamped with a space counts from that same day',
    AI_GO.reviewAgeDays(spaced) === AI_GO.reviewAgeDays(plainDay),
    AI_GO.reviewAgeDays(spaced) + ' vs ' + AI_GO.reviewAgeDays(plainDay));
}

// ---- A SCRIPT THIS FILE CANNOT READ IS TOLD APART FROM A NAME IT CAN --------
// A French questionnaire quoting the Japanese term for personal data was told to
// "rewrite it in your own terms", which is no advice at all for a term of art in
// another writing. The refusal now says what it is and what lifts it.
{
  const said = (txt, langs) => {
    const t3 = {
      id: 'c', langs: langs, defaultLang: langs[0], start: 'q1', steps: [{ id: 's', name: 'S' }],
      publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
      review: { by: 'Legal', date: '2026-06-01' },
      nodes: { q1: { type: 'single', step: 's', title: txt,
        answers: [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }] } },
      results: { r: { level: 'info', title: 'R', solution: { text: 'S' } } },
      links: {}, disclaimer: 'D'
    };
    const hit = AI_GO.guard(t3, 'hes-example.ch').filter(i => /nodes/.test(i.path))[0];
    return hit ? hit.message : '';
  };
  const jp = said('Les donnees personnelles, \u500b\u4eba\u60c5\u5831 en droit japonais, sont visees', ['fr']);
  ok('a run in a script the file cannot read is refused with the sentence that names the remedy',
    /langs/.test(jp) && !/vos propres termes|your own terms/.test(jp), jp.slice(0, 60));
  ok('and declaring that language lifts it',
    said('Les donnees personnelles, \u500b\u4eba\u60c5\u5831 en droit japonais, sont visees', ['fr', 'ja']) === '');
  ok('while a name this file CAN read keeps the refusal that names the field to use',
    /derivedFrom/.test(said('Guide UNIL interne', ['fr'])), said('Guide UNIL interne', ['fr']).slice(0, 60));
}

// ---- WHAT NINETY-SIX MUTATIONS OF THE ENGINE WALKED THROUGH ----------------
// Ninety-six small changes were made to the engine and the harness was rerun on
// each; twenty-nine came back green. Every assertion below closes one of them.
// Three were critical, and all three have the same shape: the rule is written
// correctly and the test only ever exercises the easy half of it.
{
  const guarded = (txt, langs, where) => {
    const t3 = {
      id: 'c', langs: langs || ['fr'], defaultLang: (langs || ['fr'])[0], start: 'q1',
      steps: [{ id: 's', name: 'S' }],
      publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
      review: { by: 'Legal', date: '2026-06-01' },
      nodes: { q1: { type: 'single', step: 's', title: 'Q',
        answers: [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }] } },
      results: { r: { level: 'info', title: 'R', solution: { text: 'S' } } },
      links: {}, disclaimer: 'D'
    };
    t3[where || 'disclaimer'] = txt;
    return AI_GO.guard(t3, 'hes-example.ch').filter(i => i.path.indexOf(where || 'disclaimer') === 0);
  };
  const caught = (txt, langs) => guarded(txt, langs).length > 0;

  // A5. THE SYMBOL IS REPLACED BY A SPACE, NOT BY NOTHING. Every witness the
  // sweeps use puts the symbol at the END of the name, where the boundary
  // survives whatever the replacement is. Between the name and a letter is
  // where the replacement has to be a space: "UNIL<symbol>x" read as "UNILx"
  // has no boundary at all, and the name walks out.
  const GLUED = ['\u2122', '\u2116', '\u338f', '\u2121', '\u2105', '\u33c2'];
  const slipped = GLUED.filter(c => !caught('Made by UNIL' + c + 'x today'));
  ok(`a symbol drawing two letters, set between the name and a letter, still breaks the word, in all ${GLUED.length} witnesses`,
    slipped.length === 0,
    slipped.map(c => 'U+' + c.codePointAt(0).toString(16).toUpperCase()).join(' '));
  // And one that draws a single letter is read as that letter, so it spells the
  // name rather than hiding it: that is the other branch of the same rule.
  const DRAWN = ['\u2160', '\u24be', '\uff29', '\u2170'];
  const hid = DRAWN.filter(c => !caught('Made by UN' + c + 'L today'));
  ok(`and a symbol drawing a single letter spells the name instead of hiding it, in all ${DRAWN.length} witnesses`,
    hid.length === 0, hid.map(c => 'U+' + c.codePointAt(0).toString(16).toUpperCase()).join(' '));

  // B1. ACCEPTING ONE PASSAGE IS NOT ABANDONING THE STRING. A spelling this file
  // refuses, placed AFTER a passage written in a language the tree declares, is
  // still refused: the search carries on past what it accepted.
  ok('a forbidden spelling after a legitimate passage in a declared language is still caught',
    caught('\u3053\u308c\u306f\u65e5\u672c\u8a9e \u3042\u3044\u3046\u3048 and then \ua4ea\ua420\ua430\ua461 after it', ['fr', 'ja']) &&
    !caught('\u3053\u308c\u306f\u65e5\u672c\u8a9e \u3042\u3044\u3046\u3048 and nothing else', ['fr', 'ja']));

  // B9. BOTH READINGS, NOT THE FIRST. plain() returns more than one reading of a
  // string -- one of them puts the word back together across an invisible
  // character -- and the skeleton has to be read on each. Reading only the first
  // let one zero-width character glue a forbidden spelling to a Latin letter.
  ok('the skeleton is read on every reading plain() returns, not only the first',
    caught('a\u200b\ua4ea\ua420\ua430\ua461\u200bb'));

  // A12. A WILDCARD IS A LETTER AT THE EDGE OF A WORD. Without that, a word of
  // five or more unreadable letters is read as a four-letter name hidden inside
  // it, and an institution writing Russian, Amharic or Lisu is refused its own
  // ordinary words with no remedy at all.
  const LONGER = ['x \ua4d0\ua4d1\ua4d2\ua4d3\ua4d4 y', 'x \u0436\u0449\u0446\u0444\u0436\u0449\u0446 y',
    'x \u1200\u1201\u1202\u1203\u1204\u1205 y', 'x \u10d0\u10d1\u10d2\u10d3\u10d4 y'];
  const wronged = LONGER.filter(t3 => caught(t3));
  ok(`a word of five unreadable letters or more is not a four-letter name, in ${LONGER.length} writings`,
    wronged.length === 0, wronged.join(' | '));

  // C4, C5, C11, C13, C14. EACH RANGE RECOGNISES ITS OWN SCRIPT, AND EACH
  // LANGUAGE CARRIES EVERY SCRIPT IT WRITES IN. The harness checked that every
  // script named has a range and that no Latin language is listed; it never
  // checked that a range matches anything, so emptying one took the exemption
  // away from a whole family of languages and stayed green.
  const WITNESS = {
    cjk: '\u6f22\u5b57', kana: '\u3042\u3044\u3046\u3048', hangul: '\ud55c\uad6d',
    hebrew: '\u05d0\u05d1', arabic: '\u0628\u064a\u0627\u0646', deva: '\u0915\u0916',
    bengali: '\u0995\u0996', gurmukhi: '\u0a15\u0a16', gujarati: '\u0a95\u0a96',
    oriya: '\u0b15\u0b16', tamil: '\u0b95\u0b9a', telugu: '\u0c15\u0c16',
    kannada: '\u0c95\u0c96', malayalam: '\u0d15\u0d16', sinhala: '\u0d9a\u0d9b',
    thai: '\u0e01\u0e02', lao: '\u0e81\u0e82', myanmar: '\u1000\u1001',
    khmer: '\u1780\u1781', tibetan: '\u0f40\u0f41', georgian: '\u10d0\u10d1',
    armenian: '\u0531\u0532', ethiopic: '\u1200\u1201', syllabics: '\u1401\u1402',
    cherokee: '\u13a0\u13a1', thaana: '\u0780\u0781', cyrillic: '\u0446\u0438',
    greek: '\u03a8\u03a9'
  };
  const ranges = AI_GO.SCRIPT_RANGES || {};
  const blind = Object.keys(ranges).filter(k => !WITNESS[k] || !ranges[k].test(WITNESS[k]));
  ok(`each of the ${Object.keys(ranges).length} script ranges recognises a witness of the script it names`,
    Object.keys(ranges).length > 20 && blind.length === 0, blind.join(', '));
  // And from the other table: a tree declaring a language may write four letters
  // of each script that language uses, in the middle of a Latin sentence.
  const langs = AI_GO.LANG_SCRIPTS || {};
  const shut = [];
  Object.keys(langs).forEach(l => langs[l].forEach(sc => {
    const w = WITNESS[sc];
    if (w && caught('this is english ' + w + w + ' here', ['en', l])) shut.push(l + '/' + sc);
  }));
  ok('and a tree declaring a language may write every script that language uses',
    shut.length === 0, shut.join(', '));

  // C8, C9. THE TAG IS NORMALISED. `JA`, `ja-JP` and `ja` are one language, and
  // `fr-CH`, `de-CH`, `zh-Hans` are exactly what a Swiss institution writes.
  const TAGS = [['JA', WITNESS.kana], ['ja-JP', WITNESS.kana], ['Ja-jp', WITNESS.kana],
    ['ZH-Hans', WITNESS.cjk], ['RU-ru', WITNESS.cyrillic], ['el-GR', WITNESS.greek]];
  const lostTags = TAGS.filter(([l, w]) => caught('this is english ' + w + w + ' here', ['en', l]));
  ok('a language tag is read whatever its case and whatever its subtag',
    lostTags.length === 0, lostTags.map(x => x[0]).join(', '));

  // B7. THE REFUSAL QUOTES WHAT IS WRITTEN, never the wildcards it read. A
  // message naming four invisible placeholders tells the reader nothing about
  // where to look in their own file.
  const msg = guarded('x \ua4ea\ua420\ua430\ua461 y')[0];
  ok('a refusal caught by skeleton quotes the characters of the tree, not the wildcards',
    !!msg && msg.message.indexOf('\ua4ea') >= 0 && msg.message.indexOf('\u0000') < 0,
    msg ? msg.message.slice(0, 60) : 'aucun refus');
}

// ---- A DATE IS READ ONCE, AND THE SAME WAY BY BOTH READERS ------------------
{
  const aged = d => { const t3 = cp(signed); t3.review.date = d; return AI_GO.reviewAgeDays(t3); };
  const refused = d => { const t3 = cp(signed); t3.review.date = d;
    return AI_GO.guard(t3, 'hes-example.ch').some(i => i.path.indexOf('review.date') === 0); };
  // D7. The clock never counts from a date the check refused.
  const BAD = ['2026-02-31', '2026-13-01', '03.12.2026', '2026-6-1', '', '2099-12-31'];
  const counted = BAD.filter(d => aged(d) !== null);
  ok(`the review clock counts from none of the ${BAD.length} dates the check refuses`,
    counted.length === 0, counted.join(' | '));
  // D8. And a date is a string, not something with a toString.
  const NOT_STRINGS = [{ toString: () => '2026-06-01' }, 20260601, new Date(), ['2026-06-01'], true];
  const swallowed = NOT_STRINGS.filter(d => aged(d) !== null || !refused(d));
  ok('and a review date is a string, not an object that can be talked into looking like one',
    swallowed.length === 0, swallowed.map(d => typeof d).join(', '));
  // D6, D9. The banner comes due the day AFTER the limit, not the day before.
  const dayShift = n => {
    const t3 = cp(signed);
    const d = new Date(Date.now() - n * 86400000);
    t3.review.date = d.toISOString().slice(0, 10);
    return AI_GO.reviewAgeDays(t3);
  };
  const max = AI_GO.POLICY.reviewMaxDays;
  ok(`the review is ${max} days old at ${max} days and not a day sooner`,
    dayShift(max) === max && dayShift(max - 1) === max - 1 && dayShift(max + 1) === max + 1,
    [dayShift(max - 1), dayShift(max), dayShift(max + 1)].join(','));
}

// ---- ONE LINE MEANS NONE OF THE THREE ---------------------------------------
{
  const derived = d => { const t3 = cp(signed); t3.derivedFrom = d;
    return AI_GO.structure(t3).some(i => i.path.indexOf('derivedFrom') === 0); };
  const BREAKS = ['\n', '\r', '\t'];
  const through = [];
  BREAKS.forEach(ch => {
    if (!derived({ name: 'A' + ch + 'B' })) through.push('name ' + JSON.stringify(ch));
    if (!derived({ name: 'S', licence: 'CC' + ch + 'BY 4.0' })) through.push('licence ' + JSON.stringify(ch));
    if (!derived('A' + ch + 'B')) through.push('bare ' + JSON.stringify(ch));
  });
  ok('a name or a licence is refused for a newline, a carriage return and a tab alike',
    through.length === 0, through.join(', '));
}

// ---- A DIGEST THAT COULD NOT BE COMPUTED DOES NOT LOOK LIKE ONE -------------
// G14. A legal service files what it is given. A row of zeroes reads as a
// receipt; it has to read as a failure.
{
  // Depuis que les trois projections passent par le gel, un arbre cyclique se
  // signe : le gel coupe le cycle, et ce qui est signe est ce qui est affiche.
  // Ce qui reste a garantir, c'est que la valeur de repli, si elle sort un
  // jour, ne ressemble pas a un condensat -- un service juridique classe ce
  // qu'on lui donne, et une suite de zeros se classe comme un recu.
  const cyclic = {}; cyclic.self = cyclic;
  const impossible = { start: 'q1', nodes: cyclic, results: {}, links: {}, ui: cyclic };
  const shapes = [AI_GO.fingerprint(impossible), AI_GO.signature(impossible), AI_GO.examplePrint(impossible)];
  ok('a cyclic tree signs the copy the freeze made of it, which is the copy the reader sees',
    shapes.every(h => /^[0-9a-f]{16}$/.test(h)) &&
    AI_GO.fingerprint(impossible) === AI_GO.fingerprint(impossible), shapes.join(' '));
  ok('and the value the engine falls back on does not look like a digest',
    engineCode.indexOf("'????????????????'") >= 0 &&
    !/return '0{16}'/.test(engineCode));
}

// ---- UN TÉMOIN PAR SOUS-FAMILLE, JAMAIS UN SEUL PAR CLASSE ------------------
// Vingt-huit mutations du moteur, sept survivantes, et cinq d'entre elles sont
// un chiffre ou une propriété Unicode changée : `\p{Cf}` retiré de la classe des
// invisibles, `\p{M}` réduit à `\p{Mn}`, une paire de parenthèses ôtée d'une
// classe, une borne de 200 portée à 400, un jour porté à un an. Les assertions
// existaient en face -- mais avec UN témoin par classe, si bien qu'un témoin
// voisin de la même famille passait. Chaque classe est éprouvée ici par un
// témoin de chacune de ses sous-familles.
{
  const titled2 = txt => ({
    id: 'c', langs: ['fr'], defaultLang: 'fr', start: 'q1', steps: [{ id: 's', name: 'S' }],
    publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
    review: { by: 'Legal', date: '2026-06-01' },
    nodes: { q1: { type: 'single', step: 's', title: 'Q',
      answers: [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }] } },
    results: { r: { level: 'info', title: 'R', solution: { text: 'S' } } },
    links: {}, disclaimer: txt
  });
  const hidden = txt => AI_GO.guard(titled2(txt), 'hes-example.ch').some(i => /disclaimer/.test(i.path));

  // LES INVISIBLES : un témoin de chaque sous-famille de la classe.
  //   Cc  contrôle            Cf  format, dont beaucoup ne sont PAS « ignorables »
  //   DI  ignorable par défaut
  const UNSEEN = [
    ['Cc U+0000', '\u0000'], ['Cc U+0008', '\u0008'], ['Cc U+001F', '\u001f'],
    ['Cf U+0600', '\u0600'], ['Cf U+06DD', '\u06dd'], ['Cf U+070F', '\u070f'],
    ['Cf U+110BD', '\ud804\udcbd'], ['DI U+200B', '\u200b'], ['DI U+00AD', '\u00ad'],
    ['DI U+FEFF', '\ufeff'], ['DI U+E0001', '\udb40\udc01']
  ];
  const seen = UNSEEN.filter(([, c]) => !hidden('Fait par UN' + c + 'IL aujourd’hui'));
  ok(`the ${UNSEEN.length} invisible witnesses, one per subfamily, all fail to cut the name`,
    seen.length === 0, seen.map(x => x[0]).join(', '));
  // Et un nom fait uniquement d'invisibles n'est pas un nom.
  const blankish = UNSEEN.filter(([, c]) => {
    const t3 = titled2('D'); t3.publisher = { name: c + c, domains: ['hes-example.ch'] };
    return !AI_GO.guard(t3, 'hes-example.ch').some(i => i.path === 'publisher.name');
  });
  ok('and a signature made of invisible characters is not a signature',
    blankish.length === 0, blankish.map(x => x[0]).join(', '));

  // LES MARQUES : Mn, Mc et Me sont trois sous-familles, et deux manquaient.
  const MARKS_W = [['Mn U+0300', '\u0300'], ['Mn U+1DC0', '\u1dc0'], ['Mn U+0483', '\u0483'],
    ['Mc U+0903', '\u0903'], ['Mc U+093B', '\u093b'], ['Me U+20DD', '\u20dd'],
    ['Me U+0488', '\u0488'], ['Me U+A670', '\ua670']];
  const kept = MARKS_W.filter(([, c]) => !hidden('Fait par UN' + c + 'IL aujourd’hui'));
  ok(`the ${MARKS_W.length} combining witnesses, spacing and enclosing included, all fail to cut the name`,
    kept.length === 0, kept.map(x => x[0]).join(', '));

  // LES CARACTÈRES QUI FERMENT UNE PHRASE dans une URL : chacun séparément.
  const derivedUrl = u => {
    const t3 = titled2('D'); t3.derivedFrom = { name: 'Source', url: u };
    return AI_GO.structure(t3).some(i => i.path === 'derivedFrom.url');
  };
  const CLOSERS = ['(', ')', '<', '>', '"', "'"];
  const openLeft = CLOSERS.filter(c => !derivedUrl('https://a.ch/x' + c + 'y'));
  ok(`each of the ${CLOSERS.length} characters that can close the engine’s own sentence is refused in a url`,
    openLeft.length === 0, openLeft.join(' '));
  ok('and the length bound of a url is the one the refusal names',
    !derivedUrl('https://a.ch/' + 'a'.repeat(186)) && derivedUrl('https://a.ch/' + 'a'.repeat(188)),
    'bornes 199/201');

  // LE JOUR DE TROP : un mois dans le futur est déjà trop, pas seulement un siècle.
  const dated2 = d => { const t3 = titled2('D'); t3.review.date = d;
    return AI_GO.guard(t3, 'hes-example.ch').some(i => i.path === 'review.date'); };
  const ahead = n => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
  const FUTURES = [2, 7, 30, 365, 3650];
  const passed = FUTURES.filter(n => !dated2(ahead(n)));
  ok(`a review dated ${FUTURES.length} different distances into the future is refused at every one`,
    passed.length === 0, passed.map(n => n + ' j').join(', '));

  // LA SIGNATURE : chacune de ses douze clés, pas une seule.
  const base2 = () => {
    const t3 = cp(signed);
    t3.ui = { fr: { back: 'Retour' } };
    t3.derivedFrom = { name: 'Source' };
    return t3;
  };
  const MOVES = [
    ['publisher', t3 => { t3.publisher.name = 'Autre'; }],
    ['review', t3 => { t3.review.by = 'Autre'; }],
    ['disclaimer', t3 => { t3.disclaimer = 'Autre'; }],
    ['derivedFrom', t3 => { t3.derivedFrom = { name: 'Autre' }; }],
    ['jurisdiction', t3 => { t3.jurisdiction = 'CH-GE'; }],
    ['legalBasis', t3 => { t3.legalBasis = ['Autre']; }],
    ['steps', t3 => { t3.steps[0].name = 'Autre'; }],
    ['ui', t3 => { t3.ui = { fr: { back: 'Autre' } }; }],
    ['id', t3 => { t3.id = 'autre-id'; }],
    ['version', t3 => { t3.version = '9.9.9'; }],
    ['langs', t3 => { t3.langs = t3.langs.concat(['de']); }],
    // Une valeur forcement differente, quel que soit le contenu du fichier :
    // sur un arbre d'une seule langue, « la deuxieme langue » n'existe pas.
    ['defaultLang', t3 => { t3.defaultLang = t3.defaultLang === 'zz' ? 'yy' : 'zz'; }]
  ];
  const ref = AI_GO.signature(base2());
  const still = MOVES.filter(([, f]) => { const t3 = base2(); f(t3); return AI_GO.signature(t3) === ref; });
  ok(`each of the ${MOVES.length} fields the signature covers moves it when it changes`,
    still.length === 0, still.map(x => x[0]).join(', '));
}

// ---- CHAQUE BORNE, PRISE A N ET A N+1 ---------------------------------------
// Un audit par mutation a change 200 en 400, 32 en 33, 40 en 1, `<=` en `<`, et
// le harnais est reste vert neuf fois sur douze. Il eprouvait ses bornes soit
// comme un nombre ecrit dans un fichier -- qui dit que la valeur est la bonne,
// jamais qu'elle est appliquee au bon endroit -- soit a quarante unites de
// distance, ou aucun des deux cotes de la limite n'est visible. Une borne se
// verifie a n, qui doit passer, et a n+1, qui doit tomber.
{
  const bounded = (extra) => {
    const t = { id: 'c', langs: ['fr'], defaultLang: 'fr', start: 'q1',
      steps: [{ id: 's', name: 'S' }],
      publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
      review: { by: 'Legal', date: '2026-06-01' },
      nodes: { q1: { type: 'single', step: 's', title: 'Q',
        answers: [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }] } },
      results: { r: { level: 'info', title: 'R', solution: { text: 'S' } } },
      links: {}, disclaimer: 'D' };
    Object.keys(extra || {}).forEach(k => { t[k] = extra[k]; });
    return t;
  };
  const refuses = (extra, path) =>
    AI_GO.structure(bounded(extra)).concat(AI_GO.guard(bounded(extra), 'hes-example.ch'))
      .some(i => i.path === path);

  // LE NOM D'UNE SOURCE : 200 caracteres exactement sont permis.
  const nm = n => ({ derivedFrom: { name: 'A'.repeat(n) } });
  ok('a derivedFrom name of exactly 200 characters, the length the refusal names, is accepted',
    !refuses(nm(200), 'derivedFrom.name'), '200');
  ok('and 201 is refused, so the bound is applied where it is written',
    refuses(nm(201), 'derivedFrom.name'), '201');

  // LE NOM D'UNE LICENCE : cent, la longueur du nom complet de CC BY 4.0.
  const lc = n => ({ derivedFrom: { name: 'Source', licence: 'C'.repeat(n) } });
  ok('a licence name of exactly 100 characters is accepted',
    !refuses(lc(100), 'derivedFrom.licence'), '100');
  ok('and 101 is refused', refuses(lc(101), 'derivedFrom.licence'), '101');

  // L'ADRESSE D'UNE SOURCE : 200 aussi, et l'ancienne epreuve la prenait a 186.
  const ur = n => ({ derivedFrom: { name: 'Source', url: 'https://a.ch/' + 'u'.repeat(n - 13) } });
  ok('a derivedFrom url of exactly 200 characters is accepted',
    !refuses(ur(200), 'derivedFrom.url'), '200');
  ok('and 201 is refused', refuses(ur(201), 'derivedFrom.url'), '201');

  // LA PROFONDEUR DU GEL : 32 niveaux passent, 33 sont refuses.
  const nested = depth => {
    let v = 'bout';
    for (let k = 0; k < depth; k++) v = { d: v };
    return v;
  };
  const deepAt = depth => AI_GO.structure(bounded({ extras: nested(depth) })).length;
  const shallow = deepAt(28);
  ok('a tree nested 31 levels deep is judged like a shallow one',
    deepAt(31) === shallow, deepAt(31) + ' vs ' + shallow);
  ok('and one level deeper is refused, which is the depth bound doing its work',
    deepAt(34) > shallow, deepAt(34) + ' vs ' + shallow);

  // LE PLAFOND DE QUARANTE POINTS : un fichier hostile n'ecrit pas mille lignes
  // dans un encadre que personne ne peut faire defiler.
  const manyBad = {};
  for (let k = 0; k < 120; k++) manyBad['k' + k] = function () { return 1; };
  const capped = AI_GO.structure(bounded({ extras: manyBad })).length;
  ok('a tree carrying 120 unreadable entries reports 40 points, not 1 and not 120',
    capped === 40, String(capped));
}

// ---- LES VINGT-SIX LETTRES DE CHAQUE FAMILLE ENCLOSE ------------------------
// Ces trois familles sont les seules qu'Unicode laisse sans decomposition, et le
// moteur les derive par un decalage depuis leur premiere lettre. Le harnais ne
// les eprouvait que sur les lettres des mots reserves, dont aucun ne porte de Z :
// baisser la borne haute d'un cran ne cassait rien. Chaque lettre est prise ici,
// et le nom ne doit se reconstruire que sur celle qui l'ecrit vraiment.
{
  const named = name => ({ id: 'c', langs: ['fr'], defaultLang: 'fr', start: 'q1',
    steps: [{ id: 's', name: 'S' }],
    publisher: { name: name, domains: ['hes-example.ch'] },
    review: { by: 'Legal', date: '2026-06-01' },
    nodes: { q1: { type: 'single', step: 's', title: 'Q',
      answers: [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }] } },
    results: { r: { level: 'info', title: 'R', solution: { text: 'S' } } },
    links: {}, disclaimer: 'D' });
  const flags = name => AI_GO.guard(named(name), 'hes-example.ch').some(i => i.path === 'publisher.name');
  const FAMILIES = [['negative circled', 0x1f150], ['negative squared', 0x1f170],
    ['regional indicator', 0x1f1e6]];
  const misread = [];
  FAMILIES.forEach(([label, from]) => {
    for (let k = 0; k < 26; k++) {
      const letter = String.fromCharCode(65 + k);
      // La lettre enclose REMPLACE le I : UN?L ne redevient UNIL que si elle
      // se lit I. Ecrite entre le N et le I, elle donnait UN?IL, cinq lettres
      // qui ne sont le nom pour aucune valeur de ?, et l'epreuve ne prouvait rien.
      const drawn = 'UN' + String.fromCodePoint(from + k) + 'L';
      if (flags(drawn) !== (letter === 'I')) misread.push(label + ' ' + letter);
      /* ET LA LECTURE ELLE-MEME, PAS SEULEMENT LE VERDICT. Le verdict compare
       * sans casse contre huit mots reserves dont aucun ne porte de Z : vingt-
       * cinq des vingt-six lettres ne pouvaient donc rien distinguer, et cette
       * boucle n'etait informative que sur le I. plain() dit ce que le moteur
       * LIT, lettre par lettre, et c'est la que le decalage se voit. */
      if (AI_GO.plain(drawn).join(' ').indexOf('UN' + letter + 'L') < 0) {
        misread.push(label + ' ' + letter + ' (lecture)');
      }
    }
  });
  ok('across the 3 undecomposed families, all 26 letters read as themselves and only I rebuilds the name',
    misread.length === 0, misread.join(', '));
}

// ---- LE SECOND VERROU, CELUI DES MOTEURS SANS PROPRIETES UNICODE -----------
// Trois expressions du fichier sont construites par `new RegExp` avec des
// proprietes Unicode, et retombent sur des plages ecrites a la main quand le
// moteur ne les connait pas. C'est delibere. Ce qui ne l'etait pas : rien
// n'exercait jamais cette moitie-la, si bien qu'elle pouvait pourrir sans un
// rouge, et que personne ne savait de combien elle differe de l'autre.
//
// On charge donc une SECONDE fois le meme moteur, avec un RegExp qui refuse les
// proprietes exactement comme le ferait un moteur d'avant 2018. Les litteraux
// ne passent pas par la : seuls les trois `new RegExp` basculent.
{
  const RealRegExp = RegExp;
  function OldRegExp(pattern, flags) {
    if (String(pattern).indexOf('\\p{') >= 0) throw new SyntaxError('property escapes unsupported');
    return new RealRegExp(pattern, flags);
  }
  OldRegExp.prototype = RealRegExp.prototype;
  let OLD = null, why = '';
  try { OLD = new Function('RegExp', engineCode + '\n;return AI_GO;')(OldRegExp); }
  catch (e) { why = String((e && e.message) || e); }
  ok('the engine loads on a runtime that has no Unicode property escapes', OLD !== null, why);

  if (OLD) {
    ok('and it is a second engine, not the first one handed back',
      OLD !== AI_GO && typeof OLD.guard === 'function');

    const namedBy = (eng, name) => eng.guard({
      id: 'c', langs: ['fr'], defaultLang: 'fr', start: 'q1',
      steps: [{ id: 's', name: 'S' }],
      publisher: { name: name, domains: ['hes-example.ch'] },
      review: { by: 'Legal', date: '2026-06-01' },
      nodes: { q1: { type: 'single', step: 's', title: 'Q',
        answers: [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }] } },
      results: { r: { level: 'info', title: 'R', solution: { text: 'S' } } },
      links: {}, disclaimer: 'D'
    }, 'hes-example.ch').some(i => i.path === 'publisher.name');

    /* CE QUE LE SECOND VERROU DOIT TENIR MALGRE TOUT. Il est plus faible, et le
     * fichier le dit ; il ne doit pas pour autant laisser passer les ecritures
     * ordinaires du nom, celles qu'un adoptant produit sans y penser. */
    const TENUES = [
      ['le nom tel quel', 'UNIL'],
      ['en minuscules', 'unil'],
      ['coupé par un gras vide', 'UN****IL'],
      ['coupé par une espace de largeur nulle', 'UN\u200bIL'],
      ['par une marque combinante du bloc usuel', 'UN\u0301IL'],
      ['en pleine chasse', '\uff35\uff2e\uff29\uff2c'],
      ['par un forçage bidirectionnel', 'Guide \u202eLINU\u202c'],
      /* A L'INTERIEUR DU NOM, et non autour : ce repli n'etait eprouve que sur
       * les ecritures ou le nom est entier d'un bloc. */
      ['par un forçage posé dans le nom', 'UN\u202dIL'],
      ['par un renversement posé dans le nom', 'UN\u202eIL']
    ];
    const laissees = TENUES.filter(([, n]) => !namedBy(OLD, n));
    ok(`the older lock still refuses the ${TENUES.length} everyday writings of the origin name`,
      laissees.length === 0, laissees.map(x => x[0]).join(' | '));

    // Et il ne refuse pas le monde : un nom latin ordinaire passe des deux cotes.
    const ORDINAIRES = ['Haute école de gestion', 'Universität Bern', 'Scuola universitaria'];
    const abusives = ORDINAIRES.filter(n => namedBy(OLD, n) || namedBy(AI_GO, n));
    ok(`and refuses none of the ${ORDINAIRES.length} ordinary institution names, in either lock`,
      abusives.length === 0, abusives.join(' | '));

    /* ET L'ECART EST MESURE, PAS DEVINE. Ce que le second verrou ne sait pas
     * lire est ecrit dans SECURITY.md ; ce compte est ce qui le tient a jour. */
    const exact = new RealRegExp('^\\p{L}$', 'u');
    let manquees = 0;
    for (let cp = 0; cp <= 0xffff; cp++) {
      if (cp >= 0xd800 && cp <= 0xdfff) continue;
      const ch = String.fromCodePoint(cp);
      if (exact.test(ch) && OLD.plain(ch)[0] === ch && AI_GO.plain(ch)[0] !== ch) manquees++;
    }
    ok('the two locks read the basic plane closely enough that the gap is the documented one',
      manquees < 2000, manquees + ' points de code lus autrement dans le plan de base');
  }
}


// ---- UN MARQUEUR QUE LE LECTEUR VOIT EST UN MARQUEUR ------------------------
// Le balayage des textes a remplacer comparait la chaine brute pendant que
// celui des noms reserves passait par plain(). Un audit de robustesse a montre
// dans un vrai Chrome trois ecritures d'un meme marqueur qui traversaient un
// verdict « publiable » en etant dessinees telles quelles, et un tableau dont
// les fragments sont propres separement et sales une fois joints.
{
  const held = txt => ({ id: 'c', langs: ['fr'], defaultLang: 'fr', start: 'q1',
    steps: [{ id: 's', name: 'S' }],
    publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
    review: { by: 'Legal', date: '2026-06-01' },
    nodes: { q1: { type: 'single', step: 's', title: 'Q',
      answers: [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }] } },
    results: { r: { level: 'info', title: 'R', solution: { text: 'S' } } },
    links: {}, disclaimer: txt });
  const caught = txt => AI_GO.guard(held(txt), 'hes-example.ch')
    .some(i => /disclaimer/.test(i.path));

  const WRITINGS = [
    ['tel quel', 'TO_FILL_IN'],
    ['en gras, dont le gras n’est pas du texte', 'TO_**FILL**_IN'],
    ['coupé par une espace de largeur nulle', 'TO_\u200bFILL_IN'],
    ['en pleine chasse, que NFKD ramène aux mêmes lettres', '\uff34\uff2f\uff3f\uff26\uff29\uff2c\uff2c\uff3f\uff29\uff2e'],
    ['coupé par un joint de largeur nulle', 'TO_FILL\u200d_IN'],
    ['coupé par un trait mou', 'TO_\u00adFILL_IN']
  ];
  const missed = WRITINGS.filter(([, t]) => !caught(t));
  ok(`the ${WRITINGS.length} writings of a placeholder a reader sees as one are all refused`,
    missed.length === 0, missed.map(x => x[0]).join(' | '));

  /* CE QU'UN FORCAGE BIDIRECTIONNEL DESSINE. Le contrôle partait avec les
   * invisibles et la course restait à l'endroit qu'elle a dans le fichier,
   * jamais celui où Chrome la peint. */
  const BIDI = [
    ['le nom d\u2019origine', 'Guide \u202eLINU\u202c'],
    ['un autre nom réservé', 'Guide \u202eRSCD\u202c'],
    ['le marqueur lui-même', 'Guide \u202eNI_LLIF_OT\u202c'],
    /* JAMAIS REFERME, et Chrome le dessine quand meme a l'envers jusqu'au bout.
     * Les trois temoins ci-dessus portaient tous leur U+202C final, si bien
     * qu'une lecture qui EXIGE le terminateur passait ce harnais sans rougir. */
    ['un forçage jamais refermé', 'Guide \u202eLINU'],
    ['jamais refermé, et le marqueur', 'Guide \u202eNI_LLIF_OT']
  ];
  const drawnPast = BIDI.filter(([, t]) => !caught(t));
  ok(`the ${BIDI.length} texts a bidirectional override draws as a reserved word are refused`,
    drawnPast.length === 0, drawnPast.map(x => x[0]).join(' | '));
  /* LE RENVERSEMENT NE VAUT QUE SOUS UN FORCAGE. Sans le controle, la meme
   * course de lettres est ce qu'elle est ecrite, et n'est le nom de personne :
   * lire tout le monde a l'envers refuserait la moitie du dictionnaire. */
  ok('and the same letters without an override are read forwards, as they are written',
    !caught('Guide LINU') && !caught('Le mot NI_LLIF_OT ne dit rien.'));

  // Et une écriture qui NE dessine PAS le marqueur n’est pas refusée pour lui.
  ok('a sentence that merely speaks of filling something in is not taken for the marker',
    !caught('Le formulaire est à remplir avant publication.'));

  /* LE TEXTE QUE LA RÉUNION DES FRAGMENTS DESSINE. Éprouvé sur le texte d'un
   * résultat, qui accepte une liste de blocs : `disclaimer` n'en accepte pas,
   * et son refus de forme aurait masqué ce qu'on veut voir ici. */
  const blocks = txt => { const t = held('D'); t.results.r.solution = { text: txt }; return t; };
  const hitsIn = txt => AI_GO.guard(blocks(txt), 'hes-example.ch')
    .filter(i => /solution/.test(i.path));
  const joined = hitsIn(['UN**IL', '**']);
  ok('two fragments that are clean apart and draw the origin name together are refused',
    joined.length >= 1, JSON.stringify(joined.map(i => i.path + ':' + i.key)));
  const clean = hitsIn(['Premier bloc.', 'Second bloc.']);
  ok('and two fragments that draw nothing reserved are left alone',
    clean.length === 0, JSON.stringify(clean.map(i => i.path + ':' + i.key)));
  /* ET C'EST UNE VIRGULE QUI LES JOINT, comme String(array) le fait. Un espace a
   * la place inventerait un refus : « ...this text is an » + « example... » ne
   * forme la phrase reservee que si rien ne s'intercale. */
  const frole = hitsIn(['Ce qui suit this text is an', 'example de liste']);
  ok('and a comma is what joins them, so two fragments only a space would soil are clean',
    frole.length === 0, JSON.stringify(frole.map(i => i.path)));
}

// ---- CE QUE L'ADOPTANTE ECRIT NE DOIT PAS SE RETOURNER CONTRE ELLE ----------
{
  const based = extra => {
    const t = { id: 'c', langs: ['fr'], defaultLang: 'fr', start: 'q1',
      steps: [{ id: 's', name: 'S' }],
      publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
      review: { by: 'Legal', date: '2026-06-01' },
      nodes: { q1: { type: 'single', step: 's', title: 'Q',
        answers: [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }] } },
      results: { r: { level: 'info', title: 'R', solution: { text: 'S' } } },
      links: {}, disclaimer: 'D' };
    Object.keys(extra || {}).forEach(k => { t[k] = extra[k]; });
    return t;
  };

  /* LE SOULIGNE COMPTE COMME LE TIRET DANS UN CODE DE LANGUE. « he_IL » sortait
   * de la table des ecritures, treeScripts rendait une liste vide, et chaque mot
   * hebreu de quatre lettres devenait un nom reserve contrefait : le verrou se
   * retournait contre celle qui avait bien declare sa langue, en lui conseillant
   * de faire ce qu'elle venait de faire. */
  const HEBREU = '\u05ea\u05d5\u05de\u05da';       // quatre lettres hébraïques
  const ARABE = '\u062f\u0639\u0645\u062a';        // quatre lettres arabes
  const inLang = (code, mot) => {
    const t = based({ langs: [code], defaultLang: code });
    t.disclaimer = 'Avertissement ' + mot + ' ici.';
    return AI_GO.guard(t, 'hes-example.ch').filter(i => /disclaimer/.test(i.path)).length;
  };
  // Chaque code est éprouvé avec l'écriture QU'IL DÉCLARE, jamais avec une autre.
  const ECRITURES = [['he', HEBREU], ['he-IL', HEBREU], ['he_IL', HEBREU], ['HE', HEBREU],
    ['he_il', HEBREU], ['ar', ARABE], ['ar-SA', ARABE], ['ar_SA', ARABE], ['AR', ARABE]];
  const retournees = ECRITURES.filter(([c, m]) => inLang(c, m) > 0);
  ok(`the ${ECRITURES.length} spellings of a language tag all read the script the tree declares`,
    retournees.length === 0, retournees.map(x => x[0]).join(', '));
  // Et la porte ne s'ouvre pas : une écriture qu'aucune langue déclarée n'emploie
  // reste refusée, et le souligné n'y change rien.
  const FERMEES = [['fr', HEBREU], ['fr', ARABE], ['de_DE', HEBREU], ['en-GB', ARABE]];
  const ouvertes = FERMEES.filter(([c, m]) => inLang(c, m) === 0);
  ok(`and the ${FERMEES.length} scripts no declared language uses are still refused`,
    ouvertes.length === 0, ouvertes.map(x => x[0]).join(', '));

}

// ---- UNE BORNE QUI NE REND PAS LA MAIN N'EST PAS UNE BORNE ------------------
// La garde de profondeur de l'enumerateur retournait AVANT de pousser dans la
// liste : `list` restait vide, la borne des 5000 chemins ne mordait plus jamais,
// et un arbre CONFORME de 502 questions envoyait la marche parcourir 2^501
// branches. La page ne rendait plus la main, jamais, sur un fichier que le
// moteur declare publiable. Une seule forme d'arbre gardait cette borne, et ce
// n'etait pas celle-la : la chaine ou les DEUX reponses avancent.
{
  const chaine = n => {
    const nodes = {};
    for (let k = 1; k <= n; k++) {
      // Les deux reponses avancent : c'est ce qui fait doubler les branches.
      nodes['q' + k] = k === n
        ? { type: 'single', step: 's', title: 'Q' + k,
            answers: [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }] }
        : { type: 'single', step: 's', title: 'Q' + k,
            answers: [{ value: 'a', to: 'q' + (k + 1) }, { value: 'b', to: 'q' + (k + 1) }] };
    }
    return { id: 'long-example', langs: ['fr'], defaultLang: 'fr', start: 'q1',
      publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
      review: { by: 'Legal', date: '2026-06-01' },
      jurisdiction: 'CH-VD', legalBasis: ['LPD'], disclaimer: 'D',
      steps: [{ id: 's', name: 'S' }], nodes: nodes,
      results: { r: { level: 'info', step: 's', title: 'R', solution: { text: 'S' } } },
      links: {} };
  };
  // 501 tenait deja ; 502 est le premier qui franchissait la garde de profondeur.
  const mesure = n => {
    const t0 = Date.now();
    const out = CHECK.paths(chaine(n));
    return { n: out.length, tronque: !!out.truncated, ms: Date.now() - t0 };
  };
  const court = mesure(501);
  ok('a chain of 501 questions is enumerated and reported truncated',
    court.tronque === true && court.ms < 5000, JSON.stringify(court));
  const long = mesure(502);
  ok('and one question deeper still returns, instead of walking two to the five hundredth',
    long.tronque === true && long.ms < 5000, JSON.stringify(long));
  // ET LA BORNE DU NOMBRE MORD ENCORE, elle : un arbre large, peu profond.
  const large = () => {
    const nodes = { q1: { type: 'single', step: 's', title: 'Q1', answers: [] } };
    for (let k = 0; k < 40; k++) nodes.q1.answers.push({ value: 'v' + k, to: 'q2' });
    nodes.q2 = { type: 'single', step: 's', title: 'Q2', answers: [] };
    for (let k = 0; k < 40; k++) nodes.q2.answers.push({ value: 'w' + k, to: 'q3' });
    nodes.q3 = { type: 'single', step: 's', title: 'Q3', answers: [] };
    for (let k = 0; k < 40; k++) nodes.q3.answers.push({ value: 'x' + k, result: 'r' });
    const t = chaine(1); t.nodes = nodes; return t;
  };
  const wide = CHECK.paths(large());
  ok('a wide shallow tree is stopped by the count bound, which is the other half of the guard',
    wide.truncated === true && wide.length > 0, wide.length + ' chemins');
}




// ---- CE QUE LA PAGE MONTRE, LU JUSQU'A SON PREMIER CARACTERE ---------------
// L'extraction du texte visible n'etait pas exportee, et deux defauts vivaient
// la ou rien ne pouvait les atteindre. Une recherche ecrite `> 0` au lieu de
// `>= 0` rend muette une sentinelle posee en TETE du texte -- exactement ou un
// titre de page la porte. Et la borne haute du decodage des references de
// caracteres, si elle perd un cran, laisse une chaine se cacher derriere le
// dernier point de code d'Unicode.
{
  const eng3 = CHECK.loadEngine(html).value;
  const page = body => '<html><body>' + body + '</body></html>';

  // AU TOUT PREMIER CARACTERE, la ou un titre commence.
  const atStart = CHECK.chromeSentinels(page('<h1>TO_FILL_IN, puis la suite</h1>'), eng3);
  ok('a placeholder written at the very first character of what the page shows is reported',
    atStart.length === 1, atStart.length + ' point(s)');
  const later = CHECK.chromeSentinels(page('<h1>Un titre, puis TO_FILL_IN</h1>'), eng3);
  ok('and one written further along is reported the same way',
    later.length === 1, later.length + ' point(s)');

  // LES REFERENCES DE CARACTERES, A LEUR BORNE HAUTE.
  const seen = t => CHECK.chromeText(page('<p>' + t + '</p>'));
  ok('a character reference is decoded, so a placeholder cannot hide behind one',
    CHECK.chromeSentinels(page('<p>TO_FILL&#95;IN</p>'), eng3).length === 1);
  ok('the highest code point Unicode has is decoded, in decimal and in hexadecimal',
    seen('&#1114111;').indexOf(String.fromCodePoint(0x10ffff)) >= 0 &&
    seen('&#x10FFFF;').indexOf(String.fromCodePoint(0x10ffff)) >= 0,
    JSON.stringify(seen('&#1114111;')));
  ok('and one code point above it is not a character, so it is left as it was written',
    seen('&#1114112;').indexOf('1114112') >= 0, JSON.stringify(seen('&#1114112;')));
}

// ---- LE VALIDATEUR LIT LE DESSIN, PAS LE SOURCE -----------------------------
// Un audit de robustesse a monte six fichiers dans un vrai Chrome et lu l'ecran :
// six fois le lecteur voyait un marqueur ou le nom d'origine, six fois le verdict
// disait « publiable ». Trois causes, toutes dans l'extraction du texte affiche.
{
  const eng4 = CHECK.loadEngine(html).value;
  const page = body => '<html><body>' + body + '</body></html>';
  const sentinelled = body => CHECK.chromeSentinels(page(body), eng4).length;

  // CE QUI NE SEPARE RIEN A L'ECRAN NE DOIT RIEN SEPARER ICI.
  const JOINED = [
    ['une balise en ligne', '<h1>TO_<span>FILL</span>_IN</h1>'],
    ['du gras', '<h1>TO_<strong>FILL</strong>_IN</h1>'],
    ['un lien', '<h1>TO_<a href="#">FILL</a>_IN</h1>'],
    ['un commentaire', '<h1>TO_<' + '!-- note --' + '>FILL_IN</h1>'],
    ['une entité qui nomme le tiret bas', '<h1>TO&lowbar;FILL&lowbar;IN</h1>']
  ];
  const slipped = JOINED.filter(([, b]) => sentinelled(b) === 0);
  ok(`the ${JOINED.length} ways of cutting a placeholder that a browser draws as one word are all reported`,
    slipped.length === 0, slipped.map(x => x[0]).join(' | '));
  /* LES BALISES EN LIGNE, UNE PAR UNE, et la liste est ecrite ICI. La lire de
   * check.html la ferait retrecir en meme temps qu'elle : une table qui
   * s'eprouve elle-meme ne prouve rien. Trois etaient couvertes sur vingt-huit,
   * et le compte annonce est celui du tableau lui-meme. */
  const INLINE_TAGS = ('a|abbr|b|bdi|bdo|cite|code|data|dfn|em|i|kbd|mark|q|rp|rt|ruby|'
    + 's|samp|small|span|strong|sub|sup|time|u|var|wbr').split('|');
  const muettes = INLINE_TAGS.filter(t =>
    sentinelled('<h1>TO_<' + t + '>FILL</' + t + '>_IN</h1>') === 0);
  if (sentinelled('<h1>TO_<SPAN>FILL</SPAN>_IN</h1>') === 0) muettes.push('SPAN en capitales');
  ok(`each of the ${INLINE_TAGS.length} inline tags joins the word it splits, in either case`,
    muettes.length === 0, muettes.join(', '));

  // ET CE QUI SEPARE VRAIMENT DOIT SEPARER : deux blocs ne sont pas un mot.
  ok('two block elements are not read as one word, which would refuse the world',
    sentinelled('<p>TO_FILL</p><p>_IN</p>') === 0);

  // LES TROIS ALPHABETS STYLISES, qui nomment une lettre latine.
  const reserved = body => CHECK.chromeTerms(page(body), eng4, 'hes-example.ch',
    { publisher: { domains: ['hes-example.ch'] }, langs: ['fr'] }).length;
  const STYLED = [['ajouré', 'opf'], ['gothique', 'fr'], ['anglaise', 'scr']];
  const unseen = STYLED.filter(([, k]) =>
    reserved('<h1>Guide &U' + k + ';&N' + k + ';&I' + k + ';&L' + k + ';</h1>') === 0);
  ok(`the origin name written in the ${STYLED.length} styled alphabets HTML names is reported in all three`,
    unseen.length === 0, unseen.map(x => x[0]).join(' | '));
}

// ---- L'EMPREINTE DIT SI LE MOTEUR A BOUGE, PAS COMMENT IL EST EMBALLE -------
// Une revue de fidelite a compare 102 fichiers dans un vrai Chrome. Quatre
// d'entre eux portaient un moteur identique octet pour octet, s'affichaient
// exactement comme le temoin, et s'entendaient dire que leur moteur avait ete
// modifie : la fermeture ecrite avec une espace, avec une barre oblique, avec
// un saut de ligne -- trois formes qu'un navigateur ferme pareil et qu'un CMS
// reecrit sans prevenir -- et le fichier dont les balises sont en capitales,
// qui perdait meme son moteur entierement. Un faux positif sur l'integrite est
// aussi couteux qu'un faux negatif : il fait renoncer a publier un bon fichier.
{
  const O = '<' + 'script', C = '<' + '/' + 'script';
  const ECRITURES = [
    ['une espace avant le chevron', s => s.split(C + '>').join(C + ' >')],
    ['une barre oblique', s => s.split(C + '>').join(C + '/>')],
    ['un saut de ligne', s => s.split(C + '>').join(C + '\n>')],
    ['des capitales', s => s.split(O + '>').join(O.toUpperCase() + '>')
      .split(C + '>').join(C.toUpperCase() + '>')],
  ];
  const empreinte = src => { const r = CHECK.loadEngine(src); return r && r.value ? r.computed : null; };
  const temoin = empreinte(html);
  ok('the delivered file loads and its engine print is the one the marker declares',
    temoin !== null && html.indexOf('h:' + temoin) > 0, String(temoin));
  const bougees = ECRITURES.filter(([, f]) => empreinte(f(html)) !== temoin);
  ok(`the ${ECRITURES.length} spellings of the wrapper a browser closes alike leave the engine print where it was`,
    bougees.length === 0, bougees.map(x => x[0]).join(' | '));
  /* ET ELLE MORD SUR TOUT LE BLOC, pas sur le seul code. Le premier remede a ce
   * faux positif ne hachait plus que le JavaScript, et treize mille caracteres
   * de feuille de style -- celle qui porte la couche d'accessibilite -- sont
   * sortis du controle sans que rien ne rougisse : la correction etait pire que
   * le defaut. Les trois choses que le bloc porte sont eprouvees une par une. */
  const PORTE = [
    ['le code du moteur', s => s.replace('var FREEZE_MAX_DEPTH = 32;', 'var FREEZE_MAX_DEPTH = 99;')],
    ['la feuille de style du moteur', s => s.replace('.aigo-disclaimer { font-size: .875rem; }',
      '.aigo-disclaimer { font-size: .5rem; }')],
    ['un attribut sur la balise qui les porte', s => {
      const bloc = CHECK.engineBlock(s), tag = bloc.match(/<script[^>]*>/i)[0];
      const at = s.indexOf(bloc);
      return s.slice(0, at) + bloc.replace(tag, '<' + 'script defer>') + s.slice(at + bloc.length);
    }]
  ];
  const muettes = PORTE.filter(([, f]) => {
    const mod = f(html);
    return mod === html || empreinte(mod) === temoin;
  });
  ok(`each of the ${PORTE.length} things the engine block carries moves its print when it changes`,
    muettes.length === 0, muettes.map(x => x[0]).join(' | '));
}






// ---- « OÙ QUE CE SOIT » VEUT DIRE HORS DE L'ARBRE AUSSI ---------------------
// Le guide promet d'attraper un texte à remplacer « où que ce soit ». Le garde
// du moteur parcourt l'arbre, et c'est son périmètre ; le titre de la page, le
// grand titre, le chapeau et le message affiché quand les scripts ne s'exécutent
// pas n'en font pas partie. Un message de repli livré avec un TO_FILL_IN dedans
// -- le seul texte que voit un lecteur sans JavaScript -- a traversé un verdict
// « publiable, rien à signaler » sans un mot. Le validateur lit déjà tout ce que
// la page montre : c'est là que le contrôle manquait.
{
  const eng2 = CHECK.loadEngine(html).value;
  /* CETTE SENTINELLE EST LA NOTRE, PAS LA SIENNE. Le fichier livre porte un
   * TO_FILL_IN dans son message de repli, et c'est voulu : c'est la case ou
   * l'adoptante ecrit son adresse de contact. Exiger la sentinelle sans
   * condition faisait echouer le harnais sur le fichier de celle qui l'avait
   * correctement remplie -- le seul fichier approuve etait alors celui qui
   * gardait un texte a remplacer sous les yeux du lecteur. */
  if (onlyDelivered('the placeholder the delivered fallback message carries, which yours should not have')) {
    const delivered = CHECK.chromeSentinels(html, eng2);
    ok('the delivered file is reported for the placeholder its fallback message carries',
      delivered.length >= 1 && delivered.every(i => i.level === 'warn'),
      delivered.length + ' point(s)');
  }
  const filled = html.replace(/mailto:TO_FILL_IN/g, 'mailto:service@heg.ch')
    .replace(/>TO_FILL_IN<\/a>/g, '>service@heg.ch</a>');
  ok('and it is clean once that message is filled in',
    CHECK.chromeSentinels(filled, eng2).length === 0,
    CHECK.chromeSentinels(filled, eng2).map(i => i.message.slice(0, 40)).join(' | '));
  // Chaque sentinelle, à chacun des quatre endroits hors de l'arbre.
  const PLACES = [['<title>', '<title>X</title>'], ['grand titre', '<h1>X</h1>'],
    ['chapeau', '<p class="lead">X</p>'], ['message de repli', '<' + 'noscript><p>X</p></' + 'noscript>']];
  const missed = [];
  (eng2.POLICY.sentinels || []).forEach(word => {
    PLACES.forEach(([label, shape]) => {
      const page = '<html><body>' + shape.replace('X', 'Texte ' + word + ' ici') + '</body></html>';
      if (!CHECK.chromeSentinels(page, eng2).length) missed.push(label + ' / ' + word);
    });
  });
  ok(`each placeholder is reported in each of the ${PLACES.length} places outside the tree a reader can see`,
    missed.length === 0, missed.join(', '));
}

// ---- THE SANDBOX RUNS THE PROGRAM THE BROWSER RUNS -------------------------
// `document` was undefined in the sandbox, which does not make a file safer: it
// makes it a DIFFERENT program. A change guarded by `typeof document !==
// "undefined"` vanished from the check without vanishing from the page, and
// `document.addEventListener`, the commonest way to fill a date before the
// mount, raised an error this page blamed on the file. And `load` handlers were
// replayed although the engine mounts on DOMContentLoaded and keeps its copy:
// the verdict was the opposite of the screen, in both directions.
{
  const S2 = '<' + 'script>', E2 = '<' + '/' + 'script>';
  const tree = d => '{ id:"t", langs:["fr"], defaultLang:"fr", start:"q1",' +
    ' publisher:{name:"HEG",domains:["heg.ch"]}, review:{by:"DPO",date:' + JSON.stringify(d) + '},' +
    ' jurisdiction:"CH", legalBasis:["LPD"], disclaimer:{fr:"Avis"}, steps:[{id:"s1",name:{fr:"S"}}], links:{},' +
    ' nodes:{q1:{type:"single",step:"s1",title:{fr:"Q1"},answers:[{value:"a",result:"r1"},{value:"b",result:"r1"}]}},' +
    ' results:{r1:{step:"s1",level:"info",title:{fr:"R1"},solution:{text:{fr:"S"}}}} }';
  const page = (start, after) => '<html><body><div data-ai-go="AI_GO_CONTENT"></div>\n' +
    S2 + 'var AI_GO_CONTENT = ' + tree(start) + ';' + E2 + '\n' + (after || '') + '\n</body></html>';
  const dateSeen = html => {
    const r = CHECK.loadContent(html);
    return r && r.value && r.value.review ? r.value.review.date : null;
  };
  const CASES = [
    ['a branch on typeof document', page('TO_FILL_IN',
      S2 + 'if (typeof document !== "undefined") { AI_GO_CONTENT.review.date = "2026-06-01"; }' + E2), '2026-06-01'],
    ['document.addEventListener', page('TO_FILL_IN',
      S2 + 'document.addEventListener("DOMContentLoaded", function(){ AI_GO_CONTENT.review.date = "2026-06-01"; });' + E2), '2026-06-01'],
    ['window.addEventListener', page('TO_FILL_IN',
      S2 + 'window.addEventListener("DOMContentLoaded", function(){ AI_GO_CONTENT.review.date = "2026-06-01"; });' + E2), '2026-06-01'],
    ['a load handler comes too late to help', page('TO_FILL_IN',
      S2 + 'window.addEventListener("load", function(){ AI_GO_CONTENT.review.date = "2026-06-01"; });' + E2), 'TO_FILL_IN'],
    ['and too late to harm', page('2026-06-01',
      S2 + 'window.addEventListener("load", function(){ AI_GO_CONTENT.review.date = "TO_FILL_IN"; });' + E2), '2026-06-01'],
    ['nothing after the tree', page('TO_FILL_IN', ''), 'TO_FILL_IN']
  ];
  const wrong = CASES.filter(([, html, want]) => dateSeen(html) !== want);
  ok(`the validator reads what the browser would, in all ${CASES.length} ways a file fills a field late`,
    wrong.length === 0, wrong.map(x => x[0] + ' -> ' + JSON.stringify(dateSeen(x[1]))).join(' | '));
  // Et le document du bac a sable ne touche a rien : ce qu'on lui demande est vide.
  const reaching = page('TO_FILL_IN', S2 +
    'var n = document.getElementById("x"); if (n) { AI_GO_CONTENT.review.date = "atteint"; }' +
    'document.body.appendChild(document.createElement("div"));' + E2);
  ok('and a file that reaches for the DOM finds an inert one, and reaches nothing',
    dateSeen(reaching) === 'TO_FILL_IN');
}

// ---- TWO PAGES THAT DIFFER ON SCREEN DIFFER IN THE RECEIPT -----------------
// The receipt is what a legal service files. Two ways of describing a tree used
// to defeat it, and both were reproduced in a browser: a numeric target, since
// `Infinity` and `-Infinity` name two different results and serialise to the
// same `null`; and a key declared non-enumerable, which vanished from the
// serialisation without vanishing from the screen. Two files showing opposite
// conclusions handed back the same two values, both publishable.
{
  const twoWays = (a2, b2) => ({
    id: 'c', langs: ['fr'], defaultLang: 'fr', start: 'q1', steps: [{ id: 's', name: 'S' }],
    publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
    review: { by: 'Legal', date: '2026-06-01' },
    nodes: { q1: { type: 'single', step: 's', title: 'Q',
      answers: [{ value: 'a', result: a2 }, { value: 'b', result: b2 }] } },
    results: { oui: { level: 'info', title: 'Autorisé', solution: { text: 'S' } },
               non: { level: 'stop', title: 'Interdit', solution: { text: 'S' } } },
    links: {}, disclaimer: 'D'
  });
  // A numeric target is refused outright: a target names a key, and a key is text.
  const numeric = twoWays(Infinity, -Infinity);
  ok('a target written as a number is refused, since two numbers can be written the same way',
    AI_GO.structure(numeric).some(i => /answers/.test(i.path)),
    AI_GO.structure(numeric).map(i => i.path).join(','));
  // And two trees whose answers lead to opposite conclusions never share a receipt.
  const A = twoWays('oui', 'non'), B = twoWays('non', 'oui');
  ok('two trees whose answers lead to opposite conclusions have different receipts',
    AI_GO.fingerprint(A) !== AI_GO.fingerprint(B),
    AI_GO.fingerprint(A) + ' vs ' + AI_GO.fingerprint(B));
  // A key posted non-enumerable is signed exactly as one posted plainly: the
  // three projections read the frozen copy, which is the copy that is drawn.
  // Meme ordre de cles dans les deux, l'ordre etant signe deliberement : ce qui
  // est compare ici est la maniere de POSER la cle, pas sa place.
  const posed = (how, what) => {
    const t3 = twoWays('oui', 'non');
    delete t3.results.oui.title;
    if (how === 'hidden') Object.defineProperty(t3.results.oui, 'title', { value: what, enumerable: false });
    else t3.results.oui.title = what;
    return t3;
  };
  ok('a key declared non-enumerable is signed exactly as one written plainly',
    AI_GO.fingerprint(posed('hidden', 'Autorisé')) === AI_GO.fingerprint(posed('plain', 'Autorisé')),
    AI_GO.fingerprint(posed('hidden', 'Autorisé')) + ' vs ' + AI_GO.fingerprint(posed('plain', 'Autorisé')));
  ok('and changing what it says still moves the receipt',
    AI_GO.fingerprint(posed('hidden', 'Autorisé')) !== AI_GO.fingerprint(posed('hidden', 'Autre chose')));
}

// ---- ONE CALCULATION, ONE SENTENCE, EVERYWHERE IT IS DESCRIBED -------------
// The fingerprint was described four different ways for one projection: "the
// questions, the routing and the links" in the validator, "the questions, the
// answers, the results and the links" in one of its own messages, "the start,
// the questions, the results and the links" in the integration guide, and "the
// questions, the answers and the results" -- which is examplePrint, a different
// value -- in the engine's own comment. Each wording was written by somebody who
// had read the code, and three of them were wrong. The words are frozen here,
// against the projection the code actually hashes.
{
  const FR = 'le départ, les questions, les résultats et les liens';
  const EN = 'the start, the questions, the results and the links';
  // The projection itself, read off the engine rather than trusted: hashing a
  // tree with each of the four fields moved must move the value, and moving a
  // field the fingerprint does not cover must not.
  const based = () => cp(signed);
  const moves = f => { const t3 = based(); f(t3); return AI_GO.fingerprint(t3) !== AI_GO.fingerprint(signed); };
  const covered = [
    ['start', t3 => { t3.start = Object.keys(t3.nodes)[1] || t3.start; }],
    ['nodes', t3 => { t3.nodes[Object.keys(t3.nodes)[0]].title = 'Autre chose'; }],
    ['results', t3 => { t3.results[Object.keys(t3.results)[0]].title = 'Autre chose'; }],
    ['links', t3 => { t3.links = Object.assign({}, t3.links, { z: { label: 'z', href: '/z' } }); }]
  ];
  const outside = [
    ['publisher', t3 => { t3.publisher.name = 'Autre'; }],
    ['review', t3 => { t3.review.by = 'Autre'; }],
    ['disclaimer', t3 => { t3.disclaimer = 'Autre'; }],
    ['steps', t3 => { t3.steps[0].name = 'Autre'; }]
  ];
  const missed = covered.filter(([, f]) => !moves(f)).map(x => x[0]);
  const leaked = outside.filter(([, f]) => moves(f)).map(x => x[0]);
  ok('the fingerprint covers those four fields and no others',
    missed.length === 0 && leaked.length === 0,
    'non couvert : ' + missed.join(',') + ' | de trop : ' + leaked.join(','));
  // And every page that describes it uses the same words for it.
  const SAYS_FR = ['check.html', 'docs/ARBRE.md'];
  const SAYS_EN = ['check.html', 'docs/INTEGRATE.md'];
  const wrongFr = SAYS_FR.filter(f => read(f).indexOf(FR) < 0);
  const wrongEn = SAYS_EN.filter(f => read(f).indexOf(EN) < 0);
  ok('and every page that describes it says it in the same words, in both languages',
    wrongFr.length === 0 && wrongEn.length === 0,
    'fr : ' + wrongFr.join(',') + ' | en : ' + wrongEn.join(','));
  // The validator calls it a HALF, never the receipt: the signature is the other.
  ok('the validator calls the fingerprint one half of the receipt, never the receipt',
    /one half of the receipt/.test(read('check.html')) &&
    /une moitié du reçu/.test(read('check.html')) &&
    read('check.html').indexOf('is the receipt of your review') < 0);
}

// ---- THE RECEIPT HAS A SHAPE, AND THE SHAPE IS PART OF THE PROMISE ---------
// A mutation padded the two halves of the digest together instead of one by one.
// No collision, every frozen value unmoved, harness green -- and one string in
// sixteen came back with a digest of a different width, so a legal service that
// had recorded a receipt could not reproduce it. What is asserted is the shape:
// sixteen characters, and the first eight are the first half.
{
  const shapes = new Set();
  const halves = [];
  for (let i = 0; i < 40000; i++) {
    const h = AI_GO.hash('AI_GO shape ' + i);
    shapes.add(h.length);
    if (!/^[0-9a-f]{16}$/.test(h)) halves.push(h);
  }
  ok('every digest is sixteen lowercase hexadecimal characters, over forty thousand strings',
    shapes.size === 1 && shapes.has(16) && halves.length === 0,
    [...shapes].join(',') + ' ' + halves.slice(0, 3).join(' '));
  // The empty string and one character: the two inputs a padding bug reaches first.
  ok('and so are the digests of the shortest inputs there are',
    /^[0-9a-f]{16}$/.test(AI_GO.hash('')) && /^[0-9a-f]{16}$/.test(AI_GO.hash('a')) &&
    /^[0-9a-f]{16}$/.test(AI_GO.hash('\u0000')),
    AI_GO.hash('') + ' ' + AI_GO.hash('a'));
}

// ---- THE EXEMPTION IS COMPARED EXACTLY, NEVER AS A HEAD OF A PATH -----------
// `derivedFrom.name` may name the source; `derivedFrom.name.en` is a string
// somebody wrote and is read like the rest of the page. A mutation turned the
// exact comparison into a prefix one, and the bilingual name became a field of
// free prose about the origin. `publisher.domains` closes the same trap and has
// an assertion for it; this one had none.
{
  const withName = v => {
    const t3 = cp(signed);
    t3.derivedFrom = { name: v };
    return AI_GO.guard(t3, 'hes-example.ch').map(i => i.path);
  };
  ok('derivedFrom.name names the source and passes',
    withName('University of Lausanne').length === 0, withName('University of Lausanne').join(','));
  const bilingual = withName({ en: 'Adapted from the University of Lausanne toolkit',
    fr: 'Adapte de la boite a outils de l\'Universite de Lausanne' });
  ok('but a bilingual name, which is two sentences about the origin, is read like any other text',
    bilingual.length >= 2 && bilingual.every(p2 => p2.indexOf('derivedFrom.name.') === 0),
    bilingual.join(','));
}

// ---- derivedFrom.note IS TEXT, OR IT IS NOTHING -----------------------------
// A mutation checked its form only when it was already a string, so `note: 42`
// was declared structurally sound, drawn as nothing, and the adopter's sentence
// vanished without a word.
{
  const noteIs = v => {
    const t3 = cp(signed);
    t3.derivedFrom = { name: 'Source', note: v };
    return AI_GO.structure(t3).some(i => i.path.indexOf('derivedFrom.note') === 0);
  };
  // An empty list is an empty note, which is a note; the shapes below are not
  // text in any reading. A bare `{ items: [...] }` is not one either: a list is a
  // BLOCK, and a block lives inside the list of blocks -- `[{ items: [...] }]`.
  const NOT_TEXT = [42, true, {}, [42], { items: 42 }, { items: ['a'] }, { fr: 42 }, () => 'x'];
  const accepted = NOT_TEXT.filter(v => !noteIs(v));
  ok(`a note that is not text is refused in all ${NOT_TEXT.length} shapes, instead of drawn as nothing`,
    accepted.length === 0, accepted.map(v => JSON.stringify(v) || String(v)).join(' | '));
  ok('and the five shapes a text may take are accepted, an empty note included',
    !noteIs('une phrase') && !noteIs(['un', 'deux']) && !noteIs([{ items: ['a', 'b'] }]) &&
    !noteIs({ fr: 'phrase', en: 'sentence' }) && !noteIs([]));
}

// ---- THE TABLE OF SCRIPTS, READ IN BOTH DIRECTIONS -------------------------
// Seventy-five mutations of the engine were run against this harness and
// twenty-eight came back green. Every assertion below closes one of them: they
// are not decoration, each is a hole somebody walked through.
{
  const scripted = (txt, langs) => ({
    id: 'c', langs: langs, defaultLang: langs[0], start: 'q1',
    steps: [{ id: 's', name: 'S' }],
    publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
    review: { by: 'Legal', date: '2026-06-01' },
    nodes: { q1: { type: 'single', step: 's', title: txt,
      answers: [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }] } },
    results: { r: { level: 'info', title: 'R', solution: { text: 'S' } } },
    links: {}, disclaimer: 'D'
  });
  const flagged = (txt, langs) =>
    AI_GO.guard(scripted(txt, langs), 'hes-example.ch').some(i => /nodes/.test(i.path));

  // Declaring a script buys THAT script and no other. A tree that declares Greek
  // may write Greek; it may not spell the origin in Cherokee, in Deseret or in
  // the small capitals -- and one mutation of ownScript() opened all three at
  // once while every assertion stayed green.
  const FOREIGN = [['petites capitales', 'Guide \u1d1c\u0274\u026a\u029f'],
    ['cherokee', 'Guide \u13a2\u13a0\u13a1\u13a3'],
    ['deseret', 'Guide \ud801\udc10\ud801\udc11\ud801\udc12\ud801\udc13'],
    ['geometrique', 'Guide \u1d00\u1d0b\u1d0f\u1d1b']];
  const opened = FOREIGN.filter(([, t]) => !flagged(t, ['fr', 'el']));
  ok(`a tree that declares Greek is refused the name written in ${FOREIGN.length} scripts that are not Greek`,
    opened.length === 0, opened.map(x => x[0]).join(', '));
  // Including above the basic plane: reading by UTF-16 unit instead of by code
  // point makes every astral letter invisible, and Deseret went straight through.
  ok('and refused it above the basic plane, which is where reading by code unit failed',
    flagged('Guide \ud801\udc10\ud801\udc11\ud801\udc12\ud801\udc13', ['fr', 'zh']));

  // The other direction: a tree that declares a language writes that language.
  // One mutation dropped `kana` from `ja` and a Japanese adopter could no longer
  // publish four kana of their own, with a refusal telling them they had named
  // the University of Lausanne.
  const OWN = [['ja', '\u30e4\u30de\u30c8\u30b3'], ['ja', '\u3053\u306e\u8cea\u554f'],
    ['ko', '\ud55c\uad6d\uc5b4\ubb38'], ['ru', '\u0446\u0438\u0444\u0440\u0430'],
    ['el', '\u03a8\u03a9\u039e\u03a6'], ['chr', '\uab74\uab72\uab75\uabae'],
    ['ru', '\ua640\ua642\ua644\ua646'], ['he', '\u05d0\u05d1\u05d2\u05d3'],
    ['ka', '\u10d0\u10d1\u10d2\u10d3'], ['th', '\u0e01\u0e02\u0e03\u0e04'],
    ['hi', '\u0915\u0916\u0917\u0918'], ['am', '\u1200\u1201\u1202\u1203'],
    ['iu', '\u1401\u1402\u1403\u1404'], ['hy', '\u0531\u0532\u0533\u0534']];
  const shut = OWN.filter(([l, t]) => flagged(t, ['fr', l]));
  ok(`each of the ${OWN.length} declared languages may write its own script, extended blocks included`,
    shut.length === 0, shut.map(x => x[0] + ' ' + x[1]).join(', '));
  // A subtag is not another language. Every serious tree writes zh-Hans, not zh.
  const TAGGED = [['zh-Hans', '\u6f22\u5b57\u6587\u66f8'], ['sr-Cyrl', '\u0446\u0438\u0444\u0440'],
    ['ja-JP', '\u30e4\u30de\u30c8\u30b3'], ['el-GR', '\u03a8\u03a9\u039e\u03a6']];
  const lost = TAGGED.filter(([l, t]) => flagged(t, ['fr', l]));
  ok('a region or script subtag keeps the exemption its language buys',
    lost.length === 0, lost.map(x => x[0]).join(', '));

  // The two tables have to agree, or a tree declaring a listed language gets no
  // verdict at all: one mutation added a script name with no ranges and guard()
  // returned a single "Check impossible" instead of its points.
  const named = Object.keys(AI_GO.LANG_SCRIPTS || {});
  ok('every language in the table names a script the table of ranges defines, and every one yields a verdict',
    named.length > 20 && named.every(l => {
      const out = AI_GO.guard(scripted('Un texte ordinaire', ['fr', l]), 'hes-example.ch');
      return !out.some(i => i.path === 'tree');
    }), 'une langue déclarée ne rend pas de verdict');
  // And no Latin-script language is in it, or it would buy an exemption for a
  // script it does not use: adding `fr: ['greek']` let every French tree spell
  // the origin in Greek.
  const LATIN = ['en', 'fr', 'de', 'it', 'es', 'pt', 'nl', 'rm', 'da', 'sv', 'pl', 'cs', 'tr'];
  const wrong = LATIN.filter(l => (AI_GO.LANG_SCRIPTS || {})[l]);
  ok('and no language written in the Latin alphabet is on it', wrong.length === 0, wrong.join(', '));
}

// ---- THE ORIGIN'S NAME, PUT IN BOLD, IS STILL THE ORIGIN'S NAME -------------
// The inline syntax is part of the reading: asRead() spells what inlineInto()
// draws, out of the same split. A mutation that made asRead keep only what sits
// OUTSIDE the markers left the guard reading "UNIL" as nothing at all, while the
// reader read it in bold, and the harness stayed green.
{
  const inBold = t => ({
    id: 'c', langs: ['fr'], defaultLang: 'fr', start: 'q1', steps: [{ id: 's', name: 'S' }],
    publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
    review: { by: 'Legal', date: '2026-06-01' },
    nodes: { q1: { type: 'single', step: 's', title: t,
      answers: [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }] } },
    results: { r: { level: 'info', title: 'R', solution: { text: 'S' } } },
    links: {}, disclaimer: 'D'
  });
  const caught = t => AI_GO.guard(inBold(t), 'hes-example.ch').some(i => /nodes/.test(i.path));
  const MARKED = ['**UNIL**', 'Guide **UNIL** interne', 'Uni**versity of Lausanne**',
    '**AI_GO**', 'D**CSR**', '****UNIL****'];
  const slipped = MARKED.filter(t => !caught(t));
  ok(`the origin's name is caught in all ${MARKED.length} ways the inline syntax can be wrapped round it`,
    caught('UNIL') && slipped.length === 0, slipped.join(' | '));
  // And what the guard reads is what the renderer draws: the same split, spelled
  // rather than drawn.
  ok('and plain() spells exactly what the reader is shown, markers removed',
    AI_GO.plain('a**b**c')[0] === 'abc' && AI_GO.plain('**b**')[0] === 'b');
}

// ---- A DECORATED LATIN LETTER IS A LATIN LETTER -----------------------------
// A hand-written list of "letterish" ranges dropped U+1E00-1FFF, so a dot under
// one letter turned it into a break and "Universite de Lausanne" walked out.
{
  const decorated = t => AI_GO.guard({
    id: 'c', langs: ['fr'], defaultLang: 'fr', start: 'q1', steps: [{ id: 's', name: 'S' }],
    publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
    review: { by: 'Legal', date: '2026-06-01' },
    nodes: { q1: { type: 'single', step: 's', title: t,
      answers: [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }] } },
    results: { r: { level: 'info', title: 'R', solution: { text: 'S' } } },
    links: {}, disclaimer: 'D'
  }, 'hes-example.ch').some(i => /nodes/.test(i.path));
  const DECOR = ['Univer\u1e63ite de Lausanne', 'Universite de \u1e36ausanne', 'UNI\u1e36',
    '\u1ee4NIL', 'Universit\u1ebd de Lausanne', 'D\u1e08SR'];
  const got = DECOR.filter(t => !decorated(t));
  ok(`a Latin letter decorated outside Latin-1 is still a letter, in all ${DECOR.length} readings`,
    got.length === 0, got.join(' | '));
}

// ---- ONE WRITTEN FORM FOR A DATE, BECAUSE A GUESSED DATE IS PRINTED WRONG ---
// Date.parse reads "03.12.2026" -- the third of December as it is written in
// Switzerland -- as the eleventh of March. The file was called publishable,
// printed "Relu le 03.12.2026" under every result, and started its own
// eighteen-month review clock nine months early, with nobody told. The refusal
// sentence had promised YYYY-MM-DD all along; the check now asks for it.
{
  const dated = d => {
    const t2 = cp(signed); t2.review.date = d;
    return AI_GO.guard(t2, 'hes-example.ch').filter(i => i.path === 'review.date').length === 0;
  };
  // Des jours deja venus : une relecture ne se fait pas demain.
  const past = n => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
  const ACCEPTED = [past(1), past(300), ' ' + past(30) + ' '];
  const REFUSED = ['03.12.2026', '12/03/2026', 'septembre 2026', '1 Sep 2026',
    '2026-02-31', '2026-13-45', '2026-9-1', 'à confirmer', '2026/09/01', '20260901',
    '2099-12-31'];
  const wrongly = ACCEPTED.filter(d => !dated(d)).concat(REFUSED.filter(d => dated(d)));
  ok(`a review date is read in one written form and ${REFUSED.length} others are refused, not guessed at`,
    wrongly.length === 0, wrongly.join(' | '));
  // And the clock is read the same way, or the banner would be computed from a
  // date the check has already refused.
  const clock = cp(signed); clock.review.date = '03.12.2026';
  ok('and the review clock refuses that date too, instead of dating it nine months early',
    typeof AI_GO.reviewAgeDays === 'function' && AI_GO.reviewAgeDays(clock) === null &&
    AI_GO.reviewAgeDays(signed) !== null,
    String(AI_GO.reviewAgeDays && AI_GO.reviewAgeDays(clock)));
}

// ---- WHAT THE GUARD READS IS WHAT THE READER SEES ---------------------------
// The engine takes a copy of the tree in plain values, with no prototype and no
// accessor, and checks THAT copy -- which is also the one it draws. So a title
// arriving by the prototype chain is invisible to both at once, and the file
// reports a missing title rather than drawing a reserved name nobody checked.
// SECURITY.md states this as a limit; it is asserted here as an agreement,
// because the day the two disagree is the day the whole lock is decorative.
{
  const shared = { title: 'Guide UNIL' };
  const inherited = Object.create(shared);
  inherited.type = 'single'; inherited.step = 's1';
  inherited.answers = [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }];
  const t3 = { id: 'c', langs: ['fr'], defaultLang: 'fr', start: 'q1',
    steps: [{ id: 's1', name: 'S' }],
    publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
    review: { by: 'Legal', date: '2026-06-01' },
    nodes: { q1: inherited },
    results: { r: { level: 'info', title: 'R', solution: { text: 'S' } } },
    links: {}, disclaimer: 'D' };
  ok('a title reaching the tree by its prototype is read by nobody, the reader included',
    inherited.title === 'Guide UNIL' &&
    AI_GO.guard(t3, 'hes-example.ch').every(i => !/UNIL/.test(i.message)) &&
    AI_GO.structure(t3).some(i => i.path === 'nodes.q1.title'),
    AI_GO.structure(t3).map(i => i.path).join(','));
}

// ---- A SYMBOL IS NOT A LETTER, AND ALL OF UNICODE SAYS SO -------------------
// The reserved-word lock reads a word between two non-letters. It used to read
// that boundary AFTER a compatibility decomposition, which turns U+2122 into the
// two letters "TM": "UNIL™" was checked as "UNILTM", where nothing ends after
// the L, and a copy drew all five reserved names on a foreign domain with one
// invisible character. Nine witnesses were found by hand; there are three
// hundred and twenty-seven, and one of them, the squared capital A, survived the
// first fix because it lives above the basic plane and the fix walked code units.
// So the whole range is walked here, at both edges of the word, every time.
{
  const symbolTree = t => ({
    id: 'c', langs: ['fr'], defaultLang: 'fr', start: 'q1', steps: [{ id: 's', name: 'S' }],
    publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
    review: { by: 'Legal', date: '2026-06-01' },
    nodes: { q1: { type: 'single', step: 's', title: t,
      answers: [{ value: 'a', result: 'r' }, { value: 'b', result: 'r' }] } },
    results: { r: { level: 'info', title: 'R', solution: { text: 'S' } } },
    links: {}, disclaimer: 'D'
  });
  const named = t => AI_GO.guard(symbolTree(t), 'hes-example.ch').some(i => /nodes/.test(i.path));
  const LETTER = /\p{L}/u;
  const forgers = [];
  for (let cp = 0xa0; cp <= 0x1ffff; cp++) {
    if (cp >= 0xd800 && cp <= 0xdfff) continue;
    const c = String.fromCodePoint(cp);
    if (LETTER.test(c)) continue;
    if (/[A-Za-z]/.test(c.normalize('NFKD'))) forgers.push(c);
  }
  // TWO BRANCHES, AND THE COUNT OF EACH. A character that is not a letter and
  // that a compatibility decomposition turns into ONE Latin letter is read AS
  // that letter: the Roman one and the circled I draw an I, and replacing them
  // with a space erased the I in the MIDDLE of the name -- "UN<roman one>L" was
  // checked as "UN L" and published while the reader read the name. Sixteen
  // substitutions out of sixteen went through. A character that decomposes into
  // TWO letters or more stays a break, because reading them as letters is what
  // cancelled a word boundary in the first place.
  const oneLetter = [], manyLetters = [];
  forgers.forEach(c => {
    const d = c.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    (/^[A-Za-z]$/.test(d) ? oneLetter : manyLetters).push([c, d]);
  });
  const stillBreaks = manyLetters.filter(([c]) => !named('Guide UNIL' + c) || !named('Guide UNIL' + c + 'x'));
  ok(`the ${manyLetters.length} characters that decompose into two Latin letters or more break the word, on both sides`,
    manyLetters.length > 200 && stillBreaks.length === 0,
    stillBreaks.slice(0, 8).map(([c]) => 'U+' + c.codePointAt(0).toString(16).toUpperCase()).join(' '));
  // And the single-letter ones are read as the letter they draw, which is what
  // stops them spelling the name from the inside.
  const spelled = oneLetter.filter(([c, d]) => {
    const at = 'UNIL'.indexOf(d.toUpperCase());
    if (at < 0) return false;
    return !named('Guide ' + 'UNIL'.slice(0, at) + c + 'UNIL'.slice(at + 1));
  });
  ok(`the ${oneLetter.length} characters that draw a single Latin letter are read as that letter`,
    oneLetter.length > 40 && spelled.length === 0,
    spelled.slice(0, 8).map(([c]) => 'U+' + c.codePointAt(0).toString(16).toUpperCase()).join(' '));

  // LES LETTRES ENFERMEES QU'UNICODE N'A PAS DECOMPOSEES. Les deux familles
  // « negatives » et les indicateurs regionaux dessinent chacun une lettre
  // latine et n'ont aucune decomposition : ils n'etaient ni lus comme lettres,
  // ni transformes en jokers, et vingt-quatre substitutions sur vingt-quatre
  // faisaient passer le nom de l'origine. Les trois familles sont balayees ici
  // en entier, sur les trois noms les plus courts.
  {
    const FAMILIES = [['cerclées négatives', 0x1f150], ['carrées négatives', 0x1f170],
      ['indicateurs régionaux', 0x1f1e6]];
    const escaped = [];
    FAMILIES.forEach(([label, base]) => {
      ['UNIL', 'DCSR', 'AI_GO'].forEach(word => {
        for (let i = 0; i < word.length; i++) {
          const code = word.charCodeAt(i);
          if (code < 65 || code > 90) continue;
          const c = String.fromCodePoint(base + (code - 65));
          if (!named('Guide ' + word.slice(0, i) + c + word.slice(i + 1))) {
            escaped.push(label + ' ' + word + '[' + i + ']');
          }
        }
      });
    });
    ok(`the three enclosed-letter families Unicode left undecomposed are read as the letters they draw`,
      escaped.length === 0, escaped.slice(0, 8).join(', '));
  }

  // AND THE OTHER HALF, WHICH IS THE ONE THAT COST. The sweep above walks the
  // characters that are NOT letters. The characters that ARE letters and still
  // decompose to a Latin one -- the fullwidth alphabet, the mathematical
  // alphabets, the parenthesized and circled letters -- were taken for symbols
  // by a hand-written list, replaced by a space, and "UNＩL" was checked as
  // "UN L" while the reader read UNIL. A hundred and twenty-seven readings of
  // the origin's name went through. Every letter that spells one of the five
  // reserved words is put in its place here, one at a time.
  const SPELLS = 'AIGOUNLDCSRÉEVRSTUDNAGRPRUCHAIÉQIP';
  const wanted = {};
  for (const ch of SPELLS) wanted[ch.toLowerCase()] = 1;
  const lookalikes = [];
  for (let cp = 0x80; cp <= 0x1ffff; cp++) {
    if (cp >= 0xd800 && cp <= 0xdfff) continue;
    const c = String.fromCodePoint(cp);
    if (!LETTER.test(c)) continue;                       // celles-ci sont au-dessus
    const d = c.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    if (d.length !== 1 || !/^[A-Za-z]$/.test(d)) continue;
    if (!wanted[d.toLowerCase()]) continue;
    if (/^[A-Za-z]$/.test(c)) continue;                  // une lettre ASCII est elle-même
    lookalikes.push([c, d]);
  }
  // Chacune remplace la lettre qu'elle imite dans le nom, une par une.
  const escaped = [];
  for (const [c, d] of lookalikes) {
    const word = 'UNIL';
    const at = word.toUpperCase().indexOf(d.toUpperCase());
    if (at < 0) continue;
    const forged = 'Guide ' + word.slice(0, at) + c + word.slice(at + 1);
    if (!named(forged)) escaped.push([c, forged]);
  }
  // AND THE LIMIT OF THAT, ASSERTED SO NOBODY TAKES IT FOR MORE. A letter glued
  // to the name makes another word -- true of "UNILa", and true of the raised
  // ordinal, which Unicode calls a letter and the eye reads as a mark. The
  // property that would separate them is the one that makes the fullwidth I read
  // as an I, so there is no telling them apart without a list of presentation
  // forms; SECURITY.md says so. What is asserted is that this is the ONLY way
  // out: the mark has to come after the whole name, never inside it.
  ok('a letter glued to the name makes another word, and the guide says so',
    !named('Guide UNIL\u00aa') && !named('Guide UNILa') &&
    named('Guide UNI\u1d38') && named('Guide UN\uff29L') &&
    /ª|ordinal/.test(read('SECURITY.md')),
    'la limite n’est pas celle qui est écrite');
  ok(`the ${lookalikes.length} letters that a compatibility decomposition turns into a letter of the name are read as that letter`,
    lookalikes.length > 100 && escaped.length === 0,
    escaped.slice(0, 8).map(([c, f]) => 'U+' + c.codePointAt(0).toString(16).toUpperCase() + ' ' + f).join(' | '));
  // And the other direction, which is the one a fix like this breaks: ordinary
  // French, with the signs a word processor puts there on its own.
  const INNOCENT = [
    'Les données sont-elles publiques, accessibles à tous, sans restriction ?',
    'Coût : 50 % du budget (cf. § 3, note ①).',
    'Température de 20 °C, surface de 12 m², prix 30 €.',
    'Voir l’annexe n° 4 et le tableau ½ ¼ ¾.'
  ];
  const wronged = INNOCENT.filter(t => named(t));
  ok('and ordinary French, degree signs and fractions and ordinals included, is left alone',
    wronged.length === 0, wronged.join(' | '));
}

// ---- T2, point 3a: the licence asks for an attribution ----------------------
// "Adapted from a tool of the University of Lausanne." in a disclaimer is
// refused, and must stay refused: a disclaimer is printed under every result and
// would read as the origin's own page. The attribution has fields of its own,
// exempt from the lock and rendered under every result, and the refusal names
// them instead of saying only "rewrite it".
//
// THE ENGINE WRITES THE NOTICE, THE ADOPTER SUPPLIES THE THREE VALUES. A CC BY
// notice names the creator, the work, the licence and the fact of adaptation,
// and each of those names the origin: leaving it to the adopter's prose meant
// either exempting that prose from the lock, or refusing the adopter the means
// of complying with the licence. So `name`, `url` and `licence` are exempt and
// hold no sentences, the engine composes the sentence around them, and `note`
// -- free prose, printed under every result -- is checked like the rest of the
// page. `note` used to be exempt too, and a copy wrote "reviewed and certified
// by the University of Lausanne" in it, one line under the engine's own
// sentence saying the source had NOT reviewed it.
t = cp(signed);
t.derivedFrom = { name: 'University of Lausanne', url: 'https://unil.ch/ai-go',
  licence: 'CC BY 4.0' };
ok('the three fields that discharge the licence name the origin and pass both checks',
  errs(t).length === 0 && AI_GO.guard(t, 'hes-example.ch').length === 0,
  errs(t).concat(AI_GO.guard(t, 'hes-example.ch')).map(i => i.path).join(','));
t = cp(signed);
t.derivedFrom = { name: 'University of Lausanne',
  note: 'Reviewed and certified by the University of Lausanne.' };
ok('a note that contradicts that notice is refused, since the notice is already drawn',
  AI_GO.guard(t, 'hes-example.ch').some(i => i.path === 'derivedFrom.note'),
  AI_GO.guard(t, 'hes-example.ch').map(i => i.path).join(','));
t = cp(signed);
t.derivedFrom = { name: 'University of Lausanne', note: 'Traduit et complete par la HEG.' };
ok('a note that says what the adopter did, and does not name the source, passes',
  errs(t).length === 0 && AI_GO.guard(t, 'hes-example.ch').length === 0,
  errs(t).concat(AI_GO.guard(t, 'hes-example.ch')).map(i => i.path).join(','));
t = cp(signed); t.disclaimer = 'Adapted from a tool of the University of Lausanne.';
ok('the same sentence elsewhere is refused, and the refusal names the field that takes it',
  AI_GO.guard(t, 'hes-example.ch').some(i => i.path === 'disclaimer' && /derivedFrom/.test(i.message)),
  AI_GO.guard(t, 'hes-example.ch').map(i => i.message).join(' | '));

// ---- T2, point 3b: a domain the standards keep for documentation ------------
// RFC 2606 reserves example.org for examples and documentation, and an
// institution that kept one in `links` to show what an entry looks like was
// refused for writing what the standard reserves that name for. What is refused
// is OFFERING a dead link to a reader, and a result's `allowed` is the only way
// a link reaches a screen.
t = cp(signed);
t.links.sample = { label: 'What an entry looks like', external: true, href: 'https://example.org/sample' };
ok('a documentation link no result offers reaches nobody, and is left alone',
  AI_GO.guard(t, 'hes-example.ch').length === 0,
  AI_GO.guard(t, 'hes-example.ch').map(i => i.path + ' ' + i.message).join(' | '));
t.results[Object.keys(t.results)[0]].allowed = ['sample'];
ok('the same entry, once a result offers it, is a dead link in front of a reader',
  AI_GO.guard(t, 'hes-example.ch').some(i => i.path === 'links.sample.href'),
  AI_GO.guard(t, 'hes-example.ch').map(i => i.path).join(','));
t = cp(signed);
t.links.r = { label: 'x', href: '/relative' };
t.links.m = { label: 'y', href: 'mailto:a@b.c' };
t.links.h = { label: 'z', href: '#' };
ok('relative, mailto and hash links accepted without crash', AI_GO.guard(t, 'hes-example.ch').length === 0);

// A signature has to be readable text, and a review date has to be a date that
// exists. `publisher.name: true` used to satisfy a truthiness test and print a
// footer reading "true, reviewed by true"; "2026-02-31" used to be accepted and
// silently rolled over to 3 March.
section(() => {
  const typed = cp(signed);
  typed.publisher.name = true; typed.review.by = true; typed.disclaimer = true;
  const paths = AI_GO.guard(typed, 'hes-example.ch').map(i => i.path);
  ok('a signature made of booleans is refused, field by field',
    ['publisher.name', 'review.by', 'disclaimer'].every(p => paths.includes(p)), paths.join(','));

  const impossible = cp(signed); impossible.review.date = '2026-02-31';
  ok('a review date that does not exist in the calendar is refused',
    AI_GO.guard(impossible, 'hes-example.ch').some(i => i.path === 'review.date'));
  const real = cp(signed); real.review.date = '2026-02-28';
  ok('a real date is still accepted', AI_GO.guard(real, 'hes-example.ch').length === 0,
    AI_GO.guard(real, 'hes-example.ch').map(i => i.path).join(','));

  const twin = cp(signed);
  twin.nodes.q1.answers = [{ value: 'x', result: 'open' }, { value: 'x', result: 'restricted' }];
  ok('two answers sharing one value are reported: the second is unreachable',
    AI_GO.structure(twin).some(i => /answers\[1\]/.test(i.path)),
    AI_GO.structure(twin).map(i => i.path).join(','));
});

// ============================================================================
// SWEEPS. Six audits found six variants of two mistakes: a lock written against
// a closed list, and a check applied to one writing of a string. Each was fixed
// where it was found, and the next audit found the next variant. What follows
// does not test a seventh variant: it ENUMERATES the variants, mechanically,
// and requires the lock to hold for every one of them. A sweep that finds
// nothing is worth its running cost only if it fails when the lock is removed,
// and each of the three below was checked that way.
// ============================================================================

// Every code point Unicode itself declares default-ignorable: invisible on
// screen, not whitespace, not a combining mark. ASKED of the runtime, never
// listed here, or this file would hold a copy of the very list it is judging
// and the two would go stale together.
const IGNORABLE = [];
section(() => {
  const re = new RegExp('\\p{Default_Ignorable_Code_Point}', 'u');
  // Block by block, then code point by code point inside the few blocks that
  // hold any: the same answer as scanning all of Unicode one character at a
  // time, and a tenth of the time, which this file has to care about.
  for (let base = 0; base <= 0x10ffff; base += 0x400) {
    const codes = [];
    for (let c = base; c < base + 0x400 && c <= 0x10ffff; c++) {
      if (c < 0xd800 || c > 0xdfff) codes.push(c);
    }
    if (!re.test(String.fromCodePoint.apply(null, codes))) continue;
    codes.forEach(c => { if (re.test(String.fromCodePoint(c))) IGNORABLE.push(c); });
  }
});
const hex = c => 'U+' + c.toString(16).toUpperCase();

console.log(`sweep 1: the ${IGNORABLE.length} invisible characters, the four normal forms and the spaces`);
section(() => {
  // The smallest tree the guard accepts: the sweep runs tens of thousands of
  // calls through it and every extra string in it is paid for on each one.
  const T = {
    id: 'sweep', version: '1.0.0', langs: ['en'], defaultLang: 'en', start: 'q1',
    publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
    review: { by: 'Legal service', date: '2026-06-01' },
    disclaimer: 'Our own text.',
    steps: [{ id: 's1', name: 'One' }], links: {},
    nodes: { q1: { type: 'single', step: 's1', title: 'A question?',
      answers: [{ value: 'yes', result: 'r' }, { value: 'no', result: 'r' }] } },
    results: { r: { level: 'info', title: 'A result' } }
  };
  ok('the sweep tree is publishable to begin with, or every sweep below is vacuous',
    AI_GO.guard(T, 'hes-example.ch').length === 0 && errs(T).length === 0,
    AI_GO.guard(T, 'hes-example.ch').map(i => i.path).join(','));
  // The same tree as the origin would publish it: on its own domain the origin
  // may name itself, and a sweep that only proved refusals would pass on an
  // engine that refuses everything.
  const H = cp(T);
  H.id = 'aigo-unil'; H.publisher = { name: 'Origin', domains: ['unil.ch'] };
  ok('and the same tree at home is publishable, so the exemption is real',
    AI_GO.guard(H, 'www.unil.ch').length === 0, AI_GO.guard(H, 'www.unil.ch').map(i => i.path).join(','));

  // Spellings of the origin. Not a wish list: the assertion below fails if a
  // reserved term is added to the policy without a spelling to sweep it with.
  const SEEDS = ['AI_GO', 'DCSR', 'UNIL',
    'Universite de Lausanne', 'Universit\u00e9 de Lausanne',
    'Universitat Lausanne', 'Universit\u00e4t Lausanne', 'University of Lausanne',
    'Universita di Losanna', 'Universit\u00e0 di Losanna',
    'Cellule strategique IA', 'Cellule strat\u00e9gique IA'];
  const uncovered = AI_GO.POLICY.reservedTerms
    .filter(re => !SEEDS.some(s => AI_GO.plain(s).some(v => re.test(v))));
  ok('every reserved term of the policy has a spelling in this sweep',
    uncovered.length === 0, uncovered.map(String).join(' | '));

  // A refusal that names the field, not any refusal: publisher.domains is
  // undeclared for the home tree and would answer for everything.
  const caught = (tree, field, value, host) => {
    const v = cp(tree);
    if (field === 'publisher.name') v.publisher.name = value; else v.review.by = value;
    return AI_GO.guard(v, host).some(i => i.path === field);
  };

  // ---- the four normal forms, the cases, and every space a keyboard produces
  const SPACERS = ['\u00a0', '\u2009', '\u202f', '\u2003', '\u2007', '\u205f', '\t', '  ', ' \u00a0 '];
  const writings = seed => {
    const out = new Set();
    for (const c of [seed, seed.toLowerCase(), seed.toUpperCase(),
                     seed.replace(/[A-Za-z]/g, (ch, i) => i % 2 ? ch.toUpperCase() : ch.toLowerCase())]) {
      for (const form of ['NFC', 'NFD', 'NFKC', 'NFKD']) {
        const v = c.normalize(form);
        out.add(v);
        if (v.indexOf(' ') >= 0) SPACERS.forEach(w => out.add(v.split(' ').join(w)));
      }
    }
    return [...out];
  };
  const ALL_WRITINGS = [].concat(...SEEDS.map(writings));
  {
    const missed = [];
    for (const w of ALL_WRITINGS) {
      for (const field of ['publisher.name', 'review.by']) {
        if (!caught(T, field, w, 'hes-example.ch')) missed.push(field + ' ' + JSON.stringify(w));
      }
    }
    ok(`${ALL_WRITINGS.length} writings of the origin name are refused in publisher.name and review.by`,
      missed.length === 0, missed.slice(0, 4).join(' | '));
    const wrong = ALL_WRITINGS.filter(w => caught(H, 'publisher.name', w, 'www.unil.ch'));
    ok('and not one of them is refused on the origin domain, where the name belongs',
      wrong.length === 0, wrong.slice(0, 4).map(w => JSON.stringify(w)).join(' | '));
  }

  // ---- every invisible character, one position, both fields, both domains
  {
    const seed = 'UNIL', cut = 2;
    const missed = [], falsePositive = [];
    for (const c of IGNORABLE) {
      const w = seed.slice(0, cut) + String.fromCodePoint(c) + seed.slice(cut);
      if (!caught(T, 'publisher.name', w, 'hes-example.ch')) missed.push('publisher.name ' + hex(c));
      else if (!caught(T, 'review.by', w, 'hes-example.ch')) missed.push('review.by ' + hex(c));
      if (caught(H, 'publisher.name', w, 'www.unil.ch')) falsePositive.push(hex(c));
    }
    ok(`the origin name broken by any of the ${IGNORABLE.length} invisible characters is still refused`,
      missed.length === 0, missed.slice(0, 6).join(' | '));
    ok('and none of them turns the origin name into a refusal on the origin domain',
      falsePositive.length === 0, falsePositive.slice(0, 6).join(' | '));
  }

  // ---- every position of every spelling, on a sample of the same set
  {
    // Drawn from the list above by stride, so the sample follows Unicode rather
    // than a hand-picked dozen: it moves when the set moves.
    const stride = Math.ceil(IGNORABLE.length / 12);
    const sample = IGNORABLE.filter((_, i) => i % stride === 0);
    const missed = [];
    let tried = 0;
    for (const seed of SEEDS) {
      for (let i = 1; i < seed.length; i++) {
        for (const c of sample) {
          tried++;
          const w = seed.slice(0, i) + String.fromCodePoint(c) + seed.slice(i);
          if (!caught(T, 'publisher.name', w, 'hes-example.ch')) missed.push(hex(c) + ' at ' + i + ' of ' + seed);
        }
      }
    }
    ok(`${tried} insertions, every position of every spelling, are all refused`,
      missed.length === 0, missed.slice(0, 6).join(' | '));
  }

  // ---- the same sweep through check.html, on the page around the questionnaire
  // The title and the standfirst are outside the tree, so guard() never sees
  // them. They went unread, then read undecoded, then read unnormalised: the
  // same lock, one writing at a time. chromeTerms is the whole scan, pure, so
  // this runs on one line of markup instead of a 90 kB file per variant.
  {
    const page = t => '<html><head><title>' + t + '</title></head><body><p>x</p></body></html>';
    const seen = t => CHECK.chromeTerms(page(t), AI_GO, 'hes-example.ch').length > 0;
    const dec = s => [...s].map(c => c.codePointAt(0) < 128 ? c : '&#' + c.codePointAt(0) + ';').join('');
    const hx = s => [...s].map(c => c.codePointAt(0) < 128 ? c : '&#x' + c.codePointAt(0).toString(16) + ';').join('');
    ok('check.html says nothing about a page that does not name the origin',
      !seen('Which tools may I use for my data?'));
    const missed = [];
    for (const w of ALL_WRITINGS) {
      for (const [how, enc] of [['as written', String], ['decimal entities', dec], ['hex entities', hx]]) {
        if (!seen(enc(w))) missed.push(how + ' ' + JSON.stringify(w));
      }
    }
    ok(`${ALL_WRITINGS.length * 3} writings of the origin name in a page title are reported`,
      missed.length === 0, missed.slice(0, 4).join(' | '));
    const invisible = [];
    for (const c of IGNORABLE) {
      const w = 'UN' + String.fromCodePoint(c) + 'IL';
      if (!seen(w)) invisible.push('literal ' + hex(c));
      else if (!seen(dec(w))) invisible.push('decimal ' + hex(c));
      else if (!seen(hx(w))) invisible.push('hex ' + hex(c));
    }
    ok(`and so are the ${IGNORABLE.length} invisible characters, written literally or as an entity`,
      invisible.length === 0, invisible.slice(0, 6).join(' | '));
    // A named entity is the third way to write the same character, and the set
    // that matters is closed: the names that paint an invisible, and the names
    // that paint a space. The first hide INSIDE a word, the second stand where
    // a space belongs; a space inside UNIL is a space a reader sees, and it is
    // right that no lock fires on it.
    const HIDDEN = ['shy', 'zwnj', 'zwj', 'lrm', 'rlm', 'ZeroWidthSpace', 'NoBreak',
      'InvisibleTimes', 'InvisibleComma'];
    const SPACED = ['nbsp', 'ensp', 'emsp', 'emsp13', 'emsp14', 'numsp', 'puncsp', 'thinsp', 'hairsp'];
    const named = HIDDEN.filter(n => !seen('UN&' + n + ';IL') || !seen('UN&' + n + 'IL'))
      .concat(SPACED.filter(n => !seen('Universite&' + n + ';de Lausanne') ||
                                 !seen('Universite&' + n + 'de Lausanne')));
    ok(`the ${HIDDEN.length + SPACED.length} named entities that hide a break in a name are decoded, semicolon or not`,
      named.length === 0, named.join(', '));
    ok('and a space a reader can actually see is not read as a hidden one',
      !seen('UN&nbsp;IL') && !seen('UN IL'));
    ok('and the accented letters are decoded by rule, not from a list of eight',
      ['eacute', 'egrave', 'ecirc', 'euml', 'Eacute', 'etilde'].every(n =>
        seen('Universit&' + n + '; de Lausanne')) && seen('AI&lowbar;GO') && seen('AI&#95;GO'));
    // A browser makes the semicolon optional and so does this, in both bases.
    ok('a numeric entity without its semicolon is decoded too',
      seen('Universit&#xE9 de Lausanne') && seen('Universit&#233 de Lausanne'));
    // WITH NO DOMAIN TYPED, which is the state this page is in when a legal
    // officer opens it for the only time. The finding used to be demoted to a
    // warning here, and warnings were counted and drawn nowhere.
    ok('with no domain typed the finding is blocking, not demoted to a warning',
      CHECK.chromeTerms(page('Universite de Lausanne'), AI_GO, '').length === 1 &&
      CHECK.chromeTerms(page('Universite de Lausanne'), AI_GO, '')[0].level === 'error',
      JSON.stringify(CHECK.chromeTerms(page('Universite de Lausanne'), AI_GO, '').map(i => i.level)));
    // With no domain we cannot ask the page where it is served, so we ask the
    // file whose it is: the origin's own content may name the origin.
    ok('and the origin\'s own file, with no domain typed, is still silent',
      CHECK.chromeTerms(page('UNIL'), AI_GO, '', { publisher: { domains: ['www.unil.ch'] } }).length === 0);
    ok('while a copy that declares its own domain is not',
      CHECK.chromeTerms(page('UNIL'), AI_GO, '', { publisher: { domains: ['hes-example.ch'] } }).length === 1);
    ok('check.html says nothing about the origin naming itself on its own domain',
      CHECK.chromeTerms(page('UNIL'), AI_GO, 'www.unil.ch').length === 0);
  }
});

console.log('sweep 2: every kind of value every displayed field can hold');
section(() => {
  // An empty title passed, then { en: null } passed, then a duplicate box named
  // __proto__ passed. Three audits, three cells of one table. Here the table is
  // filled in: every field the engine reads and shows, crossed with every kind
  // of value a hand-written file can put in it.
  const T = {
    id: 'sweep2', version: '1.0.0', langs: ['en'], defaultLang: 'en', start: 'q1',
    publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
    review: { by: 'Legal service', date: '2026-06-01' },
    disclaimer: 'Our own text.',
    steps: [{ id: 's1', name: 'One' }],
    links: { g: { label: 'Guide', href: 'https://hes-example.ch/g' } },
    nodes: {
      q1: { type: 'single', step: 's1', title: 'A question?', help: 'Some help.',
        answers: [{ value: 'yes', label: 'Yes', detail: 'A detail', to: 'q2' },
                  { value: 'no', result: 'r' }] },
      q2: { type: 'multi', step: 's1', polarity: 'direct', title: 'Which ones?',
        options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
        next: { ifAnyResult: 'r', elseResult: 'r' } }
    },
    results: { r: { level: 'info', title: 'A result', summary: 'A summary.',
      solution: { label: 'plain', text: 'A solution.' }, allowed: ['g'],
      forbidden: ['Not this.'], alert: { level: 'warning', text: 'A note.' } } }
  };
  ok('the sweep tree is sound and publishable to begin with',
    errs(T).length === 0 && AI_GO.guard(T, 'hes-example.ch').length === 0,
    errs(T).map(e => e.path).join(',') + ' / ' + AI_GO.guard(T, 'hes-example.ch').map(i => i.path).join(','));

  // NOTHING TO SHOW versus NOT TEXT. A field the tree may leave out is allowed
  // to hold the first and never the second: a number, a boolean, or an object
  // that answers for a language it does not carry all render as silence in one
  // language and text in the other, which is the fallback this engine forbids.
  const EMPTY = [['null', null], ['undefined', undefined], ['an empty string', ''],
    ['a string of spaces', '   '], ['a string of invisibles', '\u200b\u00ad\u2063'],
    ['an empty array', []]];
  const NOT_TEXT = [['a number', 7], ['a boolean', true], ['an object with no language', {}],
    ['an object missing the declared language', { de: 'x' }],
    ['an object whose declared language is null', { en: null }],
    ['an object whose declared language is a number', { en: 7 }],
    ['an object whose only key is inherited', { toString: 'x' }]];

  // Every field the engine reads and puts on screen, with how it is written.
  const set = (t, path, v) => {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let o = t;
    for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = v;
  };
  const REQUIRED = ['nodes.q1.title', 'nodes.q2.title', 'nodes.q2.options[0].label',
    'results.r.title', 'links.g.label', 'steps[0].name'];
  const OPTIONAL = ['nodes.q1.help', 'nodes.q1.answers[0].label', 'nodes.q1.answers[0].detail',
    'results.r.summary', 'results.r.solution.text', 'results.r.alert.text', 'results.r.forbidden[0]'];
  const SIGNED = ['publisher.name', 'review.by', 'disclaimer'];

  const say = (path, kind, v) => path + ' = ' + kind;
  const report = (t, path) => {
    const list = SIGNED.indexOf(path) >= 0 ? AI_GO.guard(t, 'hes-example.ch') : errs(t);
    return list.some(i => i.path === path || i.path.indexOf(path + '.') === 0 ||
      i.path.indexOf(path + '[') === 0);
  };
  let crashes = [], missed = [], falseAlarm = [], tried = 0;
  for (const [group, list] of [['required', REQUIRED], ['optional', OPTIONAL], ['signed', SIGNED]]) {
    for (const path of list) {
      for (const [kind, value] of EMPTY.concat(NOT_TEXT)) {
        tried++;
        const t = cp(T);
        try { set(t, path, value); } catch (e) { crashes.push(say(path, kind) + ': ' + e.message); continue; }
        let refused = null;
        try { refused = report(t, path); AI_GO.structure(t); AI_GO.guard(t, 'x'); AI_GO.fingerprint(t); CHECK.paths(t); }
        catch (e) { crashes.push(say(path, kind) + ': ' + e.message); continue; }
        // A field the tree may leave out may hold "nothing to show"; every other
        // field, and every value that is not text, must be refused.
        const mustRefuse = group !== 'optional' || NOT_TEXT.some(p => p[0] === kind);
        if (mustRefuse && !refused) missed.push(say(path, kind));
        if (!mustRefuse && refused) falseAlarm.push(say(path, kind));
      }
    }
  }
  ok(`${tried} field/value pairs: structure, guard, paths and fingerprint never throw`,
    crashes.length === 0, crashes.slice(0, 4).join(' | '));
  ok('every field the reader must see refuses all 13 kinds of empty and non-text value',
    missed.length === 0, missed.slice(0, 6).join(' | '));
  ok('and a field the tree may leave out still accepts the six ways of saying nothing',
    falseAlarm.length === 0, falseAlarm.slice(0, 6).join(' | '));

  // ---- the names a plain object answers for, as identifiers and as values
  {
    // A duplicate box valued __proto__ was never seen as a duplicate: the object
    // holding the values already answered for it. Every place the engine keys an
    // object by a name out of the file is swept here, in both directions: a name
    // the file OWNS is an ordinary identifier, a name it only inherits is not
    // there at all.
    const SPECIAL = ['__proto__', 'constructor', 'prototype', 'hasOwnProperty', 'toString'];
    const put = (o, k, v) => {
      Object.defineProperty(o, k, { value: v, enumerable: true, writable: true, configurable: true });
      return o;
    };
    const single = (to, result) => ({ type: 'single', step: 's1', title: 'Q?',
      answers: [{ value: 'yes', to: to, result: result }, { value: 'no', result: 'r' }] });
    const owned = [], inherited = [], broke = [];
    for (const S of SPECIAL) {
      const cases = [];
      // A node, a result, a link, a step and a language, each named S and each
      // actually declared: ordinary identifiers, and the tree must be sound.
      cases.push(['a node named ' + S, () => {
        const t = cp(T); t.nodes = put({}, S, single(undefined, 'r')); t.start = S; return t;
      }, true]);
      cases.push(['a result named ' + S, () => {
        const t = cp(T); put(t.results, S, { level: 'info', title: 'R' });
        t.nodes.q1.answers[0] = { value: 'yes', result: S }; delete t.nodes.q2; t.nodes.q1.answers[1].result = S;
        return t;
      }, true]);
      cases.push(['a link named ' + S, () => {
        const t = cp(T); put(t.links, S, { label: 'L', href: 'https://hes-example.ch/l' });
        t.results.r.allowed = [S]; return t;
      }, true]);
      cases.push(['a step named ' + S, () => {
        const t = cp(T); t.steps = [{ id: S, name: 'One' }];
        Object.keys(t.nodes).forEach(k => { t.nodes[k].step = S; }); return t;
      }, true]);
      cases.push(['an answer valued ' + S, () => {
        const t = cp(T); t.nodes.q1.answers[0].value = S; return t;
      }, true]);
      cases.push(['a box valued ' + S, () => {
        const t = cp(T); t.nodes.q2.options[0].value = S; return t;
      }, true]);
      cases.push(['a language named ' + S, () => {
        const t = cp(T); t.langs = [S]; t.defaultLang = S;
        const w = v => put({}, S, v);
        t.disclaimer = w('D'); t.steps[0].name = w('One'); t.links.g.label = w('Guide');
        Object.values(t.nodes).forEach(n => {
          n.title = w(n.title); if (n.help) n.help = w(n.help);
          (n.answers || []).forEach(a => { if (a.label) a.label = w(a.label); if (a.detail) a.detail = w(a.detail); });
          (n.options || []).forEach(o => { o.label = w(o.label); });
        });
        Object.values(t.results).forEach(r => {
          r.title = w(r.title); r.summary = w(r.summary); r.solution.text = w(r.solution.text);
          r.alert.text = w(r.alert.text); r.forbidden = r.forbidden.map(w);
        });
        return t;
      }, true]);
      // The same names where the file declares NOTHING: inherited, therefore
      // absent, and every one of these has to be refused.
      cases.push(['a start pointing at ' + S, () => { const t = cp(T); t.start = S; return t; }, false, 'start']);
      cases.push(['an answer going to ' + S, () => {
        const t = cp(T); t.nodes.q1.answers[0].to = S; return t;
      }, false, 'nodes.q1.answers[0]']);
      cases.push(['an answer resulting in ' + S, () => {
        const t = cp(T); delete t.nodes.q1.answers[0].to; t.nodes.q1.answers[0].result = S; return t;
      }, false, 'nodes.q1.answers[0]']);
      cases.push(['a result allowing the link ' + S, () => {
        const t = cp(T); t.results.r.allowed = [S]; return t;
      }, false, 'results.r.allowed']);
      cases.push(['a question in the step ' + S, () => {
        const t = cp(T); t.nodes.q1.step = S; return t;
      }, false, 'nodes.q1.step']);
      cases.push(['a declared language ' + S + ' nothing supplies', () => {
        // On a tree whose texts are objects: a bare string is deliberately
        // tolerated here and reported by check.html, so it proves nothing.
        const t = bilingual(T, 'de'); t.langs = ['en', 'de', S]; return t;
        // Read on the HELP and not on the title: a required field is caught by
        // the blankness test whatever the translation check says, and would hide
        // whether that check reads an owned key or an inherited one.
      }, false, 'nodes.q1.help']);
      cases.push(['two boxes both valued ' + S, () => {
        const t = cp(T); t.nodes.q2.options[0].value = S; t.nodes.q2.options[1].value = S; return t;
      }, false, 'nodes.q2.options[1]']);
      cases.push(['two answers both valued ' + S, () => {
        const t = cp(T); t.nodes.q1.answers[0].value = S; t.nodes.q1.answers[1].value = S; return t;
      }, false, 'nodes.q1.answers[1]']);

      for (const [label, make, sound, where] of cases) {
        let t = null, found = null;
        try {
          t = make();
          found = errs(t).map(e => e.path);
          AI_GO.guard(t, 'hes-example.ch'); AI_GO.fingerprint(t); CHECK.paths(t); CHECK.extras(t, CHECK.paths(t));
        } catch (e) { broke.push(label + ': ' + e.message); continue; }
        if (sound && found.length) owned.push(label + ' -> ' + found.join(','));
        if (sound && CHECK.paths(t).length < 2) owned.push(label + ' -> ' + CHECK.paths(t).length + ' path(s)');
        if (!sound && !found.some(p => p === where)) inherited.push(label + ' -> ' + (found.join(',') || 'nothing'));
      }
    }
    ok(`the ${SPECIAL.length} names a plain object answers for never crash any check`,
      broke.length === 0, broke.slice(0, 4).join(' | '));
    ok('a node, result, link, step, answer, box or language the file OWNS by such a name is ordinary',
      owned.length === 0, owned.slice(0, 4).join(' | '));
    ok('and the same name merely INHERITED is refused, wherever the engine keys on it',
      inherited.length === 0, inherited.slice(0, 4).join(' | '));
  }
});

// ===========================================================================
// SWEEP 4: THE VALUES A CHECK WALKS PAST AND A BROWSER PRINTS.
// Sweep 2 crossed every displayed field with every kind of value a hand-written
// file can hold. It missed the values a file can hold that are not written by
// hand: a String OBJECT, whose typeof is "object" and whose enumeration yields
// its characters one at a time, and a property defined with defineProperty,
// which Object.keys does not list and the renderer reads by name all the same.
// Both used to cross structure() and guard() untouched, and one of them printed
// the origin's name on the page while doing it.
// ===========================================================================
console.log('sweep 4: a String object, a hidden property, a getter');
section(() => {
  const HOST = 'hes-example.ch';
  const NAME = 'Universite de Lausanne';
  const T = () => ({
    id: 'sweep4', version: '1.0.0', langs: ['en'], defaultLang: 'en', start: 'q1',
    publisher: { name: 'Example UAS', domains: [HOST] },
    review: { by: 'Legal service', date: '2026-06-01' },
    disclaimer: 'Our own text.',
    steps: [{ id: 's1', name: 'One' }],
    links: { g: { label: 'Our guide', href: 'https://hes-example.ch/g' } },
    nodes: {
      q1: { type: 'single', step: 's1', title: 'A question?', help: 'Some help.',
        answers: [{ value: 'yes', label: 'Yes', detail: 'A detail', to: 'q2' },
                  { value: 'no', result: 'r' }] },
      q2: { type: 'multi', step: 's1', polarity: 'direct', title: 'Which ones?',
        options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
        next: { ifAnyResult: 'r', elseResult: 'r' } }
    },
    results: { r: { level: 'info', title: 'A result', summary: 'A summary.',
      solution: { label: 'plain', text: 'A solution.' }, allowed: ['g'],
      forbidden: ['Not this.'], alert: { level: 'warning', text: 'A note.' } } }
  });
  ok('the sweep tree is sound and publishable to begin with',
    errs(T()).length === 0 && AI_GO.guard(T(), HOST).length === 0,
    errs(T()).map(e => e.path).join(',') + ' / ' + AI_GO.guard(T(), HOST).map(i => i.path).join(','));

  // Every field a reader sees, and the three ways of putting the origin's name
  // in one of them without writing a string there.
  const set = (t, path, v) => {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let o = t;
    for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = v;
  };
  const SHOWN = ['nodes.q1.title', 'nodes.q1.help', 'nodes.q1.answers[0].label',
    'nodes.q1.answers[0].detail', 'nodes.q2.title', 'nodes.q2.options[0].label',
    'results.r.title', 'results.r.summary', 'results.r.solution.text',
    'results.r.solution.label', 'results.r.alert.text', 'results.r.forbidden[0]',
    'links.g.label', 'steps[0].name', 'disclaimer'];
  const WRAPPED = [
    ['a String object', () => new String(NAME)],
    ['a hidden property', () => { const o = {}; Object.defineProperty(o, 'en', { enumerable: false, value: NAME }); return o; }],
    ['a getter', () => { const o = {}; Object.defineProperty(o, 'en', { enumerable: true, get() { return NAME; } }); return o; }],
    ['a hidden getter', () => { const o = {}; Object.defineProperty(o, 'en', { enumerable: false, get() { return NAME; } }); return o; }]
  ];
  const blind = [], crashes = [];
  for (const path of SHOWN) {
    for (const [label, make] of WRAPPED) {
      const t = T();
      try { set(t, path, make()); } catch (e) { crashes.push(path + ' = ' + label + ': ' + e.message); continue; }
      let s = null, g = null;
      try { s = errs(t); g = AI_GO.guard(t, HOST); AI_GO.fingerprint(t); CHECK.paths(t); }
      catch (e) { crashes.push(path + ' = ' + label + ': ' + e.message); continue; }
      // Refused as a value, or caught as the origin's name: either is enough,
      // and nothing at all is the hole this sweep exists for.
      if (!s.length && !g.length) blind.push(path + ' = ' + label);
    }
  }
  ok(`${SHOWN.length * WRAPPED.length} wrapped values: structure, guard, paths and fingerprint never throw`,
    crashes.length === 0, crashes.slice(0, 4).join(' | '));
  ok('and not one of them reaches a reader unseen by both checks',
    blind.length === 0, blind.slice(0, 6).join(' | '));

  // The corollary: a language key holding an OBJECT was counted as translated,
  // and an object under a language key draws nothing at all.
  const langObj = v => { const t = T(); t.langs = ['en', 'de']; t.disclaimer = { en: 'D', de: 'D' };
    t.nodes.q1.help = { en: 'Some help.', de: v }; return t; };
  ok('an object under a language key is not a translation',
    errs(langObj({})).some(e => e.path === 'nodes.q1.help') &&
    errs(langObj({ nope: 1 })).some(e => e.path === 'nodes.q1.help'),
    errs(langObj({ nope: 1 })).map(e => e.path).join(','));
  ok('and a bullet list under a language key still is one',
    !errs(langObj({ items: ['one', 'two'] })).some(e => e.path === 'nodes.q1.help'),
    errs(langObj({ items: ['one'] })).map(e => e.path + ' ' + e.message).join(' | '));
  ok('a solution or an alert that is not an object is reported where the words are missing',
    (() => { const t = T(); t.results.r.solution = new String('x');
             return errs(t).some(e => e.path === 'results.r.solution.text'); })() &&
    (() => { const t = T(); t.results.r.alert = new String('x');
             return errs(t).some(e => e.path === 'results.r.alert.text'); })());

  // structure() and guard() are the public API, and a tree can hold code.
  const hostile = [
    ['a getter that throws on a title', () => { const t = T();
      Object.defineProperty(t.nodes.q1, 'title', { get() { throw new Error('boom'); } }); return t; }],
    ['a getter that throws on the tree', () => { const t = T();
      Object.defineProperty(t, 'nodes', { get() { throw new Error('boom'); } }); return t; }],
    ['a self-referential tree', () => { const t = T(); t.self = t; return t; }],
    ['a String object for a whole tree', () => new String('x')]
  ];
  const threw = [];
  for (const [label, make] of hostile) {
    let t = null;
    try { t = make(); } catch (e) { threw.push(label + ' (build): ' + e.message); continue; }
    try { AI_GO.structure(t); } catch (e) { threw.push('structure ' + label + ': ' + e.message); }
    try { AI_GO.guard(t, HOST); } catch (e) { threw.push('guard ' + label + ': ' + e.message); }
    try { AI_GO.fingerprint(t); } catch (e) { threw.push('fingerprint ' + label + ': ' + e.message); }
  }
  ok(`neither check throws on ${hostile.length} trees that hold code instead of text`,
    threw.length === 0, threw.slice(0, 4).join(' | '));
  ok('and a crash inside one of them is reported as a point to fix, not raised',
    (() => {
      const t = T();
      Object.defineProperty(t, 'nodes', { get() { throw new Error('boom'); } });
      // Caught here too: an assertion that raises kills the harness instead of
      // failing it, and the whole point of this one is an engine that raises.
      try { return AI_GO.structure(t).some(i => /boom/.test(i.message)); } catch (e) { return false; }
    })());
});

// ===========================================================================
// SWEEP 5: THE LETTERS A READER CANNOT TELL APART.
// The lock reads plain(), which folds accents, invisibles and every kind of
// space. It did not fold the Cyrillic and Greek letters that share a shape with
// a Latin one, so one keystroke turned UNIL into a string the lock had never
// heard of and a screen no reader could tell from the original.
// ===========================================================================
console.log('sweep 5: the Cyrillic and Greek letters that wear a Latin face');
section(() => {
  const HOST = 'hes-example.ch';
  const T = {
    id: 'sweep5', version: '1.0.0', langs: ['en'], defaultLang: 'en', start: 'q1',
    publisher: { name: 'Example UAS', domains: [HOST] },
    review: { by: 'Legal service', date: '2026-06-01' },
    disclaimer: 'Our own text.',
    steps: [{ id: 's1', name: 'One' }], links: {},
    nodes: { q1: { type: 'single', step: 's1', title: 'A question?',
      answers: [{ value: 'yes', result: 'r' }, { value: 'no', result: 'r' }] } },
    results: { r: { level: 'info', title: 'A result' } }
  };
  ok('the sweep tree is publishable to begin with, or this sweep is vacuous',
    AI_GO.guard(T, HOST).length === 0 && errs(T).length === 0);
  const caught = (value, host) => {
    const v = cp(T); v.publisher.name = value;
    return AI_GO.guard(v, host).some(i => i.path === 'publisher.name');
  };
  // Every seed of sweep 1, with every Latin letter replaced, one at a time, by
  // each of its twins. Written as code points, never as characters: two of the
  // strings below are indistinguishable on screen from the one above them.
  const SEEDS = ['AI_GO', 'DCSR', 'UNIL', 'Universite de Lausanne',
    'University of Lausanne', 'Cellule strategique IA'];
  const TWINS = {
    // Added when the engine's table grew: the sweep below bounds the fold from
    // above, and it is what told this file it had fallen behind.
    D: ['\u0500'], F: ['\u03dc'], G: ['\u050c'], Q: ['\u051a'],
    V: ['\u0474', '\u0476'], W: ['\u051c'],
    A: ['\u0410', '\u0391'], B: ['\u0412', '\u0392'], C: ['\u0421', '\u03f9'],
    E: ['\u0415', '\u0395'], H: ['\u041d', '\u0397'], I: ['\u0406', '\u04c0', '\u0399'],
    J: ['\u0408'], K: ['\u041a', '\u039a'], M: ['\u041c', '\u039c'], N: ['\u039d'],
    O: ['\u041e', '\u039f'], P: ['\u0420', '\u03a1'], S: ['\u0405'], T: ['\u0422', '\u03a4'],
    X: ['\u0425', '\u03a7'], Y: ['\u0423', '\u04ae', '\u03a5'], Z: ['\u0396'],
    a: ['\u0430', '\u03b1'], c: ['\u0441', '\u03f2'], d: ['\u0501'], e: ['\u0435'],
    h: ['\u04bb'], i: ['\u0456', '\u03b9'], j: ['\u0458', '\u03f3'], k: ['\u03ba'],
    l: ['\u04cf'], n: ['\u03b7'], o: ['\u043e', '\u03bf'], p: ['\u0440', '\u03c1'],
    q: ['\u051b'], s: ['\u0455'], t: ['\u03c4'], u: ['\u03c5'], v: ['\u0475', '\u03bd'],
    w: ['\u051d', '\u0461'], x: ['\u0445', '\u03c7'], y: ['\u0443', '\u04af', '\u03b3']
  };
  const missed = [];
  let tried = 0;
  for (const seed of SEEDS) {
    for (let i = 0; i < seed.length; i++) {
      for (const twin of TWINS[seed[i]] || []) {
        tried++;
        const w = seed.slice(0, i) + twin + seed.slice(i + 1);
        if (!caught(w, HOST)) missed.push(seed + ' at ' + i + ' -> U+' + twin.codePointAt(0).toString(16).toUpperCase());
      }
    }
  }
  ok(`${tried} one-letter substitutions from another script are still refused`,
    missed.length === 0, missed.slice(0, 6).join(' | '));
  // Honest about what this table is: a RESTATEMENT of the engine's, not a second
  // source. It catches a twin dropped from the engine, and nothing that both
  // sides would get wrong together. What it cannot do, the sweep below does: it
  // bounds the fold from above, where a table can only bound it from below.
  const unfolded = [];
  let entries = 0;
  Object.keys(TWINS).forEach(latin => TWINS[latin].forEach(twin => {
    entries++;
    if (!AI_GO.plain('x' + twin + 'x').some(v => v === 'x' + latin + 'x')) {
      unfolded.push('U+' + twin.codePointAt(0).toString(16).toUpperCase() + ' should read as ' + latin);
    }
  }));
  // A table says what MUST fold. Nothing said what must NOT: an entry mapping the
  // digit 1 onto the letter l could be added to the engine and no assertion moved.
  // So: every code point the fold turns into a plain Latin letter has to be one
  // this file asked for, or one its own NFKD already produced.
  const invented = [];
  for (let cp = 0x80; cp < 0x2500; cp++) {
    const ch = String.fromCodePoint(cp);
    const folded = AI_GO.plain(ch)[0];
    if (!/^[A-Za-z]$/.test(folded)) continue;
    // Two steps, in the order the engine takes them: NFKD and its accents first,
    // then the table. A Greek alpha with a tonos reaches the table as a bare alpha.
    const bare = ch.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    if (bare === folded) continue;
    if ((TWINS[folded] || []).indexOf(ch) >= 0 || (TWINS[folded] || []).indexOf(bare) >= 0) continue;
    invented.push('U+' + cp.toString(16).toUpperCase() + ' reads as ' + folded);
  }
  ok('the fold turns no other code point into a Latin letter, so it cannot invent a match',
    invented.length === 0, invented.slice(0, 6).join(', '));
  ok(`the ${entries} letters this harness asks for all read as their Latin twin`,
    unfolded.length === 0, unfolded.slice(0, 6).join(' | '));
  // The fold is for the comparison only, and it is not a rewriting of the world:
  // a word that merely contains a Greek letter is not the origin's name.
  ok('the fold does not invent a match where there is none',
    !caught('\u03a3\u03c7\u03bf\u03bb\u03ae', HOST) && !caught('Haute ecole de Lausanne', HOST));
  ok('and the origin may still name itself, however it is spelled, on its own domain',
    (() => { const H = cp(T); H.id = 'aigo-unil';
             H.publisher = { name: 'UN\u0406L', domains: ['unil.ch'] };
             return AI_GO.guard(H, 'www.unil.ch').length === 0; })());
  // plain() is exported and check.html reads the page chrome with it, so the
  // fold reaches the title and the standfirst too.
  ok('check.html reads a substituted name in the page around the questionnaire',
    CHECK.chromeTerms('<html><head><title>UN\u0406L</title></head><body><p>x</p></body></html>',
      AI_GO, 'hes-example.ch').length > 0);
});

console.log('messages: a refusal names the string it found');
section(() => {
  const HOST = 'hes-example.ch';
  const T = cp(signed);
  const said = (mut) => { const t = cp(T); mut(t); return AI_GO.guard(t, HOST).map(i => i.message); };
  // Three texts with nothing in common used to produce one sentence, and it
  // named the origin instead of the words that were actually in the file.
  const first = Object.keys(T.results)[0];
  // The tree declares two languages, so a text set in one only is a missing
  // translation, and the refusal that comes back is that one, not this one.
  const inBoth = v => { const o = {}; (T.langs || ['en']).forEach(l => { o[l] = v; }); return o; };
  // The refusal follows the tree's language, and this tree is French by default,
  // so the sentence is recognised by what the engine ships, not by one wording.
  const REWRITE = Object.keys(AI_GO.UI)
    .map(l => AI_GO.UI[l].msg && AI_GO.UI[l].msg.reservedTerm).filter(Boolean)
    .map(t => t.split('{')[0]);
  const term = s => said(t => { t.results[first].summary = inBoth(s); })
    .filter(m => REWRITE.some(r => m.indexOf(r) === 0));
  ok('a reserved term is named as it stands in the file, not as the policy names itself',
    term('See the DCSR for details').some(m => m.includes('DCSR')) &&
    term('Built with AI_GO').some(m => m.includes('AI_GO')) &&
    !term('See the DCSR for details').some(m => m.includes('AI_GO')),
    term('See the DCSR for details').join(' | '));
  ok('a reserved identifier names the prefix that reserved it',
    said(t => { t.id = 'aigo-unil-copy'; }).some(m => m.includes('aigo-unil')));
  ok('a reserved link names the host or the prefix that matched',
    said(t => { t.links[Object.keys(t.links)[0]].href = 'https://wp.unil.ch/x'; })
      .some(m => m.includes('unil.ch')) &&
    said(t => { t.links[Object.keys(t.links)[0]].href = 'https://padlet.com/AI_research/x'; })
      .some(m => m.includes('padlet.com/ai_research')));
  // The variables have to reach both label sets, or a French file prints a brace.
  ['reservedId', 'reservedTerm', 'reservedLink'].forEach(k => {
    ok(`${k} names both the term and the origin, in English and in French`,
      ['{term}', '{origin}'].every(v => AI_GO.UI.en.msg[k].includes(v) && AI_GO.UI.fr.msg[k].includes(v)));
  });
});

console.log('check.html: it certifies the object the page mounts');
section(() => {
  const CB = at('AI_GO-CONTENT-BEGIN'), CE = at('AI_GO-CONTENT-END');
  const REAL = CHECK.contentBlock(html);
  // The delivered file with `src` as its content block, marker lines untouched:
  // the same paste the update procedure documents.
  const page = src => html.slice(0, CB) + 'AI_GO-CONTENT-BEGIN\n*/\n' + src + '\n/*\n' + html.slice(CE);
  const DECOY = 'var REVIEWED = { id: "reviewed", langs: ["en"], defaultLang: "en", start: "z",\n' +
    '  publisher: { name: "Nobody", domains: ["x.example"] }, review: { by: "Nobody", date: "2026-01-01" },\n' +
    '  disclaimer: "D", steps: [{ id: "s", name: "S" }], links: {},\n' +
    '  nodes: { z: { type: "single", step: "s", title: "Z?", answers: [{ value: "y", result: "r" }, { value: "n", result: "r" }] } },\n' +
    '  results: { r: { level: "info", title: "R" } } };\n';
  const loaded = t => CHECK.loadContent(t);
  ok('the delivered file resolves to the variable its container names, and to that object',
    loaded(html).name === 'AI_GO_CONTENT' &&
    AI_GO.fingerprint(loaded(html).value) === AI_GO.fingerprint(starter),
    String(loaded(html).name));
  // A second tree declared FIRST used to be the one enumerated, fingerprinted
  // and declared publishable, while the page went on mounting the other.
  const two = loaded(page(DECOY + REAL));
  ok('a second questionnaire declared before it changes nothing',
    !two.missing && !two.error && AI_GO.fingerprint(two.value) === AI_GO.fingerprint(starter),
    two.missing ? 'refused' : (two.value && two.value.id));
  const aux = loaded(page('var SETTINGS = { theme: "dark" };\n' + REAL));
  ok('and neither does an auxiliary object declared before it',
    !aux.missing && !aux.error && AI_GO.fingerprint(aux.value) === AI_GO.fingerprint(starter),
    aux.missing ? 'refused' : (aux.value && aux.value.id));
  // What it refuses instead of guessing. A top-level let or const is not a
  // property of window, so the engine would find nothing to mount.
  const refuses = (label, text, needle) => {
    const r = loaded(text);
    ok('check.html refuses ' + label, !!r.missing && String(r.hint || '').includes(needle),
      r.missing ? String(r.hint) : 'accepted ' + (r.value && r.value.id));
  };
  refuses('a tree the file declares with let', page(REAL.replace('var AI_GO_CONTENT', 'let AI_GO_CONTENT')), 'window');
  refuses('a tree the file declares with const', page(REAL.replace('var AI_GO_CONTENT', 'const AI_GO_CONTENT')), 'window');
  refuses('a container naming a variable nothing declares',
    page(REAL).replace('data-ai-go="AI_GO_CONTENT"', 'data-ai-go="ABSENT"'), 'ABSENT');
  refuses('a container whose name is not an identifier',
    page(REAL).replace('data-ai-go="AI_GO_CONTENT"', 'data-ai-go="2 + 2"'), 'not a variable name');
  refuses('a file with no container at all',
    page(REAL).replace(' data-ai-go="AI_GO_CONTENT"', ''), 'No container');
  refuses('a file whose containers name two different variables',
    page('var OTHER = { id: "other" };\n' + REAL)
      .replace('data-ai-go="AI_GO_CONTENT"', 'data-ai-go="AI_GO_CONTENT"></div><div data-ai-go="OTHER"'),
    'two different variables');
  refuses('a container naming something that is not a questionnaire',
    page('var AI_GO_CONTENT = 42;'), 'not an object');
  ok('two containers naming the SAME variable are not an ambiguity',
    !loaded(page(REAL).replace('data-ai-go="AI_GO_CONTENT"',
      'data-ai-go="AI_GO_CONTENT"></div><div data-ai-go="AI_GO_CONTENT"')).missing);
  ok('and the page itself declares exactly one container',
    typeof CHECK.mountNames === 'function' &&
    JSON.stringify(CHECK.mountNames(html)) === '["AI_GO_CONTENT"]',
    typeof CHECK.mountNames === 'function' ? JSON.stringify(CHECK.mountNames(html)) : 'no reader');
});


console.log('check.html: it judges the FILE, not the block between two markers');
section(() => {
  // A whole file in miniature: a container, a content script, and whatever else
  // the case needs. Independent of the questionnaire this repository ships, so
  // these run on an institution's own file too.
  const mini = (scripts, attr) =>
    '<!doctype html><html lang="en"><head><title>T</title></head><body>\n' +
    '<h1>H</h1>\n<div data-ai-go=' + (attr || '"C"') + '></div>\n' +
    scripts.map(s => '<' + 'script>' + s + '</' + 'script>').join('\n') + '\n</body></html>\n';
  const TREE = 'var C = { id: "t", langs: ["en"], defaultLang: "en", start: "q1",' +
    ' publisher: { name: "N", domains: ["x.example"] }, review: { by: "R", date: "2026-01-01" },' +
    ' disclaimer: "D", steps: [{ id: "s", name: "S" }], links: {},' +
    ' nodes: { q1: { type: "single", step: "s", title: "Q1?", answers: [{ value: "y", to: "q2" }, { value: "n", result: "r" }] },' +
    ' q2: { type: "single", step: "s", title: "Q2?", answers: [{ value: "y", result: "r" }, { value: "n", result: "r" }] } },' +
    ' results: { r: { level: "info", title: "R" } } };';
  const load = (scripts, attr) => CHECK.loadContent(mini(scripts, attr));
  // D1. The validator judged the block; the browser runs the file. One line of
  // script after the content block, rewriting the target of one answer, took a
  // question out of the served questionnaire while the receipt went on
  // certifying the paths and the fingerprint of a tree nobody would be shown.
  ok('a script placed after the content is run, so the receipt counts what the page serves',
    CHECK.paths(load([TREE]).value).length === 3 &&
    CHECK.paths(load([TREE, 'C.nodes.q1.answers[0].to = undefined; C.nodes.q1.answers[0].result = "r";']).value).length === 2,
    String(CHECK.paths(load([TREE, 'C.nodes.q1.answers[0].to = undefined; C.nodes.q1.answers[0].result = "r";']).value).length));
  // D2 and D3. Whether a name lands on window is a question about the language,
  // and it is now the language that answers it: no regex reads the source to
  // guess, so neither a continuation comma nor a comment can lie to it.
  // The sentence has to be the RIGHT one: "the file declares it, but not on
  // window" is a different instruction from "nothing declares it", and only the
  // first one sends the adopter to the keyword that has to change.
  const declaredNotGlobal = /does declare it, but not on window/;
  const comma = load(['let THEME = { c: "b" },\n' + TREE.replace(/^var /, '')]);
  ok('a let hidden behind a continuation comma is refused, and named as a let',
    !!comma.missing && declaredNotGlobal.test(String(comma.hint)),
    comma.missing ? String(comma.hint).slice(0, 70) : 'accepted');
  const quoted = load(['/* it used to be: var C = { ... }; */\n' + TREE.replace(/^var /, 'let ')]);
  ok('a `var C = {` quoted in a comment decides nothing, and the let is still named as a let',
    !!quoted.missing && declaredNotGlobal.test(String(quoted.hint)),
    quoted.missing ? String(quoted.hint).slice(0, 70) : 'accepted');
  ok('while a name nothing declares at all gets the other sentence',
    !!load([TREE.replace('var C', 'var OTHER')]).missing &&
    !declaredNotGlobal.test(String(load([TREE.replace('var C', 'var OTHER')]).hint)));
  // D5. The other direction: two files that work in a browser and that the old
  // reading refused, because it knew two spellings of "this lands on window".
  ok('window.C = {...} is accepted, because that is a page that works',
    !load([TREE.replace(/^var C/, 'window.C')]).missing &&
    load([TREE.replace(/^var C/, 'window.C')]).value.id === 't');
  ok('and so is a bare assignment, for the same reason',
    !load([TREE.replace(/^var C/, 'C')]).missing);
  ok('two scripts declaring the same name resolve to the last, the way a browser does',
    load([TREE, TREE.replace('id: "t"', 'id: "second"')]).value.id === 'second');
  // What is run and what is not. The engine block is skipped on purpose: it is
  // evaluated once by loadEngine, it never assigns the content variable, and
  // running it twice would install a second set of listeners on this page.
  ok('the engine block is skipped, and it is the only skipped script of the delivered file',
    CHECK.inlineScripts(html).filter(s => s.skip === 'engine').length === 1 &&
    CHECK.inlineScripts(html).filter(s => !s.skip).length === 1,
    JSON.stringify(CHECK.inlineScripts(html).map(s => s.skip)));
  const external = mini([TREE.replace('var C', 'var UNUSED')])
    .replace('</body>', '<script src="tree.js"></script></body>');
  ok('a script this page cannot run is counted and named, never passed over in silence',
    /did not run/.test(String(CHECK.loadContent(external).hint)),
    String(CHECK.loadContent(external).hint).slice(0, 70));
  // A browser drops a script that throws and mounts all the same, so this page
  // reports the throw and judges the object, never the other way round.
  ok('a script that throws is carried as a warning, not as a refusal',
    load([TREE, 'throw new Error("decor");']).value.id === 't' &&
    load([TREE, 'throw new Error("decor");']).run.errors.length === 1);
  ok('a script that does not parse leaves the others running, as a browser does',
    load(['function (', TREE]).value.id === 't');
  // The page doing the checking must not become a page the checked file wrote
  // on, and two checks in a row must not see each other's leftovers.
  globalThis.LEAK_PROBE = 'untouched';
  load(['LEAKED_BY_THE_FILE = 1; LEAK_PROBE = "polluted";', TREE]);
  ok('the dropped file writes nothing on the global object of the page checking it',
    typeof globalThis.LEAKED_BY_THE_FILE === 'undefined' && globalThis.LEAK_PROBE === 'untouched',
    String(globalThis.LEAK_PROBE));
  delete globalThis.LEAK_PROBE;
  load(['var FROM_THE_FIRST_FILE = 1;', TREE]);
  ok('and one check leaves nothing behind for the next',
    load([TREE.replace('id: "t"', 'id: "second"'),
      'if (typeof FROM_THE_FIRST_FILE !== "undefined") C.id = "contaminated";']).value.id === 'second');
  // A browser too old for Proxy keeps the plain object, where the name seeded on
  // the sandbox is what still makes a `var` land on it. Only the guarantee about
  // not writing on this page's global object is weaker there, and this is the
  // one place that says so out loud.
  {
    const realProxy = globalThis.Proxy;
    try {
      globalThis.Proxy = undefined;
      const idOf = t => { const r = load(t); return r && r.value ? r.value.id : null; };
      ok('without Proxy the questionnaire is still read off the sandbox',
        idOf([TREE]) === 't' && idOf([TREE.replace(/^var C/, 'C')]) === 't' &&
        !!load([TREE.replace(/^var /, 'let ')]).missing,
        String(idOf([TREE])) + '/' + String(idOf([TREE.replace(/^var C/, 'C')])));
    } finally { globalThis.Proxy = realProxy; }
  }
  // D6. The attribute is an attribute of the markup, not a string in the file.
  ok('data-ai-go is read in single quotes as well as in double ones',
    JSON.stringify(CHECK.mountNames(mini([TREE], "'C'"))) === '["C"]');
  ok('a name that starts with a digit is not a variable name',
    /not a variable name/.test(String(load([TREE], '"2fast"').hint)));
  ok('a container left behind in an HTML comment is not a container',
    JSON.stringify(CHECK.mountNames(mini([TREE]).replace('<h1>H</h1>', '<!-- <div data-ai-go="OLD"></div> -->'))) === '["C"]');
  ok('and the same markup quoted inside a script names no variable, least of all a backslash',
    JSON.stringify(CHECK.mountNames(mini(['var s = "<div data-ai-go=\\"OLD\\"></div>";', TREE]))) === '["C"]');
});

console.log('check.html: the six markers, on files that are not the delivered one');
section(() => {
  // "the six markers, once each, in order" has only ever been asked of the file
  // this repository ships, which has them. Three ways of breaking them, named
  // apart, because the verdict treats them apart.
  const dup = t => html.replace(t + '\n', t + '\n   ' + t + '\n');
  ok('a duplicated marker is reported as duplicated, and the file is not ok',
    CHECK.markers(dup('AI_GO-CONTENT-BEGIN')).duplicated.join() === 'AI_GO-CONTENT-BEGIN' &&
    CHECK.markers(dup('AI_GO-CONTENT-BEGIN')).ok === false,
    JSON.stringify(CHECK.markers(dup('AI_GO-CONTENT-BEGIN')).duplicated));
  const gone = html.replace(/^[ \t]*AI_GO-END[ \t]*$/m, '');
  ok('a marker an editor ate is reported as missing, and not as duplicated',
    CHECK.markers(gone).missing.join() === 'AI_GO-END' && CHECK.markers(gone).duplicated.length === 0);
  const swapped = html.replace('AI_GO-CONTENT-BEGIN', '@@SWAP@@')
    .replace('AI_GO-CONTENT-END', 'AI_GO-CONTENT-BEGIN').replace('@@SWAP@@', 'AI_GO-CONTENT-END');
  ok('two markers in the wrong order are reported as out of order',
    CHECK.markers(swapped).disordered.length > 0 && CHECK.markers(swapped).ok === false,
    JSON.stringify(CHECK.markers(swapped).disordered));
  // The engine marker line carries a version and eight hexadecimal digits, and
  // any other shape is not that marker: it is what the receipt reads to say
  // whether the engine below it is the one it claims to be.
  const shortHash = html.replace(/AI_GO-ENGINE-BEGIN ([0-9.]+) h:[0-9a-f]{8}/, 'AI_GO-ENGINE-BEGIN $1 h:90cf');
  ok('an engine marker whose hash is not eight hexadecimal digits is not that marker',
    CHECK.markers(shortHash).missing.indexOf('AI_GO-ENGINE-BEGIN') >= 0);
  const noVersion = html.replace(/AI_GO-ENGINE-BEGIN [0-9.]+ h:/, 'AI_GO-ENGINE-BEGIN h:');
  ok('and neither is one that carries no version', CHECK.markers(noVersion).missing.indexOf('AI_GO-ENGINE-BEGIN') >= 0);
  ok('the delivered file still has the six, once each, in order', CHECK.markers(html).ok === true);
});

console.log('check.html: one walk and one lint, not two');
section(() => {
  // The engine bounded its walk at 32 and this page bounded nothing, so an
  // object that refers to itself froze the browser it was dropped in.
  const cyclic = { id: 'x', nodes: {}, results: {} };
  cyclic.self = cyclic;
  let froze = false;
  try { CHECK.extras(cyclic, CHECK.paths(cyclic)); } catch (e) { froze = true; }
  ok('a self-referential object is walked, not chased', !froze);
  // Same bound, same reading of a String object: the two walks are one rule.
  const deep = n => { let o = { s: '<' + 'script' }; for (let i = 0; i < n; i++) o = { k: o }; return o; };
  const seen = n => CHECK.extras({ id: 'x', nodes: {}, results: {}, d: deep(n) }, []).length > 0;
  ok('and it stops at the same depth the engine stops at', seen(5) && !seen(40));
  ok('a String object is read as the text it stands for, not as its characters',
    CHECK.extras({ id: 'x', nodes: {}, results: {}, t: new String('<' + '!--') }, [])
      .some(i => i.where === 't'),
    JSON.stringify(CHECK.extras({ id: 'x', nodes: {}, results: {}, t: new String('<' + '!--') }, []).map(i => i.where)));
  // The other invisible space. U+202F is what a French word processor writes
  // before a colon, and the lint knew only U+00A0.
  const NNBSP = String.fromCharCode(0x202f);
  ok('the source lint catches the narrow no-break space too, and names which one',
    CHECK.lintContent('a' + NNBSP + 'b').length === 1 &&
    CHECK.lintContent('a' + NNBSP + 'b')[0].message.includes('U+202F') &&
    CHECK.lintContent('a' + NBSP + 'b')[0].message.includes('U+00A0'),
    JSON.stringify(CHECK.lintContent('a' + NNBSP + 'b').map(i => i.message)));
  ok('and it still says nothing about an ordinary space', CHECK.lintContent('a b').length === 0);
  // Two writings of one rule. The engine does not export its walk, so the two
  // are compared through what each one feeds: guard() sweeps for placeholders
  // with the engine's walk, extras() sweeps for the sequence that closes a
  // script block with this page's, and both start from the tree itself.
  const nest = (n, leaf) => { let o = leaf; for (let i = 0; i < n; i++) o = { k: o }; return o; };
  const engineSees = n => { const t = cp(signed); t.probe = nest(n, 'TO_FILL_IN');
    return AI_GO.guard(t, 'hes-example.ch').some(i => /^probe/.test(i.path)); };
  const checkSees = n => CHECK.extras({ id: 'x', nodes: {}, results: {}, probe: nest(n, '<' + 'script') }, [])
    .some(i => /^probe/.test(i.where));
  const depths = [1, 5, 28, 30, 31, 32, 33, 40];
  ok('the engine walk and the validator walk stop at the same depth, on both sides of the bound',
    depths.every(n => engineSees(n) === checkSees(n)),
    depths.map(n => n + ':' + engineSees(n) + '/' + checkSees(n)).join(' '));
  ok('and the bound is actually reached, so the comparison above is not two constant falses',
    engineSees(1) === true && engineSees(40) === false);
  const strObjTree = s => { const t = cp(signed); t.probe = new String(s); return t; };
  ok('and both read a String object as the text it stands for',
    AI_GO.guard(strObjTree('TO_FILL_IN'), 'hes-example.ch').some(i => i.path === 'probe') &&
    CHECK.extras({ id: 'x', nodes: {}, results: {}, probe: new String('<' + '!--') }, []).some(i => i.where === 'probe'));
  ok('the pages that ship hold neither of the two',
    !html.includes(NNBSP) && !checkHtml.includes(NNBSP) &&
    !html.includes(NBSP) && !checkHtml.includes(NBSP));
});

console.log('messages: every refusal has a sentence, and none is dead code');
section(() => {
  const keys = Object.keys(AI_GO.UI.en.msg);
  // Not a pinned total: a new refusal is a normal thing to add, and a count that
  // has to be edited teaches people to edit counts. What matters is that every
  // declared sentence is real, and (below) that every one of them is used.
  ok(`the engine declares ${keys.length} refusal sentences, all non-empty`,
    keys.length > 25 && keys.every(k => typeof AI_GO.UI.en.msg[k] === 'string' && AI_GO.UI.en.msg[k].length > 0),
    String(keys.length));
  // This used to search the source for the key as a literal, which a call site
  // wrapped in `if (false)` satisfies just as well as a live one: five refusals
  // were emptied in a mutation run and the line stayed green. So the keys are
  // collected from what the engine SAYS, on a corpus built to reach every one.
  const spoken = new Set();
  const speak = (tree, host) => {
    try { AI_GO.structure(tree).forEach(i => spoken.add(i.message)); } catch (e) { /* never throws */ }
    try { AI_GO.guard(tree, host === undefined ? '' : host).forEach(i => spoken.add(i.message)); } catch (e) { /* idem */ }
  };
  // Built here, not derived from whatever content the file ships: on an adopted
  // questionnaire the mutations below landed on a different shape and three
  // sentences stopped being reachable, so a correct file went red for a reason
  // that was about this file and not about theirs.
  const sound = () => ({
    id: 'corpus-ia', langs: ['fr', 'en'], defaultLang: 'fr', start: 'q1',
    steps: [{ id: 's1', name: { fr: 'Étape', en: 'Step' } }],
    publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
    review: { by: 'Legal', date: '2026-06-01' }, jurisdiction: 'CH-VD', legalBasis: ['FADP'],
    nodes: { q1: { type: 'single', step: 's1', title: { fr: 'Q', en: 'Q' },
      answers: [{ value: 'a', label: { fr: 'A', en: 'A' }, result: 'r' },
                { value: 'b', label: { fr: 'B', en: 'B' }, result: 'r' }] } },
    results: { r: { level: 'info', title: { fr: 'R', en: 'R' },
      solution: { text: { fr: 'S', en: 'S' } } } },
    links: {}, disclaimer: { fr: 'D', en: 'D' }
  });
  const say = (mut, host) => { const t = sound(); try { mut(t); } catch (e) { return; } speak(t, host); };
  const anyNode = 'q1', anyResult = 'r';
  speak(null); speak({}); speak([]); speak(sound(), 'ailleurs.example');
  say(t => { t.disclaimer = { fr: 'TO_FILL_IN', en: 'TO_FILL_IN' }; });
  say(t => { t.nodes[anyNode].title = { fr: 'Q' }; });
  say(t => { delete t.nodes; });
  say(t => { delete t.start; });
  say(t => { t.start = 'nulle-part'; });
  say(t => { t.nodes[anyNode] = null; });
  say(t => { delete t.nodes[anyNode].title; });
  say(t => { t.langs = ['fr', 'en', 'de']; });
  say(t => { t.nodes[anyNode].answers = [{ value: 'x', to: 'inconnu' }, { value: 'y', result: anyResult }]; });
  say(t => { t.nodes[anyNode].answers[0].result = 'inconnu'; });
  say(t => { t.nodes[anyNode].answers[0].result = Infinity; });
  say(t => { t.nodes[anyNode].answers[0] = { label: 'sans valeur' }; });
  say(t => { t.nodes[anyNode].answers = [{ value: 'x', result: anyResult }]; });
  say(t => { t.nodes[anyNode].answers[1].value = t.nodes[anyNode].answers[0].value; });
  say(t => { t.nodes[anyNode].answers[0].to = undefined; delete t.nodes[anyNode].answers[0].result; });
  say(t => { t.nodes[anyNode].type = 'multi'; t.nodes[anyNode].options = []; delete t.nodes[anyNode].answers; });
  say(t => { t.nodes[anyNode].type = 'multi'; t.nodes[anyNode].options = [{ label: 'a' }];
             t.nodes[anyNode].next = { ifAny: anyResult }; delete t.nodes[anyNode].answers; });
  say(t => { t.nodes[anyNode].type = 'multi'; t.nodes[anyNode].options = [{ value: 'a', label: 'a' }, { value: 'a', label: 'b' }];
             delete t.nodes[anyNode].next; delete t.nodes[anyNode].answers; });
  say(t => { t.nodes[anyNode].step = 'pas-une-etape'; });
  say(t => { t.results[anyResult] = null; });
  say(t => { t.links = { l: { label: 'x' } }; t.results[anyResult].allowed = ['l']; });
  say(t => { t.results[anyResult].allowed = ['inconnu']; });
  say(t => { t.links = { l: { label: 'x', href: 'javascript:alert(1)' } }; t.results[anyResult].allowed = ['l']; });
  say(t => { delete t.publisher.name; });
  say(t => { t.publisher.domains = []; });
  say(t => { delete t.review.by; });
  say(t => { delete t.review.date; });
  say(t => { t.review.date = 'pas-une-date'; });
  say(t => { t.review.date = '03.12.2026'; });
  say(t => { t.review.date = 'septembre 2026'; });
  say(t => { delete t.disclaimer; });
  say(t => { t.derivedFrom = {}; });
  say(t => { t.derivedFrom = { name: 'Source', url: 7 }; });
  say(t => { t.derivedFrom = { name: 'Source\nsur deux lignes' }; });
  say(t => { t.derivedFrom = { name: 'Source', licence: 'L'.repeat(101) }; });
  // Un mot de quatre lettres dans une ecriture qu'aucune langue declaree ne
  // couvre : le refus qui nomme le remede, et non celui qui dit de reecrire.
  say(t => { t.nodes[anyNode].title = 'Le terme \u500b\u4eba\u60c5\u5831 en droit japonais'; }, 'ailleurs.example');
  say(t => { t.derivedFrom = { name: 'Source', licence: {} }; });
  say(t => { t.id = 'aigo-unil-copie'; }, 'ailleurs.example');
  say(t => { t.results[anyResult].summary = 'Adapte de l Universite de Lausanne'; }, 'ailleurs.example');
  say(t => { t.links = { l: { label: 'x', href: 'https://padlet.com/ai_research/board' } };
             t.results[anyResult].allowed = ['l']; }, 'ailleurs.example');
  say(t => { t.nodes[anyNode].title = 7; });
  say(t => { t.nodes[anyNode].help = { fr: [1, 2], en: 'x' }; });
  say(t => { t.results[anyResult].solution = { text: { fr: [{}], en: 'x' } }; });
  say(t => { t.publisher.domains = ['ch']; }, 'quelconque.ch');
  // The delivered example, signed and published as it stands. No mutation of the
  // fixture above can produce this one: the sentence fires on a tree that IS the
  // example, and the fixture is not it. So the example itself is put through,
  // with a signature on it and nothing else changed.
  if (asDelivered) {
    const asIs = cp(starter);
    asIs.publisher = { name: 'Example UAS', domains: ['hes-example.ch'] };
    asIs.review = { by: 'Legal', date: '2026-06-01' };
    speak(asIs, 'hes-example.ch');
  }
  // The tree is French by default, so the engine answers in French: a sentence
  // is recognised by the head of its wording in ANY language the engine ships.
  const heard = k => Object.keys(AI_GO.UI)
    .map(l => AI_GO.UI[l].msg && AI_GO.UI[l].msg[k]).filter(Boolean)
    .some(m => { const head = m.split('{')[0]; return [...spoken].some(x => x.indexOf(head) === 0); });
  // renderFailed is the one sentence that does not belong to this path: it is the
  // net under mount(), and the rendering section below is where it is exercised.
  // renderFailed is exercised by the rendering section below. placeholderExample
  // fires on a tree that IS the delivered example, so on an adapted file there is
  // nothing that can make the engine say it -- and asking the adopter to produce
  // our example in order to go green would be absurd. The run says which of the
  // two it left out.
  const RENDER_ONLY = asDelivered ? ['renderFailed'] : ['renderFailed', 'placeholderExample'];
  if (!asDelivered) skipped.push('the sentence that refuses the delivered example, which your content is not');
  const silent = keys.filter(k => RENDER_ONLY.indexOf(k) < 0 && !heard(k));
  ok(`each of the ${keys.length - RENDER_ONLY.length} refusal sentences of the two checks is one the engine can be made to say`,
    silent.length === 0, 'jamais entendues : ' + silent.join(', '));
  ok('and the last one, the net under the renderer, is exercised where it lives',
    engineCode.indexOf("phrase('renderFailed'") > 0);
  // A key used but not declared makes phrase() return the raw key. Fire a
  // battery of broken trees and check nothing comes back looking like one.
  const broken = [{}, null, [], cp(base), ...(hasReference ? [cp(unil)] : []),
    (() => { const x = cp(signed); x.nodes.q1.answers[0].to = 'gone'; return x; })(),
    (() => { const x = cp(signed); delete x.nodes.q3.title; return x; })(),
    (() => { const x = cp(signed); x.links.guide.href = 'javascript:alert(1)'; return x; })(),
    (() => { const x = bilingual(signed, 'de'); delete x.nodes.q1.answers[0].detail.de; return x; })()];
  const raw = [];
  for (const v of broken) {
    for (const i of AI_GO.structure(v).concat(AI_GO.guard(v, 'x.example'))) {
      if (/^[a-z][A-Za-z0-9]*$/.test(i.message)) raw.push(i.message);
    }
  }
  ok('no refusal message falls back to its raw key', raw.length === 0, [...new Set(raw)].join(', '));
  // The shipped French set may not introduce a key the English base does not
  // define, or the tree.ui contract documented in the file would be a lie.
  const enKeys = Object.keys(AI_GO.UI.en), frKeys = Object.keys(AI_GO.UI.fr);
  ok('the shipped French label set only overrides keys the English base defines',
    frKeys.every(k => enKeys.includes(k)),
    frKeys.filter(k => !enKeys.includes(k)).join(', '));
  // A refusal follows the tree's language, and the box around it was already
  // translated, so the sentences ship in French too. A key left out would be
  // served in English inside a French box; a variable renamed in translation
  // would print the brace instead of the value it stands for.
  const enMsg = Object.keys(AI_GO.UI.en.msg), frMsg = Object.keys(AI_GO.UI.fr.msg);
  const vars = t => (String(t).match(/\{(\w+)\}/g) || []).sort().join(',');
  const drift = enMsg.filter(k => frMsg.includes(k) && vars(AI_GO.UI.en.msg[k]) !== vars(AI_GO.UI.fr.msg[k]));
  ok(`the ${enMsg.length} refusal sentences ship in French too, with the same variables`,
    frMsg.length === enMsg.length && enMsg.every(k => frMsg.includes(k)) && drift.length === 0,
    enMsg.filter(k => !frMsg.includes(k)).concat(drift).join(', '));
  {
    // One broken route, in three trees that differ only in what they say about it.
    const broken = lang => ({
      langs: [lang], defaultLang: lang, start: 'q1',
      steps: [{ id: 's1', name: 'S' }],
      publisher: { name: 'Service X', domains: ['exemple.ch'] },
      review: { by: 'Service X', date: '2026-01-01' },
      nodes: { q1: { type: 'single', step: 's1', title: 'Q',
        answers: [{ value: 'a', to: 'zzz' }, { value: 'b', result: 'r' }] } },
      results: { r: { level: 'info', title: 'R', solution: 'S' } }, links: {}, disclaimer: 'D'
    });
    const said = t => AI_GO.structure(t).map(i => i.message);
    const filled = (t, id) => t.replace('{id}', id);
    ok('a French tree is refused in French',
      said(broken('fr')).includes(filled(AI_GO.UI.fr.msg.unknownNode, 'zzz')), said(broken('fr')).join(' | '));
    ok('an English tree is refused in English',
      said(broken('en')).includes(filled(AI_GO.UI.en.msg.unknownNode, 'zzz')), said(broken('en')).join(' | '));
    const own = broken('fr'); own.ui = { fr: { msg: { unknownNode: 'A moi de le dire.' } } };
    ok('a tree that rewords one refusal is obeyed, and keeps the shipped French for the rest',
      said(own).includes('A moi de le dire.') &&
      said(own).every(m => m !== filled(AI_GO.UI.en.msg.unknownNode, 'zzz')), said(own).join(' | '));
  }
  // `frKeys.every(k => html.includes(k))` could not fail: "no" occurs 327 times
  // in this file. The header list is read as a list and compared as a set.
  // Only the indented key lines that follow the heading, never the prose under
  // them: a sentence explaining the list is not part of the list.
  const after = html.slice(html.indexOf('INTERFACE STRING KEYS'));
  const keyLines = [];
  after.split('\n').slice(1).every(l => /^ \*   [A-Za-z][A-Za-z ]*$/.test(l) && keyLines.push(l));
  const listed = keyLines.join(' ').replace(/\*/g, ' ').split(/\s+/).filter(Boolean);
  const missing = enKeys.filter(k => !listed.includes(k));
  const invented = listed.filter(k => !enKeys.includes(k));
  ok(`the engine header lists the ${enKeys.length} interface keys the engine defines, and no other`,
    missing.length === 0 && invented.length === 0,
    'absentes: ' + missing.join(', ') + ' | inventees: ' + invented.join(', '));
});

console.log('structure: link schemes and malformed input');
const mkTree = h => ({
  id: 'x', langs: ['en'], defaultLang: 'en', start: 'q1',
  steps: [{ id: 's1', name: 's' }],
  links: { m: { label: 'c', href: h } },
  nodes: { q1: { type: 'single', step: 's1', title: 't', answers: [{ value: 'yes', result: 'r' }, { value: 'no', result: 'r' }] } },
  results: { r: { level: 'info', title: 'r', allowed: ['m'] } }
});
const scheme = h => errs(mkTree(h)).some(e => /scheme not allowed/.test(e.message));
ok('a script scheme is rejected', scheme('javascript:alert(1)'));
ok('a protocol-relative href is rejected', scheme('//evil.example'));
ok('a backslash protocol-relative href is rejected', scheme('/\\evil.example'));
ok('a tab-split protocol-relative href is rejected', scheme('/\t/evil.example'));
ok('a tab-split script scheme is rejected', scheme('java\tscript:alert(1)'));
ok('an https href is accepted', !scheme('https://ok.org'));
ok('a mailto href is accepted', !scheme('mailto:a@b.c'));
section(() => {
  const bad = [{}, null, [], { langs: 'fr' }, { steps: 42 },
    { langs: ['en'], start: 'a', nodes: { a: null }, steps: [] },
    { langs: ['en'], start: 'a', nodes: { a: { type: 'single', title: 't', answers: [{ value: 'y', result: 'r' }, { value: 'n', result: 'r' }] } }, results: { r: null }, steps: [] },
    { langs: ['en'], start: 'a', steps: [], nodes: { a: { type: 'single', title: 't', answers: 'yes' } }, results: {} },
    { langs: ['en'], start: 'a', steps: [], nodes: { a: { type: 'multi', title: 't', options: 'x', next: 5 } }, results: {} },
    { langs: ['en'], start: 'a', steps: [null], links: 'x', nodes: { a: { type: 'single', title: 't', answers: [null, { value: 'y', result: 'r' }] } }, results: { r: { title: 'r', allowed: 'edu', forbidden: 'no' } } },
    { langs: ['en'], start: 'a', steps: [], nodes: { a: null }, publisher: 'x', review: 'y', disclaimer: 'z' }];
  let crashes = 0;
  for (const v of bad) {
    try { AI_GO.structure(v); AI_GO.guard(v, 'x'); CHECK.paths(v); AI_GO.fingerprint(v || {}); } catch (e) { crashes++; }
  }
  ok(`structure, guard, paths and fingerprint never throw on ${bad.length} malformed inputs`, crashes === 0);
  const holes = cp(base);
  holes.nodes.q2.options.unshift(null);
  holes.steps.unshift(null);
  delete holes.nodes.q3.title;
  delete holes.results.open.title;
  holes.nodes.q2.options[1] = { label: 'x' };
  const where = errs(holes).map(e => e.path);
  ok('a null checkbox option is rejected', where.includes('nodes.q2.options[0]'));
  ok('a checkbox option without value is rejected', where.includes('nodes.q2.options[1]'));
  ok('a null step entry is rejected', where.includes('steps[0]'));
  ok('a node and a result without title are rejected', where.includes('nodes.q3.title') && where.includes('results.open.title'));
  const inherited = cp(base); inherited.start = 'constructor';
  ok('an identifier inherited from Object.prototype is not a node',
    errs(inherited).some(e => e.path === 'start') && CHECK.paths(inherited).length === 0);
  const inheritedLink = cp(signed); inheritedLink.results.open.allowed = ['constructor'];
  ok('an inherited key is not a link', errs(inheritedLink).some(e => e.path === 'results.open.allowed'));
  const gone = cp(base); gone.nodes.q1.answers[0].to = 'q9';
  ok('a target that resolves nowhere is refused at mount time, not in production',
    errs(gone).some(e => e.path === 'nodes.q1.answers[0]'));
  const untranslated = bilingual(base, 'de'); delete untranslated.nodes.q1.title.de;
  ok('a missing translation is refused, never served as a silent fallback',
    errs(untranslated).some(e => e.path === 'nodes.q1.title'));
});

// The engine header promises that structure, guard and fingerprint report rather
// than throw. check.html runs them on whatever file is dropped on it, so a throw
// there is a dead validator, not a stack trace someone reads.
for (const [label, value] of [['null', null], ['undefined', undefined], ['an array', []],
                              ['a string', 'x'], ['a number', 7]]) {
  let threw = null;
  for (const fn of ['structure', 'guard', 'fingerprint']) {
    try { AI_GO[fn](value, 'example.ch'); } catch (e) { threw = fn + ': ' + e.message; }
  }
  ok(`structure, guard and fingerprint report instead of throwing on ${label}`, threw === null, threw);
}
section(() => {
  const cyclic = { start: 'a', nodes: {} }; cyclic.self = cyclic;
  let threw = null;
  try { AI_GO.guard(cyclic, 'example.ch'); AI_GO.fingerprint(cyclic); } catch (e) { threw = e.message; }
  ok('a self-referential tree is reported, not a stack overflow', threw === null, threw);
});

console.log('paths: truncation is signalled, never silent');
section(() => {
  const chain = k => {
    const nodes = {};
    for (let i = 0; i < k; i++) nodes['q' + i] = {
      type: 'single', step: 's1', title: 'x',
      answers: [{ value: 'yes', to: i < k - 1 ? 'q' + (i + 1) : undefined, result: i < k - 1 ? undefined : 'end' },
                { value: 'no', result: 'end' }]
    };
    return { id: 't', langs: ['en'], defaultLang: 'en', start: 'q0', steps: [{ id: 's1', name: 's' }], nodes, results: { end: { level: 'info', title: 'e' } } };
  };
  // This used to read "does not overflow the stack", which could not fail: the
  // enumerator stops at PATH_DEPTH long before any stack is at risk. What is
  // worth guarding is the bound itself, since it was 2000 once, and 2000 did
  // overflow. So: the declared bound, and the answer it produces.
  const declaredDepth = Number((checkHtml.match(/PATH_DEPTH\s*=\s*(\d+)/) || [])[1]);
  ok('the path enumerator declares a depth bound low enough to keep the stack safe',
    declaredDepth > 0 && declaredDepth <= 1000, String(declaredDepth));
  let deep = null;
  try { deep = CHECK.paths(chain(6000)); ok('a chain far deeper than the bound is answered, not thrown', true); }
  catch (e) { ok('a chain far deeper than the bound is answered, not thrown', false, e.constructor.name); }
  ok('a 6000-node chain sets the truncated flag', !!deep && deep.truncated === true);
  ok('a 450-node chain is not truncated', CHECK.paths(chain(450)).truncated === false);
  ok('a routing diff reports truncation instead of answering "0 path added"',
    CHECK.routingDiff(chain(6000), chain(6000)).truncated === true);
  const orphanTarget = cp(base); orphanTarget.nodes.q1.answers[1].to = 'gone';
  ok('a target that does not exist is enumerated as a dead end, not silently dropped',
    CHECK.paths(orphanTarget).length === 4 && CHECK.paths(orphanTarget).some(p => p.dangling) &&
    CHECK.extras(orphanTarget, CHECK.paths(orphanTarget)).some(i => i.level === 'error' && i.where === 'paths'),
    'a broken tree must not report fewer paths, it must report an error');
  const cyclic = cp(base); cyclic.nodes.q3.answers[0].result = undefined; cyclic.nodes.q3.answers[0].to = 'q1';
  ok('a cycle is enumerated as a cycle, not as an infinite loop',
    CHECK.paths(cyclic).some(p => p.cycle === 'q1'));
});

console.log('the receipt: one fingerprint, a routing diff and a source lint');
section(() => {
  const a = cp(base), b = cp(base);
  b.nodes.q1.title = 'reworded';
  ok('a wording change moves no path', CHECK.routingDiff(a, b).added.length === 0 && CHECK.routingDiff(a, b).removed.length === 0);
  const c = cp(base); c.nodes.q3.answers[1].result = 'restricted';
  ok('a routing change is detected', CHECK.routingDiff(a, c).added.length + CHECK.routingDiff(a, c).removed.length > 0);
  const shorter = cp(base); shorter.nodes.q1.answers.pop();
  ok('a routing diff reports what a version removed, not only what it added',
    CHECK.routingDiff(base, shorter).removed.length > 0 && CHECK.routingDiff(base, shorter).added.length === 0,
    JSON.stringify({ removed: CHECK.routingDiff(base, shorter).removed.length,
                     added: CHECK.routingDiff(base, shorter).added.length }));
  ok('the fingerprint is 16 hex characters', /^[0-9a-f]{16}$/.test(AI_GO.fingerprint(signed)));
  ok('the fingerprint moves with the content', AI_GO.fingerprint(signed) !== AI_GO.fingerprint(c));
  // Signature only: `signed` also rewrites the example's links, which the
  // fingerprint does sign, so it is not the fixture for this one.
  const signatureOnly = cp(base);
  signatureOnly.publisher = { name: 'X', domains: ['x.example'] };
  signatureOnly.review = { by: 'Y', date: '2026-01-01' };
  signatureOnly.disclaimer = 'Z';
  ok('the fingerprint ignores the signature, so signing changes nothing',
    AI_GO.fingerprint(base) === AI_GO.fingerprint(signatureOnly));

  // ---- T2, point 1: who answers for the tree ------------------------------
  // The fingerprint signs the questions and the routing, and that is all it has
  // ever signed. `derivedFrom` could be added, removed and renamed without the
  // receipt moving by one character, and it is the field that says whose
  // questionnaire this is adapted from. Widening the projection was the other
  // way out: it would move the fingerprint every adopter has already recorded,
  // and adopters are exactly the trees that declare that field. So the signature
  // block gets a value of its own, and cbdb4863aed9f778 does not move.
  const withSource = cp(signatureOnly); withSource.derivedFrom = { name: 'Origin U' };
  const otherSource = cp(signatureOnly); otherSource.derivedFrom = { name: 'Somebody Else' };
  ok('the signature value is 16 hex characters', /^[0-9a-f]{16}$/.test(AI_GO.signature(signatureOnly)),
    AI_GO.signature(signatureOnly));
  ok('declaring derivedFrom moves the signature value',
    AI_GO.signature(withSource) !== AI_GO.signature(signatureOnly),
    AI_GO.signature(signatureOnly) + ' -> ' + AI_GO.signature(withSource));
  ok('renaming the source moves it again',
    AI_GO.signature(withSource) !== AI_GO.signature(otherSource),
    AI_GO.signature(withSource) + ' -> ' + AI_GO.signature(otherSource));
  ok('and none of that moves the content fingerprint, which signs another question',
    AI_GO.fingerprint(signatureOnly) === AI_GO.fingerprint(withSource) &&
    AI_GO.fingerprint(withSource) === AI_GO.fingerprint(otherSource));
  const renamedPublisher = cp(signatureOnly); renamedPublisher.publisher.name = 'Another University';
  const redated = cp(signatureOnly); redated.review.date = '2026-01-02';
  ok('the other two fields nobody signed either move it too',
    AI_GO.signature(renamedPublisher) !== AI_GO.signature(signatureOnly) &&
    AI_GO.signature(redated) !== AI_GO.signature(signatureOnly));
  ok('signature() never throws, whatever it is handed',
    [null, undefined, 0, '', [], 'x', (() => { const c = {}; c.self = c; return c; })()]
      .every(v => /^[0-9a-f?]{16}$/.test(AI_GO.signature(v))));
  if (hasReference) ok('the content fingerprint of the frozen tree has not moved: still cbdb4863aed9f778',
    AI_GO.fingerprint(unil) === 'cbdb4863aed9f778', AI_GO.fingerprint(unil));
  ok('a reworded question moves the fingerprint', AI_GO.fingerprint(b) !== AI_GO.fingerprint(a));
  ok('the delivered content passes the source lint', CHECK.lintContent(html, starter).length === 0,
    CHECK.lintContent(html, starter).map(i => i.where).join(', '));
  // Translating the questions and leaving <html lang> as it shipped makes a
  // screen reader read the new language with the old voice. Nothing in the
  // engine can see the page, so the validator is where this has to be caught.
  {
    // A language the content does not already declare, or a German adaptation
    // fails a test that exists to catch a page left in the wrong language.
    const other = ['de', 'it', 'rm', 'nl'].find(l => (starter.langs || []).indexOf(l) < 0);
    const translated = cp(starter); translated.langs = [other]; translated.defaultLang = other;
    // Reported at whichever attribute decides: the container's data-lang wins over
    // the page's lang, so naming <html lang> when data-lang is what mounts would
    // send the adopter to the wrong line.
    const LANG_WHERE = ['<html lang>', 'data-lang'];
    ok('a page whose lang contradicts the language the engine will mount in is reported',
      CHECK.lintContent(html, translated).some(i => LANG_WHERE.indexOf(i.where) >= 0),
      CHECK.lintContent(html, translated).map(i => i.where).join(', '));
    ok('and a page whose lang agrees with it is not',
      !CHECK.lintContent(html, starter).some(i => LANG_WHERE.indexOf(i.where) >= 0));
    // The case the old rule could not see: the container forces a language the
    // page does not announce, so the engine mounts in one voice and the screen
    // reader speaks in the other.
    // Built from whatever the file carries: an adopted file may have no data-lang
    // at all, and an assertion that assumes one is an assertion about this file.
    const pageTag = (html.match(/<html[^>]*\blang\s*=\s*"([\w-]+)"/) || [])[1] || 'fr';
    const forcedTag = (starter.langs || ['fr', 'en']).find(l => l.split('-')[0] !== pageTag.split('-')[0]) ||
      (pageTag.slice(0, 2) === 'en' ? 'fr' : 'en');
    const forcedPage = /data-lang=/.test(html)
      ? html.replace(/(<[a-z][\w-]*\b[^>]*\sdata-ai-go\b[^>]*\s)data-lang="[\w-]+"/i, '$1data-lang="' + forcedTag + '"')
      : html.replace(/(<[a-z][\w-]*\b[^>]*\sdata-ai-go\b)/i, '$1 data-lang="' + forcedTag + '"');
    ok('a container that forces another language than the page is reported now',
      forcedPage !== html && CHECK.lintContent(forcedPage, starter).some(i => i.where === 'data-lang'),
      CHECK.lintContent(forcedPage, starter).map(i => i.where).join(', ') + ' | ' + pageTag + '->' + forcedTag);
  }
  if (hasReference) ok('the frozen UNIL content passes the source lint',
    CHECK.lintContent(read('reference/aigo-unil.js'), unil).length === 0,
    CHECK.lintContent(read('reference/aigo-unil.js'), unil).map(i => i.where).join(', '));
  const literal = 'var T = {\n  a: "two' + NBSP + 'words"\n};';
  ok('the source lint catches a literal non-breaking space', CHECK.lintContent(literal).length === 1);
  const killer = cp(signed);
  killer.results.open.summary = 'a text with <' + '/script' + '> inside it';
  ok('a sequence that would close the script block is refused by the validator',
    CHECK.extras(killer, CHECK.paths(killer)).some(i => i.level === 'error' && /close the script block/.test(i.message)),
    'this is the failure mode a single file adds, and it applies to any string');
  const noPolarity = cp(signed); delete noPolarity.nodes.q2.polarity;
  ok('a checkbox question without a declared polarity is flagged',
    CHECK.extras(noPolarity, CHECK.paths(noPolarity)).some(i => i.where === 'nodes.q2'));
  const badPolarity = cp(signed); badPolarity.nodes.q2.polarity = 'reversed';
  ok('a polarity with a wrong value is an error',
    CHECK.extras(badPolarity, CHECK.paths(badPolarity)).some(i => i.level === 'error' && i.where === 'nodes.q2.polarity'));
  const orphan = cp(signed);
  orphan.nodes.q4 = { type: 'single', step: 's1', title: 'x', answers: [{ value: 'a', result: 'open' }, { value: 'b', result: 'open' }] };
  ok('an unreachable question is reported by the validator, not by the engine',
    CHECK.extras(orphan, CHECK.paths(orphan)).some(i => i.where === 'nodes.q4') &&
    !AI_GO.structure(orphan).some(i => i.path === 'nodes.q4'));
  // Five checks that could be deleted without a single assertion moving.
  const unreachableResult = cp(signed);
  unreachableResult.results.spare = { level: 'info', title: 'Never reached' };
  ok('a result no path reaches is reported',
    CHECK.extras(unreachableResult, CHECK.paths(unreachableResult)).some(i => i.where === 'results.spare'));
  const undeclaredDefault = cp(signed); undeclaredDefault.defaultLang = 'it';
  ok('a default language the tree does not declare is an error',
    CHECK.extras(undeclaredDefault, CHECK.paths(undeclaredDefault))
      .some(i => i.level === 'error' && i.where === 'defaultLang'));
  const angle = cp(signed); angle.results.open.summary = 'fewer than 5 < 6 people';
  ok('an angle bracket in a text is a warning, and not the same finding as a killer sequence',
    CHECK.extras(angle, CHECK.paths(angle)).some(i => i.level === 'warn' && /angle bracket/.test(i.message)));
  const loop = cp(signed);
  loop.nodes.q3.answers[0].result = undefined; loop.nodes.q3.answers[0].to = 'q1';
  ok('a cycle is an error, named by the node it closes on',
    CHECK.extras(loop, CHECK.paths(loop)).some(i => i.level === 'error' && /Cycle detected on "q1"/.test(i.message)));
  ok('the source lint catches a straight apostrophe inside a single-quoted string',
    CHECK.lintContent("var T = {\n  a: 'l'ecole'\n};").length === 1);
  // The review age. This page carried its own 365 while the engine of the same
  // file banners at POLICY.reviewMaxDays: for 183 days the receipt an
  // institution filed said the review was stale and the page it described said
  // nothing at all, and neither of the two was wrong about its own number.
  const dayString = n => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
  // Written here, not read from the file under test: the two copies used to be
  // compared to each other and never to a number anybody had decided, so moving
  // the bound from 548 to 54800 left both of them agreeing, and both wrong.
  const REVIEW_MAX_DAYS = 548;
  ok(`the engine bounds a review at ${REVIEW_MAX_DAYS} days, the figure this file was written against`,
    AI_GO.POLICY.reviewMaxDays === REVIEW_MAX_DAYS,
    'POLICY.reviewMaxDays says ' + AI_GO.POLICY.reviewMaxDays +
    ': change it on purpose and change this line with it, or the two stop meaning anything');
  const stale = cp(signed); stale.review.date = dayString(AI_GO.POLICY.reviewMaxDays + 40);
  ok('the review age is judged against the engine\'s own bound',
    CHECK.extras(stale, CHECK.paths(stale), AI_GO).some(i => /days old/.test(i.message)));
  const nearly = cp(signed); nearly.review.date = dayString(AI_GO.POLICY.reviewMaxDays - 40);
  ok('and it says nothing for as long as the engine of the same file says nothing',
    !CHECK.extras(nearly, CHECK.paths(nearly), AI_GO).some(i => /days old/.test(i.message)),
    'a receipt that warns 183 days before the page does is a receipt about another page');
  ok('with no engine there is no bound to read, and none is invented',
    !CHECK.extras(stale, CHECK.paths(stale)).some(i => /days old/.test(i.message)));
  /* ET LA BORNE PRISE DES DEUX COTES, pas a quarante jours de distance. Le recu
   * et la banniere peuvent se desaligner d'un jour sans qu'aucune ligne rougisse
   * tant qu'on les interroge loin de la limite : c'est exactement ce qui s'etait
   * produit quand cette page comptait en fraction de jour et le moteur en
   * entier, et le recu disait « 549 jours » sous une page muette. */
  const said = n => {
    const t9 = cp(signed); t9.review.date = dayString(n);
    return CHECK.extras(t9, CHECK.paths(t9), AI_GO).some(i => /days old/.test(i.message));
  };
  const MAX = AI_GO.POLICY.reviewMaxDays;
  ok(`the receipt takes the bound where the banner takes it: day ${MAX} silent, day ${MAX + 1} spoken`,
    said(MAX) === false && said(MAX + 1) === true,
    'jour ' + MAX + ' -> ' + said(MAX) + ', jour ' + (MAX + 1) + ' -> ' + said(MAX + 1));
  // FOURTEEN DRAWN FIELDS, not the six the walk used to reach. A tree half written
  // in French got "publishable, no warning" and served an English reader the label
  // "Recommended solution" above a French sentence: the recommended solution is
  // the phrase a legal service signs, and it was among the eight that were silent.
  {
    const two = bilingual(signed, 'de');
    const spots = [
      ['nodes.q1.answers[0].detail', t => { t.nodes.q1.answers[0].detail = 'une seule langue'; }],
      ['nodes.q1.answers[0].label', t => { t.nodes.q1.answers[0].label = 'une seule langue'; }],
      ['results.solution.text', t => { const r = Object.keys(t.results)[0];
        t.results[r].solution = { text: 'une seule langue' }; }],
      ['results.alert.text', t => { const r = Object.keys(t.results)[0];
        t.results[r].alert = { text: 'une seule langue' }; }],
      ['results.forbidden[0]', t => { const r = Object.keys(t.results)[0];
        t.results[r].forbidden = ['une seule langue']; }],
      ['disclaimer', t => { t.disclaimer = 'une seule langue'; }],
      ['derivedFrom.note', t => { t.derivedFrom = { name: 'Source', note: 'une seule langue' }; }]
    ];
    const missed = spots.filter(([, mut]) => {
      const t = cp(two); mut(t);
      return !CHECK.extras(t, CHECK.paths(t), AI_GO).some(i => /Untranslated|non traduit/.test(i.message));
    }).map(s2 => s2[0]);
    ok(`a bare string is reported in each of the ${spots.length} places the engine draws one`,
      missed.length === 0, 'muets : ' + missed.join(', '));
  }
  const halfTranslated = bilingual(signed, 'de'); halfTranslated.nodes.q1.title = 'a bare string';
  ok('a bare string in a two-language tree is a validator warning',
    CHECK.extras(halfTranslated, CHECK.paths(halfTranslated)).some(i => i.where === 'nodes.q1.title'));
});

console.log('engine: rendering (minimal DOM shim)');
// A tiny fake DOM: only what the engine touches. Enough to assert the
// accessibility invariants on the code that actually ships.
section(() => {
  const raf = [];
  class N {
    constructor(t) { this.tagName = t; this.children = []; this.attrs = {}; this.on = {}; this.p = {}; }
    get className() { return this.attrs.class || ''; } set className(v) { this.attrs.class = v; }
    get classList() { const s = this; return { add: c => { s.attrs.class = [...new Set((s.className + ' ' + c).trim().split(/\s+/))].join(' '); }, remove: c => { s.attrs.class = s.className.split(/\s+/).filter(x => x && x !== c).join(' '); }, contains: c => s.className.split(/\s+/).includes(c) }; }
    get textContent() { return this.children.map(c => typeof c === 'string' ? c : c.textContent).join(''); } set textContent(v) { this.children = v === '' ? [] : [String(v)]; }
    appendChild(c) { this.children.push(c); return c; } insertBefore(c) { this.children.unshift(c); return c; } get firstChild() { return this.children[0] || null; }
    setAttribute(k, v) { this.attrs[k] = String(v); } getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
    removeAttribute(k) { delete this.attrs[k]; }
    addEventListener(t, f) { (this.on[t] = this.on[t] || []).push(f); } fire(t, ev) { (this.on[t] || []).forEach(f => f(ev || {})); }
    focus() { shim.focused = this; } scrollIntoView() {}
    all() { const o = []; (function w(n) { n.children.forEach(c => { if (typeof c !== 'string') { o.push(c); w(c); } }); })(this); return o; }
    match(sel) { if (sel === 'input') return this.tagName === 'input'; if (sel[0] === '.') return this.classList.contains(sel.slice(1)); const m = sel.match(/^\[([\w-]+)\](?::not\(\[([\w-]+)\]\))?$/); return m && m[1] in this.attrs && !(m[2] && m[2] in this.attrs); }
    querySelector(sel) { return this.all().find(n => n.match(sel)) || null; } querySelectorAll(sel) { return this.all().filter(n => n.match(sel)); }
  }
  for (const k of ['type', 'value', 'checked', 'name', 'href', 'target', 'rel']) Object.defineProperty(N.prototype, k, { get() { return this.p[k]; }, set(v) { this.p[k] = v; } });
  const body = new N('body'), store = new Map(), hist = [null], listeners = {};
  const shim = { focused: null };
  globalThis.document = { documentElement: { lang: 'en', scrollHeight: 900 }, createElement: t => new N(t), createTextNode: t => String(t), querySelectorAll: s => body.querySelectorAll(s) };
  globalThis.window = { addEventListener: (t, f) => (listeners[t] = listeners[t] || []).push(f), removeEventListener: (t, f) => { listeners[t] = (listeners[t] || []).filter(x => x !== f); }, requestAnimationFrame: f => raf.push(f) };
  globalThis.window.top = globalThis.window; globalThis.window.self = globalThis.window;
  // SECURITY.md promises the answers go nowhere. That promise used to be guarded
  // by counting the word postMessage in the source, so an engine amended to post
  // the whole session to any framing origin kept the harness green. Here the send
  // is observed: framed or not, and with every message it produces kept.
  const sent = [];
  // The three promises of SECURITY.md, observed rather than grepped. A word can
  // be split, a call can hide after a string holding "https://"; a trap cannot be
  // talked out of firing. sessionStorage stays real: the engine is meant to use it.
  const touched = [];
  const trap = name => (...a) => { touched.push(name + '(' + a.length + ')'); throw new Error('forbidden: ' + name); };
  globalThis.fetch = trap('fetch');
  globalThis.XMLHttpRequest = function () { touched.push('XMLHttpRequest'); };
  globalThis.WebSocket = function () { touched.push('WebSocket'); };
  globalThis.EventSource = function () { touched.push('EventSource'); };
  globalThis.importScripts = trap('importScripts');
  // navigator is read-only on some Node versions: define it, or leave the real
  // one alone and trap the one the engine would actually reach through window.
  try { Object.defineProperty(globalThis, 'navigator', { value: { sendBeacon: trap('sendBeacon') }, configurable: true }); }
  catch (e) { /* the window one below is the reachable path */ }
  globalThis.window.navigator = { sendBeacon: trap('sendBeacon') };
  globalThis.localStorage = {
    getItem: trap('localStorage.getItem'), setItem: trap('localStorage.setItem'),
    removeItem: trap('localStorage.removeItem'), clear: trap('localStorage.clear')
  };
  globalThis.window.fetch = globalThis.fetch;
  globalThis.window.localStorage = globalThis.localStorage;
  globalThis.window.XMLHttpRequest = globalThis.XMLHttpRequest;
  globalThis.window.parent = { postMessage: (data, origin) => sent.push({ data: structuredClone(data), origin }) };
  const framed = on => { globalThis.window.top = on ? { framed: true } : globalThis.window; };
  // A real browser structured-clones the pushed state. Keeping a live reference
  // here made the harness green on a broken engine: the fake saw an answer that
  // was ticked after the snapshot had been taken.
  globalThis.history = {
    pushState: s => hist.push(structuredClone(s)),
    replaceState: s => { if (hist.length) hist[hist.length - 1] = structuredClone(s); else hist.push(structuredClone(s)); },
    back: () => { hist.pop(); (listeners.popstate || []).forEach(f => f({ state: hist[hist.length - 1] })); }
  };
  globalThis.sessionStorage = { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) };
  globalThis.location = { hostname: '' };
  const flush = () => { while (raf.length) raf.shift()(); };

  const root = new N('div'); body.appendChild(root);
  const inst = AI_GO.mount(root, unsigned, { lang: 'en', storageKey: 'test' });
  ok('a double-clicked file mounts in preview mode with an empty hostname',
    !!inst && inst.mode === 'preview' && inst.issues.length > 0);
  ok('the preview banner comes first and counts the open points',
    root.firstChild.className === 'aigo-banner' && root.firstChild.textContent.includes(String(inst.issues.length)));

  // ---- T2, point 4: the preview says what it counts -----------------------
  // The banner counted and stopped there. A data protection officer opened her
  // file by double-click, read "1 item to complete", and had to carry the file
  // to check.html to learn that the field was `jurisdiction`. The local preview
  // is the only screen somebody who does not program ever sees of this check.
  ok('the preview lists the points it counts, one line per point',
    root.firstChild.querySelectorAll('.aigo-issues').length === 1 &&
    root.firstChild.querySelector('.aigo-issues').children.length === inst.issues.length,
    String(root.firstChild.textContent).slice(0, 120));
  ok('each line names the field first, then carries the sentence',
    inst.issues.every(i => root.firstChild.querySelector('.aigo-issues').children
      .some(li => li.textContent.indexOf(i.path) === 0 && li.textContent.includes(i.message))),
    String(root.firstChild.textContent).slice(0, 200));
  {
    // The two screens are drawn by one function, so they cannot say different
    // things: the same tree, refused strictly, names the same points.
    const strictRoot = new N('div');
    AI_GO.mount(strictRoot, unsigned, { mode: 'strict', lang: 'en', storageKey: null, history: false });
    const said = n => n.querySelector('.aigo-issues').children.map(li => li.textContent).sort();
    ok('the local preview and the strict refusal name the same points, sentence for sentence',
      said(strictRoot).length > 0 &&
      JSON.stringify(said(root.firstChild)) === JSON.stringify(said(strictRoot)),
      JSON.stringify(said(root.firstChild)).slice(0, 160));
  }
  ok('live region: role=status, aria-live=polite, screen-reader only',
    root.querySelectorAll('[role]').some(x => x.attrs.role === 'status' && x.attrs['aria-live'] === 'polite' && x.classList.contains('aigo-sr-only')));
  ok('the question title is an h2 with tabindex=-1',
    root.querySelector('.aigo-title').tagName === 'h2' && root.querySelector('.aigo-title').attrs.tabindex === '-1');
  ok('every button has type=button, so a CMS form is never submitted',
    root.all().filter(x => x.tagName === 'button').every(b => b.type === 'button'));
  ok('no Back button on the first question', !root.querySelector('.aigo-btn-ghost'));
  const yes = root.querySelectorAll('input').find(i => i.value === 'yes');
  yes.fire('click', { detail: 0 });
  ok('a keyboard click (detail 0) on a radio selects without navigating', inst.node === 'q1');
  root.querySelector('.aigo-btn-primary').fire('click');
  ok('Continue without a choice stays put and moves the focus to the first option',
    inst.node === 'q1' && shim.focused && shim.focused.tagName === 'input');
  yes.checked = true; yes.fire('change'); yes.fire('click', { detail: 1 });
  flush();
  ok('a mouse click on a radio advances', inst.node === 'q2');
  // The example ships in two languages, so a title is an object: what the live
  // region announces is the title in the language this instance was mounted in.
  const inLang = (v, l) => (v && typeof v === 'object' && !Array.isArray(v) ? v[l] : v);
  ok('the step change is announced with the step label',
    root.querySelector('[role]').textContent === 'Step 2 of 3: ' + inLang(base.nodes.q2.title, 'en'),
    root.querySelector('[role]').textContent);
  ok('a checkbox question uses fieldset and a legend that repeats the question',
    // An empty legend is still a legend, and announces nothing: assert the words.
    !!root.querySelector('.aigo-fieldset') &&
    root.querySelector('.aigo-fieldset').firstChild.tagName === 'legend' &&
    root.querySelector('.aigo-fieldset').firstChild.textContent === inLang(base.nodes.q2.title, 'en'),
    root.querySelector('.aigo-fieldset').firstChild.textContent);
  ok('the question title takes the focus after a navigation', shim.focused === root.querySelector('.aigo-title'));
  const health = root.querySelectorAll('input').find(i => i.value === 'health');
  health.checked = true; health.fire('change');
  root.querySelector('.aigo-btn-primary').fire('click');
  ok('a ticked box routes through ifAnyResult', inst.result === 'restricted' && inst.node === null);
  ok('the result title is a heading, focusable, and carries the verdict',
    // <strong> is not a heading, and heading navigation is how a screen reader
    // user reaches the verdict: the tag itself is the guarantee.
    /^h[1-6]$/.test(root.querySelector('.aigo-result-title').tagName) &&
    root.querySelector('.aigo-result-title').attrs.tabindex === '-1' &&
    root.querySelector('.aigo-result-title').textContent.length > 0,
    root.querySelector('.aigo-result-title').tagName);
  ok('the disclaimer is rendered with its text, not just its box',
    !!root.querySelector('.aigo-disclaimer') && root.querySelector('.aigo-disclaimer').textContent.length > 20,
    String((root.querySelector('.aigo-disclaimer') || {}).textContent).length);
  ok('an external link opens in a new tab, with noopener and a spoken mention',
    root.querySelectorAll('.aigo-link').every(a => a.target === '_blank' && a.rel === 'noopener noreferrer' && a.querySelector('.aigo-sr-only')));
  ok('a link outside the publisher domains is shown with its host next to the label',
    root.querySelectorAll('.aigo-foreign-host').length === 2 &&
    root.querySelector('.aigo-foreign-host').textContent.includes('example.org'));
  ok('the footer carries the fingerprint and the engine version',
    root.querySelector('.aigo-content-id').textContent.includes(AI_GO.fingerprint(base)) &&
    root.querySelector('.aigo-content-id').textContent.includes(AI_GO.version));

  /* ---- LA BANNIÈRE DE PÉREMPTION EST DESSINÉE, PAS SEULEMENT CALCULÉE ----- */
  // Trois mutations survivaient au même trou : le pied de page n'était jamais
  // monté avec une relecture vieille. `if (false && age > ...)`, un seuil
  // multiplié par cent, et `>` changé en `>=` laissaient le harnais vert, et un
  // lecteur recevait sous les yeux une recommandation juridique périmée sans un
  // mot. Le nombre 548 était vérifié comme un nombre écrit dans un fichier,
  // jamais comme une bannière qui apparaît. Et on l'éprouve aux DEUX jours qui
  // bordent la limite, parce qu'une borne vérifiée à quarante jours de distance
  // ne dit pas de quel côté elle tombe.
  {
    const dayOff = n => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
    const agedTree = days => ({
      id: 'aged-example', langs: ['en'], defaultLang: 'en', start: 'q1',
      publisher: { name: 'Example UAS', domains: ['example-uas.ch'] },
      review: { by: 'Legal service', date: dayOff(days) },
      jurisdiction: 'CH-VD', legalBasis: ['FADP'], disclaimer: 'Not legal advice.',
      steps: [{ id: 's', name: 'Step' }],
      nodes: { q1: { type: 'single', step: 's', title: 'A question?',
        answers: [{ value: 'a', label: 'Yes', result: 'r' }] } },
      results: { r: { level: 'info', step: 's', title: 'A result', solution: { text: 'Do this.' } } },
      links: {}
    });
    // Monte, coche l'unique réponse, avance : le pied de page n'existe qu'au résultat.
    const bannersAt = days => {
      const r = new N('div'); body.appendChild(r);
      const i = AI_GO.mount(r, agedTree(days), { lang: 'en', storageKey: null, history: false, mode: 'preview' });
      const box = r.querySelectorAll('input').find(x => x.value === 'a');
      box.checked = true; box.fire('change');
      r.querySelector('.aigo-btn-primary').fire('click');
      return { seen: i.result === 'r', banner: r.querySelectorAll('.aigo-review-expired') };
    };
    const fresh = bannersAt(10), stale = bannersAt(600);
    ok('a result is reached and its footer drawn, which is where the review is spoken about',
      fresh.seen && stale.seen);
    ok('a review read ten days ago draws no expiry banner',
      fresh.banner.length === 0, fresh.banner.map(b => b.textContent).join(' | '));
    ok('a review read six hundred days ago draws one, and it names the shelf life',
      stale.banner.length === 1 && stale.banner[0].textContent.includes(String(AI_GO.POLICY.reviewMaxDays)),
      stale.banner.map(b => b.textContent).join(' | '));
    // LA BORNE, PRISE DE CHAQUE CÔTÉ. 548 est le dernier jour sans bannière.
    const max = AI_GO.POLICY.reviewMaxDays;
    ok(`the last day inside the shelf life, day ${max}, draws nothing`,
      bannersAt(max).banner.length === 0, 'jour ' + max);
    ok(`and the first day past it, day ${max + 1}, draws the banner`,
      bannersAt(max + 1).banner.length === 1, 'jour ' + (max + 1));
  }

  /* ---- L'ERREUR DE SAISIE EXISTE POUR L'OEIL AUSSI ----------------------- */
  // WCAG 3.3.1 demande que l'erreur soit decrite SOUS FORME DE TEXTE. Le seul
  // texte vivait dans la region annoncee : une personne voyante qui cliquait
  // « Continuer » sans avoir repondu voyait un ecran identique au caractere
  // pres, mesure a zero difference sur la serialisation complete du DOM, et
  // concluait que le bouton etait casse. Le miroir de la panne habituelle.
  {
    const asked = {
      id: 'ask-example', langs: ['en'], defaultLang: 'en', start: 'q1',
      publisher: { name: 'Example UAS', domains: ['example-uas.ch'] },
      review: { by: 'Legal service', date: '2026-06-01' },
      jurisdiction: 'CH-VD', legalBasis: ['FADP'], disclaimer: 'Not legal advice.',
      steps: [{ id: 's', name: 'Step' }],
      nodes: { q1: { type: 'single', step: 's', title: 'A question?',
        answers: [{ value: 'a', label: 'Yes', result: 'r' }, { value: 'b', label: 'No', result: 'r' }] } },
      results: { r: { level: 'info', step: 's', title: 'A result', solution: { text: 'Do this.' } } },
      links: {}
    };
    const r = new N('div'); body.appendChild(r);
    const i2 = AI_GO.mount(r, asked, { lang: 'en', storageKey: null, history: false, mode: 'preview' });
    const visible = () => r.all().filter(x => !x.classList.contains('aigo-sr-only'))
      .map(x => x.textContent).join(' ');
    const avant = visible();
    r.querySelector('.aigo-btn-primary').fire('click');
    ok('a question left unanswered does not advance', i2.result === null);
    ok('and the refusal is written on the screen, not only in the region a screen reader hears',
      visible() !== avant && r.querySelectorAll('.aigo-choose').length === 1,
      r.querySelectorAll('.aigo-choose').map(x => x.textContent).join(' | '));
    // Deux clics ne l'empilent pas : une erreur repetee reste une erreur.
    r.querySelector('.aigo-btn-primary').fire('click');
    ok('a second click does not stack a second copy of it',
      r.querySelectorAll('.aigo-choose').length === 1,
      String(r.querySelectorAll('.aigo-choose').length));
    // Et une fois la reponse donnee, elle ne suit pas le lecteur au resultat.
    const box = r.querySelectorAll('input').find(x => x.value === 'a');
    box.checked = true; box.fire('change');
    r.querySelector('.aigo-btn-primary').fire('click');
    ok('and it is gone once the question is answered',
      i2.result === 'r' && r.querySelectorAll('.aigo-choose').length === 0,
      String(r.querySelectorAll('.aigo-choose').length));

    /* ---- UNE ETIQUETTE VIDE NE VIDE PAS LE BOUTON --------------------------
     * La superposition des libelles verifiait la CLE et jamais la VALEUR : une
     * chaine vide, un null, un nombre ou un tableau remplacaient le libelle que
     * le lecteur doit cliquer, et le verdict disait « publiable ». Cette epreuve
     * a d'abord ete ecrite comme du CODE MORT -- une fonction d'aide jamais
     * appelee, et une assertion qui se bornait a constater que le moteur a des
     * libelles. Elle monte maintenant, et lit le bouton. */
    const labelOf = v => {
      const t = JSON.parse(JSON.stringify(asked));
      t.ui = { en: { continue: v } };
      const rr = new N('div'); body.appendChild(rr);
      AI_GO.mount(rr, t, { lang: 'en', storageKey: null, history: false, mode: 'preview' });
      const btn = rr.querySelector('.aigo-btn-primary');
      return btn ? String(btn.textContent) : null;
    };
    const propre = labelOf('Carry on');
    ok('a label the tree writes is the one the reader clicks',
      propre === 'Carry on', JSON.stringify(propre));
    const VIDES = [['la chaîne vide', ''], ['null', null], ['un nombre', 42],
      ['un tableau', ['Weiter']], ['des espaces seulement', '   ']];
    const vides = VIDES.filter(([, v]) => {
      const t = labelOf(v);
      return !t || !t.trim() || t === '42' || t === 'Weiter';
    });
    ok(`none of the ${VIDES.length} empty or wrong-typed labels reaches the button`,
      vides.length === 0, vides.map(x => x[0]).join(' | '));
  }

  /* ---- CE QUE LE LECTEUR VOIT, ET CE QUE LA SYNTHESE NOMME ---------------- */
  {
    /* LES DEUX LISTES DU VERDICT portaient le meme nom -- aucun. « autorise » et
     * « interdit » arrivaient l'une comme l'autre en « liste, N elements », et
     * la seule chose qui les distingue est au-dessus, hors de la liste. */
    const rr = new N('div'); body.appendChild(rr);
    const iv = AI_GO.mount(rr, signed, { lang: 'en', storageKey: null, history: false, mode: 'preview' });
    const walk = () => {
      let n = 0;
      while (iv.result === null && n < 12) {
        const box = rr.querySelectorAll('input')[0];
        if (!box) break;
        box.checked = true; box.fire('change');
        const b = rr.querySelector('.aigo-btn-primary'); if (!b) break;
        b.fire('click'); n++;
      }
      return iv.result;
    };
    walk();
    const listes = rr.querySelectorAll('.aigo-list');
    const sansNom = listes.filter(u => !u.attrs['aria-label']);
    ok('every list in the verdict carries the name of its own block',
      listes.length > 0 && sansNom.length === 0,
      listes.length + ' liste(s), ' + sansNom.length + ' sans nom');
    const noms = listes.map(u => u.attrs['aria-label']);
    ok('and two lists in the same verdict are not given the same name',
      new Set(noms).size === noms.length, JSON.stringify(noms));

    /* LA BOITE « CHARGEMENT IMPOSSIBLE » n'avait recu aucune des deux
     * corrections que sa jumelle avait recues, alors qu'elle est parfois la
     * seule chose que la page affiche. */
    const orphan = new N('div');
    orphan.setAttribute('data-ai-go', 'PAS_LA');
    const sc = new N('div'); sc.appendChild(orphan);
    AI_GO.mountAll(sc);
    const bad = orphan.querySelector('.aigo-error');
    ok('the box shown when the questionnaire cannot be loaded is an alert, in a language, with a heading',
      !!bad && bad.attrs.role === 'alert' && !!bad.attrs.lang &&
      bad.all().some(x => /^h[1-6]$/.test(x.tagName) && x.attrs.tabindex === '-1'),
      bad ? JSON.stringify({ role: bad.attrs.role, lang: bad.attrs.lang,
        titre: bad.all().filter(x => /^h[1-6]$/.test(x.tagName)).map(x => x.tagName) }) : 'aucune boîte');
  }

  /* ---- A L'IMPRESSION, LES QUATRE GRAVITES RESTENT QUATRE ----------------- */
  // Le raccourci `border` du bloc @media print ecrasait la border-color que les
  // quatre regles de niveau posent : sur le papier qui part au plan de gestion
  // de donnees, « rien ne sort de la machine » et « usage libre » devenaient la
  // meme boite. On lit la feuille du moteur, la ou la regle est ecrite.
  {
    const sheet = CHECK.engineBlock(html);
    const printBlock = (sheet.match(/@media print \{[\s\S]*?\n  \}/) || [''])[0];
    ok('the print stylesheet does not reset the border colour the four levels set',
      /\.aigo-alert \{[^}]*border-style/.test(printBlock) &&
      !/\.aigo-alert \{[^}]*border:\s/.test(printBlock),
      JSON.stringify(((printBlock.match(/\.aigo-alert \{[^}]*\}/) || [''])[0]).slice(0, 90)));
    const levels = (sheet.match(/\.aigo-alert-[a-z]+\s*\{[^}]*border-color/g) || []).length;
    ok('and the four levels each set one, which is what makes them four',
      levels >= 4, levels + ' niveau(x) portant une couleur de bord');
  }




  // ---- what the reader actually reads -------------------------------------
  // The engine composes bold from **two asterisks**, and nothing asserted it: the
  // markers could be changed to anything and "**Avertissement :**" would have
  // been served to the reader with its asterisks showing. This matters twice
  // over, because the same function decides what the guard is supposed to read.
  {
    const held = new N('div'); body.appendChild(held);
    const bold = cp(unsigned);
    // The help of the first question, because it is on the first screen: no
    // navigation, no result, nothing between the mount and what is read.
    bold.nodes[bold.start].help = { fr: '**Gras\u00a0:** puis du droit.', en: '**Bold:** then plain.' };
    const shown = AI_GO.mount(held, bold, { lang: 'en', storageKey: 'bold', mode: 'preview' });
    void shown;
    const box = held.all().filter(x => x.tagName === 'strong');
    ok('the engine draws **two asterisks** as a strong element, and never shows the asterisks',
      box.length >= 1 && box[0].textContent === 'Bold:' && held.textContent.indexOf('**') < 0,
      box.length + ' strong, texte : ' + held.textContent.slice(0, 90));
  }

  // ---- T2, point 5: a state read is a read --------------------------------
  // `path` was copied and `answers` was handed out by reference, so getState()
  // gave a host page the engine's own answer map: writing one key of it moved
  // the reader to another branch, and the next save wrote that to the session.
  // Fixed before this run; asserted here so it stays fixed.
  {
    const rState = new N('div'); body.appendChild(rState);
    const iState = AI_GO.mount(rState, base, { lang: 'en', storageKey: null, history: false, mode: 'preview' });
    iState.answer('q1', 'yes');
    iState.answer('q2', ['health']);
    const a1 = iState.getState(), a2 = iState.getState();
    ok('getState hands out a copy of the answers, not the engine\'s own map',
      a1.answers !== a2.answers && a1.path !== a2.path);
    a1.answers.q1 = 'no';
    ok('writing into that map moves nothing inside the engine',
      iState.getState().answers.q1 === 'yes', String(iState.getState().answers.q1));
    a1.answers.q2.push('legal');
    ok('and the ticked boxes are copied too, the list included',
      JSON.stringify(iState.getState().answers.q2) === JSON.stringify(['health']),
      JSON.stringify(iState.getState().answers.q2));
    iState.destroy();
  }

  // ---- T2, point 1, on the page the reader is served ----------------------
  ok('the footer carries the signature value too, on its own line, after the content one',
    root.querySelectorAll('.aigo-content-id').length === 2 &&
    root.querySelectorAll('.aigo-content-id')[0].textContent.includes(AI_GO.fingerprint(base)) &&
    root.querySelectorAll('.aigo-content-id')[1].textContent.includes(AI_GO.signature(unsigned)),
    root.querySelectorAll('.aigo-content-id').map(p => p.textContent).join(' | '));
  ok('and the container carries it for a right-click inspection',
    root.attrs['data-ai-go-signature'] === AI_GO.signature(unsigned),
    root.attrs['data-ai-go-signature']);
  ok('the container carries the fingerprint for a right-click inspection',
    root.attrs['data-ai-go-content'] === AI_GO.fingerprint(base) &&
    root.attrs['data-ai-go-engine'] === AI_GO.version);
  root.querySelector('.aigo-btn-ghost').fire('click');
  ok('Back pops to the previous question and restores the ticked box',
    inst.node === 'q2' && root.querySelectorAll('input').find(i => i.value === 'health').checked === true);
  inst.restart();
  ok('restart returns to the start node with no answers',
    inst.node === 'q1' && Object.keys(inst.getState().answers).length === 0);
  ok('the session is saved under the storage key', store.has('test:state'));
  inst.destroy();
  ok('destroy empties the container and removes the class',
    root.children.length === 0 && !root.classList.contains('aigo'));

  store.set('test:state', JSON.stringify({ path: ['q1', 'gone'], answers: {}, result: null, tv: base.version, lang: 'en' }));
  const inst2 = AI_GO.mount(root, base, { lang: 'en', storageKey: 'test' }); flush();
  ok('a stale session is rejected, announced, and the tree starts over',
    inst2.node === 'q1' && root.querySelector('[role]').textContent === AI_GO.UI.en.staleError);
  inst2.destroy();
  store.set('test:state', JSON.stringify({ path: ['q1', 'q3'], answers: { q1: 'no' }, result: null, tv: 'other', lang: 'en' }));
  const inst3 = AI_GO.mount(root, base, { lang: 'en', storageKey: 'test' }); flush();
  ok('a session from another tree version is rejected', inst3.node === 'q1');
  inst3.destroy();
  // A session edited by hand, or written before an option was renamed, used to
  // show no ticked box and yet route as though one were ticked: the reader saw
  // an empty question and got the "at least one" verdict.
  store.set('test:state', JSON.stringify({ path: ['q1', 'q2'], answers: { q1: 'yes', q2: ['gone'] },
    result: null, tv: base.version, lang: 'en' }));
  const inst4 = AI_GO.mount(root, base, { lang: 'en', storageKey: 'test' }); flush();
  ok('a session value no option declares is dropped, not trusted',
    JSON.stringify(inst4.getState().answers.q2) === '[]',
    JSON.stringify(inst4.getState().answers));
  root.querySelector('.aigo-btn-primary').fire('click'); flush();
  ok('and the question then routes as the empty answer it looks like',
    inst4.result === base.nodes.q2.next.elseResult || inst4.node === base.nodes.q2.next.else,
    String(inst4.result) + '/' + String(inst4.node));
  inst4.destroy(); store.delete('test:state');

  // A session that claims a verdict its own answers do not reach is refused AND
  // not shown: the state used to be written before the check, and rendered.
  const forged = new N('div'); body.appendChild(forged);
  const firstAnswer = (base.nodes[base.start].answers || [])[0];
  store.set('forged:state', JSON.stringify({
    path: [base.start], answers: { [base.start]: firstAnswer && firstAnswer.value },
    result: Object.keys(base.results)[Object.keys(base.results).length - 1], tv: base.version, lang: 'en' }));
  const iF = AI_GO.mount(forged, unsigned, { lang: 'en', storageKey: 'forged', mode: 'preview' });
  ok('a session claiming a verdict its answers do not reach is refused, and not displayed',
    !!iF && iF.result === null && forged.querySelectorAll('.aigo-result').length === 0,
    iF ? String(iF.result) : 'no mount');
  iF.destroy(); store.delete('forged:state');

console.log('engine: the ticked boxes are a set, and they are the boxes on screen');
section(() => {
  // A duplicate in a stored session showed ONE ticked box, survived the
  // unticking of it, and then routed as "at least one ticked": a wrong legal
  // branch with nothing ticked in front of it.
  const T = {
    id: 'boxes', version: '1.0.0', langs: ['en'], defaultLang: 'en', start: 'q1',
    publisher: { name: 'Example UAS', domains: ['hes-example.ch'] },
    review: { by: 'Legal service', date: '2026-06-01' },
    disclaimer: 'Our own text.',
    steps: [{ id: 's1', name: 'One' }], links: {},
    nodes: { q1: { type: 'multi', step: 's1', polarity: 'direct', title: 'Tick?',
      options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
      next: { ifAnyResult: 'any', elseResult: 'none' } } },
    results: { any: { level: 'info', title: 'AT LEAST ONE' }, none: { level: 'info', title: 'NONE' } }
  };
  const mount = (stored) => {
    const root = new N('div'); body.appendChild(root);
    if (stored) store.set('boxes:state', JSON.stringify(stored)); else store.delete('boxes:state');
    const inst = AI_GO.mount(root, T, { lang: 'en', storageKey: 'boxes', history: false });
    return { root, inst };
  };
  const session = answers => ({ path: ['q1'], answers: answers, result: null, tv: T.version, lang: 'en' });

  const dup = mount(session({ q1: ['a', 'a'] }));
  ok('a session holding one value twice is restored once',
    JSON.stringify(dup.inst.getState().answers.q1) === '["a"]',
    JSON.stringify(dup.inst.getState().answers.q1));
  const boxA = dup.root.querySelectorAll('input').filter(i => i.value === 'a');
  ok('one box, one tick', boxA.length === 1 && boxA[0].checked === true);
  boxA[0].checked = false; boxA[0].fire('change');
  ok('and unticking it empties the answer, leaving no copy behind',
    JSON.stringify(dup.inst.getState().answers.q1) === '[]',
    JSON.stringify(dup.inst.getState().answers.q1));
  dup.root.querySelector('.aigo-btn-primary').fire('click'); flush();
  ok('so the question routes as the empty answer it looks like',
    dup.inst.result === 'none', String(dup.inst.result));
  dup.inst.destroy();

  const ghost = mount(session({ q1: ['gone'] }));
  ghost.root.querySelector('.aigo-btn-primary').fire('click'); flush();
  ok('a value no box declares routes as nothing ticked, not as something ticked',
    ghost.inst.result === 'none', String(ghost.inst.result));
  ghost.inst.destroy();
  store.delete('boxes:state');

  // The public API. The engine's own views cannot call it wrongly; a page can.
  const api = mount(null);
  const refused = [
    ['a question the reader is not standing on', () => api.inst.answer('q9', 'yes')],
    ['a value the question does not offer', () => api.inst.answer('q1', ['ghost'])],
    ['a value that is not even a list', () => api.inst.answer('q1', 'yes')],
    ['the same box twice', () => api.inst.answer('q1', ['a', 'a'])],
    ['a node inherited from Object.prototype', () => api.inst.answer('constructor', 'yes')]
  ];
  // Each call inside a try: a caller that raises is refusing nothing, and an
  // assertion that raises kills the harness instead of failing it.
  const went = refused.filter(([, call]) => {
    let r;
    try { r = call(); } catch (e) { return true; }
    return r !== false || api.inst.result !== null || api.inst.node !== 'q1';
  });
  ok(`the public answer() refuses the ${refused.length} calls a page can get wrong, and moves nobody`,
    went.length === 0, went.map(([l]) => l).join(' | '));
  ok('and it accepts the two a question really offers',
    api.inst.answer('q1', []) === true && api.inst.result === 'none');
  api.inst.destroy();
  const api2 = mount(null);
  ok('a ticked box still routes through ifAny',
    api2.inst.answer('q1', ['b']) === true && api2.inst.result === 'any');
  ok('and a run that has reached its verdict answers nothing more',
    api2.inst.answer('q1', ['a']) === false && api2.inst.result === 'any');
  api2.inst.destroy();

  // ---- the sentence a copy does not get to write ---------------------------
  // derivedFrom buys the right to name the origin, and the price is the sentence
  // saying the origin has not reviewed this adaptation. It was an overridable
  // label: a copy rewrote it into "Certified by {source}" and bought an
  // endorsement, or wrote one space and bought silence, and the receipt moved in
  // neither case. The engine now says it from its own table.
  //
  // THIS IS A SOURCE CHECK, AND IT SAYS SO. Reaching the footer needs a walk to a
  // result, and the walk this shim performs did not advance on a fresh mount; the
  // behavioural version belongs with whoever fixes that. What is asserted here is
  // that the render site reads the engine's table and not the tree's labels.
  {
    const at = engineCode.indexOf("'aigo-attribution'");
    const near = engineCode.slice(Math.max(0, at - 400), at + 200);
    ok('the attribution sentence is drawn from the engine table, never from the tree labels',
      /UI\[/.test(near) && !/s\.attribution/.test(near),
      near.split('\n').slice(0, 3).join(' / '));
    ok('and no other place reads it from the labels either',
      engineCode.indexOf('s.attribution') < 0 && engineCode.indexOf('fmt(s.attribution') < 0);
  }

});

  /* ---- ce qui sort du moteur -------------------------------------------- */
  section(() => {
    sent.length = 0;
    const r2 = new N('div'); body.appendChild(r2);
    const i2 = AI_GO.mount(r2, signed, { lang: 'en', storageKey: 'post', mode: 'preview' });
    const answerThrough = () => {
      for (let guard = 0; guard < 12 && i2 && !i2.result; guard++) {
        const box = r2.querySelectorAll('input').find(x => !x.checked);
        if (!box) break;
        box.checked = true; box.fire('change'); box.fire('click', { detail: 1 });
        const go = r2.querySelector('.aigo-btn-primary');
        if (go) go.fire('click');
        flush();
      }
    };
    // Top-level page: nothing at all may leave, whatever the reader does.
    framed(false); answerThrough();
    ok('a page that is not framed sends nothing at all', sent.length === 0, JSON.stringify(sent).slice(0, 200));
    // Framed: the height, and only ever the height.
    framed(true); sent.length = 0;
    const r3 = new N('div'); body.appendChild(r3);
    const i3 = AI_GO.mount(r3, signed, { lang: 'en', storageKey: 'post3', mode: 'preview' });
    void i3; answerThrough();
    ok('framed, the engine does send, so the assertion below is not vacuous', sent.length > 0, String(sent.length));
    const shape = sent.filter(m => {
      const k = Object.keys(m.data || {}).sort().join(',');
      return k !== 'aigo,px' || m.data.aigo !== 'height' || typeof m.data.px !== 'number';
    });
    ok('every outbound message carries the height and nothing else, key for key',
      shape.length === 0, JSON.stringify(shape.slice(0, 2)));
    // Belt and braces: no word the reader ever chose may appear in what goes out.
    const said = JSON.stringify(sent);
    const secrets = [];
    Object.keys(signed.nodes).forEach(id => {
      const list = x => Array.isArray(x) ? x : [];
      list(signed.nodes[id].answers).concat(list(signed.nodes[id].options)).forEach(a => {
        if (a && a.value && said.indexOf(String(a.value)) >= 0) secrets.push(id + '=' + a.value);
      });
    });
    Object.keys(signed.results).forEach(id => { if (said.indexOf(id) >= 0) secrets.push('result ' + id); });
    ok('not one answer value and not one result id leaves the page',
      secrets.length === 0, secrets.join(', ') + ' in ' + said.slice(0, 160));
    ok('through a whole run the engine touches no network API and no localStorage, whatever they are called',
      touched.length === 0, touched.join(', '));
    framed(false);
  });

  // ---- sweep 3: every way a saved session can contradict the tree
  // A forged session displayed a verdict; the check was added; the state was
  // still written before the check ran, and it displayed the verdict again. Two
  // audits, two spellings of one hole. Here the sessions are not written by
  // hand: every real route of the tree is taken, and every way of corrupting one
  // is applied to it. None of them may put a verdict on screen, none may throw,
  // and the untouched route must still resume, or a mount that refuses
  // everything would pass this sweep without doing anything.
  {
    const trees = [['the delivered tree', unsigned]].concat(hasReference ? [['the frozen tree', unil]] : []);
    let shown = [], threw = [], lost = [], mounted = 0;
    for (const [label, T] of trees) {
      const routes = CHECK.paths(T).filter(p => p.result && p.steps.length);
      const value = (nodeId, choice) => {
        const n = T.nodes[nodeId];
        if (n.type !== 'multi') return choice;
        return choice === 'any' ? [(n.options || [])[0].value] : [];
      };
      const sessionOf = p => ({
        path: p.steps.map(s => s.node),
        answers: p.steps.reduce((a, s) => { a[s.node] = value(s.node, s.choice); return a; }, {}),
        result: p.result, tv: T.version, lang: 'en'
      });
      const otherResult = Object.keys(T.results);
      // Each mutation says in one line why the session it produces cannot be
      // true of this tree. `keep` marks the ones that stay true and must resume.
      const MUTATIONS = [
        ['the verdict is one these answers do not reach', s => otherResult.filter(r => r !== s.result)
          .map(r => ({ ...s, result: r }))],
        ['the verdict does not exist in the tree', s => [{ ...s, result: 'no-such-result' }]],
        ['the first answer is gone', s => [{ ...s, answers: dropKey(s.answers, s.path[0]) }]],
        ['an answer in the middle is gone', s => s.path.length < 3 ? []
          : [{ ...s, answers: dropKey(s.answers, s.path[1]) }]],
        ['an answer the tree no longer offers', s => [{ ...s, answers: { ...s.answers, [s.path[0]]: 'gone' } }]],
        ['the path skips a question it answered', s => s.path.length < 3 ? []
          : [{ ...s, path: s.path.filter((_, i) => i !== 1) }]],
        ['the path invents a question', s => [{ ...s, path: [s.path[0], s.path[0]].concat(s.path.slice(1)) }]],
        ['the path names a question the tree does not have', s => [{ ...s, path: s.path.concat(['ghost']) }]],
        ['the path is empty', s => [{ ...s, path: [] }]],
        ['the path is not a list', s => [{ ...s, path: s.path[0] }, { ...s, path: null }, { ...s, path: {} }]],
        ['the answers are not an object', s => [{ ...s, answers: 'x' }, { ...s, answers: null },
          { ...s, answers: [] }, { ...s, answers: 7 }]],
        ['the tree version is another one', s => [{ ...s, tv: 'other' }]],
        ['a verdict is claimed from the first question', s => [{ path: [T.start], answers: {},
          result: s.result, tv: T.version, lang: 'en' }]],
        ['nothing at all', () => [null, {}, [], 'x', 7, { path: [T.start] }]],
        ['nothing is wrong with it', s => [s, { ...s, lang: 'zz' }], true]
      ];
      for (const p of routes) {
        const base = sessionOf(p);
        for (const [why, make, keep] of MUTATIONS) {
          for (const state of make(base)) {
            const host = new N('div'); body.appendChild(host);
            store.set('sw3:state', JSON.stringify(state));
            let inst = null;
            mounted++;
            try { inst = AI_GO.mount(host, T, { lang: 'en', storageKey: 'sw3', history: false, mode: 'preview' }); }
            catch (e) { threw.push(label + ': ' + why + ': ' + e.message); store.delete('sw3:state'); continue; }
            const verdict = !!inst && (inst.result !== null || host.querySelectorAll('.aigo-result').length > 0);
            if (keep && !verdict) lost.push(label + ': ' + why + ': ' + JSON.stringify(state).slice(0, 90));
            if (!keep && verdict) shown.push(label + ': ' + why + ': ' + JSON.stringify(state).slice(0, 90));
            if (inst) inst.destroy();
            store.delete('sw3:state');
          }
        }
      }
    }
    ok(`${mounted} sessions, forged from every route of ${trees.length} tree(s), never crash a mount`,
      threw.length === 0, threw.slice(0, 4).join(' | '));
    ok('not one incoherent session puts a verdict on screen',
      shown.length === 0, shown.slice(0, 4).join(' | '));
    ok('and a session that is still true of the tree resumes and shows its verdict',
      lost.length === 0, lost.slice(0, 4).join(' | '));
  }

  const r2 = new N('div');
  ok('strict mode refuses unsigned content: null, role=alert, one item per point',
    AI_GO.mount(r2, unsigned, { mode: 'strict' }) === null && r2.firstChild.attrs.role === 'alert' &&
    r2.querySelectorAll('.aigo-error').length === 1 &&
    r2.all().filter(x => x.tagName === 'li').length === AI_GO.guard(unsigned, '').length);
  const r2b = new N('div');
  const brokenTarget = cp(signed); brokenTarget.nodes.q1.answers[0].to = 'nowhere';
  ok('strict mode refuses a tree whose target resolves nowhere',
    AI_GO.mount(r2b, brokenTarget, { mode: 'strict' }) === null && r2b.firstChild.attrs.role === 'alert');
  const r3 = new N('div');
  ok('a missing tree renders the load error',
    AI_GO.mount(r3, null, { lang: 'en' }) === null && r3.textContent === AI_GO.UI.en.loadError);

  const r4 = new N('div');
  r4.setAttribute('data-ai-go', 'T_SIGNED'); r4.setAttribute('data-lang', 'en'); r4.setAttribute('data-heading-level', '3');
  body.appendChild(r4);
  globalThis.window.T_SIGNED = signed;
  const made = AI_GO.mountAll();
  ok('mountAll mounts by attribute and honours data-lang and data-heading-level',
    made.length === 1 && made[0].lang === 'en' && r4.querySelector('.aigo-title').tagName === 'h3');
  ok('mountAll is idempotent', AI_GO.mountAll().length === 0);
  const rHist = new N('div'); rHist.setAttribute('data-ai-go', 'T_SIGNED'); rHist.setAttribute('data-history', 'false');
  body.appendChild(rHist);
  const depth = hist.length;
  ok('data-history="false" mounts without pushing a browser history entry',
    AI_GO.mountAll().length === 1 && hist.length === depth);

  /* ---- DEUX QUESTIONNAIRES SUR UNE PAGE ---------------------------------- */
  // Les deux prenaient l'historique, et le second remplacait l'entree du premier
  // sous lui : le bouton Retour du premier mourait au premier clic. Le guide
  // demandait a l'integrateur d'y penser, et decrivait le symptome inverse.
  {
    /* UN DOCUMENT PROPRE. La marque d'historique se cherche desormais dans le
     * DOCUMENT et non dans la portee -- c'est ce qui empeche deux appels a
     * mountAll de la donner deux fois -- alors les conteneurs que les epreuves
     * precedentes ont laisses la porteraient encore. */
    body.querySelectorAll('[data-ai-go-history]').forEach(x => x.removeAttribute('data-ai-go-history'));
    const deux = ['A', 'B'].map(() => {
      const d = new N('div'); d.setAttribute('data-ai-go', 'T_SIGNED'); body.appendChild(d); return d;
    });
    const scope = new N('div');
    deux.forEach(d => scope.appendChild(d));
    globalThis.T_SIGNED = signed;
    const faits = AI_GO.mountAll(scope);
    ok('two containers on one page both mount', faits.length === 2, String(faits.length));
    const prennent = faits.filter(x => x && x.useHistory).length;
    ok('and exactly one of them takes the browser history, so neither Back button is eaten',
      prennent === 1, prennent + ' sur 2');
    // Et un conteneur seul le prend toujours : la regle n'en prive personne.
    body.querySelectorAll('[data-ai-go-history]').forEach(x => x.removeAttribute('data-ai-go-history'));
    const seul = new N('div'); seul.setAttribute('data-ai-go', 'T_SIGNED');
    const scope2 = new N('div'); scope2.appendChild(seul);
    const fait2 = AI_GO.mountAll(scope2);
    ok('a page carrying one questionnaire still gives it the history',
      fait2.length === 1 && fait2[0].useHistory === true);
    /* ET SUR DEUX PORTEES, ce qui est le cas d'une application qui monte un
     * second widget apres coup. La marque etait cherchee dans la portee : les
     * deux appels ne se voyaient pas, les deux prenaient l'historique, et le
     * symptome revenait en pire, le Retour du premier deplacant le second. */
    body.querySelectorAll('[data-ai-go-history]').forEach(x => x.removeAttribute('data-ai-go-history'));
    const p1 = new N('div'); p1.setAttribute('data-ai-go', 'T_SIGNED'); body.appendChild(p1);
    const p2 = new N('div'); p2.setAttribute('data-ai-go', 'T_SIGNED'); body.appendChild(p2);
    const s1 = new N('div'); s1.appendChild(p1);
    const s2 = new N('div'); s2.appendChild(p2);
    const m1 = AI_GO.mountAll(s1), m2 = AI_GO.mountAll(s2);
    const pris = m1.concat(m2).filter(x => x && x.useHistory).length;
    ok('two separate calls to mountAll still hand the history to one questionnaire only',
      m1.length === 1 && m2.length === 1 && pris === 1, pris + ' sur 2');
    /* ET LA MARQUE EST RENDUE A LA DESTRUCTION : sans quoi le questionnaire
     * encore vivant ne pourrait plus jamais la prendre. */
    body.querySelectorAll('[data-ai-go-history]').forEach(x => x.removeAttribute('data-ai-go-history'));
    const p3 = new N('div'); p3.setAttribute('data-ai-go', 'T_SIGNED'); body.appendChild(p3);
    const s3 = new N('div'); s3.appendChild(p3);
    AI_GO.mountAll(s3)[0].destroy();
    /* LA PROFONDEUR SURVIVAIT A UNE REPRISE DE SESSION. Portee par la seule
     * instance, elle comptait ce qu'une visite PRECEDENTE avait poussé : le
     * bouton Retour de la page appelait alors history.back() sur des entrées
     * qui n'étaient pas les siennes, et faisait sortir le lecteur de la page. */
    {
      const marques = hist.filter(h => h && h.aigo).map(h => h.d);
      ok('every history entry this engine writes carries the depth it was written at',
        marques.length > 0 && marques.every(d => typeof d === 'number'),
        JSON.stringify(marques.slice(0, 8)));
      ok('and the first of them is zero, so a Back to it leaves nothing to pop',
        marques[0] === 0 || marques[0] === 1, String(marques[0]));
    }
    ok('and a destroyed container gives the history mark back',
      p3.getAttribute('data-ai-go-history') === null &&
      p3.getAttribute('data-ai-go-mounted') === '1',
      JSON.stringify({ hist: p3.getAttribute('data-ai-go-history'), monte: p3.getAttribute('data-ai-go-mounted') }));
    delete globalThis.T_SIGNED;
  }

  /* ---- CE QU'UNE CORRECTION D'HIER S'ETAIT ARRETEE UN PAS AVANT ---------- */
  // Une re-mesure a repris chaque correctif annonce et l'a rejoue. Six ne
  // tenaient pas jusqu'a leur propre invariant. Ceux-ci sont les plus couteux.
  {
    globalThis.T_SIGNED = signed;

    /* destroy() RENDAIT LA CLE A CHAQUE APPEL. Appele deux fois, il liberait la
     * reservation d'une instance VIVANTE : la suivante retombait sur sa cle,
     * deux questionnaires partageaient une session, et l'un pouvait montrer a
     * son lecteur la branche juridique de l'autre. */
    const mk = () => {
      const d = new N('div'); body.appendChild(d);
      return AI_GO.mount(d, signed, { lang: 'en', history: false, mode: 'preview' });
    };
    const x = mk(); const kx = x.storageKey;
    x.destroy();
    const y = mk(); const ky = y.storageKey;
    x.destroy();                       // le second appel, celui qui faisait le mal
    const z = mk(); const kz = z.storageKey;
    ok('a key released once is not released twice, so two live instances never share a session',
      ky !== kz, JSON.stringify({ kx, ky, kz }));

    /* data-heading-level HORS BORNES. Le moteur borne a 1..6 ; rien ne le
     * verifiait, et « 9 » aurait ecrit un <h9>, qui n'existe pas. */
    const levelOf = v => {
      const d = new N('div');
      d.setAttribute('data-ai-go', 'T_SIGNED');
      if (v !== null) d.setAttribute('data-heading-level', v);
      const sc = new N('div'); sc.appendChild(d);
      AI_GO.mountAll(sc);
      const t = d.querySelector('.aigo-title');
      return t ? t.tagName : null;
    };
    // « 0 » retombe sur le niveau par defaut, comme une valeur inventee :
    // parseInt('0') vaut zero, que le repli || traite comme une absence.
    const HORS = [['9', 'h6'], ['-1', 'h1'], ['0', 'h2'], ['abc', 'h2'], ['3', 'h3']];
    const debordent = HORS.filter(([v, want]) => levelOf(v) !== want);
    ok(`the heading level stays inside h1..h6 for the ${HORS.length} values tried, invented ones included`,
      debordent.length === 0, debordent.map(([v]) => v + ' -> ' + levelOf(v)).join(', '));

    /* L'ANCRAGE DE isLocalHost. Un hote qui CONTIENT « localhost » ne doit pas
     * desarmer la declaration de domaine : « notlocalhost.example » est un vrai
     * nom d'hote, que quelqu'un peut posseder. */
    const ancre = AI_GO.guard(cp(signed), 'notlocalhost.attacker.example');
    ok('a hostname that merely contains "localhost" is not read as a local preview',
      ancre.some(i => i.path === 'publisher.domains'),
      JSON.stringify(ancre.map(i => i.path)));

    delete globalThis.T_SIGNED;
  }

  /* ---- LES ATTRIBUTS DE CONTENEUR QUE LA DOCUMENTATION PROMET ------------- */
  // Un audit par mutation a rendu trois d'entre eux inertes sans qu'une seule
  // des assertions bouge, alors que docs/INTEGRATE.md et SECURITY.md les
  // nomment. Chacun est monte SEUL, dans sa propre portee : monte a la suite
  // d'un autre, data-history="false" passait pour une autre raison.
  {
    globalThis.T_SIGNED = signed;
    const seul = attrs => {
      const d = new N('div');
      d.setAttribute('data-ai-go', 'T_SIGNED');
      Object.keys(attrs).forEach(k => d.setAttribute(k, attrs[k]));
      const sc = new N('div'); sc.appendChild(d);
      return { inst: AI_GO.mountAll(sc)[0], root: d };
    };
    const ATTRS = [
      ['data-mode="strict" refuse au lieu de prévisualiser',
        { 'data-mode': 'strict' }, r => r.inst === null || r.inst.mode === 'strict'],
      ['data-storage="none" ne réserve aucune clé',
        { 'data-storage': 'none' }, r => r.inst && r.inst.storageKey === null],
      ['data-history="false" laisse l’historique tranquille',
        { 'data-history': 'false' }, r => r.inst && r.inst.useHistory === false],
      ['data-heading-level porte le niveau demandé',
        { 'data-heading-level': '4' }, r => { const t = r.root.querySelector('.aigo-title'); return t && t.tagName === 'h4'; }],
      ['data-lang avec une région sert cette langue',
        { 'data-lang': 'fr-CH' }, r => r.inst && String(r.inst.lang).toLowerCase().indexOf('fr') === 0]
    ];
    const inertes = ATTRS.filter(([, a2, check]) => { try { return !check(seul(a2)); } catch (e) { return true; } });
    ok(`each of the ${ATTRS.length} container attributes the guides name does what they say`,
      inertes.length === 0, inertes.map(x => x[0]).join(' | '));

    /* LE REGISTRE DES CLES, DANS SES DEUX MOITIES. Il doit rendre la meme cle a
     * qui remonte apres avoir detruit, et deux cles distinctes a deux instances
     * vivantes du meme arbre. Ni l'une ni l'autre n'etait eprouvee. */
    const one = () => { const d = new N('div'); body.appendChild(d);
      return AI_GO.mount(d, signed, { lang: 'en', history: false, mode: 'preview' }); };
    const a1 = one(); const k1 = a1.storageKey; a1.destroy();
    const a2 = one(); const k2 = a2.storageKey;
    ok('a key given back on destroy is handed to the next mount, so a session is resumed',
      k1 === k2, k1 + ' vs ' + k2);
    const b1 = one(), b2 = one();
    ok('and two live instances of the same tree never receive the same key',
      b1.storageKey !== b2.storageKey, b1.storageKey + ' vs ' + b2.storageKey);
    delete globalThis.T_SIGNED;
  }

  /* ---- L'EXEMPTION D'ORIGINE NE S'OUVRE PAS A UN FICHIER SANS DOMAINE ------ */
  // Sur son propre domaine, un editeur peut nommer l'origine. Un fichier qui ne
  // declare AUCUN domaine ne doit pas heriter de cette permission par defaut :
  // la clause qui l'en empeche survivait a son retrait.
  {
    const naming = domains => {
      const t = cp(signed);
      if (domains === null) delete t.publisher.domains; else t.publisher.domains = domains;
      t.disclaimer = 'Relu par UNIL.';
      return AI_GO.guard(t, 'localhost').filter(i => /disclaimer/.test(i.path)).length;
    };
    ok('a file that declares no domain does not inherit the right to name the origin',
      naming(null) > 0 && naming([]) > 0,
      'absent ' + naming(null) + ' / vide ' + naming([]));
  }

  /* ---- UNE PORTEE, UN POINT, MEME QUAND DEUX MOTS RESERVES LA TROUVENT ----- */
  {
    const held = txt => { const t = cp(signed); t.disclaimer = txt; return t; };
    const amb = AI_GO.guard(held('Guide \u1d1c\u0274\u026a\u029f ici.'), 'hes-example.ch')
      .filter(i => /disclaimer/.test(i.path));
    ok('one passage draws one point, even when two reserved words match the same span',
      amb.length === 1, amb.length + ' point(s) : ' + JSON.stringify(amb.map(i => String(i.message).slice(0, 40))));
  }



  const r5 = new N('div'); r5.setAttribute('data-ai-go', 'NOPE'); body.appendChild(r5); AI_GO.mountAll();
  ok('an undefined content variable renders the not-loaded refusal, not a blank area',
    r5.firstChild.attrs.role === 'alert' && r5.textContent.includes('NOPE'));

  // Third interface language, declared in the tree, exactly as the content
  // block documents it. Nothing in the engine block changes.
  const t2 = bilingual(signed, 'de');
  t2.ui = { de: { back: 'Zurueck', continue: 'Weiter', allowedLabel: 'Zulaessige Werkzeuge' } };
  t2.derivedFrom = 'Origin U';
  ok('a third interface language declared in the tree needs no engine change',
    AI_GO.structure(t2).length === 0 && AI_GO.guard(t2, 'hes-example.ch').length === 0,
    AI_GO.structure(t2).map(i => i.path).join(','));
  const r6 = new N('div');
  const storeSize = store.size;
  const i6 = AI_GO.mount(r6, t2, { lang: 'de', storageKey: null, history: false });
  i6.answer('q1', 'no'); i6.answer('q3', 'no');
  ok('the tree supplies its own interface strings for that language',
    r6.querySelector('.aigo-btn-ghost').textContent === 'Zurueck' &&
    r6.querySelector('.aigo-block-title').textContent === 'Zulaessige Werkzeuge');
  // LA VOIE `mount()` DIRECTE, celle que documente docs/INTEGRATE.md. Le montage
  // automatique calcule `langDeclared` lui-meme ; un appel direct ne le passe
  // pas, et la session d'une autre page ne doit pas pour autant decider de la
  // langue de celle-ci. Seul le chemin automatique etait couvert.
  {
    const shared = 'partage-' + Math.abs(AI_GO.hash('lang')).toString().slice(0, 6);
    const tFr = cp(t2); tFr.langs = ['fr', 'en']; tFr.defaultLang = 'fr';
    const rA = new N('div');
    const iA = AI_GO.mount(rA, tFr, { lang: 'fr', storageKey: shared, history: false });
    iA.answer('q1', 'no');
    const rB = new N('div');
    const iB = AI_GO.mount(rB, tFr, { lang: 'en', storageKey: shared, history: false });
    ok('a direct mount keeps the language it was given, whatever another page left in the session',
      iB && iB.lang === 'en', iB ? iB.lang : 'aucun montage');
    if (iA) iA.destroy(); if (iB) iB.destroy();
    /* La sonde ne laisse rien derriere elle : l'assertion suivante compte les
     * clefs de la session. */
    store.delete('aigo:' + tFr.id + ':' + shared);
    [...store.keys()].forEach(k => { if (k.indexOf(shared) >= 0) store.delete(k); });
  }
  ok('derivedFrom feeds the attribution line',
    r6.querySelector('.aigo-attribution').textContent.includes('Origin U'));
  // The whole CC BY notice, composed by the engine out of three fields holding
  // no sentences, so that complying with the licence never requires prose the
  // reserved-word lock would have to be opened for.
  const r6b = new N('div');
  const t2b = cp(t2);
  t2b.derivedFrom = { name: 'Origin U', url: 'https://origin.example/tool', licence: 'CC BY 4.0' };
  const i6b = AI_GO.mount(r6b, t2b, { lang: 'en', storageKey: null, history: false });
  i6b.answer('q1', 'no'); i6b.answer('q3', 'no');
  const credit = r6b.querySelector('.aigo-attribution').textContent;
  ok('the engine draws creator, work and licence, and says the source has not reviewed it',
    credit.includes('Origin U') && credit.includes('https://origin.example/tool') &&
    credit.includes('CC BY 4.0') && /has not reviewed/.test(credit), credit);

  // THE ENGINE'S SENTENCE IS DRAWN WHATEVER THE TREE SAYS, and the adopter's own
  // sentence comes after it, never instead. One mutation made the engine's line
  // disappear as soon as `note` was filled -- the half of the bargain that pays
  // for naming the source at all -- and every rendering assertion stayed green,
  // because not one of them ever set a `note`.
  const withNote = cp(t2b);
  withNote.derivedFrom = { name: 'Origin U', url: 'https://origin.example/tool',
    licence: 'CC BY 4.0', note: 'Traduit par la HEG en 2026.' };
  const rNote = new N('div');
  const iNote = AI_GO.mount(rNote, withNote, { lang: 'en', storageKey: null, history: false });
  iNote.answer('q1', 'no'); iNote.answer('q3', 'no');
  const blocks = rNote.querySelectorAll('.aigo-attribution');
  ok('a tree that fills derivedFrom.note carries two attribution blocks, the engine\'s first',
    blocks.length === 2 && /has not reviewed/.test(blocks[0].textContent) &&
    blocks[1].textContent.indexOf('Traduit par la HEG') >= 0,
    blocks.map(b => b.textContent.slice(0, 40)).join(' || '));
  // And the wording is the engine's, whatever the tree puts in `ui` or in
  // `derivedFrom`: a mutation that let the tree supply the sentence printed
  // "Officially endorsed by Origin U." with the receipt unmoved.
  const forger = cp(t2b);
  forger.derivedFrom = { name: 'Origin U', wording: 'Officially endorsed by {source}.',
    attribution: 'Certified by {source}.' };
  forger.ui = { en: { attribution: 'Certified by {source}.' },
    de: { attribution: 'Zertifiziert von {source}.' } };
  const rForge = new N('div');
  const iForge = AI_GO.mount(rForge, forger, { lang: 'en', storageKey: null, history: false });
  iForge.answer('q1', 'no'); iForge.answer('q3', 'no');
  const forgedLine = rForge.querySelector('.aigo-attribution').textContent;
  ok('and the wording of that sentence is the engine\'s, never one the tree supplies',
    /has not reviewed this adaptation/.test(forgedLine) && !/endorsed|Certified/i.test(forgedLine), forgedLine);

  // THE INLINE SYNTAX IS READ WHEREVER A STRING OF THE TREE IS DRAWN. Only the
  // paragraph path was asserted, so every title, label and step name could go
  // back to printing its asterisks without a single assertion moving.
  const bolded = cp(t2);
  bolded.steps[0].name = '**Nature** des donnees';
  bolded.nodes.q1.title = '**Attention** ici';
  bolded.nodes.q1.answers[0].label = '**Oui** vraiment';
  bolded.results[Object.keys(bolded.results)[0]].title = '**Grave** ici';
  const rBold = new N('div');
  AI_GO.mount(rBold, bolded, { lang: 'en', storageKey: null, history: false });
  const drawnBold = ['.aigo-step-name', '.aigo-title', '.aigo-option-label']
    .map(sel => rBold.querySelector(sel))
    .filter(Boolean);
  ok('the inline syntax is drawn as strong in the step name, the question title and the option label',
    drawnBold.length === 3 &&
    drawnBold.every(el => el.textContent.indexOf('**') < 0) &&
    drawnBold.every(el => JSON.stringify(el).indexOf('strong') >= 0),
    drawnBold.map(el => el.textContent).join(' | '));
  ok('storageKey: null leaves sessionStorage untouched', store.size === storeSize);

  const r7 = new N('div');
  const holes2 = cp(base); holes2.nodes.q2.options.unshift(null);
  ok('strict mode refuses a tree with a null checkbox option instead of crashing',
    AI_GO.mount(r7, holes2, { mode: 'strict', lang: 'en' }) === null && r7.firstChild.attrs.role === 'alert');
  const r8 = new N('div');
  const broken8 = cp(signed); broken8.nodes.q2.options = [null];
  const i8 = AI_GO.mount(r8, broken8, { mode: 'preview', lang: 'en', storageKey: null, history: false });
  i8.answer('q1', 'yes');
  ok('preview mode renders a refusal, never an empty container, when rendering throws',
    r8.textContent.length > 0 && r8.firstChild.attrs.role === 'alert' && r8.textContent.includes('Check impossible'));
  const r9 = new N('div');
  store.set('aigo:hes-example-ia:state', JSON.stringify({ path: ['q1'], answers: 'not-an-object', result: null, tv: signed.version, lang: 'en' }));
  const i9 = AI_GO.mount(r9, signed, { lang: 'en', history: false });
  i9.answer('q1', 'no');
  ok('a session whose answers are not an object resumes empty, without crashing', i9.node === 'q3');
  i9.destroy(); store.delete('aigo:hes-example-ia:state');
  const r10 = new N('div');
  const nullForbidden = cp(signed); nullForbidden.results.restricted.forbidden = [null];
  const i10 = AI_GO.mount(r10, nullForbidden, { lang: 'en', storageKey: null, history: false });
  i10.answer('q1', 'no'); i10.answer('q3', 'yes');
  ok('a null prohibition renders nothing, not the text "null"', !r10.textContent.includes('null'));
  globalThis.location = { hostname: '', protocol: 'about:' };
  const r11 = new N('div');
  ok('an empty hostname outside file: (about:srcdoc, blob:) is strict, not preview',
    AI_GO.mount(r11, unsigned, { lang: 'en', storageKey: null, history: false }) === null && r11.firstChild.attrs.role === 'alert');

  // The bilingual reference content, on the engine that ships, in BOTH of its
  // languages. This is how the production page is served: one file, one engine,
  // two languages, the French labels shipped with the engine and the French
  // content coming from the tree.
  globalThis.location = { hostname: 'www.unil.ch', protocol: 'https:' };
  if (hasReference) {
  const r12 = new N('div');
  const i12 = AI_GO.mount(r12, unil, { lang: 'fr', storageKey: null, history: false });
  ok('the frozen bilingual content mounts and renders in French on its own domain',
    !!i12 && i12.mode === 'strict' && r12.querySelector('.aigo-title').textContent === unil.nodes.q1.title.fr &&
    r12.querySelector('.aigo-btn-primary').textContent === 'Continuer',
    r12.querySelector('.aigo-btn-primary').textContent);
  i12.setLang('en');
  ok('the same instance switches to English content and English labels',
    r12.querySelector('.aigo-title').textContent === unil.nodes.q1.title.en &&
    r12.querySelector('.aigo-btn-primary').textContent === 'Continue' && r12.attrs.lang === 'en');
  i12.destroy();
  }
  globalThis.location = { hostname: '' };

  // ---- check.html, end to end. The validator was once shipped dead: a syntax
  // error killed the page and the harness stayed green. Here the page is wired
  // against the shim and asked to analyse the file that ships.
  const ids = {};
  ['out', 'drop', 'file', 'paste', 'pasteGo', 'host',
   't-title', 't-lead', 't-drop', 't-exec', 't-pasteHead', 't-foot', 't-hostLabel'].forEach(id => { ids[id] = new N('div'); });
  ids.paste.value = '';
  ids.host.value = '';
  globalThis.document.getElementById = id => ids[id] || null;
  const PAGE = new Function(bodiesOf(checkHtml)[0] + '\n;return AI_GO_CHECK;')();
  // The validator now opens in the reader's language, French first. Everything
  // below reads its rendered sentences, so the language is pinned here rather
  // than in twenty assertions: what is under test is the verdict, not the wording.
  PAGE.setLang('en');
  // The two tables are the promise: a key in one and not the other is a page
  // that falls back to the other language in front of the reader, silently.
  // Read key by key, not line by line: six lines carry two or three keys, so the
  // comparison covered 88 of the 92 that exist, and msg, level, noReview and
  // legalBasis were never confronted at all.
  const tableKeys = name => {
    const m = checkHtml.match(new RegExp('var ' + name + ' = \\{([\\s\\S]*?)\\n  \\};'));
    if (!m) return [];
    // Top level only: a line indented by exactly four spaces, and every key it
    // carries, since six lines carry two or three. Nested keys are not labels.
    const out = [];
    m[1].split('\n').forEach(line => {
      if (!/^ {4}[a-zA-Z]/.test(line)) return;
      const re = /(?:^ {4}|,\s+)([a-zA-Z][A-Za-z0-9]*)\s*:/g;
      let hit;
      while ((hit = re.exec(line))) out.push(hit[1]);
    });
    return out;
  };
  const enT = tableKeys('EN'), frT = tableKeys('FR');
  ok(`check.html ships its ${enT.length} interface strings in both languages, key for key`,
    enT.length > 40 && enT.length === frT.length && enT.every(k => frT.indexOf(k) >= 0),
    'EN sans FR : ' + enT.filter(k => frT.indexOf(k) < 0).join(', ') +
    ' | FR sans EN : ' + frT.filter(k => enT.indexOf(k) < 0).join(', '));
  ok('check.html wires itself and labels its own chrome',
    ids['t-title'].textContent.length > 0 && ids.pasteGo.textContent.length > 0);
  const report = PAGE.analyse(html);
  const shown = ids.out.textContent;
  ok('check.html analyses the delivered file without crashing', !!report && !!report.tree);
  ok('check.html reports the engine as intact', shown.includes(AI_GO.version) && shown.includes('intact'));
  ok('check.html reports the six markers as present', shown.includes('six markers'));
  // Les points de PUBLICATION viennent du garde ; ce que le validateur voit hors
  // de l'arbre est une erreur de cohérence, comptée et dessinée dans sa propre
  // section, parce que le moteur ne la voit pas et ne peut donc pas refuser.
  const openPoints = AI_GO.guard(starter, '').length;
  ok('check.html shows the publication points and the fingerprint',
    shown.includes(AI_GO.fingerprint(starter)) &&
    (openPoints ? shown.includes(openPoints + ' point') : /Nothing to complete/.test(shown)));
  ok('check.html lists every path of the content it was given',
    ids.out.querySelectorAll('.paths').length === 1 &&
    ids.out.querySelectorAll('.paths')[0].children.length === paths(starter).length);
  // The domain field decides half the verdict, and until it was wired it changed
  // nothing on screen. Typed, retyped, or given as a whole URL: same verdict.
  const signedHtml = html
    .replace('publisher: { name: "TO_FILL_IN", domains: ["TO_FILL_IN"] }',
      'publisher: { name: "Example UAS", domains: ["hes-example.ch"] }')
    .replace('review: { by: "TO_FILL_IN", date: "TO_FILL_IN" }',
      'review: { by: "Legal service", date: "2026-06-01" }')
    .replace('jurisdiction: "TO_FILL_IN"', 'jurisdiction: "CH-VD"')
    .replace('legalBasis: ["TO_FILL_IN"]', 'legalBasis: ["FADP"]')
    // The disclaimer ships in both languages and each ends on the placeholder,
    // so filling it means filling it twice: one string form matched neither.
    .replace(/ TO_FILL_IN"/g, ' Notre texte."')
    // and the example's own links and remark, which the engine now treats as the
    // placeholders they are. The example ships in two languages, so a label is an
    // object and the remark sits under a language key: the old one-string forms
    // matched nothing here and the fixture silently stopped being signed.
    .replace(/href: "https:\/\/example\.org\/guide"/, 'href: "https://hes-example.ch/guide"')
    .replace(/href: "https:\/\/example\.org\/contact"/, 'href: "https://hes-example.ch/contact"')
    .replace(/\{ fr: "Guide interne", en: "Internal guide" \}/, '{ fr: "Notre guide", en: "Our guide" }')
    .replace('id: "my-questionnaire"', 'id: "hes-example-ia"')
    // Et le message affiché quand les scripts ne s'exécutent pas, qui est hors de
    // l'arbre et que le validateur lit désormais : c'est le seul texte que voit
    // un lecteur sans JavaScript, et il partait avec son texte à remplacer.
    .replace(/mailto:TO_FILL_IN/g, 'mailto:service@hes-example.ch')
    .replace(/>TO_FILL_IN<\/a>/g, '>service@hes-example.ch</a>')
    .replace(/"\*\*To check:\*\* this text is an example[^"]*"/, '"**To check:** our own remark."')
    .replace(/"\*\*\u00c0 v\u00e9rifier[^"]*ce texte est un exemple[^"]*"/,
      '"**\u00c0 v\u00e9rifier\\u00a0:** notre propre remarque."');
  const verdictOn = () => { PAGE.analyse(signedHtml); return ids.out.textContent; };
  // The signed fixture is made by filling the placeholders of the shipped file, so
  // these only mean something on that file.
  if (onlyDelivered('the validator, read against the shipped example')) {
    ids.host.value = 'hes-example.ch';
    ok('check.html publishes for the domain that was typed', /Publishable/.test(verdictOn()));
    ids.host.value = 'autre-ecole.ch';
    ok('check.html refuses the same file for a domain the content does not declare',
      /NOT publishable/.test(verdictOn()) && ids.out.textContent.includes('publisher.domains'));
    ids.host.value = 'https://HES-Example.ch:8443/page?x=1';
    ok('check.html reads a whole URL, a port and capitals as the hostname they contain',
      /Publishable/.test(verdictOn()));
    // A scheme is a scheme only when followed by //. Stripping every word before a
    // colon turned localhost:8080 into the host "8080".
    ids.host.value = 'localhost:8080';
    ok('a host that only looks like a scheme is still a host', /Publishable/.test(verdictOn()));
    // Typed but unreadable is not the same as left empty, or the domain check is
    // skipped in silence on the entry a browser would have read as a hostname.
    // A browser reads a backslash in a URL as a slash, so this host is evil.test.
    ids.host.value = 'https://evil.test\\.hes-example.ch/page';
    ok('a backslash in the domain field is read the way a browser reads it',
      /NOT publishable/.test(verdictOn()));
    ids.host.value = '/foo';
    ok('an entry that reduces to no hostname is refused, never read as no domain given',
      /NOT publishable/.test(verdictOn()) && !/No domain given/.test(ids.out.textContent));
    // ai-go.html says this page lists the interface keys a language is missing.
    // It did not, and a third language went live half in English, all green.
    const german = signedHtml.replace(/langs: \["fr", "en"\]/, 'langs: ["fr", "en", "de"]');
    ids.host.value = 'hes-example.ch';
    PAGE.analyse(german);
    ok('check.html lists the interface labels a declared language has not supplied',
      /Language "de" has no interface labels/.test(ids.out.textContent));

    /* ET IL COMPTE CE QUE `msg` PORTE, pas seulement sa forme. L'exiger comme
     * une chaine accusait une langue traduite de bout en bout ; n'en verifier
     * que la forme a echange ce faux positif contre un faux negatif, car
     * `msg: {}` -- la retouche exacte qu'un adoptant fait pour eteindre un
     * avertissement -- passait alors pour une traduction complete et laissait
     * les quarante-deux phrases de refus en anglais sous des questions
     * allemandes. Les trois etats sont eprouves ici. */
    const withUi = body => german.replace('links: {', body + '\n  links: {');
    const uiSays = body => { ids.host.value = 'hes-example.ch'; PAGE.analyse(withUi(body)); return ids.out.textContent; };
    const LABELS = Object.keys(AI_GO.UI.en).filter(k => k !== 'msg');
    const full = '  ui: { de: { ' + LABELS.map(k => k + ': "x"').join(', ')
      + ', msg: { ' + Object.keys(AI_GO.UI.en.msg).map(k => k + ': "y"').join(', ') + ' } } },';
    ok('a third language translated to the last sentence draws no warning at all',
      !/Language "de" has no interface labels/.test(uiSays(full)),
      String(uiSays(full)).slice(0, 90));
    const emptyMsg = full.replace(/msg: \{[^}]*\}/, 'msg: {}');
    ok('and an empty msg is named sentence by sentence, not taken for a translation',
      /msg\./.test(uiSays(emptyMsg)), String(uiSays(emptyMsg)).slice(0, 110));
    const oneMsg = full.replace(/msg: \{[^}]*\}/, 'msg: { notLoaded: "y" }');
    ok('and one sentence out of forty-two is named as the forty-one that are missing',
      /msg\./.test(uiSays(oneMsg)), String(uiSays(oneMsg)).slice(0, 110));

    /* UNE LANGUE A REGION EST LA LANGUE. Le moteur sert « fr-CH » avec les
     * libelles de « fr » ; l'accuser de n'en fournir aucun serait un reproche
     * sur une page correcte. */
    const swiss = signedHtml.replace(/langs: \["fr", "en"\]/, 'langs: ["fr-CH", "en"]')
      .replace(/defaultLang: "fr"/, 'defaultLang: "fr-CH"');
    ids.host.value = 'hes-example.ch';
    PAGE.analyse(swiss);
    ok('a language written with a region is not accused of supplying no labels',
      !/has no interface labels/.test(ids.out.textContent),
      String(ids.out.textContent).slice(0, 90));
    ids.host.value = '';
    ok('an empty domain field skips the declaration check and says so',
      /Publishable/.test(verdictOn()) && /No domain given/.test(ids.out.textContent));
    // The engine reads the tree; the title, the heading and the standfirst are
    // outside it. A copy that rewrote its questions and kept the origin's headline
    // used to pass in silence, and those are the largest words on the page.
    // The page chrome is read out of the file rather than quoted here: the title,
    // the heading and the standfirst are written by whoever adopts this file, and
    // this repository writes them in French. Quoting them froze an English page
    // that no longer exists, and every fixture below silently replaced nothing.
    const chromeOf = (t, re) => { const m = t.match(re); return m ? m[0] : null; };
    const TITLE = chromeOf(html, /<title>[\s\S]*?<\/title>/);
    const H1 = chromeOf(html, /<h1>[\s\S]*?<\/h1>/);
    const LEAD = chromeOf(html, /<p class="lead">[\s\S]*?<\/p>/);
    ok('the page carries a title, a heading and a standfirst this file can read',
      !!TITLE && !!H1 && !!LEAD, [TITLE, H1, LEAD].map(x => x === null ? 'absent' : 'ok').join('/'));
    const withTitle = t => signedHtml.replace(TITLE, '<title>' + t + '</title>');
    const wearing = withTitle('AI_GO, Universite de Lausanne');
    ids.host.value = 'hes-example.ch';
    PAGE.analyse(wearing);
    ok('check.html reports the origin named in the page around the questionnaire',
      /page around the questionnaire/.test(ids.out.textContent));
    ids.host.value = 'www.unil.ch';
    PAGE.analyse(wearing);
    ok('and says nothing about it on the origin domain itself',
      !/page around the questionnaire/.test(ids.out.textContent));

    /* CE QU'IL N'A PAS EXECUTE, DIT A CHAQUE FOIS. La reserve n'etait posee que
     * sur la branche ou l'arbre reste introuvable : des qu'un script en ligne
     * l'avait declare, un module ou un script charge d'ailleurs etait saute sans
     * un mot, et le verdict decrivait une page que le navigateur ne sert pas. */
    {
      const S_ = '<' + 'script', C_ = '<' + '/' + 'script';
      const carrying = extra => signedHtml.replace('<' + '/body>', extra + '\n<' + '/body>');
      ids.host.value = 'unil.ch';
      PAGE.analyse(signedHtml);
      const nu = ids.out.textContent;
      ok('a file whose scripts this page can all run says nothing about unrun ones',
        !/did not run/.test(nu));
      const AILLEURS = [
        ['un script chargé depuis un autre fichier', S_ + ' src="ailleurs.js">' + C_ + '>'],
        ['un module', S_ + ' type="module">var x = 1;' + C_ + '>'],
      ];
      const muets = AILLEURS.filter(([, tag]) => {
        PAGE.analyse(carrying(tag));
        return !/did not run/.test(ids.out.textContent);
      });
      ok(`the reservation is spoken for the ${AILLEURS.length} kinds of script this page cannot run, even when the tree was found`,
        muets.length === 0, muets.map(x => x[0]).join(' | '));
    }
    // A browser paints &eacute; as an accented e; reading the source undecoded
    // let the origin's name sit in a title untouched.
    const wearingEntity = withTitle('Universit&eacute; de Lausanne');
    ids.host.value = 'hes-example.ch';
    PAGE.analyse(wearingEntity);
    ok('the page around the questionnaire is read with its named entities decoded',
      /page around the questionnaire/.test(ids.out.textContent));
    PAGE.analyse(withTitle('Universit&#233; de Lausanne'));
    ok('and with its numeric entities decoded too',
      /page around the questionnaire/.test(ids.out.textContent));
    PAGE.analyse(withTitle('Universit&#xE9; de Lausanne'));
    ok('and with its hexadecimal entities decoded too',
      /page around the questionnaire/.test(ids.out.textContent));
    // The chrome is read the way the engine reads the tree, or a decomposed
    // accent in a heading walks past a lock the questions cannot walk past.
    const wearingNfd = withTitle('Universite\u0301 de Lausanne');
    ids.host.value = 'hes-example.ch';
    PAGE.analyse(wearingNfd);
    ok('the page around the questionnaire is read normalised, like the tree',
      /page around the questionnaire/.test(ids.out.textContent));
    // COUNTED IN THE BANNER AND DRAWN NOWHERE. shownRows concatenated errors,
    // the warn half of extras and uiIssues, and nothing else: the warnings of
    // chromeTerms and chromeSpaces went into the count and into no table. A data
    // protection officer read "Publishable, 1 warning(s)" followed by "Nothing
    // to report." and had no way to learn what the warning was.
    const NBSP_ = String.fromCharCode(0x00a0);
    const spaced = signedHtml.replace(H1, '<h1>Quels outils' + NBSP_ + 'puis-je utiliser\u00a0?</h1>');
    ids.host.value = 'hes-example.ch';
    const spacedReport = PAGE.analyse(spaced);
    // chromeSpaces read text.slice(0, position of AI_GO-CONTENT-BEGIN), and in
    // the file this repository ships that is the <title> and nothing else: the
    // <h1> and the standfirst sit twenty lines BELOW AI_GO-CONTENT-END.
    ok('a non-breaking space BELOW the content block is seen at all',
      CHECK.chromeSpaces(spaced).length === 1 && CHECK.chromeSpaces(html).length === 0,
      String(CHECK.chromeSpaces(spaced).length));
    ok('and it is drawn, not merely counted',
      /1 warning/.test(ids.out.children[0].textContent) && !/Nothing to report/.test(ids.out.textContent) &&
      /non-breaking space/.test(ids.out.textContent), ids.out.children[0].textContent);
    ok('every warning the banner counts is a row the page drew',
      spacedReport.rows.warns.every(w => spacedReport.rows.shown.indexOf(w) >= 0),
      spacedReport.rows.warns.filter(w => spacedReport.rows.shown.indexOf(w) < 0).map(w => w.message).join(' | '));
    // The source lint has a section of its own, and it is counted in the banner:
    // removing it from the count is a mutation nothing used to see.
    // Any string of the content block will do; it has to be one that is still there.
    const someHelp = (signedHtml.match(/en: "[^"]{12,60}\."/) || [])[0];
    const apostrophe = signedHtml.replace(someHelp, someHelp.replace('en: "', "en: '").replace(/\."$/, " l\u2019indirectly.'"));
    PAGE.analyse(apostrophe);
    // The banner, not the page: the prose of the coherence section carries the
    // word "warnings" on its own, and a count read off the whole page is a count
    // that cannot fall to zero.
    ok('the source lint is counted in the banner and drawn in its own section',
      /1 warning/.test(ids.out.children[0].textContent) &&
      /Apostrophe inside a single-quoted string/.test(ids.out.textContent),
      ids.out.children[0].textContent);
    // THE DEFAULT STATE OF THIS PAGE. Nobody has typed a domain yet, and that
    // used to be the greenest light in this repository.
    const borrowed = signedHtml.replace(LEAD,
      '<p class="lead">Adapte du questionnaire AI_GO de l\u2019Universite de Lausanne.</p>');
    ids.host.value = '';
    PAGE.analyse(borrowed);
    ok('a copy wearing the origin\'s name is blocking with no domain typed, exactly as with one',
      /Blocking errors/.test(ids.out.textContent) &&
      /page around the questionnaire/.test(ids.out.textContent) &&
      // The engine's own section stays true and stops being reassuring: the
      // engine cannot see a headline, and it must not sound as if it could.
      /Nothing to complete for the engine/.test(ids.out.textContent) &&
      !/Nothing to complete: the engine will display this content/.test(ids.out.textContent),
      ids.out.children[0].textContent);
    ids.host.value = 'hes-example.ch';
    PAGE.analyse(borrowed);
    ok('and typing the domain changes nothing about that verdict', /Blocking errors/.test(ids.out.textContent));
    ids.host.value = '';
    ok('while the sentence about the missing domain no longer claims the rest is identical',
      /No domain given/.test(verdictOn()) &&
      !/the declaration check is skipped; everything else is identical/.test(ids.out.textContent));
    // THE MARKERS, IN THE VERDICT. markers() has always been right and has
    // always been printed in small grey type outside the calculation: a file
    // carrying its content block twice, which this page read one way round and
    // a browser mounts the other, kept a green banner reading "Publishable".
    ids.host.value = 'hes-example.ch';
    PAGE.analyse(signedHtml.replace('AI_GO-CONTENT-BEGIN\n', 'AI_GO-CONTENT-BEGIN\n   AI_GO-CONTENT-BEGIN\n'));
    ok('a file carrying a marker twice does not keep a green banner',
      /Blocking errors/.test(ids.out.textContent) && /more than once/.test(ids.out.textContent),
      ids.out.children[0].textContent);
    PAGE.analyse(signedHtml.replace(/^[ \t]*AI_GO-END[ \t]*$/m, ''));
    ok('and a marker an editor ate is a warning the page counts and draws',
      /warning/.test(ids.out.children[0].textContent) && /Marker missing/.test(ids.out.textContent),
      ids.out.children[0].textContent);
    // The whole file, judged: a mutation script after the content block used to
    // leave the receipt certifying a path the page would never offer.
    const rewritten = signedHtml.replace('<main class="page">',
      '<' + 'script>AI_GO_CONTENT.nodes.q1.answers[0].to = "q3";</' + 'script>\n<main class="page">');
    const rewrittenReport = PAGE.analyse(rewritten);
    ok('a script after the content block moves the paths of the receipt, because it moves the page',
      CHECK.paths(rewrittenReport.tree).length === CHECK.paths(starter).length - 1 &&
      /nodes\.q2/.test(ids.out.textContent),
      String(CHECK.paths(rewrittenReport.tree).length));
    ids.host.value = '';
  }
  ok('the page re-runs the analysis when the domain changes, on change and while typing',
    /hostField\.addEventListener\('change'/.test(checkHtml) && /addEventListener\('input'/.test(checkHtml) &&
    /if \(last && last\.text\) run\(last\.text, false\)/.test(checkHtml));
  ok('the domain field sits outside the drop zone, so clicking it opens no file picker',
    checkHtml.indexOf('id="host"') > checkHtml.indexOf('</div>', checkHtml.indexOf('id="drop"')));

  // A check that throws must reach the banner, not take the render down after
  // the banner has already said "publishable".
  const crashing = html.slice(0, at('AI_GO-CONTENT-BEGIN')) +
    'AI_GO-CONTENT-BEGIN\n*/\nvar AI_GO_CONTENT = { get start() { throw new Error("boom"); }, nodes: {}, results: {} };\n/*\n' +
    html.slice(at('AI_GO-CONTENT-END'));
  PAGE.analyse(crashing);
  ok('a check that throws says so in the banner instead of printing a verdict',
    /The check failed/.test(ids.out.textContent), ids.out.children[0].textContent);
  // Derived, never spelled out: pinning the version here made a release break a
  // test that has nothing to do with versions.
  const versionLine = `var VERSION = '${AI_GO.version}';`;
  const tampered = html.replace(versionLine, versionLine + ' /* touched */');
  const tamperedReport = PAGE.analyse(tampered);
  ok('check.html says MODIFIED LOCALLY when the engine block was edited',
    ids.out.textContent.includes('MODIFIED LOCALLY'));
  ok('and counts it as a warning, instead of only printing it below the banner',
    !!tamperedReport && tamperedReport.rows.warns.some(r => r.where === 'engine block'),
    JSON.stringify((tamperedReport && tamperedReport.rows.warns || []).map(r => r.where)));

  // Producing the UNIL production page is one paste: the reference content
  // replaces the content block, marker lines untouched, nothing renamed.
  if (hasReference) {
  const unilSource = read('reference/aigo-unil.js').replace(/if \(typeof module[\s\S]*$/, '');
  const unilPage = html.slice(0, at('AI_GO-CONTENT-BEGIN')) +
    'AI_GO-CONTENT-BEGIN\n*/\n' + unilSource + '\n/*\n' + html.slice(at('AI_GO-CONTENT-END'));
  const unilReport = PAGE.analyse(unilPage);
  ok('the bilingual content pasted into the delivered file yields 20 paths and the frozen fingerprint',
    !!unilReport && unilReport.hash === 'cbdb4863aed9f778' && CHECK.paths(unilReport.tree).length === 20,
    'this is how the production page is produced: one paste, no rename');
  }
});

// The documentation rules are about THIS repository's pages. An institution that
// rewrote the README for its own community is not failing them; it left them.
const hasOwnPages = ['README.md', 'docs/INTEGRATE.md', 'docs/ARBRE.md']
  .every(f => { try { statSync(join(ROOT, f)); return true; } catch (e) { return false; } });
const readme = hasOwnPages ? read('README.md') : '';
// The origin repository is the one that still carries the origin's questionnaire.
// Reading it off a substring of the README meant that renaming that substring
// silently switched every documentation rule off and still printed "passed".
const isThisRepository = hasReference && hasOwnPages;
console.log('the typography tool');
section(() => {
  const TOOL = 'tools/typographie.mjs';
  if (!existsSync(join(ROOT, TOOL))) {
    skipped.push('the typography tool, which this copy does not ship');
  } else {
    const lines = read(TOOL).replace(/\n$/, '').split('\n').length;
    // The page that forbids the typed non-breaking space carried four of them.
    ok('the tool types no non-breaking space of its own, neither U+00A0 nor U+202F',
      !read(TOOL).includes(NBSP) && !read(TOOL).includes(String.fromCharCode(0x202f)));
    // The guides state the length, so a reader knows what they are about to open.
    // The guides state the length in words: widen this map when the tool changes length.
    const WORDS = { 61: ['soixante et un', 'Sixty-one'], 62: ['soixante-deux', 'Sixty-two'],
      63: ['soixante-trois', 'Sixty-three'], 64: ['soixante-quatre', 'Sixty-four'],
      65: ['soixante-cinq', 'Sixty-five'], 66: ['soixante-six', 'Sixty-six'] };
    const CALL = 'node ' + TOOL + ' ai-go.html';
    if (isThisRepository) {
      const fr = read('docs/DEMARRER.md'), en = read('docs/INTEGRATE.md');
      ok('both guides call the tool by the one command that runs it',
        fr.includes(CALL) && en.includes(CALL));
      ok(`both guides say the tool is ${lines} lines, which is what it is`,
        !!WORDS[lines] && fr.includes(WORDS[lines][0]) && en.includes(WORDS[lines][1]), String(lines));
    }
    // Run the shipped script, never a copy of its rules: a parallel implementation
    // here could pass while the file an adopter runs is broken.
    const dir = mkdtempSync(join(tmpdir(), 'aigo-typo-'));
    const run = f => execFileSync(process.execPath, [join(ROOT, TOOL), f], { encoding: 'utf8' });
    try {
      const f = join(dir, 'sample.html');
      const seeded = ['/* AI_GO-CONTENT-BEGIN */',
        'var AI_GO_CONTENT = {',
        '  a: "Vos donnees' + NBSP + '?",',
        '  b: "Cas : 100 % et <<' + NBSP + 'ainsi >> ; fin",',
        '/* AI_GO-CONTENT-END */',
        'var engine = "hors du bloc' + NBSP + ': intact";'].join('\n')
        .replace(/<</g, '\u00ab').replace(/>>/g, '\u00bb');
      writeFileSync(f, seeded, 'utf8');
      const said = run(f);
      const after = readFileSync(f, 'utf8');
      const block = after.slice(after.indexOf('CONTENT-BEGIN'), after.indexOf('CONTENT-END'));
      const tail = after.slice(after.indexOf('CONTENT-END'));
      ok('the tool leaves no typed non-breaking space inside the content block',
        !block.includes(NBSP), JSON.stringify(block));
      ok('it writes the escape where French wants one, before the colon and inside the guillemets',
        (block.match(/\\u00a0/g) || []).length === 6, String((block.match(/\\u00a0/g) || []).length));
      ok('it says how many it wrote', /^6 non-breaking space/.test(said), said.trim());
      ok('below AI_GO-CONTENT-END it changes nothing, so the engine is never touched',
        tail.includes('hors du bloc' + NBSP + ': intact'));
      run(f);
      ok('running it twice changes nothing the second time', readFileSync(f, 'utf8') === after);
      // The claim the guides make about the file as delivered, checked on the file.
      const copy = join(dir, 'ai-go.html');
      writeFileSync(copy, html, 'utf8');
      run(copy);
      // Only meaningful on the delivered file. An adopter who has written French
      // and not yet run the tool has a file the tool WILL change, which is the
      // point of shipping it; failing them here punished the expected case.
      if (asDelivered) ok('on ai-go.html as delivered it changes not one byte', readFileSync(copy, 'utf8') === html);
      else skipped.push('the claim that the tool changes nothing on the delivered file');
      /* ---- les marqueurs ------------------------------------------------ */
      // Three marker corruptions an editor makes. Each of them used to make the
      // tool rewrite the engine block below the content and still exit 0.
      const BEG = '/* AI_GO-CONTENT-BEGIN */', END = '/* AI_GO-CONTENT-END */';
      const ENGINE = 'var engine = "Moteur' + NBSP + ': 50' + NBSP + '%' + NBSP + '!";';
      const BODY = ['var AI_GO_CONTENT = {', '  a: "Vos donnees' + NBSP + '?",', '};'].join('\n');
      const refuses = (label, lines) => {
        const broken = join(dir, 'broken.html');
        writeFileSync(broken, lines.join('\n') + '\n', 'utf8');
        const before = readFileSync(broken, 'utf8');
        let code = 0, said = '';
        try { execFileSync(process.execPath, [join(ROOT, TOOL), broken], { encoding: 'utf8', stdio: 'pipe' }); }
        catch (e) { code = e.status; said = String(e.stderr || ''); }
        const after = readFileSync(broken, 'utf8');
        ok('the tool refuses to write a file whose markers are ' + label,
          code !== 0 && after === before && said.includes('AI_GO-CONTENT-BEGIN'),
          'exit ' + code + ', file ' + (after === before ? 'unchanged' : 'REWRITTEN'));
      };
      refuses('missing the end marker', [BEG, BODY, ENGINE]);
      refuses('carrying a second begin marker', [BEG, BODY, END, BEG, ENGINE]);
      refuses('the wrong way round', [END, BODY, BEG, ENGINE]);

      /* ---- U+202F ------------------------------------------------------- */
      // A word processor writes the narrow no-break space as readily as U+00A0,
      // and left in place it is just as invisible and just as lost on a paste.
      const NNBSP = String.fromCharCode(0x202f);
      const fine = join(dir, 'fine.html');
      writeFileSync(fine, [BEG, 'var C = {', '  a: "Fine' + NNBSP + '? et' + NNBSP + ': fin",', '};', END,
        'var engine = "hors du bloc' + NNBSP + ': intact";'].join('\n') + '\n', 'utf8');
      run(fine);
      const fineOut = readFileSync(fine, 'utf8');
      const cut = fineOut.indexOf('CONTENT-END');
      ok('it converts the narrow no-break space U+202F, and only inside the content block',
        !fineOut.slice(0, cut).includes(NNBSP) && (fineOut.match(/\\u00a0/g) || []).length === 2 &&
        fineOut.slice(cut).includes(NNBSP), JSON.stringify(fineOut.slice(0, cut)));

      /* ---- il n'ajoute rien --------------------------------------------- */
      // The guides promise conversion, not insertion, because an insertion rule
      // has no way to tell a French sentence from an English one, a URL or a time.
      const plain = join(dir, 'plain.html');
      writeFileSync(plain, [BEG, 'var C = { a: "Bonjour!", b: "Taux: 50%", c: "10:30 https://x.ch/a" };',
        END].join('\n') + '\n', 'utf8');
      const plainBefore = readFileSync(plain, 'utf8');
      /* ---- le haut de page, que l'outil ne couvre pas ------------------- */
      // The README sends an adopter to write the title and the standfirst above
      // AI_GO-CONTENT-BEGIN, where neither the tool nor the escape rule reaches.
      // Silent on both sides used to mean "publishable" over an invisible space.
      const NNBSP2 = String.fromCharCode(0x202f);
      const chromeOf = t => CHECK.chromeSpaces(t).length;
      const cut2 = html.indexOf('AI_GO-CONTENT-BEGIN');
      const withNbsp = c => html.slice(0, cut2).replace('</title>', c + '?</title>') + html.slice(cut2);
      ok('the validator warns about a non-breaking space typed above the content block',
        chromeOf(html) === 0 && chromeOf(withNbsp(NBSP)) === 1 && chromeOf(withNbsp(NNBSP2)) === 1,
        [chromeOf(html), chromeOf(withNbsp(NBSP)), chromeOf(withNbsp(NNBSP2))].join('/'));
      ok('it adds no non-breaking space where none was typed, so no URL and no clock time moves',
        /^0 non-breaking space/.test(run(plain)) && readFileSync(plain, 'utf8') === plainBefore);
      /* ---- la promesse tenue octet pour octet ---------------------------- */
      // A begin marker that opens a comment and never closes it, or an end marker that closes one it
      // never opened, used to be read as a marker all the same: the file was rewritten whole, engine
      // included, and the tool exited 0.
      refuses('half a comment wrapper on the begin marker', ['/* AI_GO-CONTENT-BEGIN', BODY, END, ENGINE]);
      refuses('half a comment wrapper on the end marker', [BEG, BODY, 'AI_GO-CONTENT-END */', ENGINE]);
      // A unique, ordered content pair whose end marker sits BELOW the engine block satisfied every
      // condition the guides stated, and put the engine inside the region the tool rewrites. The six
      // markers of the file are checked now, and their order with them.
      refuses('a content pair that swallows the engine block',
        ['/* AI_GO-BEGIN */', BEG, BODY, '/* AI_GO-ENGINE-BEGIN 0.0.0 h:00000000 */', ENGINE,
          '/* AI_GO-ENGINE-END */', END, '/* AI_GO-END */']);
      // Run and never throw: a mutant that refuses has to fail its own assertion below, not take the
      // whole section down with it and leave the reason to be guessed from a stack trace.
      const tryRun = (f) => {
        try { return { code: 0, said: run(f) }; }
        catch (e) { return { code: e.status, said: String(e.stderr || '') }; }
      };
      // A byte that is not UTF-8, outside the block: read as UTF-8 and written back as U+FFFD,
      // silently, exit 0. Refusing is the honest answer; the tool never guesses an encoding.
      const latin = join(dir, 'latin1.html');
      writeFileSync(latin, Buffer.concat([Buffer.from([BEG, BODY, END, 'var e = "r'].join('\n'), 'utf8'),
        Buffer.from([0xe9]), Buffer.from('sultat";\n', 'utf8')]));
      const latinBefore = readFileSync(latin);
      const latinRun = tryRun(latin);
      ok('the tool refuses a file that is not valid UTF-8 instead of replacing the bytes it cannot read',
        latinRun.code !== 0 && readFileSync(latin).equals(latinBefore) && /UTF-8/.test(latinRun.said),
        'exit ' + latinRun.code + ', file ' +
          (readFileSync(latin).equals(latinBefore) ? 'unchanged' : 'REWRITTEN'));
      // The guarantee stated as a guarantee and not as a consequence of the markers: on a file the
      // tool DOES rewrite, every byte from the end marker on comes back exactly as it went in.
      const guarded = join(dir, 'guarded.html');
      writeFileSync(guarded, [BEG, '  a: "Vos donnees' + NBSP + '?",', END,
        'var moteur = "Moteur' + NBSP + ': 50' + NBSP + '%";'].join('\n') + '\n', 'utf8');
      const gBefore = readFileSync(guarded);
      tryRun(guarded);
      const gAfter = readFileSync(guarded);
      const endAt = (b) => b.indexOf(Buffer.from('AI_GO-CONTENT-END', 'utf8'));
      ok('outside the content block the tool gives back every byte it was given, the engine included',
        !gBefore.equals(gAfter) && gBefore.subarray(endAt(gBefore)).equals(gAfter.subarray(endAt(gAfter))),
        JSON.stringify(gAfter.subarray(endAt(gAfter)).toString('utf8')));
      // The byte comparison is a net under the marker rules: while those hold, no input ever reaches
      // it, so nothing black-box can kill its removal. Read off the source, and named here as the
      // weaker kind of assertion it is, because the guarantee both guides make rests on it.
      ok('the tool still compares the bytes outside the content block before it writes anything',
        /out\.subarray\(0, head\)\.equals\(input\.subarray\(0, head\)\)/.test(read(TOOL)) &&
        /Buffer\.byteLength\(was\)/.test(read(TOOL)) && /fatal: true/.test(read(TOOL)));
      /* ---- quatre mutations qui survivaient ------------------------------ */
      // Unanchoring the marker pattern survived: no fixture named a marker anywhere but at the start
      // of a line. A content text may name one, and both guides do.
      const cited = join(dir, 'cited.html');
      writeFileSync(cited, [BEG, '  a: "Le bloc se ferme sur AI_GO-CONTENT-END, plus bas' + NBSP + '.",',
        'AI_GO-CONTENT-END ferme le bloc', END,
        'var moteur = "Moteur' + NBSP + ': intact";'].join('\n') + '\n', 'utf8');
      const citedRun = tryRun(cited), citedOut = readFileSync(cited, 'utf8');
      ok('a marker named inside a text, or followed by prose, is not a marker line',
        citedRun.code === 0 && /^1 non-breaking space/.test(citedRun.said) &&
        citedOut.includes('AI_GO-CONTENT-END, plus bas\\u00a0.') &&
        citedOut.includes('var moteur = "Moteur' + NBSP + ': intact";'), citedRun.said.trim());
      // Converting the whole block instead of only its quoted strings survived: no fixture held a
      // no-break space in code. This one does, outside any string, and it must come back untouched.
      const inCode = join(dir, 'code.html');
      writeFileSync(inCode, [BEG, 'var C' + NBSP + '= { a: "Rien' + NBSP + 'a faire ici" };', END]
        .join('\n') + '\n', 'utf8');
      tryRun(inCode);
      const codeOut = readFileSync(inCode, 'utf8');
      ok('inside the block it converts the quoted strings and leaves the code between them alone',
        codeOut.includes('var C' + NBSP + '= {') && codeOut.includes('"Rien\\u00a0a faire ici"'),
        JSON.stringify(codeOut));
      // The guillemet rule was only ever exercised on a no-break space, which the general conversion
      // also handles, so deleting it changed nothing anywhere. Ordinary spaces here.
      const quotes = join(dir, 'quotes.html');
      writeFileSync(quotes, [BEG, 'var C = { a: "dit « lui » hier" };', END].join('\n') + '\n', 'utf8');
      const quotesRun = tryRun(quotes);
      ok('an ordinary space just inside either guillemet becomes the escape',
        /^2 non-breaking space/.test(quotesRun.said) &&
        readFileSync(quotes, 'utf8').includes('"dit «\\u00a0lui\\u00a0» hier"'),
        readFileSync(quotes, 'utf8').trim());
      // The U+202F fixture put both of them in front of French punctuation, where the punctuation
      // rule handles them, so restricting the general conversion to U+00A0 alone survived an
      // assertion named after U+202F. Neither of these two stands before any punctuation.
      const thin = join(dir, 'thin.html');
      writeFileSync(thin, [BEG, 'var C = { a: "1' + NNBSP + '000 personnes et 2' + NBSP + '000 dossiers" };',
        END].join('\n') + '\n', 'utf8');
      const thinRun = tryRun(thin);
      ok('a no-break space standing before no punctuation at all is converted too, U+202F included',
        /^2 non-breaking space/.test(thinRun.said) &&
        readFileSync(thin, 'utf8').includes('"1\\u00a0000 personnes et 2\\u00a0000 dossiers"'),
        readFileSync(thin, 'utf8').trim());
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
});

if (!isThisRepository) console.log('documentation: your own pages, and this file has nothing to say about them');
if (isThisRepository) section(() => {
  console.log('documentation and repository');
  const guide = read('docs/INTEGRATE.md');
  const lines = readme.replace(/\n$/, '').split('\n').length;
  ok(`README is one page (${lines} lines, limit 110)`, lines <= 110, String(lines));
  ok('README names the production URL and the repository it lives in',
    /ia\.unil\.ch\/AI_GO/.test(readme) && /unil-ia\/AI_GO/.test(readme));
  ok('the guide names what a CMS refuses: unfiltered_html and the TYPO3 HTML element',
    /unfiltered_html/.test(guide) && /TYPO3/.test(guide));
  ok('the guide carries the iframe listener an integrator has to paste, in full',
    /addEventListener\("message"/.test(guide) && guide.includes('iframe[data-aigo]') &&
    guide.includes('d.aigo === "height"'));
  ok('the guide documents data-history="false" for a page carrying two questionnaires',
    /data-history="false"/.test(guide));
  ok('the guide documents the update procedure and the fingerprint receipt',
    /check\.html/.test(guide) && /fingerprint/i.test(guide));
  ok('the guide explains how a second language is served, since the starter ships one',
    /langs/.test(guide) && /\bui\b/.test(guide));
  ok('README carries the one sentence about how this code was written',
    ASSISTANT.test(readme) && assistantCount(readme) === 1, String(assistantCount(readme)));
  // A single machine-readable licence would present the reserved questionnaire as
  // BSD, which is the mistake LICENSE opens by warning against.
  ok('CITATION.cff claims no single licence for a repository that carries three',
    !/^license(-url)?:/m.test(read('CITATION.cff')));
  // Naming WHICH of the three conditions gave way: the message used to print two
  // equal fingerprints side by side while the id was the one that had moved.
  const why = [
    AI_GO.fingerprint(starter) === STARTER_FINGERPRINT ? null
      : 'fingerprint ' + AI_GO.fingerprint(starter) + ', STARTER_FINGERPRINT says ' + STARTER_FINGERPRINT,
    starter.id === 'my-questionnaire' ? null : 'the tree id is now "' + starter.id + '"',
    JSON.stringify(starter).indexOf('TO_FILL_IN') >= 0 ? null : 'the TO_FILL_IN placeholders are gone'
  ].filter(Boolean);
  // POLICY.example NAMES OUR EXAMPLE, NEVER YOURS, and the two readings of that
  // are opposite. On the delivered file the value must be the print of the block
  // above it, or the lock guards nothing -- which is exactly what happened when
  // the example changed language and this value stayed on the old one. On an
  // adapted file the value must NOT match, and if it does, that file is our
  // example about to go out under somebody else's signature. Earlier versions
  // asked one question for both cases, and every way of answering it punished an
  // institution in the middle of its work: the harness told adopters to paste
  // their own print here, which makes the engine refuse their own page.
  if (asDelivered) {
    ok('the engine recognises the example it ships with',
      !!AI_GO.POLICY.example && AI_GO.POLICY.example === AI_GO.examplePrint(starter),
      'POLICY.example says ' + AI_GO.POLICY.example + ', the block is ' + AI_GO.examplePrint(starter) +
      ': paste the second value into POLICY.example');
  } else {
    ok('your content is not the example this engine refuses to see republished',
      AI_GO.POLICY.example !== AI_GO.examplePrint(starter),
      'your questions and results are, character for character, the delivered example: ' +
      'the engine will refuse to display them under your signature, and it is right to');
  }
  ok('CITATION.cff declares the current engine version',
    new RegExp('version: "' + AI_GO.version + '"').test(read('CITATION.cff')));

  const walk = d => readdirSync(d).flatMap(f => {
    const p = join(d, f);
    if (f === '.git' || f === 'node_modules') return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
  const every = walk(ROOT).map(p => p.replace(ROOT, ''));
  // WHAT IS MISSING IS A FAILURE; WHAT IS EXTRA IS NOT. This used to demand
  // exactly nineteen files, so an institution that kept its own working copy of
  // the questionnaire beside ours -- the obvious thing to do -- got a red run for
  // having done nothing wrong. What this repository owes is its own files; a file
  // it does not know is named, not judged.
  const OWN_FILES = ['/.github/workflows/test.yml', '/.gitignore', '/CHANGELOG.md',
    '/CITATION.cff', '/CONTRIBUTING.md', '/LICENSE', '/README.md', '/SECURITY.md',
    '/ai-go.html', '/check.html', '/docs/ARBRE.md', '/docs/DEMARRER.md',
    '/docs/INTEGRATE.md', '/docs/PUBLICATIONS.md', '/docs/capture.png',
    '/reference/aigo-unil.js', '/reference/aigo-unil.paths.js', '/test/run.mjs',
    '/tools/typographie.mjs'];
  // Le chemin est compare sans sa barre de tete : ROOT s'ecrit avec ou sans.
  const noSlash = f => String(f).replace(/^\//, '');
  const here = every.map(noSlash), mine = OWN_FILES.map(noSlash);
  const absent = mine.filter(f => here.indexOf(f) < 0);
  const extra = here.filter(f => mine.indexOf(f) < 0);
  ok(`the repository holds the ${OWN_FILES.length} files it is made of`,
    absent.length === 0, 'manquant : ' + absent.join(', '));
  if (extra.length) skipped.push('les ' + extra.length + ' fichier(s) qui ne sont pas les nôtres : ' + extra.join(', '));
  // The text rules run on text files: a PNG decoded as UTF-8 yields accents by accident.
  const text = every.filter(p => !/\.png$/.test(p));
  const dashed = text.filter(p => read(p).includes(EM_DASH));
  ok(`no em dash in any of the ${text.length} text files`, dashed.length === 0, dashed.join(', '));
  // Named one by one, against the real inventory: asking only that the sentence
  // exist let a file be added and left out of every regime.
  const licence = read('LICENSE');
  // No exception coded here any more: the file that grants the licences is a
  // file of this repository and has to name itself among the ones it covers.
  const uncovered = text.filter(p => !licence.includes(p));
  ok('LICENSE names every file in the repository, itself included', uncovered.length === 0, uncovered.join(', '));
  const named = text.filter(p => OTHER_NAME.test(read(p)));
  // OTHER_NAME only knew the names this tool used to carry. This catches the way
  // its current name gets misspelled: a hyphen or a space where the underscore
  // belongs, which in a heading used to pass. Assembled, so this file is not a hit.
  const MISSPELT = new RegExp('AI' + '[- ]GO');
  const misspelt = text.filter(p => MISSPELT.test(read(p)));
  ok('the tool is called AI_GO everywhere, and nothing else',
    named.length === 0 && misspelt.length === 0, named.concat(misspelt).join(', '));
  const credited = text.filter(p => ASSISTANT.test(read(p)));
  ok('the assistant that wrote the code is named once, in the README, and nowhere else',
    credited.length === 1 && credited[0] === 'README.md', credited.join(', '));
  // The code and its guide are written in English. The exceptions are declared:
  // the pages that face the French-speaking reader (README.md, SECURITY.md,
  // CHANGELOG.md and docs/ except the guide), the bilingual reference content,
  // the French label set shipped inside the engine, the legal name of the
  // copyright holder, and this file, which renders the canonical French form of
  // those pages in order to compare them with what is written.
  const mayHoldFrench = p => p === 'README.md' || p === 'SECURITY.md' || p === 'CHANGELOG.md' || p === 'CONTRIBUTING.md' ||
    (p.startsWith('docs/') && p !== 'docs/INTEGRATE.md') || p === 'test/run.mjs' ||
    p.startsWith('reference/') || p === 'ai-go.html' || p === 'LICENSE' || p === 'CITATION.cff' ||
    // Since the validator ships its interface in both languages, it is a
    // French-facing page like the others, and an assertion below checks that
    // its two tables hold exactly the same keys.
    p === 'check.html';
  // The holder's legal name carries two accents and belongs in every licence
  // notice. It was an exception in the comment above and in no line of code.
  const HOLDER_NAME = new RegExp('Universit\u00e9 de Lausanne|Cellule strat\u00e9gique IA', 'g');
  const french = text.filter(p => !mayHoldFrench(p) && ACCENTS.test(read(p).replace(HOLDER_NAME, '')));
  ok('outside the reference content, the French-facing pages and the shipped label set, every file is English',
    french.length === 0, french.join(', '));
  // THE RULE THIS REPOSITORY SPENDS A HUNDRED LINES TEACHING. It taught it in
  // four places and applied it nowhere: three campaigns in a row reported the
  // same missing spaces, and the newest changelog entry was every time the only
  // one in the file without a single one. A rule nothing enforces is a rule that
  // decays in the direction of whoever wrote last.
  //
  // docs/ARBRE.md is exempt, and not for convenience: it transcribes the frozen
  // questionnaire word for word, the questionnaire writes an ordinary space
  // before its question marks, and the assertions below compare the two exactly.
  // Fixing it means fixing the frozen content, which belongs to its authors.
  const FRENCH_PAGES = ['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'SECURITY.md',
    'docs/DEMARRER.md', 'docs/PUBLICATIONS.md'];
  const looseSpace = text => {
    let n = 0, fence = false;
    text.split('\n').forEach(line => {
      if (line.indexOf('```') === 0) { fence = !fence; return; }
      if (fence) return;
      const bare = line.replace(/`[^`]*`/g, '').replace(/https?:\/\/\S+/g, '');
      n += (bare.match(/ [:;?!%\u00bb]/g) || []).length + (bare.match(/\u00ab /g) || []).length;
    });
    return n;
  };
  const loose = FRENCH_PAGES.map(p2 => [p2, looseSpace(read(p2))]).filter(x => x[1] > 0);
  ok(`the ${FRENCH_PAGES.length} French pages write the space this repository spends a hundred lines teaching`,
    loose.length === 0, loose.map(x => x[0] + ': ' + x[1]).join(', '));

  // The two French pages are the questionnaire as an adopting DPO reads it. A
  // containment test proved too weak: a right string attached to the wrong node,
  // an eighth sensitive category invented, a tool list moved from one result to
  // another, all stayed green. So the block of every node and every result is
  // rendered here from the frozen tree and must appear in docs/ARBRE.md exactly,
  // separators included. The file stays hand-editable; it just has to be right.
  const arbre = read('docs/ARBRE.md');
  const FR = v => (v == null ? '' : typeof v === 'string' ? v : v.fr !== undefined ? v.fr : '');
  const paras = h => {
    if (h == null) return [];
    const out = [];
    for (const x of [].concat(h)) {
      if (typeof x === 'string') out.push({ p: x });
      else if (x && x.items) x.items.forEach(i => out.push({ li: i }));
      else if (x && x.fr !== undefined) {
        for (const y of [].concat(x.fr)) {
          if (typeof y === 'string') out.push({ p: y });
          else if (y && y.items) y.items.forEach(i => out.push({ li: i }));
        }
      }
    }
    return out;
  };
  const R = {};
  Object.keys(unil.results).forEach((id, i) => { R[id] = 'R' + (i + 1); });
  const linkLabel = id => FR(unil.links[id].label);
  // Rendered, not merely contained. A containment test let a right string sit on
  // the wrong node, an eighth category be invented, one result's summary be
  // pasted into another's block, and text be appended to a solution line. Each
  // block is rendered here from the frozen tree and must appear in docs/ARBRE.md
  // exactly, blank lines and connectives included. This is the one place in the
  // harness that writes French: it writes the canonical form of a French page.
  const space = lines => lines.join('\n').replace(/\n(?!- )/g, '\n\n');
  const nodeBlock = (id, n) => {
    const out = [`**${id}. ${FR(n.title)}**`];
    paras(n.help).forEach(x => out.push(x.li ? '- ' + x.li : x.p));
    if (n.type === 'multi') {
      out.push('Cases à cocher :');
      n.options.forEach(o => out.push('- ' + FR(o.label)));
      out.push(`Routage : au moins une case → ${n.next.ifAny || R[n.next.ifAnyResult]} ; aucune → ${n.next.else || R[n.next.elseResult]}.`);
      if (n.polarity === 'inverse') out.push('Attention au sens : ici, cocher fait sortir de la branche des données personnelles ; le fichier le déclare par `polarity: "inverse"`.');
    } else {
      out.push('Réponses :');
      n.answers.forEach(a => {
        const lab = a.label ? FR(a.label) : (a.value === 'yes' ? 'Oui' : 'Non');
        out.push(`- ${lab}${FR(a.detail) ? ' : ' + FR(a.detail) : ''} → ${a.to || R[a.result]}`);
      });
    }
    return space(out);
  };
  const resultBlock = (label, r) => {
    const out = [`**${label}. ${FR(r.title)}**`, FR(r.summary),
      `Solution recommandée : ${FR(r.solution.text)}.`, 'Outils proposés :'];
    (r.allowed || []).forEach(a => out.push('- ' + linkLabel(a)));
    if (r.forbidden && r.forbidden.length) {
      out.push('Interdits :');
      r.forbidden.forEach(f => out.push('- ' + FR(f)));
    }
    if (r.alert) out.push(FR(r.alert.text));
    return space(out);
  };
  const offBlocks = [
    ...Object.entries(unil.nodes).map(([id, n]) => [id, nodeBlock(id, n)]),
    ...Object.values(unil.results).map((r, i) => ['R' + (i + 1), resultBlock('R' + (i + 1), r)]),
  ].filter(([, b]) => !arbre.includes(b)).map(([id]) => id);
  ok(`docs/ARBRE.md renders the ${Object.keys(unil.nodes).length + Object.keys(unil.results).length} nodes and results exactly`,
    offBlocks.length === 0, offBlocks.join(' | '));
  // Node labels and colour classes are written by hand: they shorten the
  // questions and they name what each result allows. Nothing derives them, so
  // they are frozen. Change them on purpose and move the hash.
  const mermaidBlock = arbre.slice(arbre.indexOf('```mermaid'), arbre.indexOf('```', arbre.indexOf('```mermaid') + 3));
  ok('the diagram of docs/ARBRE.md is frozen, labels and colours included',
    AI_GO.hash(mermaidBlock) === '01e9c63645ca1faf', AI_GO.hash(mermaidBlock));
  // The sentences beside the machine form are written by hand and nothing derives
  // them: frozen, so an inverted one cannot pass on the strength of its last word.
  const sentences = arbre.slice(arbre.indexOf('## Les 20 chemins')).split('\n')
    .filter(l => /^\d+\. /.test(l)).join('\n');
  ok('the 20 sentences of docs/ARBRE.md are frozen, clause by clause',
    AI_GO.hash(sentences) === 'f78feaa238bdbe0f', AI_GO.hash(sentences));
  ok('docs/ARBRE.md declares 11 questions and 7 results, and not one more',
    (arbre.match(/^\*\*q[0-9a-z]+\. /gm) || []).length === 11 &&
    (arbre.match(/^\*\*R[0-9]+\. /gm) || []).length === 7);

  // The README no longer reproduces the questionnaire, so the rows are gone;
  // the diagram of docs/ARBRE.md is still checked against the frozen routing.
  const routing = [], edges = [];
  for (const [id, node] of Object.entries(unil.nodes)) {
    if (node.type === 'multi') {
      const any = node.next.ifAny || R[node.next.ifAnyResult];
      const none = node.next.else || R[node.next.elseResult];
      routing.push([id, `au moins une case → ${any} ; aucune → ${none}`]);
      edges.push(`${id} -- au moins une case --> ${node.next.ifAny || R[node.next.ifAnyResult].toLowerCase()}`);
      edges.push(`${id} -- aucune --> ${node.next.else || R[node.next.elseResult].toLowerCase()}`);
    } else {
      const y = node.answers.find(a => a.value === 'yes');
      const no = node.answers.find(a => a.value === 'no');
      routing.push([id, `oui → ${y.to || R[y.result]} ; non → ${no.to || R[no.result]}`]);
      edges.push(`${id} -- oui --> ${y.to || R[y.result].toLowerCase()}`);
      edges.push(`${id} -- non --> ${no.to || R[no.result].toLowerCase()}`);
    }
  }
  const mermaid = arbre.slice(arbre.indexOf('```mermaid'), arbre.indexOf('```', arbre.indexOf('```mermaid') + 3));
  // Any arrow, labelled or not: `q1 --> q9` used to be invisible to this parser
  // and therefore free.
  const drawn = [...mermaid.matchAll(/^\s*([A-Za-z0-9_]+)\s*(?:--\s*(.+?)\s*)?-->\s*([A-Za-z0-9_]+)/gm)]
    .map(m => `${m[1]} -- ${m[2] === undefined ? '' : m[2]} --> ${m[3]}`);
  // The exact set, both ways: a missing edge is a lie by omission, an extra one
  // (q1 -- non --> q9, say) is a lie by addition, and only the first was caught.
  ok('the diagram of docs/ARBRE.md draws that routing and nothing else, edge for edge',
    JSON.stringify(drawn.slice().sort()) === JSON.stringify(edges.slice().sort()),
    drawn.filter(e => !edges.includes(e)).concat(edges.filter(e => !drawn.includes(e))).join(' | '));
  /* ---- ce que le README a le droit de reproduire ---------------------- */
  // The README is BSD and the questionnaire it describes is all rights reserved. It used to carry
  // the eleven question titles and the seven results verbatim, and five assertions here guaranteed
  // that the duplication survived every version. The rule now runs the other way round.
  const flatten = t => t.replace(new RegExp(NBSP, 'g'), ' ');
  const reserved = [...Object.values(unil.nodes).map(n => FR(n.title)),
    ...Object.values(unil.results).map(r => FR(r.title)),
    ...Object.values(unil.results).map(r => FR(r.solution.text)),
    ...Object.values(unil.results).filter(r => r.alert).map(r => FR(r.alert.text))]
    .filter(s => s && s.length > 25);
  const copied = reserved.filter(s => flatten(readme).includes(flatten(s)));
  ok(`the README reproduces none of the ${reserved.length} reserved strings of the questionnaire`,
    copied.length === 0, copied.join(' | '));
  ok('the README says what the questionnaire covers and sends the reader to docs/ARBRE.md for it',
    /## Ce que le questionnaire demande/.test(readme) && /docs\/ARBRE\.md/.test(readme) &&
    /tous droits réservés/.test(readme));
  /* ---- le haut de page, la ou il est reellement ----------------------- */
  // A marker is a whole line, comment wrapper and all: AI_GO-ENGINE-BEGIN is named in prose on
  // line 15 of the file, and reading its position with indexOf put the engine above the heading.
  const htmlLines = html.split('\n');
  const markerLine = k => htmlLines.findIndex(l =>
    l.trim().replace(/^\/\*\s*/, '').replace(/\s*\*\/$/, '').split(' ')[0] === k) + 1;
  const lineOf = s => htmlLines.findIndex(l => l.includes(s)) + 1;
  // Two guides put the h1 and the standfirst above the begin marker for a whole version. Only the
  // <title> is above; the other two are below the end marker. Read off the file, not off the pages.
  ok('the title sits above the content block and the h1 and the standfirst sit below it',
    lineOf('<title>') < markerLine('AI_GO-CONTENT-BEGIN') &&
    markerLine('AI_GO-CONTENT-END') < lineOf('<h1>') && lineOf('<h1>') < lineOf('class="lead"') &&
    lineOf('class="lead"') < markerLine('AI_GO-ENGINE-BEGIN'),
    [lineOf('<title>'), markerLine('AI_GO-CONTENT-BEGIN'), markerLine('AI_GO-CONTENT-END'),
      lineOf('<h1>'), lineOf('class="lead"'), markerLine('AI_GO-ENGINE-BEGIN')].join('/'));
  const oneLine = t => t.replace(/\s+/g, ' ');
  ok('the three pages that place them say below the end marker, which is where they are',
    /just below the end marker/.test(oneLine(guide)) &&
    /juste en dessous du marqueur de fin/.test(oneLine(read('docs/DEMARRER.md'))) &&
    /juste en dessous du marqueur de fin/.test(oneLine(readme)));
  // Three French pages named them three ways, one of which does not mean an h1 at all.
  const misnamed = ['README.md', 'docs/DEMARRER.md', 'SECURITY.md']
    .filter(p => new RegExp('titrage').test(read(p)));
  ok('the pages an adopter reads name the page title, the h1 and the standfirst the same way',
    misnamed.length === 0, misnamed.join(', '));
  /* ---- les chiffres que les pages citent ------------------------------ */
  // The lines of ai-go.html that lie outside the two blocks, inside the region a CMS paste carries.
  // LICENSE and the guide both state the number; it read 69 and the file held 53.
  // Read once, not once per line: markerLine scans the whole file, and calling it
  // four times inside a loop over two thousand lines cost eleven seconds.
  const cb = markerLine('AI_GO-CONTENT-BEGIN'), ce = markerLine('AI_GO-CONTENT-END');
  const eb = markerLine('AI_GO-ENGINE-BEGIN'), ee = markerLine('AI_GO-ENGINE-END');
  const inBlock = n => (n >= cb && n <= ce) || (n >= eb && n <= ee);
  let glue = 0;
  for (let n = markerLine('AI_GO-BEGIN'), stop = markerLine('AI_GO-END'); n <= stop; n++) if (!inBlock(n)) glue++;
  /* CE NOMBRE DECRIT NOTRE FICHIER. LICENSE et le guide sont a nous ; une
   * adoptante qui ecrit un chapeau sur trois lignes en a soixante, et n'a
   * aucune raison de reediter nos documents pour le dire. */
  if (onlyDelivered('the line count LICENSE and the guide state, which describes the delivered file'))
    ok(`LICENSE and the guide say the pasted region holds ${glue} lines outside the two blocks`,
      licence.includes(glue + ' lines') && guide.includes(glue + ' lines'), String(glue));
  // The corpus the two guides count, recomputed from that corpus, so the sentence cannot drift away
  // from the repository it describes. It read 504 strings and 64 places; the second number was 59.
  const quoted = t => t.match(/"(?:[^"\\]|\\.)*"/g) || [];
  const contentRegion = html.slice(html.indexOf('AI_GO-CONTENT-BEGIN'), html.indexOf('AI_GO-CONTENT-END'));
  const corpus = quoted(read('reference/aigo-unil.js')).concat(quoted(contentRegion));
  const FIRE = new RegExp('[^ ' + NBSP + String.fromCharCode(0x202f) + '\\\\]([:;?!%])', 'g');
  const fires = corpus.reduce((n, s) => n + (s.match(FIRE) || []).length, 0);
  const counts = t => t.includes(String(corpus.length)) && t.includes(String(fires));
  // The guides count the DELIVERED corpus. An adopter has written their own
  // content block, so their numbers differ and the sentence is not about them.
  if (asDelivered)
  ok(`both guides count ${corpus.length} strings and the ${fires} places an insertion would fire`,
    counts(read('docs/DEMARRER.md')) && counts(guide), corpus.length + ' and ' + fires);
  // The rule five pages hid for a version: an ordinary space typed before French punctuation is
  // converted too. Both guides have to say so, not merely stop claiming the opposite.
  ok('both guides say the tool converts the space you typed, the ordinary one included',
    /espace que vous avez tapée devant/.test(oneLine(read('docs/DEMARRER.md'))) &&
    /every space you typed before/.test(oneLine(guide)));

  // The frozen tree writes the typographic apostrophe, so the pages that quote it
  // have to as well, or a quotation stops being one. \u2019, never the ASCII one.
  const straight = ['README.md', 'docs/ARBRE.md'].filter(f => read(f).includes("'"));
  ok('the French pages use the typographic apostrophe, like the tree they quote',
    straight.length === 0, straight.join(', '));
  // No article of law may be cited in the French pages that the frozen tree does
  // not cite: art. 3 LRH turned into art. 4 LRH used to pass.
  const flat = t => t.replace(/\u00a0/g, ' ');
  const treeText = flat(JSON.stringify(unil));
  // Abbreviated or spelled out, with or without a paragraph letter: only one form
  // was recognised before, so `article 9 RGPD` sailed straight through.
  const CITE = /\b(?:art\.?|articles?)\s?(\d+[a-z]*)(?:\s*,)?(?:\s+(?:al\.|let\.)\s?[0-9a-z]+)*(?:\s*,)?\s+(?:du |de la |des )?([A-Za-z][A-Za-z-]{1,12})/gi;
  const cited = [...new Set([...flat(readme + arbre).matchAll(CITE)].map(m => m[1] + ' ' + m[2]))];
  const invented = cited.filter(c => !treeText.includes(c));
  ok(`the ${cited.length} article(s) of law cited in the French pages are the tree's own`,
    invented.length === 0, invented.join(' | '));
  // The signature the fingerprint does NOT sign. reference/aigo-unil.js calls the
  // object frozen; fingerprint() covers start, nodes, results and links only, so
  // the disclaimer could be inverted without moving cbdb4863aed9f778. Frozen here instead.
  const unsignedParts = JSON.stringify([unil.id, unil.version, unil.disclaimer, unil.publisher,
    unil.review, unil.jurisdiction, unil.legalBasis, unil.steps, unil.langs, unil.defaultLang,
    unil.derivedFrom === undefined ? null : unil.derivedFrom, unil.attribution === undefined ? null : unil.attribution,
    unil.ui === undefined ? null : unil.ui]);
  ok('the parts of the frozen tree the fingerprint does not sign are frozen here',
    AI_GO.hash(unsignedParts) === 'bd19c474d11698ef', AI_GO.hash(unsignedParts));
  const seq = oracle.map(k => R[k.split('⇒')[1].trim()]);
  const pathLines = arbre.slice(arbre.indexOf('## Les 20 chemins')).split('\n').filter(l => /^\d+\. /.test(l));
  // The result at the end AND one clause per question asked: a sentence that
  // drops or invents a step no longer passes on the strength of its last word.
  const steps = oracle.map(k => k.split('\u21d2')[0].split('\u2192').length);
  // Sentence AND machine form. Only the last word was compared, so a sentence
  // could describe a route the engine never takes and still pass.
  const badPath = pathLines.map((l, i) => {
    const key = (l.match(/`([^`]+)`\s*$/) || [])[1];
    const body = l.replace(/^\d+\.\s*/, '').split('\u21d2')[0];
    const ends = l.replace(/\s*`[^`]*`\s*$/, '').trim().endsWith('\u21d2 ' + seq[i] + '.');
    return !ends || key !== oracle[i].split('\u21d2')[0].trim() || body.split(' ; ').length !== steps[i] ? i + 1 : null;
  }).filter(Boolean);
  ok('the 20 paths of docs/ARBRE.md carry the route the oracle freezes, in words and in full',
    pathLines.length === 20 && badPath.length === 0, 'lines ' + badPath.join(', '));
  ok('README and docs/ARBRE.md cite the current content fingerprint and engine version',
    readme.includes(AI_GO.fingerprint(unil)) && arbre.includes(AI_GO.fingerprint(unil)) &&
    readme.includes(AI_GO.version) && arbre.includes(AI_GO.version));
  // The production page runs an earlier implementation. The denial is asserted as
  // a whole sentence: requiring two words let a reversed claim through.
  ok('README denies, in full, that the production page runs this file',
    readme.includes('**Ce qui tourne sur ia.unil.ch/AI_GO n’est pas encore ce fichier.**') &&
    !/(fait tourner|ex\u00e9cute) ce fichier/.test(readme));
  // Assembled from pieces, like the two rules above, so this file is not its own hit.
  const RESEARCH = new RegExp('donn\u00e9es de ' + 'recherche|research ' + 'data', 'i');
  const research = text.filter(p => RESEARCH.test(read(p)));
  ok('the wording is data, never the qualified form', research.length === 0, research.join(', '));
  // The regime the whole repository turns on: the questionnaire is published to
  // be read, not reused. It was the one self-imposed rule with no assertion.
  ok('the pages and the licence all say the questionnaire is all rights reserved',
    /tous droits r\u00e9serv\u00e9s/.test(readme) && /tous droits r\u00e9serv\u00e9s/.test(arbre) &&
    /ALL RIGHTS RESERVED/.test(read('LICENSE')) && /CC0/.test(read('LICENSE')) &&
    /ALL RIGHTS RESERVED/.test(read('reference/aigo-unil.js')));
  ok('SECURITY.md names a private channel, the limit of the guard and where answers live',
    /iaunil@unil\.ch/.test(read('SECURITY.md')) && /courtoisie|courtesy/i.test(read('SECURITY.md')) &&
    /sessionStorage/.test(read('SECURITY.md')));
  // The current version heads the list, and every heading is distinct: a bulk
  // rewrite of the version string once renamed the history underneath it.
  const heads = (read('CHANGELOG.md').match(/^## Moteur (\d+\.\d+\.\d+) /gm) || []);
  ok('CHANGELOG.md explains the single commit, opens on the current version, and gives each version one heading',
    read('CHANGELOG.md').includes(AI_GO.version) && /seul commit/.test(read('CHANGELOG.md')) &&
    heads.length > 1 && heads[0].includes(AI_GO.version) && new Set(heads).size === heads.length,
    heads.join(' / '));
  // A blank line inside a Markdown list closes it: GitHub renders the rest as a
  // second list, and the entry reads as two. Invisible in a diff, obvious online.
  const doubled = text.filter(p => /\.md$/.test(p) && read(p).includes('\n\n\n'));
  ok('no Markdown page carries a doubled blank line, which splits a list in two on GitHub',
    doubled.length === 0, doubled.join(', '));
  /* ---- la langue des refus ------------------------------------------ */
  // 3.0.14 made the refusal sentences follow the tree. Three pages went on
  // saying the opposite for a whole version, and no page said what decides it.
  // Assembled from pieces, like the two rules above, so this file is not a hit
  // for the sentences it is looking for.
  const ENGLISH_ONLY = new RegExp(['messages sont \u00e9crits en angl' + 'ais',
    'written in Engl' + 'ish even', 'in Engl' + 'ish only'].join('|'));
  const stale = text.filter(p => ENGLISH_ONLY.test(read(p)));
  ok('no page still says the refusal sentences are written in English whatever the page',
    stale.length === 0, stale.join(', '));
  ok('the three pages an adopter reads name defaultLang as what decides that language',
    /defaultLang/.test(read('docs/DEMARRER.md')) && /defaultLang/.test(guide) && /defaultLang/.test(readme));
  // Checked on the engine, not read off a page: the container attributes decide
  // the box, `defaultLang` decides the sentences inside it.
  const refusalIn = l => {
    const t = cp(signed); t.langs = ['en', 'fr']; t.defaultLang = l; delete t.publisher;
    return AI_GO.guard(t, 'example.org').map(i => i.message).join(' ');
  };
  ok('the refusal sentences follow tree.defaultLang, which is what the pages now say',
    /Qui publie/.test(refusalIn('fr')) && /Who publishes/.test(refusalIn('en')),
    refusalIn('fr').slice(0, 60));
  // The pages state the number, so a sentence added or dropped has to move them.
  const SENTENCES = { 33: ['trente-trois', 'thirty-three'], 34: ['trente-quatre', 'thirty-four'],
    35: ['trente-cinq', 'thirty-five'], 36: ['trente-six', 'thirty-six'], 37: ['trente-sept', 'thirty-seven'],
    38: ['trente-huit', 'thirty-eight'], 39: ['trente-neuf', 'thirty-nine'], 40: ['quarante', 'forty'],
    41: ['quarante et une', 'forty-one'], 42: ['quarante-deux', 'forty-two'] };
  const nMsg = Object.keys(AI_GO.UI.en.msg).length;
  ok(`the guides and the README say the engine ships ${nMsg} refusal sentences, which is what it ships`,
    Object.keys(AI_GO.UI.fr.msg).length === nMsg && !!SENTENCES[nMsg] &&
    read('docs/DEMARRER.md').includes(SENTENCES[nMsg][0]) && guide.includes(SENTENCES[nMsg][1]) &&
    readme.includes(SENTENCES[nMsg][0]), String(nMsg));
  ok('the French sentences cover exactly the English keys, so none falls back to English unnoticed',
    JSON.stringify(Object.keys(AI_GO.UI.en.msg).sort()) === JSON.stringify(Object.keys(AI_GO.UI.fr.msg).sort()));

  /* ---- ce que le README fait telecharger ---------------------------- */
  // A reader who followed the README to the letter got "Cannot find module":
  // it ran the tool without ever saying to download it.
  ok('README names the typography tool and the one command that runs it',
    readme.includes('tools/typographie.mjs') && readme.includes('node tools/typographie.mjs ai-go.html'));
  ok('the README inventory names every file an adopter downloads, LICENSE and the tool included',
    ['ai-go.html', 'check.html', 'test/run.mjs', 'tools/typographie.mjs', 'LICENSE', 'CITATION.cff']
      .every(f => readme.includes(f)));
  ok('the guide tells an integrator to save the tool, since it makes them run it',
    guide.includes('tools/typographie.mjs'));

  /* ---- la clause 1 de la licence BSD -------------------------------- */
  // Clause 1 asks that the notice, the conditions and the disclaimer be retained
  // in a redistribution of source. A file taken alone out of this repository
  // carried none of them, and both documented integration paths ship files alone.
  const HOLDER = 'Copyright (c) 2026, Universit\u00e9 de Lausanne, Cellule strat\u00e9gique IA';
  const bears = t => t.includes(HOLDER) && t.includes('BSD-3-Clause') && t.includes('LICENSE');
  const bare = ['check.html', 'test/run.mjs', 'tools/typographie.mjs'].filter(p => !bears(read(p)));
  ok('every file the BSD licence covers carries the notice, since each is distributed alone',
    bare.length === 0, bare.join(', '));
  // The engine block travels alone twice over: an engine update replaces it, and
  // a CMS paste carries it without the repository around it.
  ok('the engine block carries the notice too, and not merely a pointer',
    bears(engineBlock));
  ok('the two integration paths tell the integrator to ship LICENSE alongside',
    /LICENSE/.test(guide) && /ship\s+`?LICENSE|`LICENSE` (next to|with|beside)/i.test(guide));
  /* ---- le registre des publications ----------------------------------- */
  // The repository is rewritten as a single commit, so the id of an older version
  // stops existing on GitHub the moment the next one lands, and a legal reader has
  // nothing left to point at. docs/PUBLICATIONS.md is what survives, and it is
  // worth exactly as much as its top entry is current: the entry has to carry the
  // version this file declares, and the digest of every file that travels alone.
  const register = read('docs/PUBLICATIONS.md');
  const TRAVELS = ['ai-go.html', 'check.html', 'test/run.mjs', 'tools/typographie.mjs'];
  const digest = f => createHash('sha256').update(readFileSync(join(ROOT, f))).digest('hex');
  const head = register.slice(register.indexOf('## Moteur'), register.indexOf('## Moteur', register.indexOf('## Moteur') + 5));
  // Bound to the file NAME, not searched anywhere in the entry: swapping two names
  // used to pass, and an old value kept in a note beside the new one used to pass too.
  const said = f => {
    const m = head.match(new RegExp('`' + f.replace(/[.\/]/g, '\\$&') + '`[^`]*`([0-9a-f]{64})`'));
    return m ? m[1] : null;
  };
  const outdated = TRAVELS.filter(f => said(f) !== digest(f));
  // Only on the delivered files. An adopter has written their own questionnaire,
  // so their ai-go.html differs from every entry by construction, and telling
  // them their register is stale would be the third false alarm of its kind.
  if (asDelivered)
  ok('the publication register opens on this version, with the digest of every file that travels alone',
    head.indexOf('## Moteur ' + AI_GO.version + '\u00a0· publié le ') === 0 && outdated.length === 0,
    'à régénérer : ' + outdated.map(f => f + ' = ' + digest(f)).join(' | '));
  // A file that did not change between two versions keeps its digest, and that is
  // the point of a digest. What may not repeat is a whole ENTRY: two versions with
  // the same four digests would be one publication announced twice.
  const entries = register.split(/^## Moteur /m).slice(1)
    .map(e => (e.match(/`[0-9a-f]{64}`/g) || []).join(','));
  const digests = register.match(/`[0-9a-f]{64}`/g) || [];
  // The count is frozen, not recomputed from the file it is meant to guard: the
  // sentence used to rewrite its own numbers, so deleting three entries stayed green.
  const RELEASES = 7;
  ok(`the register carries the ${RELEASES} versions published so far, and no entry twice`,
    entries.length === RELEASES && new Set(entries).size === entries.length &&
    entries.every(e => e.length > 0),
    entries.length + ' entrées ; doublons : ' +
    entries.filter((e, i) => entries.indexOf(e) !== i).join(' | '));
  // Inside one entry the four files are four different files.
  const collided = entries.filter(e => { const d = e.split(','); return new Set(d).size !== d.length; });
  ok('and inside an entry the four digests are four different files',
    collided.length === 0, collided.join(' | '));
  // A frozen value nobody can recompute is a value the next maintainer will
  // either delete or paste over. The page that lists them has to list them all.
  const contrib = read('CONTRIBUTING.md');
  // POLICY.example was a frozen value this table did not list, and it went stale in
  // production: the guard that refuses the shipped example could no longer fire.
  // Les sept lignes du tableau de CONTRIBUTING.md, et non cinq ancres choisies :
  // l'intitule annoncait cinq valeurs gelees pendant que la page en tenait sept.
  const FROZEN = ['AI_GO-ENGINE-BEGIN', 'STARTER_FINGERPRINT', 'cbdb4863aed9f778',
    'docs/PUBLICATIONS.md', 'POLICY.example', 'Gel des champs non signés',
    'Diagramme et vingt chemins'];
  const unlisted = FROZEN.filter(v => contrib.indexOf(v) < 0);
  ok(`CONTRIBUTING.md names the ${FROZEN.length} frozen values and how each is recomputed`,
    unlisted.length === 0 && /message d\u2019\u00e9chec/.test(contrib), unlisted.join(', '));
  // ---- WHAT THE ENGINE IMPOSES ON THE INSTITUTION, IT SAYS OUT LOUD --------
  // Two decisions the engine makes for whoever adopts it, and used to make in
  // silence. The review has a shelf life: 548 days after `review.date` the page
  // states, under every result and in front of the institution's own readers,
  // that its review is out of date. Nobody is alerted; the page says it. And the
  // review date has ONE written form: a Swiss `03.12.2026` was accepted and read
  // as the eleventh of March, printing a wrong date and starting that clock nine
  // months early. Neither figure was written in any page an adopter reads -- the
  // 548 lived in a comment inside the engine block, which the guide tells them
  // never to open.
  {
    const REVIEW_PAGES = ['docs/DEMARRER.md', 'docs/INTEGRATE.md'];
    const days = String(AI_GO.POLICY.reviewMaxDays);
    const mute = REVIEW_PAGES.filter(f => read(f).indexOf(days) < 0);
    ok(`the ${REVIEW_PAGES.length} guides state the ${days} days after which the page calls its own review out of date`,
      mute.length === 0, mute.join(', '));
    const noForm = REVIEW_PAGES.filter(f => !/AAAA-MM-JJ|YYYY-MM-DD/.test(read(f)));
    ok('and they state the one form a review date may be written in',
      noForm.length === 0, noForm.join(', '));
  }

  // ---- THE NUMBERS THIS REPOSITORY PUBLISHES ABOUT ITSELF ------------------
  // A repository whose verdict rests on the exactness of its own figures cannot
  // leave those figures unread. Three were stale at once: the assertion count of
  // the current entry, the number of pages carrying the frozen fingerprint, and
  // the interface-key count, which the engine states in two places that had
  // already drifted apart by one. Each was written by hand and read by nobody.
  {
    const entry = read('CHANGELOG.md').split(/^## Moteur /m)[1] || '';
    const claimed = (entry.match(/passe de \d+ à (\d+) assertions/) || [])[1];
    ok('the current changelog entry states the number of assertions this harness carries',
      claimed !== undefined && Number(claimed) === ASSERTIONS,
      `annoncé ${claimed}, harnais ${ASSERTIONS}`);

    const CARRIERS = ['README.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'SECURITY.md',
      'docs/ARBRE.md', 'docs/PUBLICATIONS.md', 'docs/DEMARRER.md', 'docs/INTEGRATE.md'];
    const frozenPrint = AI_GO.fingerprint(unil);
    const carrying = CARRIERS.filter(f => read(f).indexOf(frozenPrint.slice(0, 8)) >= 0);
    const FR_NUM = { une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8 };
    const wordSaid = (read('CONTRIBUTING.md').match(/dans le harnais et (\w+) pages/) || [])[1];
    ok('CONTRIBUTING.md counts the pages that carry the frozen fingerprint, and counts them right',
      FR_NUM[wordSaid] === carrying.length,
      `dit « ${wordSaid} » (${FR_NUM[wordSaid]}), portée par ${carrying.length} : ${carrying.join(', ')}`);

    // The engine names its interface keys once, in the header, and states how
    // many. The content block states the same number in French. Both are read
    // against the list itself, so a key added to the engine and to one list only
    // stops the run instead of waiting for the next audit.
    const listed = (html.match(/INTERFACE STRING KEYS[\s\S]*?\n((?: \*   [^\n]*\n)+)/) || [])[1] || '';
    const names = listed.split('\n').join(' ').split(/\s+/).filter(w => /^[a-zA-Z][A-Za-z0-9]*$/.test(w));
    const headSaid = (html.match(/That is (\d+) keys/) || [])[1];
    const blockSaid = (html.match(/Le moteur porte (\d+) clés/) || [])[1];
    // The French sentence lives in the CONTENT block, which an adopter replaces
    // with their own questionnaire. Asking them for our sentence would be the
    // fourth false alarm of this kind, so it is asked of the delivered file only,
    // and the run says which half it read.
    ok(`the engine states its interface-key count${asDelivered ? ' twice' : ''}, and the list itself agrees`,
      names.length === Number(headSaid) && (!asDelivered || headSaid === blockSaid),
      `en-tête ${headSaid}, bloc de contenu ${blockSaid}, liste ${names.length}`);
    // And every name on that list is one the engine actually reads, so the list
    // cannot be padded into agreement with a number.
    const unread = names.filter(k => k !== 'msg' && engineCode.indexOf(k) < 0);
    ok('and every key it names is one the engine reads', unread.length === 0, unread.join(', '));
  }

  ok('CONTRIBUTING.md says where a defect goes and what happens to a pull request',
    /pull request/i.test(read('CONTRIBUTING.md')) && /issue/.test(read('CONTRIBUTING.md')) &&
    /iaunil@unil\.ch/.test(read('CONTRIBUTING.md')));
  ok('no build file, no manifest, no lockfile',
    !every.some(p => /package\.json|package-lock|yarn\.lock|node_modules/.test(p)));
});

if (!asDelivered) {
  const yours = AI_GO.guard(starter, '');
  console.log('\n  The engine is intact and your content is structurally sound.');
  console.log('  What is left to check is editorial, and check.html is where you read it:');
  console.log('  ' + (yours.length
    ? yours.length + ' point(s) still stand between this file and publication.'
    : 'no publication point outstanding.'));
}
if (skipped.length || !isThisRepository) {
  // Never let a smaller run look like a complete one.
  console.log('\n  This run was reduced. Not checked here:');
  skipped.concat(isThisRepository ? [] : ['the pages of this repository'])
    .forEach(l => console.log('    - ' + l));
}
// The count itself, which is the one figure the run can check about itself. It
// is read INSIDE the assertion, where n has not yet been incremented for it, so
// the number below is the whole run including this line.
if (isThisRepository && !skipped.length) {
  ok(`this harness carries the ${ASSERTIONS} assertions the changelog announces`,
    n + 1 === ASSERTIONS, `compté ${n + 1}`);
}
console.log(`\n${n - fails}/${n} passed${skipped.length || !isThisRepository ? ' (reduced set)' : ''}`);
process.exit(fails ? 1 : 0);
