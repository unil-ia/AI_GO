# AI_GO: technical guide

What AI_GO is, who wrote the questionnaire and how to reach them: [README.md](../README.md), in French.
This page is for the person who edits, checks and publishes the file. The person who writes the questions works
from [DEMARRER.md](DEMARRER.md), a blank sheet in French, which also gives the refusal list below in French. The two
files they touch face that same reader: `ai-go.html` ships a bilingual example with French as its default language,
and `check.html` opens in the language your browser asks for, French otherwise, with two buttons to change it.
This guide is the one page kept in English.

## Try it

1. Download `ai-go.html` with the download icon beside the **Raw** button, keeping the `.html` ending, then double-click
   it. The example runs, with a banner counting what is left to fill in.
2. Writing French? Download `tools/typographie.mjs` the same way, into a `tools/` folder beside the file: the command
   below needs it, and nothing else does.
3. Edit between `AI_GO-CONTENT-BEGIN` and `AI_GO-CONTENT-END`. Save, reload: the banner counts down. Everything above
   `AI_GO-ENGINE-BEGIN` is yours, including five things outside the content block: the `<title>`, which sits above the
   begin marker; the `<h1>` and the standfirst, which sit just below the end marker; the `<noscript>` message, which
   waits for your contact address and is the only text a reader without JavaScript sees; the colour variables; and the
   language. Set `<html lang>` and the container's `data-lang` to the language you actually wrote in, or the page is
   announced in the wrong voice; `check.html` reports the mismatch.
4. Open `check.html`, type the domain you will publish on, then drop your file on it: the verdict for that domain,
   every possible path, unreachable questions, cycles, undeclared polarities, and whether the engine block was modified.
   Changing the domain afterwards recomputes the verdict. It opens in the language your browser asks for, French
   otherwise, and the two buttons above the heading switch it; the refusal sentences it copies from the engine follow
   the tree instead. Keep this page local: it runs whatever is dropped on it.
5. **Read the path list aloud with your legal service. That list is what you have signed, not the file.**

## Write your content

Three house rules for every text: double quotes only (a straight apostrophe inside a single-quoted string blanks the
page), no angle bracket inside a text, and a non-breaking space typed as `\u00a0`, never as the character itself, which
no editor shows you. `**two asterisks**` is the only inline syntax; a text is a string, or a list whose members are
paragraphs or `{ items: [...] }` blocks. The block goes INSIDE the list and never alone: alone it is read as a
per-language map and refused for the language it does not carry.

In French that third rule costs six characters a dozen times a page, and the ones you forget are caught by nothing:
a plain space before a colon is silent. So do not think about it. Write the text as you normally would, then run
this once:

```sh
node tools/typographie.mjs ai-go.html
```

Sixty-three readable lines. Inside the double-quoted strings of the content block, it rewrites as `\u00a0` every
space you typed before `:` `;` `?` `!` `%` or a closing guillemet, and after an opening one, whether that space was
an ordinary one, a U+00A0 or the narrow U+202F a word processor writes; it also rewrites every no-break space you
typed anywhere else in those strings. It adds none where you typed no space at all, and it is not language-aware, so
an English sentence in which you typed a space before `%` comes out with a no-break space, which is wrong in English:
in English, do not type that space. Why it never inserts one: it would have to guess. Over the 526 double-quoted
strings of `reference/aigo-unil.js` and of the content block of `ai-go.html`, an automatic insertion would fire in
67 places where no space was typed, and be wrong in all 67 (6 inside a URL just after the scheme, 23 straight after
an `\u00a0` escape, since it ends in a digit and not in a space, and 38 in strings that are not French). It writes
nothing at all, and exits 2, when the file is not valid UTF-8; when one of the six AI_GO markers appears twice, out
of order, not alone on its line, or with one half of a comment wrapper and not the other; or when a single byte
outside the content block would have moved. That last comparison, run on the bytes and not deduced from the markers,
is what keeps the engine untouched. It is idempotent, and on the file as delivered it changes not one byte.

It works between the two markers only, so the page title, which sits above the begin marker, and the `<h1>` and the
standfirst, which sit just below the end marker, are not covered: write `&nbsp;` in the markup there. `check.html`
warns you if you typed one.

The starter declares `langs: ["fr", "en"]` and `defaultLang: "fr"`, so each of its 27 texts is written
`{ fr: "...", en: "..." }`. **For one language only**, cut `langs` and `defaultLang` down to it and every text becomes a
plain string again. **For a third**, add its code to `langs` and give every text that variant: a text that declares its
languages and misses one is refused at mount. A bare string shows the same words in every language, which is allowed
on purpose and which `check.html` lists, so the choice stays deliberate. Interface labels ship in English and French;
any other goes in your own `ui: { de: { back: "Zurueck", ... } }`, inside your half of the file, so it survives engine
updates (key list at the top of the engine block).

`reference/aigo-unil.js` is a complete reviewed bilingual tree (11 questions, 10 steps, 7 results, 20 paths) and
`reference/aigo-unil.paths.js` freezes those paths as a non-regression oracle. To read, not to copy: see the licences.

