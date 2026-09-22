/* AI_GO English transcription tool. Copyright (c) 2026, Université de Lausanne, Cellule stratégique IA.
 * SPDX-License-Identifier: BSD-3-Clause. Redistribution and use, with or without modification,
 * are permitted under the three conditions stated in LICENSE, which also carries the warranty
 * disclaimer; LICENSE must accompany any redistribution of this file, in source or in binary.
 * Usage: node tools/anglais.mjs            writes docs/TREE.en.md
 *        node tools/anglais.mjs --check    exits 2 if the file on disk is not what this renders
 *        node tools/anglais.mjs --render <tree.js> <paths.js>   prints the page for another tree
 * It RENDERS, it does not translate: every question, option, answer, result, tool name and warning
 * below is the en: string of reference/aigo-unil.js, the institution's own English, already published
 * in this repository. What this file adds in its own words is the framing: the headings, the routing
 * connectives, the diagram's edge labels and the three sentences of the preamble. Nothing legal is
 * authored here. The French page docs/ARBRE.md carries three sections this one does not -- the
 * acronym glossary, the five remarks on the logic and the hand-written reading aids beside the 20
 * paths -- because those are commentary written at UNIL in French, and translating them would be
 * writing new text about Swiss law rather than transcribing the questionnaire.
 * The harness re-renders and compares byte for byte, so the page cannot drift from the tree. */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'docs/TREE.en.md';
const arr = v => (Array.isArray(v) ? v : v == null ? [] : [v]);

/* The institution's English, or nothing. A field with no en: would silently fall back to French and
 * hand a reader a page that mixes the two without saying so; it throws instead. */
const EN = (v, where) => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (v.en === undefined) throw new Error('no en: at ' + where);
  return v.en;
};
const paras = (h, where) => {
  const out = [];
  if (h == null) return out;
  for (const x of [].concat(h)) {
    if (typeof x === 'string') out.push({ p: x });
    else if (x && x.items) x.items.forEach(i => out.push({ li: i }));
    else if (x && x.en !== undefined) {
      for (const y of [].concat(x.en)) {
        if (typeof y === 'string') out.push({ p: y });
        else if (y && y.items) y.items.forEach(i => out.push({ li: i }));
      }
    } else throw new Error('no en: at ' + where);
  }
  return out;
};
/* A blank line between paragraphs, none between the bullets of one list. */
const space = lines => lines.join('\n').replace(/\n(?!- )/g, '\n\n');

/* L'empreinte du contenu, ECRITE ET NON RECALCULEE. Une premiere version la recalculait ici : elle rendait
 * f1316c44b78035d2 quand le moteur rend cbdb4863aed9f778, et la page aurait annonce une empreinte fausse, ce
 * qui est pire que de n'en annoncer aucune. Le harnais epingle cette constante contre AI_GO.fingerprint(unil),
 * de sorte qu'un arbre qui bouge fait rougir le test au lieu de laisser passer une page perimee. */
const CONTENT_FINGERPRINT = 'cbdb4863aed9f778';
/* Le numero du moteur, epingle de la meme facon : le harnais verifie que cette page cite AI_GO.version. */
const ENGINE = '3.1.11';

/* Le pli : une prose ecrite d'un trait, rendue en lignes de 118 colonnes au plus, pour qu'une phrase
 * rallongee par une interpolation ne sorte pas de la colonne du reste du depot. */
const WIDTH = 118;

