# AI_GO: technical guide

What AI_GO is, who wrote the questionnaire and how to reach them: [README.md](../README.md), in French.
This page is for the person who edits, checks and publishes the file.

## Try it

1. Open `ai-go.html`, **Raw**, save it, double-click. The example runs, with a banner counting what is left to fill in.
2. Edit between `AI_GO-CONTENT-BEGIN` and `AI_GO-CONTENT-END`. Save, reload: the banner counts down. Everything above
   `AI_GO-ENGINE-BEGIN` is yours, including three things just outside that region: the `<title>`, the page heading and
   its lead paragraph, and the colour variables.
3. Open `check.html` and drop your file on it: the verdict, every possible path, unreachable questions, cycles,
   undeclared polarities, and whether the engine block was modified. Type the domain you will publish on and the verdict
   covers that too. Keep this page local: it runs whatever is dropped on it.
4. **Read the path list aloud with your legal service. That list is what you have signed, not the file.**

## Write your content

Three house rules for every text: double quotes only (a straight apostrophe inside a single-quoted string blanks the
page), no angle bracket inside a text, and a non-breaking space typed as `\u00a0`, never as the character itself, which
no editor shows you. `**two asterisks**` is the only inline syntax; a text is a string, a list of paragraphs, or an
`{ items: [...] }` object.

The starter declares one language, so every text is a plain string. **For a second language**, list the codes in
`langs`, replace each text with `{ en: "...", fr: "..." }`, and give the disclaimer both variants: a text that declares
its languages and misses one is refused at mount. A bare string shows the same words in every language, which is allowed
on purpose and which `check.html` lists, so the choice stays deliberate. Interface labels ship in English and French;
any other goes in your own `ui: { de: { back: "Zurueck", ... } }`, inside your half of the file, so it survives engine
updates (key list at the top of the engine block).

`reference/aigo-unil.js` is a complete reviewed bilingual tree (11 questions, 10 steps, 7 results, 20 paths) and
`reference/aigo-unil.paths.js` freezes those paths as a non-regression oracle. To read, not to copy: see the licences.

## Integrate it

Declare your hostname in `publisher.domains` first, staging included, or the live page shows only the refusal box. Then
one of three ways:

- **Standalone file**, uploaded by SFTP. The only case where the file's own `Content-Security-Policy` applies.
- **Pasted into a CMS**, in a *custom HTML* block, never the visual editor, which rewrites quotes. WordPress needs the
  `unfiltered_html` capability; TYPO3 an HTML content element open to your role.
- **In an iframe.** The file posts its height. Give your iframe `data-aigo` and paste this into a script of your own:

  ```js
  addEventListener("message", function (e) {
    var d = e.data, f = document.querySelector("iframe[data-aigo]");
    if (d && d.aigo === "height" && f) f.style.height = d.px + "px";
  });
  ```

The engine mounts on every element carrying `data-ai-go`, whose value names the content variable. Two questionnaires on
one page each keep their own answers, but give `data-history="false"` to all but one or the Back button pops both.
Other container attributes: `data-lang`, `data-heading-level`, `data-storage="none"`, `data-mode`.

**Updating the engine.** Download the new `ai-go.html`, select in your own file from the first line to the line before
`AI_GO-ENGINE-BEGIN`, paste it over the same region of the new file, save. The receipt is the content fingerprint under
every result: it covers the start, the questions, the results and the links, so if it has not moved, no routing and no
wording has moved. It says nothing about your publisher block, review date or disclaimer, checked separately.

## What the engine refuses to display

No `publisher.name` or no `publisher.domains`; a hostname those domains do not cover (subdomains are covered,
`evilexample.ch` is not `example.ch`); no `review.by`, no `review.date`, or one it cannot parse; a disclaimer missing in
any declared language; any remaining `TO_FILL_IN`; a target that resolves nowhere; a link whose scheme is not http,
https, mailto, tel or relative; and, off the origin domain, the origin institution's identifier, name or links. Refusals
list what to fix in the container, because this audience does not read the console.

That last lock is a courtesy, not a security boundary: whoever publishes the file owns it and can edit the engine out.
It exists so a copy made in good faith cannot go live wearing someone else's name. The engine never uses `innerHTML`,
makes no network request of any kind, stores nothing in `localStorage`, and scopes every lookup to its container. The
only thing it ever sends anywhere is the iframe height above.

**Accessibility, honestly.** Keyboard navigation, focus placement, screen-reader announcements, `fieldset` grouping and
320 px reflow are asserted by the harness and were checked in a browser. No third-party audit and no real screen-reader
test have been done; the accessibility statement your law asks for is yours to write.

## What is not reusable

The **content** of `reference/aigo-unil.js` is not licensed for reuse. It encodes Swiss federal and Vaud cantonal law
and decisions one university took for its own community; elsewhere it is wrong, and it will look 90 % applicable to
you, which is more dangerous than looking foreign. Question q4 is the trap: ticking a box there takes the reader *out*
of the personal-data branch, hence its `polarity: "inverse"`. Adapting it rather than writing your own? Declare
`derivedFrom: "..."` and every result then says the source has not reviewed your version. Nothing forces you to, which
is exactly why it is asked for here.

## Licences and attribution

The engine block, `check.html` and the harness: BSD 3-Clause, see `LICENSE`. The content block of `ai-go.html` and the
tree format: CC0-1.0, copy them without condition. The reference tree content: all rights reserved.

Two different checks, and the difference matters. `node test/run.mjs` proves the **engine** is intact and is the same
for everybody; run on a file whose content you replaced, it says so and checks what it still can. `check.html` is where
**your content** is judged. No `package.json`, on purpose.