## Integrate it

Declare your hostname in `publisher.domains` first, staging included, or the live page shows only the refusal box. Put
`LICENSE` next to whatever you upload, in all three cases: clause 1 of the BSD licence asks that the notice, the
conditions and the warranty disclaimer travel with the code, and the short notice in each file only points at them.
Then one of three ways:

- **Standalone file**, uploaded by SFTP. The only case where the file's own `Content-Security-Policy` applies.
- **Pasted into a CMS**, in a *custom HTML* block, never the visual editor, which rewrites quotes. Paste the region from
  `AI_GO-BEGIN` to `AI_GO-END`. It carries the content, the container, your colours and the engine, and also the `<h1>`,
  the standfirst, the `<main class="page">` wrapper and a `body { }` rule: your CMS already renders a page, so delete
  those four before pasting or you get two headings and a stylesheet fighting the site's own. WordPress needs the
  `unfiltered_html` capability; TYPO3 an HTML content element open to your role.
- **In an iframe.** The file posts its height. Give your iframe `data-aigo` and paste this into a script of your own:

  ```js
  addEventListener("message", function (e) {
    var d = e.data, f = document.querySelector("iframe[data-aigo]");
    if (d && d.aigo === "height" && f) f.style.height = d.px + "px";
  });
  ```

The engine mounts on every element carrying `data-ai-go`, whose value names the content variable. Two questionnaires on
one page each keep their own answers, and the automatic mount now gives the browser history to the FIRST of them only:
both taking it made the second replace the first's entry underneath it, and the first Back button died on its first
click. Pass `data-history="false"` to choose a different one. The
engine also replaces `history.state` with its own on every step: inside an application that keeps its own state there,
give it `data-history="false"` too, and it will leave the history alone.
Other container attributes: `data-lang`, `data-heading-level`, `data-storage="none"`, `data-mode`.

**Mounting by hand.** `AI_GO.mount(container, tree, options)` is the same entry point the automatic mount calls, for
a container built after load or a tree fetched at runtime. It returns the instance, or **null when the tree is
refused** -- the refusal box is then drawn in the container, and there is no instance to call anything on. It throws
only when the container itself is missing.

Its seven options: `lang` (a language code), `history` (false leaves `history.state` alone), `storageKey` (null for
no `sessionStorage`; leave it out and each instance gets its own), `mode`, `headingLevel`, `resume` (false ignores a
stored session), and `langDeclared`. Five of them have a container attribute -- `data-lang`, `data-history`,
`data-storage="none"`, `data-mode`, `data-heading-level` -- and two have none. `resume` belongs to a hand-written
call alone. `langDeclared` has none because the automatic mount works it out: the page declared its language if
`data-lang` is set or if `<html lang>` names one of the tree’s `langs`. A hand-written call must say so, and passing
`lang` says it. Leave both out and a session stored by another page on the same origin decides this one’s language,
under your own heading.

**Updating the engine.** Download the new `ai-go.html`, select in your own file from the first line to the line before
`AI_GO-ENGINE-BEGIN`, paste it over the same region of the new file, save. The receipt has two halves under every result. The
content fingerprint covers the start, the questions, the results and the links; the signature, on the line below it,
covers what a reader sees around them: publisher, review, disclaimer, attribution, the law named, the step names and
the interface labels. Read both, or you have read half the page.

Compare them only between files running the SAME engine. Both values are recomputed by the engine that draws them, and
3.0.19 replaced the mixing function after a collision was constructed on the previous one, so a value recorded under an
earlier engine does not compare with one recorded under this one, and neither do its first characters.
`docs/PUBLICATIONS.md` records which engine computed what. After an engine update, take a fresh receipt and file it
with the date; do not compare it with the old one.

## What the engine refuses to display

No `publisher.name` or no `publisher.domains`; a hostname those domains do not cover (subdomains are covered,
`evilexample.ch` is not `example.ch`); no `review.by`, no `review.date`, or one not written `YYYY-MM-DD`; a disclaimer missing in
any declared language; any remaining `TO_FILL_IN` **in the tree**; a target that resolves nowhere; a link whose scheme is not http,
https, mailto, tel or relative; off the origin domain, the origin institution's identifier, name or links; the
example's own strings, which do not all carry TO_FILL_IN -- the id `my-questionnaire` and the sentence "this text
is an example" are refused for themselves; a link to a domain the standards reserve for documentation --
`example.com`, `.net`, `.org`, `.edu`, and `example`, `invalid`, `test`, `localhost` -- as soon as a result offers
it to a reader, which is what the two delivered links do; and the delivered questionnaire republished as it
stands, recognised by its questions and its results even once the signature is filled and the links changed.
Those last three are the ones you meet first: the delivered file carries thirteen points, filling the seven
signature fields settles eight, and the other five are settled by writing your own questions, results and links.