export function render(tree, oracle) {
  /* CET OUTIL NE CONNAIT QU'UNE EMPREINTE, ET ELLE APPARTIENT A UN ARBRE. Rendre
   * l'arbre d'autrui sous l'identite de l'UNIL -- meme titre, meme empreinte,
   * meme reserve de droits, meme adresse -- serait la falsification que le
   * commentaire de CONTENT_FINGERPRINT declare pire que le silence. */
  const publisher = (tree.publisher && tree.publisher.name) || 'the publisher';
  const ours = arr(tree.publisher && tree.publisher.domains).indexOf('unil.ch') >= 0;
  const R = {};
  Object.keys(tree.results).forEach((id, i) => { R[id] = 'R' + (i + 1); });
  const out = [];
  const say = s => out.push(s);
  const prose = t => {
    let line = '';
    t.split(' ').forEach(w => {
      if (line && (line + ' ' + w).length > WIDTH) { out.push(line); line = w; }
      else line = line ? line + ' ' + w : w;
    });
    if (line) out.push(line);
  };

  say('# ' + (ours ? 'The AI_GO questionnaire of UNIL' : 'The questionnaire of ' + publisher) + ', transcribed to be read');
  say('');
  prose('English transcription of the frozen tree (content "' + tree.version + '"' +
    (ours ? ', fingerprint ' + CONTENT_FINGERPRINT : '; its fingerprint is the one the engine prints under every result') +
    '). The titles, help texts and labels of the boxes, answers and results below are that ' +
    'file\'s own English, **word for word**: this page is rendered from it by `tools/anglais.mjs`. The headings, ' +
    'the routing connectives, the diagram\'s edge labels and these opening paragraphs are the tool\'s own words; ' +
    'everything else is the file\'s. The test harness re-renders the page and compares its own output with the ' +
    'file on disk, byte for byte, so no hand edit survives here. Where page and file disagree, the JavaScript file ' +
    'is right: it is what the engine runs. Published for reference, all rights reserved: read it, cite it with ' +
    'its source; to ' +
    (ours ? 'republish, translate or adapt it, write to us at <iaunil@unil.ch>.'
          : 'republish, translate or adapt it, ask ' + publisher + '.') +
    (ours ? ' It encodes Swiss law and decisions taken by UNIL for its own community; elsewhere it is to be '
          : ' It encodes the law and the decisions of ' + publisher + ' for its own community; elsewhere it is to be ') +
    're-examined question by question.');
  say('');
  if (ours) prose('Three sections of the French page `ARBRE.md` are not here, and not by oversight: the glossary of Swiss ' +
    'legal acronyms, the five remarks on the logic and the reading aids beside the 20 paths are commentary ' +
    'written at UNIL in French. Translating them would mean writing new text about Swiss law, which is the ' +
    'authors\' call, not this tool\'s. There is no language button in the page: the engine mounts in the language ' +
    'of the container\'s `data-lang`, and `ai-go.html` here sets it to `fr`. An institution that wants the English ' +
    'interface sets `data-lang="en"`; the questions and results below are that same content, read rather than ' +
    'answered.');
  say('');
  /* LA RESERVE QUI N'EXISTAIT QU'EN FRANCAIS. Le README francais la porte en gras
   * et docs/ARBRE.md la repete ; aucun des cinq textes anglais du depot ne la
   * portait. Qui arrive par << Try it >> tient pour la transcription de ce qu'il
   * vient d'utiliser une page qui decrit un autre moteur. */
  if (ours) prose('The page published at <https://ia.unil.ch/AI_GO> runs an EARLIER implementation of this same ' +
    'questionnaire, word for word. It is not the engine named at the foot of this page, and it prints neither ' +
    'of the two receipt lines, so do not compare what it shows with the fingerprint above.');
  say('');
  /* TROIS SIGLES ET RIEN POUR LES LIRE. DCSR, DPO et HRA apparaissent dans le texte
   * anglais, HRA cinq fois et dans les resultats qui decident de ce qu'on a le droit
   * de faire. Les etendre serait nommer des lois suisses dans une traduction que ce
   * depot ne fait pas. On dit donc ce qui manque, et on rend le droit cite tel que
   * l'arbre le declare -- « secret de fonction » compris, qui n'a pas de forme
   * anglaise dans le fichier et reste donc en francais. */
  if (ours) prose('Written for ' + tree.jurisdiction + ' against ' + arr(tree.legalBasis).join(', ') +
    ' (named here as the file names them, in French where the file has no English form). Three abbreviations run ' +
    'through the text and this page does not expand them: DCSR, DPO and HRA. They are the institution\'s own, the ' +
    'French page expands the French ones under its heading "Les sigles", and spelling out Swiss statutes in ' +
    'English would be a translation this repository does not make. HRA is the abbreviation the file\'s own ' +
    'English uses where its French says LRH. Ask the publisher named under any result if one of them decides ' +
    'your case.');
  say('');
  say(EN(tree.disclaimer, 'disclaimer'));
  say('');

  say('## The diagram');
  say('');
  prose('Everything the diagram shows is written out in full in the two sections that follow: it says nothing ' +
    'that is not spelled out below.');
  say('');
  say('```mermaid');
  say('flowchart TD');
  Object.entries(tree.nodes).forEach(([id, n]) => say('  ' + id + '["' + id + ' · ' + EN(n.title, id) + '"]'));
  Object.entries(tree.results).forEach(([id, r]) => say('  ' + R[id].toLowerCase() + '["' + R[id] + ' · ' + EN(r.title, id) + '"]'));
  const dest = to => (to && tree.nodes[to] ? to : R[to] ? R[to].toLowerCase() : to);
  Object.entries(tree.nodes).forEach(([id, n]) => {
    if (n.type === 'multi') {
      say('  ' + id + ' -- at least one box --> ' + dest(n.next.ifAny || n.next.ifAnyResult));
      say('  ' + id + ' -- none --> ' + dest(n.next.else || n.next.elseResult));
    } else {
      /* L'ETIQUETTE EST CELLE DE LA REPONSE, PAS << yes >> ET << no >>. Deux titres de
       * cet arbre sont des groupes nominaux et non des questions -- q8 << Impact
       * assessment with the DPO >>, q9a << Data anonymisation >> -- et ce sont les
       * deux noeuds dont une branche elargit les outils permis : << yes >> n'y veut
       * rien dire. Le detail de chaque reponse est dans l'arbre, en anglais, pour
       * les 14 reponses binaires ; on l'emploie, et rien de neuf n'est ecrit. */
      n.answers.forEach(a => {
        const dit = a.detail ? EN(a.detail, id + '.detail') : '';
        say('  ' + id + ' -- ' + (dit || (a.value === 'yes' ? 'yes' : 'no')) + ' --> ' + dest(a.to || a.result));
      });
    }
  });
  /* The three colour classes are those of the French diagram, kept identical so the two pages are
   * the same drawing; which result falls in which class is read from the tree, not retyped. */
  say('  classDef free fill:#e6f0e9,stroke:#2f6b45,color:#1e4a2e');
  say('  classDef limited fill:#f7efdd,stroke:#8a6410,color:#5c440b');
  say('  classDef local fill:#f7e8e5,stroke:#96382a,color:#6b281e');
  const byLevel = lv => Object.keys(tree.results).filter(id => tree.results[id].level === lv)
    .map(id => R[id].toLowerCase()).join(',');
  const CLASSES = [['free', 'success'], ['limited', 'warning'], ['local', 'danger']];
  CLASSES.forEach(([cls, lv]) => { const ids = byLevel(lv); if (ids) say('  class ' + ids + ' ' + cls); });
  say('```');
  say('');
  prose('Green: all three families of tools are allowed. Amber: institutional or local LLMs. Red: local LLMs ' +
    'only. The ten steps of the breadcrumb are, in order: ' +
    tree.steps.map(s => EN(s.name, 'steps.' + s.id)).join(', ') + ' (q9 and q9a share step 9).');
  say('');

  say('## The questions and their options');
  say('');
  Object.entries(tree.nodes).forEach(([id, n]) => {
    const b = ['**' + id + '. ' + EN(n.title, id) + '**'];
    paras(n.help, id + '.help').forEach(x => b.push(x.li ? '- ' + x.li : x.p));
    if (n.type === 'multi') {
      b.push('Tick boxes:');
      n.options.forEach(o => b.push('- ' + EN(o.label, id + '.option')));
      b.push('Routing: at least one box → ' + (n.next.ifAny || R[n.next.ifAnyResult]) +
        '; none → ' + (n.next.else || R[n.next.elseResult]) + '.');
      if (n.polarity === 'inverse') b.push('Mind the direction: here, ticking a box leaves the personal-data branch; the file declares it with `polarity: "inverse"`.');
    } else {
      b.push('Answers:');
      n.answers.forEach(a => {
        const lab = a.label ? EN(a.label, id + '.label') : (a.value === 'yes' ? 'Yes' : 'No');
        const det = a.detail ? EN(a.detail, id + '.detail') : '';
        b.push('- ' + lab + (det ? ': ' + det : '') + ' → ' + (a.to || R[a.result]));
      });
    }
    say(space(b));
    say('');
  });

  say('## The results');
  say('');
  Object.entries(tree.results).forEach(([id, r]) => {
    const b = ['**' + R[id] + '. ' + EN(r.title, id) + '**', EN(r.summary, id + '.summary'),
      'Recommended solution: ' + EN(r.solution.text, id + '.solution') + '.', 'Suggested tools:'];
    /* AVEC LEUR LIEN. La page les listait sans, alors que l'arbre les porte et que
     * le questionnaire en ligne les rend cliquables : deux lecteurs anglophones se
     * sont arretes la, faute de pouvoir aller voir de quels outils il s'agit. */
    (r.allowed || []).forEach(a => {
      const l = tree.links[a] || {};
      const nom = EN(l.label, 'links.' + a);
      b.push('- ' + (l.href ? '[' + nom + '](' + l.href + ')' : nom));
    });
    if (r.forbidden && r.forbidden.length) {
      b.push('Not allowed:');
      r.forbidden.forEach((f, i) => b.push('- ' + EN(f, id + '.forbidden[' + i + ']')));
    }
    if (r.alert) b.push(EN(r.alert.text, id + '.alert'));
    say(space(b));
    say('');
  });

  say('## The 20 paths');
  say('');
  /* LE NOMBRE VIENT DE L'ORACLE RECU, pas d'un vingt ecrit a la main : la page
   * annoncait « The 20 possible routes » pour un arbre qui en a deux. */
  prose('The ' + oracle.length + ' possible routes, exactly as ' +
    (ours ? '`reference/aigo-unil.paths.js`' : 'the frozen path list') + ' freezes them and in the same order. ' +
    'For a tick-box question only "at least one box" or "none" counts. The French page writes a sentence beside ' +
    'each of these; here the machine form stands alone, and the result names are the identifiers the file uses.');
  say('');
  /* CHAQUE CHEMIN SE TERMINE SUR L'IDENTIFIANT QUE LE FICHIER EMPLOIE, et rien sur
   * cette page ne le rattachait aux resultats R1 a R7 lus plus haut : le lecteur
   * anglophone arrivait au bout des vingt lignes sans pouvoir les relier a ce
   * qu'il venait de lire. Le numero est ajoute, et il est calcule, pas recopie. */
  oracle.forEach((line, i) => {
    const id = String(line).split('\u21d2').pop().trim();
    say((i + 1) + '. `' + line + '` ' + (R[id] || '?'));
  });
  say('');
  say('---');
  say('');
  say('Engine ' + ENGINE + '. Rendered by `tools/anglais.mjs` from the frozen tree; do not edit this page by hand.');
  return out.join('\n') + '\n';
}

