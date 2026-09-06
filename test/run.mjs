// Test harness. No dependency. Run: node test/run.mjs
// Exit code 1 on any failure. Every agent touching this repository keeps it green.
//
// There is one engine in this repository and one path enumerator, and both are
// taken from the files that ship: the engine out of the block of ai-go.html,
// the enumerator out of the inline script of check.html. Nothing here is a
// parallel copy that could pass while the shipped file is broken.
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = new URL('..', import.meta.url).pathname;
const read = f => readFileSync(join(ROOT, f), 'utf8');
const cp = o => JSON.parse(JSON.stringify(o));
// Written as codes, never as characters: this file is scanned by its own rules.
const EM_DASH = String.fromCharCode(0x2014);
const NBSP = String.fromCharCode(0x00a0);
const OTHER_NAME = new RegExp('guide' + 'post|\\bgp' + '-|guide' + '-donnees', 'i');
// Assembled from pieces, and from code points, so that this file is not itself
// a hit for the two rules it enforces on the repository.
const ASSISTANT = new RegExp('Cla' + 'ude', 'g');
const ACCENTS = /[\u00e0\u00e7\u00e8\u00e9\u00ea\u00eb\u00ee\u00f4\u00fb]/i;

let fails = 0, n = 0;
const own = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);
const ok = (name, cond, detail) => {
  n++; if (!cond) fails++;
  console.log(`  ${cond ? 'ok ' : 'FAIL'} ${name}${!cond && detail ? '  <- ' + detail : ''}`);
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
const engineCode = CHECK.innerScript(engineBlock).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

// The content the file is delivered with, and a signed variant of it. The
// fixture is made from the DELIVERED content, in memory: it cannot drift from
// what an institution downloads, the way a separate example file would.
const starter = CHECK.loadContent(html).value;
const signed = cp(starter);
signed.id = 'hes-example-ia';
signed.publisher = { name: 'Example University of Applied Sciences', domains: ['hes-example.ch'] };
signed.review = { by: 'Legal service', date: '2026-06-01' };
signed.jurisdiction = 'CH-VD';
signed.legalBasis = ['FADP'];
signed.disclaimer = '**Disclaimer:** our own text.';

const unil = require(join(ROOT, 'reference/aigo-unil.js'));
const oracle = require(join(ROOT, 'reference/aigo-unil.paths.js'));

const errs = t => AI_GO.structure(t);
const paths = t => CHECK.paths(t);
// Position of a marker LINE, never the first textual match: the file's own
// instructions name every marker in prose above the markers themselves.
const at = tok => CHECK.markers(html).found.find(f => f.token === tok).hits[0].index;

// Mechanically turns a one-language tree into a two-language one, so that the
// bilingual format is tested on the SAME tree as the single-language format.
const bilingual = (tree, second) => {
  const t = cp(tree);
  const w = v => (typeof v === 'string' ? { en: v, [second]: 'X ' + v }
    : Array.isArray(v) ? { en: v, [second]: v } : v);
  t.langs = ['en', second]; t.defaultLang = 'en';
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
{
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
  ok('ai-go.html is delivered with its placeholders intact',
    AI_GO.guard(starter, '').some(i => /TO_FILL_IN/.test(i.message)),
    'without them every adopter would publish a signed example under its own name');
}

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
ok('the only outbound message is the iframe height, and it is documented',
  (engineCode.match(/postMessage/g) || []).length === 1 &&
  /aigo: 'height'/.test(engineCode) && /data-aigo/.test(read('docs/INTEGRATE.md')));
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
  const opens = (src.match(/<script/g) || []).length;
  const closes = (src.match(/<\/script/g) || []).length;
  ok(`${page}: script tags pair up (${opens} open, ${closes} close)`, opens === closes && opens === bodies.length);
  ok(`${page}: no script tag or comment opener inside a script body`,
    bodies.every(b => !b.includes('<script') && !b.includes('<!--')));
  ok(`${page}: declares its Content Security Policy`, /default-src 'none'/.test(src));
  ok(`${page}: loads nothing from anywhere`, !/\ssrc\s*=/.test(src) && !/<link\b/.test(src));
  ok(`${page}: no literal non-breaking space`, !src.includes(NBSP));
  ok(`${page}: no em dash`, !src.includes(EM_DASH));
}

console.log('pages: the two halves of ai-go.html');
{
  // The adopter's half is what lies between the end of the content block and the
  // start of the engine block.
  const themeBlock = html.slice(at('AI_GO-CONTENT-END'), at('AI_GO-ENGINE-BEGIN'));
  ok('the adopter half sits before the engine, and both are found by marker line',
    at('AI_GO-BEGIN') < at('AI_GO-CONTENT-BEGIN') && at('AI_GO-CONTENT-END') < at('AI_GO-ENGINE-BEGIN') &&
    at('AI_GO-ENGINE-END') < at('AI_GO-END'));
  ok('the adopter half redefines no accessibility rule',
    !themeBlock.includes('.aigo-sr-only') && !themeBlock.includes(':focus-visible'));
  ok('the adopter half carries the container and the commented theme variables',
    /data-ai-go="AI_GO_CONTENT"/.test(themeBlock) && /--aigo-accent/.test(themeBlock));
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
  ok('the content block shows how to add an interface language without touching the engine',
    /ui: \{ de: \{/.test(html.slice(at('AI_GO-CONTENT-BEGIN'), at('AI_GO-CONTENT-END'))));
}

// Everything above tests the ENGINE and the shape of the file, and holds whatever
// content the file carries. Everything below is written against the questionnaire
// this repository ships. An institution that replaced it has not broken anything:
// it has moved beyond what this harness can assert. Say so, check what still can
// be checked, and stop, rather than crash on a node name that no longer exists.
const asDelivered =
  own(starter, 'nodes') && own(starter.nodes, 'q1') && own(starter.nodes, 'q2') && own(starter.nodes, 'q3') &&
  own(starter, 'results') && own(starter.results, 'open') &&
  own(starter, 'links') && own(starter.links, 'guide');

if (!asDelivered) {
  console.log('content: yours, not the one this file was delivered with');
  const yours = AI_GO.guard(starter, '');
  ok('your content loads and has no structural error', errs(starter).length === 0,
    errs(starter).map(e => e.path + ': ' + e.message).join(' | '));
  ok('your content has at least one reachable path', paths(starter).length > 0);
  ok('your content reaches every result it declares',
    Object.keys(starter.results).every(id => paths(starter).some(p => p.result === id)),
    Object.keys(starter.results).filter(id => !paths(starter).some(p => p.result === id)).join(','));
  console.log('\n  The engine is intact and your content is structurally sound.');
  console.log('  What is left to check is editorial, and check.html is where you read it:');
  console.log('  ' + (yours.length
    ? yours.length + ' point(s) still stand between this file and publication.'
    : 'no publication point outstanding.'));
  console.log(`\n${n - fails}/${n} passed`);
  process.exit(fails ? 1 : 0);
}

console.log('content: the file as delivered');
ok('starter: 0 structural errors', errs(starter).length === 0, errs(starter).map(e => e.path).join(','));
ok('starter: 5 paths', paths(starter).length === 5, String(paths(starter).length));
ok('starter: refused for publication, 7 points', AI_GO.guard(starter, '').length === 7,
  AI_GO.guard(starter, '').map(i => i.path).join(','));
ok('starter: a placeholder review date is reported once, as a placeholder',
  AI_GO.guard(starter, '').filter(i => i.path === 'review.date').length === 1);
ok('starter: one language, so every text is a plain string and check.html says nothing about it',
  starter.langs.length === 1 && typeof starter.nodes.q1.title === 'string' &&
  !CHECK.extras(starter, paths(starter)).some(i => /Untranslated/.test(i.message)));
ok('signed variant: 0 structural errors and 5 paths', errs(signed).length === 0 && paths(signed).length === 5);
ok('signed variant: guard passes on its own domain', AI_GO.guard(signed, 'www.hes-example.ch').length === 0,
  AI_GO.guard(signed, 'www.hes-example.ch').map(i => i.path + ': ' + i.message).join(' | '));

console.log('content: the frozen UNIL tree, bilingual, on the same engine');
ok('aigo-unil: content fingerprint is 59b6dc65', AI_GO.fingerprint(unil) === '59b6dc65', AI_GO.fingerprint(unil));
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
{
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
  ok('aigo-unil: a lowercased copy of the origin name is caught too',
    AI_GO.guard(JSON.parse(JSON.stringify(unil).replace(/UNIL/g, 'unil')), 'www.hes-example.ch')
      .some(i => /still names/i.test(i.message) || i.path.startsWith('nodes')));
}
ok('aigo-unil: the content block of ai-go.html and the reference file share one variable name',
  /var AI_GO_CONTENT = \{/.test(read('reference/aigo-unil.js')) && /var AI_GO_CONTENT = \{/.test(html));
{
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
}

console.log('guard: individual locks');
let t;
t = cp(signed); t.review.by = 'TO_FILL_IN';
ok('placeholder in review.by refused', AI_GO.guard(t, 'hes-example.ch').some(i => i.path === 'review.by'));
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
t = cp(signed); t.review.by = 'University of Lausanne (external review)';
ok('the origin name tolerated in a signature field', !AI_GO.guard(t, 'hes-example.ch').some(i => i.path === 'review.by'));
ok('an undeclared domain refused', AI_GO.guard(signed, 'other.example').some(i => i.path === 'publisher.domains'));
ok('dot boundary: evilhes-example.ch is not hes-example.ch',
  AI_GO.guard(signed, 'evilhes-example.ch').some(i => i.path === 'publisher.domains'));
t = cp(signed);
t.links.r = { label: 'x', href: '/relative' };
t.links.m = { label: 'y', href: 'mailto:a@b.c' };
t.links.h = { label: 'z', href: '#' };
ok('relative, mailto and hash links accepted without crash', AI_GO.guard(t, 'hes-example.ch').length === 0);

// A signature has to be readable text, and a review date has to be a date that
// exists. `publisher.name: true` used to satisfy a truthiness test and print a
// footer reading "true, reviewed by true"; "2026-02-31" used to be accepted and
// silently rolled over to 3 March.
{
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
}

console.log('messages: every refusal has a sentence, and none is dead code');
{
  const keys = Object.keys(AI_GO.UI.en.msg);
  // Not a pinned total: a new refusal is a normal thing to add, and a count that
  // has to be edited teaches people to edit counts. What matters is that every
  // declared sentence is real, and (below) that every one of them is used.
  ok(`the engine declares ${keys.length} refusal sentences, all non-empty`,
    keys.length > 25 && keys.every(k => typeof AI_GO.UI.en.msg[k] === 'string' && AI_GO.UI.en.msg[k].length > 0),
    String(keys.length));
  ok('no refusal key is dead code', keys.every(k => engineCode.includes(`'${k}'`)),
    keys.filter(k => !engineCode.includes(`'${k}'`)).join(', '));
  // A key used but not declared makes phrase() return the raw key. Fire a
  // battery of broken trees and check nothing comes back looking like one.
  const broken = [{}, null, [], cp(starter), cp(unil),
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
  // The engine is English. The shipped French set is labels only: it may not
  // introduce a key the English base does not define, or the tree.ui contract
  // documented in the file would be a lie.
  const enKeys = Object.keys(AI_GO.UI.en), frKeys = Object.keys(AI_GO.UI.fr);
  ok('the shipped French label set only overrides keys the English base defines',
    frKeys.every(k => enKeys.includes(k)) && !frKeys.includes('msg'),
    frKeys.filter(k => !enKeys.includes(k)).join(', '));
  ok('the interface keys documented in the engine header are the ones it uses',
    (html.match(/\* {3}back continue restart stepOf/) || []).length === 1 &&
    frKeys.every(k => html.includes(k)));
}

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
{
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
  const holes = cp(starter);
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
  const inherited = cp(starter); inherited.start = 'constructor';
  ok('an identifier inherited from Object.prototype is not a node',
    errs(inherited).some(e => e.path === 'start') && CHECK.paths(inherited).length === 0);
  const inheritedLink = cp(signed); inheritedLink.results.open.allowed = ['constructor'];
  ok('an inherited key is not a link', errs(inheritedLink).some(e => e.path === 'results.open.allowed'));
  const gone = cp(starter); gone.nodes.q1.answers[0].to = 'q9';
  ok('a target that resolves nowhere is refused at mount time, not in production',
    errs(gone).some(e => e.path === 'nodes.q1.answers[0]'));
  const untranslated = bilingual(starter, 'de'); delete untranslated.nodes.q1.title.de;
  ok('a missing translation is refused, never served as a silent fallback',
    errs(untranslated).some(e => e.path === 'nodes.q1.title'));
}

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
{
  const cyclic = { start: 'a', nodes: {} }; cyclic.self = cyclic;
  let threw = null;
  try { AI_GO.guard(cyclic, 'example.ch'); AI_GO.fingerprint(cyclic); } catch (e) { threw = e.message; }
  ok('a self-referential tree is reported, not a stack overflow', threw === null, threw);
}

console.log('paths: truncation is signalled, never silent');
{
  const chain = k => {
    const nodes = {};
    for (let i = 0; i < k; i++) nodes['q' + i] = {
      type: 'single', step: 's1', title: 'x',
      answers: [{ value: 'yes', to: i < k - 1 ? 'q' + (i + 1) : undefined, result: i < k - 1 ? undefined : 'end' },
                { value: 'no', result: 'end' }]
    };
    return { id: 't', langs: ['en'], defaultLang: 'en', start: 'q0', steps: [{ id: 's1', name: 's' }], nodes, results: { end: { level: 'info', title: 'e' } } };
  };
  let deep = null;
  try { deep = CHECK.paths(chain(6000)); ok('a 6000-node chain does not overflow the stack', true); }
  catch (e) { ok('a 6000-node chain does not overflow the stack', false, e.constructor.name); }
  ok('a 6000-node chain sets the truncated flag', !!deep && deep.truncated === true);
  ok('a 450-node chain is not truncated', CHECK.paths(chain(450)).truncated === false);
  ok('a routing diff reports truncation instead of answering "0 path added"',
    CHECK.routingDiff(chain(6000), chain(6000)).truncated === true);
  const orphanTarget = cp(starter); orphanTarget.nodes.q1.answers[1].to = 'gone';
  ok('a target that does not exist is enumerated as a dead end, not silently dropped',
    CHECK.paths(orphanTarget).length === 4 && CHECK.paths(orphanTarget).some(p => p.dangling) &&
    CHECK.extras(orphanTarget, CHECK.paths(orphanTarget)).some(i => i.level === 'error' && i.where === 'paths'),
    'a broken tree must not report fewer paths, it must report an error');
  const cyclic = cp(starter); cyclic.nodes.q3.answers[0].result = undefined; cyclic.nodes.q3.answers[0].to = 'q1';
  ok('a cycle is enumerated as a cycle, not as an infinite loop',
    CHECK.paths(cyclic).some(p => p.cycle === 'q1'));
}

console.log('the receipt: one fingerprint, a routing diff and a source lint');
{
  const a = cp(starter), b = cp(starter);
  b.nodes.q1.title = 'reworded';
  ok('a wording change moves no path', CHECK.routingDiff(a, b).added.length === 0 && CHECK.routingDiff(a, b).removed.length === 0);
  const c = cp(starter); c.nodes.q3.answers[1].result = 'restricted';
  ok('a routing change is detected', CHECK.routingDiff(a, c).added.length + CHECK.routingDiff(a, c).removed.length > 0);
  ok('the fingerprint is 8 hex characters', /^[0-9a-f]{8}$/.test(AI_GO.fingerprint(signed)));
  ok('the fingerprint moves with the content', AI_GO.fingerprint(signed) !== AI_GO.fingerprint(c));
  ok('the fingerprint ignores the signature, so signing changes nothing',
    AI_GO.fingerprint(starter) === AI_GO.fingerprint(signed));
  ok('a reworded question moves the fingerprint', AI_GO.fingerprint(b) !== AI_GO.fingerprint(a));
  ok('the delivered content passes the source lint', CHECK.lintContent(html, starter).length === 0,
    CHECK.lintContent(html, starter).map(i => i.where).join(', '));
  // Translating the questions and leaving <html lang> as it shipped makes a
  // screen reader read the new language with the old voice. Nothing in the
  // engine can see the page, so the validator is where this has to be caught.
  {
    const translated = cp(starter); translated.langs = ['de']; translated.defaultLang = 'de';
    ok('a page whose lang contradicts the questionnaire language is reported',
      CHECK.lintContent(html, translated).some(i => i.where === '<html lang>'),
      CHECK.lintContent(html, translated).map(i => i.where).join(', '));
    ok('and a page whose lang agrees with it is not',
      !CHECK.lintContent(html, starter).some(i => i.where === '<html lang>'));
  }
  ok('the frozen UNIL content passes the source lint',
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
  const halfTranslated = bilingual(signed, 'de'); halfTranslated.nodes.q1.title = 'a bare string';
  ok('a bare string in a two-language tree is a validator warning',
    CHECK.extras(halfTranslated, CHECK.paths(halfTranslated)).some(i => i.where === 'nodes.q1.title'));
}

console.log('engine: rendering (minimal DOM shim)');
// A tiny fake DOM: only what the engine touches. Enough to assert the
// accessibility invariants on the code that actually ships.
{
  const raf = [];
  class N {
    constructor(t) { this.tagName = t; this.children = []; this.attrs = {}; this.on = {}; this.p = {}; }
    get className() { return this.attrs.class || ''; } set className(v) { this.attrs.class = v; }
    get classList() { const s = this; return { add: c => { s.attrs.class = [...new Set((s.className + ' ' + c).trim().split(/\s+/))].join(' '); }, remove: c => { s.attrs.class = s.className.split(/\s+/).filter(x => x && x !== c).join(' '); }, contains: c => s.className.split(/\s+/).includes(c) }; }
    get textContent() { return this.children.map(c => typeof c === 'string' ? c : c.textContent).join(''); } set textContent(v) { this.children = v === '' ? [] : [String(v)]; }
    appendChild(c) { this.children.push(c); return c; } insertBefore(c) { this.children.unshift(c); return c; } get firstChild() { return this.children[0] || null; }
    setAttribute(k, v) { this.attrs[k] = String(v); } getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
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
  const inst = AI_GO.mount(root, starter, { lang: 'en', storageKey: 'test' });
  ok('a double-clicked file mounts in preview mode with an empty hostname',
    !!inst && inst.mode === 'preview' && inst.issues.length > 0);
  ok('the preview banner comes first and counts the open points',
    root.firstChild.className === 'aigo-banner' && root.firstChild.textContent.includes(String(inst.issues.length)));
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
  ok('the step change is announced with the step label',
    root.querySelector('[role]').textContent === 'Step 2 of 3: ' + starter.nodes.q2.title,
    root.querySelector('[role]').textContent);
  ok('a checkbox question uses fieldset and a legend that repeats the question',
    // An empty legend is still a legend, and announces nothing: assert the words.
    !!root.querySelector('.aigo-fieldset') &&
    root.querySelector('.aigo-fieldset').firstChild.tagName === 'legend' &&
    root.querySelector('.aigo-fieldset').firstChild.textContent === starter.nodes.q2.title,
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
    root.querySelector('.aigo-content-id').textContent.includes(AI_GO.fingerprint(starter)) &&
    root.querySelector('.aigo-content-id').textContent.includes(AI_GO.version));
  ok('the container carries the fingerprint for a right-click inspection',
    root.attrs['data-ai-go-content'] === AI_GO.fingerprint(starter) &&
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

  store.set('test:state', JSON.stringify({ path: ['q1', 'gone'], answers: {}, result: null, tv: starter.version, lang: 'en' }));
  const inst2 = AI_GO.mount(root, starter, { lang: 'en', storageKey: 'test' }); flush();
  ok('a stale session is rejected, announced, and the tree starts over',
    inst2.node === 'q1' && root.querySelector('[role]').textContent === AI_GO.UI.en.staleError);
  inst2.destroy();
  store.set('test:state', JSON.stringify({ path: ['q1', 'q3'], answers: { q1: 'no' }, result: null, tv: 'other', lang: 'en' }));
  const inst3 = AI_GO.mount(root, starter, { lang: 'en', storageKey: 'test' }); flush();
  ok('a session from another tree version is rejected', inst3.node === 'q1');
  inst3.destroy();
  // A session edited by hand, or written before an option was renamed, used to
  // show no ticked box and yet route as though one were ticked: the reader saw
  // an empty question and got the "at least one" verdict.
  store.set('test:state', JSON.stringify({ path: ['q1', 'q2'], answers: { q1: 'yes', q2: ['gone'] },
    result: null, tv: starter.version, lang: 'en' }));
  const inst4 = AI_GO.mount(root, starter, { lang: 'en', storageKey: 'test' }); flush();
  ok('a session value no option declares is dropped, not trusted',
    JSON.stringify(inst4.getState().answers.q2) === '[]',
    JSON.stringify(inst4.getState().answers));
  root.querySelector('.aigo-btn-primary').fire('click'); flush();
  ok('and the question then routes as the empty answer it looks like',
    inst4.result === starter.nodes.q2.next.elseResult || inst4.node === starter.nodes.q2.next.else,
    String(inst4.result) + '/' + String(inst4.node));
  inst4.destroy(); store.delete('test:state');

  const r2 = new N('div');
  ok('strict mode refuses unsigned content: null, role=alert, one item per point',
    AI_GO.mount(r2, starter, { mode: 'strict' }) === null && r2.firstChild.attrs.role === 'alert' &&
    r2.querySelectorAll('.aigo-error').length === 1 &&
    r2.all().filter(x => x.tagName === 'li').length === AI_GO.guard(starter, '').length);
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
  ok('derivedFrom feeds the attribution line',
    r6.querySelector('.aigo-attribution').textContent.includes('Origin U'));
  ok('storageKey: null leaves sessionStorage untouched', store.size === storeSize);

  const r7 = new N('div');
  const holes2 = cp(starter); holes2.nodes.q2.options.unshift(null);
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
    AI_GO.mount(r11, starter, { lang: 'en', storageKey: null, history: false }) === null && r11.firstChild.attrs.role === 'alert');

  // The bilingual reference content, on the engine that ships, in BOTH of its
  // languages. This is how the production page is served: one file, one engine,
  // two languages, the French labels shipped with the engine and the French
  // content coming from the tree.
  globalThis.location = { hostname: 'www.unil.ch', protocol: 'https:' };
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
  ok('check.html wires itself and labels its own chrome',
    ids['t-title'].textContent.length > 0 && ids.pasteGo.textContent.length > 0);
  const report = PAGE.analyse(html);
  const shown = ids.out.textContent;
  ok('check.html analyses the delivered file without crashing', !!report && !!report.tree);
  ok('check.html reports the engine as intact', shown.includes(AI_GO.version) && shown.includes('intact'));
  ok('check.html reports the six markers as present', shown.includes('six markers'));
  ok('check.html shows the publication points and the fingerprint',
    shown.includes('7 point') && shown.includes(AI_GO.fingerprint(starter)));
  ok('check.html lists the five paths of the delivered content',
    ids.out.querySelectorAll('.paths').length === 1 &&
    ids.out.querySelectorAll('.paths')[0].children.length === 5);
  // Derived, never spelled out: pinning the version here made a release break a
  // test that has nothing to do with versions.
  const versionLine = `var VERSION = '${AI_GO.version}';`;
  const tampered = html.replace(versionLine, versionLine + ' /* touched */');
  PAGE.analyse(tampered);
  ok('check.html says MODIFIED LOCALLY when the engine block was edited',
    ids.out.textContent.includes('MODIFIED LOCALLY'));
  // Producing the UNIL production page is one paste: the reference content
  // replaces the content block, marker lines untouched, nothing renamed.
  const unilSource = read('reference/aigo-unil.js').replace(/if \(typeof module[\s\S]*$/, '');
  const unilPage = html.slice(0, at('AI_GO-CONTENT-BEGIN')) +
    'AI_GO-CONTENT-BEGIN\n*/\n' + unilSource + '\n/*\n' + html.slice(at('AI_GO-CONTENT-END'));
  const unilReport = PAGE.analyse(unilPage);
  ok('the bilingual content pasted into the delivered file yields 20 paths and the frozen fingerprint',
    !!unilReport && unilReport.hash === '59b6dc65' && CHECK.paths(unilReport.tree).length === 20,
    'this is how the production page is produced: one paste, no rename');
}

console.log('documentation and repository');
{
  const readme = read('README.md');
  const guide = read('docs/INTEGRATE.md');
  const lines = readme.split('\n').length;
  ok(`README is one page (${lines} lines, limit 110)`, lines <= 110, String(lines));
  ok('README names the production URL', /ia\.unil\.ch\/AI_GO/.test(readme));
  ok('the guide names what a CMS refuses: unfiltered_html and the TYPO3 HTML element',
    /unfiltered_html/.test(guide) && /TYPO3/.test(guide));
  ok('the guide carries the iframe listener an integrator has to paste',
    /data-aigo/.test(guide) && /addEventListener\("message"/.test(guide));
  ok('the guide documents data-history="false" for a page carrying two questionnaires',
    /data-history="false"/.test(guide));
  ok('the guide documents the update procedure and the fingerprint receipt',
    /check\.html/.test(guide) && /fingerprint/i.test(guide));
  ok('the guide explains how a second language is served, since the starter ships one',
    /langs/.test(guide) && /\bui\b/.test(guide));
  ok('README carries the one sentence about how this code was written',
    ASSISTANT.test(readme) && (readme.match(ASSISTANT) || []).length === 1);
  ok('CITATION.cff declares the current engine version',
    new RegExp('version: "' + AI_GO.version + '"').test(read('CITATION.cff')));

  const walk = d => readdirSync(d).flatMap(f => {
    const p = join(d, f);
    if (f === '.git' || f === 'node_modules') return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
  const every = walk(ROOT).map(p => p.replace(ROOT, ''));
  ok(`the repository holds ${every.length} files`, every.length === 13, every.join(', '));
  // The text rules run on text files: a PNG decoded as UTF-8 yields accents by accident.
  const text = every.filter(p => !/\.png$/.test(p));
  const dashed = text.filter(p => read(p).includes(EM_DASH));
  ok(`no em dash in any of the ${every.length} files`, dashed.length === 0, dashed.join(', '));
  const named = text.filter(p => OTHER_NAME.test(read(p)));
  ok('the tool is called AI_GO everywhere, and nothing else', named.length === 0, named.join(', '));
  const credited = text.filter(p => ASSISTANT.test(read(p)));
  ok('the assistant that wrote the code is named once, in the README, and nowhere else',
    credited.length === 1 && credited[0] === 'README.md', credited.join(', '));
  // The code and its guide are written in English. The exceptions are declared:
  // the pages that face the French-speaking reader (README.md and docs/), the
  // bilingual reference content, the French label set shipped inside the engine,
  // and the legal name of the copyright holder.
  const mayHoldFrench = p => p === 'README.md' || (p.startsWith('docs/') && p !== 'docs/INTEGRATE.md') ||
    p.startsWith('reference/') || p === 'ai-go.html' || p === 'LICENSE' || p === 'CITATION.cff';
  const french = text.filter(p => !mayHoldFrench(p) && ACCENTS.test(read(p)));
  ok('outside the reference content, the French-facing pages and the shipped label set, every file is English',
    french.length === 0, french.join(', '));
  // docs/ARBRE.md is a transcription made by hand; the frozen tree is the source.
  const arbre = read('docs/ARBRE.md');
  const titles = [...Object.values(unil.nodes), ...Object.values(unil.results)].map(n => n.title.fr);
  const missing = titles.filter(x => !arbre.includes(x));
  ok('docs/ARBRE.md carries every question and result title of the frozen tree verbatim',
    missing.length === 0, missing.join(' | '));
  ok('no build file, no manifest, no lockfile',
    !every.some(p => /package\.json|package-lock|yarn\.lock|node_modules/.test(p)));
}

console.log(`\n${n - fails}/${n} passed`);
process.exit(fails ? 1 : 0);