**The refusal covers the tree, and nothing else**, because the tree is all the engine reads. The tab title, the
heading, the standfirst and the message shown when JavaScript does not run sit around the tree, not inside it: a
`TO_FILL_IN` left in any of the four does not blank the page, and the reader sees it. The delivered file carries one,
in the no-JavaScript message, waiting for your contact address. `check.html` reports them; the engine does not.
Refusals
list what to fix in the container, because this audience does not read the console. They follow the language of the
tree, and `defaultLang` is what decides it, falling back to the first entry of `langs`: forty-two sentences ship
in English and forty-two in French. `<html lang>`, the `<title>` and `data-lang` decide the buttons, the steps,
the preview banner and the refusal box itself, never the sentences inside it. Any other language, or wording of
your own, goes key by key in `ui.<lang>.msg`, and what you leave out falls back to English sentence by sentence.
The same list, in French, is in [DEMARRER.md](DEMARRER.md).

That last lock is a courtesy, not a security boundary: whoever publishes the file owns it and can edit the engine out.
It exists so a copy made in good faith cannot go live wearing someone else's name. The engine never uses `innerHTML`,
makes no network request of any kind, stores nothing in `localStorage`, and scopes every lookup to its container. The
only thing it ever sends anywhere is the iframe height above. The answers live in `sessionStorage` under
`aigo:<id>:state` and in the tab's history entries, so the Back button lands on the right step; both die with the tab and
`data-storage="none"` removes the first. `SECURITY.md` says the same in French.

**Accessibility, honestly.** Keyboard navigation, focus placement, screen-reader announcements and `fieldset` grouping
are asserted by the harness. Reflow at 320 px was checked in a browser; the harness has no layout and cannot assert it.
One deliberate departure: a pointer click on a single-choice answer moves to the next question at once, which is a change
of context on input, and WCAG 3.2.2 asks for a warning first. The keyboard never does this, and a Continue button is
always there; the click shortcut was kept because it is what people do. Say so in your own statement if you keep it. No
third-party audit and no real screen-reader test have been done; the accessibility statement your law asks for is yours
to write.

## What is not reusable

The **content** of `reference/aigo-unil.js` is not licensed for reuse. It encodes Swiss federal and Vaud cantonal law
and decisions one university took for its own community; elsewhere it is wrong, and it will look 90 % applicable to
you, which is more dangerous than looking foreign. Question q4 is the trap: ticking a box there takes the reader *out*
of the personal-data branch, hence its `polarity: "inverse"`. Adapting it rather than writing your own? Declare
`derivedFrom` and every result then carries the attribution. Give it three values and no sentences --
`{ name: "...", url: "https://...", licence: "CC BY 4.0" }`, or a bare string for the name alone -- and the ENGINE
writes the notice around them, in the language of the page, saying the source has not reviewed your version and
does not answer for it. You do not word that sentence and you cannot switch it off: it is the other half of the
exemption that lets a copy name its source at all. `derivedFrom.note` is yours, for whatever you wish to add on
top, and it is read by the reserved-word lock like every other text on the page -- so write what YOU did, not who
they are. Nothing forces you to declare `derivedFrom`, which is exactly why it is asked for here.

## The review has a shelf life, and the page says so on its own

`review.date` must be written `YYYY-MM-DD`, with or without a time after it: `2026-06-01` and `2026-06-01T00:00:00Z` are
the same day and neither is ambiguous, while `2026-6-1` is where reading starts to guess. A date this file would have to guess at is
refused, because a guessed date is printed wrong under every result -- `03.12.2026`, the third of December
as it is written in Switzerland, used to be accepted and read as the eleventh of March. **548 days after
that date, or eighteen months, the engine adds a line under every result saying the review is older than
548 days.** It blocks nothing and nobody is alerted: the page states it, in front of your readers, until
the date moves. Put that deadline in your own calendar when you write the date. `check.html` reports the
age in days once the 548 are past, and nothing before: it is a late notice, not a counter.

## Licences and attribution

`ai-go.html` as a whole, `check.html`, the harness and `tools/typographie.mjs`: BSD 3-Clause, see `LICENSE`, and ship
`LICENSE` with them. In `ai-go.html` that covers the whole `AI_GO-BEGIN` to `AI_GO-END` region this page tells you to
paste, the 59 lines outside the two blocks included. The content block and the tree format are offered under CC0-1.0 as
well: take them that way and you owe nothing. The reference tree content: all rights reserved.

**Your own text is not covered by any of that, and one line decides it.** The content block opens on
`SPDX-License-Identifier: CC0-1.0`, which is true of the example we ship and false of whatever you write in its place.
Left untouched it puts your legal analysis in the public domain: anyone may republish it, altered, without naming you.
Replace that header with your own notice as you replace the content. Ship `LICENSE` all the same, for the BSD notice
clause 1 requires you to keep; it describes our files and has no slot for your copyright, which belongs in your own
header. Do not carry `CITATION.cff` over: it names our authors and our engine version. Write your own, or ship none.

Two different checks, and the difference matters. `node test/run.mjs` proves the **engine** is intact and is the same
for everybody; run on a file whose content you replaced, it recognises that content by its fingerprint, says so, and
checks what it still can (structure, reachable paths, every declared result reached) rather than failing on questions it
no longer knows. `check.html` is where **your content** is judged. No `package.json`, on purpose.