const require_ = createRequire(import.meta.url);
/* --render prend un arbre et un oracle donnes : c'est par la que le harnais lui
 * soumet un arbre ampute d'un en:, et qu'une institution rend le sien. */
const given = process.argv[2] === '--render';
const treePath = given && process.argv[3] ? resolve(process.argv[3]) : join(ROOT, 'reference/aigo-unil.js');
const pathsPath = given && process.argv[4] ? resolve(process.argv[4]) : join(ROOT, 'reference/aigo-unil.paths.js');
const tree = require_(treePath);
const oracle = require_(pathsPath);
let wanted;
try { wanted = render(tree, oracle); }
catch (e) { console.error(String(e && e.message || e)); process.exit(2); }
if (given) {
  process.stdout.write(wanted);
} else if (process.argv[2] === '--check') {
  let have = '';
  try { have = readFileSync(join(ROOT, PAGE), 'utf8'); } catch { }
  if (have !== wanted) { console.error(PAGE + ' is not what the tree renders'); process.exit(2); }
  console.log(PAGE + ' matches the frozen tree');
} else if (process.argv[2] !== '--quiet') {
  writeFileSync(join(ROOT, PAGE), wanted);
  console.log(PAGE + ' written, ' + wanted.split('\n').length + ' lines');
}
