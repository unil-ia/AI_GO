# AI_GO : la feuille de départ

L’étape 1 de « Faire le vôtre » ([README](../README.md)) se fait sur le papier, avec votre service juridique, avant
d’ouvrir `ai-go.html`. Voici la feuille à remplir : recopiez-la dans un document, remplacez chaque passage en
italique, faites-la relire. Elle est sous CC0, servez-vous sans condition. Le questionnaire de l’UNIL, rempli dans
cette même forme, se lit dans [ARBRE.md](ARBRE.md) : il est publié pour être lu et cité, tous droits réservés, et il
encode un droit et des décisions qui ne sont pas les vôtres. Lisez-le, ne le recopiez pas.

Cette page est en français parce que c’est en français que s’écrit la moitié du travail. Le fichier livré l’est aussi :
son exemple est bilingue, le français d’abord, et `check.html` s’ouvre dans la langue de votre navigateur,
français à défaut, deux boutons en changent. Poser
ensuite le fichier sur un site se lit dans [INTEGRATE.md](INTEGRATE.md), en anglais, avec votre webmaster.

## 1. Les quatre décisions qui précèdent la première question

1. **Votre liste d’outils, par famille.** Un résultat ne dit pas « c’est légal », il dit « voici ce que vous pouvez
   utiliser ». Cette liste tient à vos contrats, elle n’est celle de personne d’autre, et c’est elle qui vieillit le
   plus vite : prévoyez qui la met à jour.
2. **Le droit que vous encodez.** Loi fédérale, loi cantonale, règlement interne : notez-le question par question. Le
   champ `legalBasis` attend cette liste, et `jurisdiction` le territoire.
3. **Qui relit et quand.** Un nom et une date, `review.by` et `review.date`, affichés sous chaque résultat. Sans eux,
   le moteur n’affiche rien.
4. **Où la page sera publiée.** Le ou les noms de domaine, préproduction comprise, dans `publisher.domains`.
   Ailleurs, le moteur n’affiche rien.

## 2. La feuille

**La ou les langues.** _Une seule, et chaque texte de la feuille s’écrit une fois. Deux, et la feuille se remplit deux
fois : le fichier livré déclare `langs: ["fr", "en"]` et `defaultLang: "fr"`, et chaque texte y est écrit
`{ fr: "...", en: "..." }`. Une langue déclarée qui manque à un seul texte fait refuser le fichier au montage._

**Les étapes.** _Trois à dix noms courts, dans l’ordre : ce sont les jalons du fil d’Ariane. Plusieurs questions
peuvent partager une étape ; aucun total ne s’écrit à la main, il se compte tout seul._

**Les outils cités.** _Un libellé et une adresse par outil, déclarés une fois. Les résultats les rappellent par leur
identifiant : la personne qui traduira ne verra jamais une adresse, donc n’en cassera aucune._

### Une question à réponse unique

**q1. _La question, telle qu’elle sera lue à l’écran._**

_Une ou deux phrases d’aide : ce qui compte, ce qui ne compte pas, un exemple._

Réponses :
- Oui : _le détail affiché sous le libellé_ → _la question suivante, ou un résultat_
- Non : _le détail affiché sous le libellé_ → _la question suivante, ou un résultat_

### Une question à cases à cocher

**q2. _La question._**

_L’aide. Dites en toutes lettres que ne rien cocher est une réponse._

Cases à cocher :
- _un libellé par case_

Routage : au moins une case → _une question ou un résultat_ ; aucune → _une question ou un résultat_.

Attention au sens : _direct_ si cocher mène vers le résultat le plus prudent, _inverse_ si cocher en fait sortir. Écrivez-le sur
la feuille : c’est la seule chose qu’une relecture bien intentionnée peut inverser sans s’en apercevoir.

### Un résultat

**R1. _Le titre affiché._**

_Une ou deux phrases : ce que le questionnaire a établi._

Solution recommandée : _la phrase courte que la personne retiendra_.

Outils proposés :
- _un outil par ligne, repris de votre liste_

Interdits :
- _ce qui n’est pas autorisé, s’il y a lieu_

**Note :** _une remarque affichée sous le résultat. Ce n’est pas une condition : ce qui conditionne un résultat est dans
les questions, et nulle part ailleurs._

### Le routage, en entier

_Une ligne par question : son identifiant, chaque réponse, sa destination. C’est la table que vous relisez ensemble.
Une fois le fichier écrit, `check.html` en déduit tous les chemins possibles et les écrit un par un : lisez cette
liste à voix haute avec votre service juridique. C’est elle qui est signée, pas le fichier._

## 3. De la feuille au fichier : où va quoi

Votre feuille est remplie et relue. Elle devient un fichier en une demi-journée, avec quelqu’un qui sait ouvrir
un éditeur de texte – ce n’est pas un travail de programmation, c’est de la recopie dans un gabarit, mais ce n’est
pas non plus un travail que cette page vous demande de faire seule. Voici la table de correspondance, pour que
vous sachiez de quoi vous parlez et que vous puissiez relire ce qui a été saisi.

| Sur votre feuille | Dans le fichier | Remarque |
|---|---|---|
| Le titre de la page | `title` de la page HTML, plus haut ; le grand titre et le chapeau, juste **sous** le marqueur de fin | trois endroits, à écrire pareil |
| Chaque grande partie du parcours | une entrée de `steps`, avec un `id` et un `name` | c’est ce qui s’affiche sous la barre de progression |
| Une question | une entrée de `nodes`, avec un `id`, un `step`, un `title` | l’`id` ne s’affiche jamais |
| Son texte d’aide | `help` | facultatif |
| Une question à une seule réponse | `type: "single"`, et ses réponses dans `answers` | chaque réponse a un `value`, un `label`, un `detail` facultatif |
| Une question à cases à cocher | `type: "multi"`, et ses cases dans `options`, plus `next` | `next` dit où mène « au moins une case » et où mène « aucune » |
| « cette réponse mène à la question X » | `to: "X"` sur la réponse | |
| « cette réponse conclut par le résultat R » | `result: "R"` sur la réponse | |
| Un résultat | une entrée de `results`, avec un `title`, un `level`, une `solution` | `level` vaut `success`, `info`, `warning` ou `danger`, et décide la couleur de la carte |
| Ce que ce résultat autorise | `allowed`, qui nomme des entrées de `links` | les liens sont déclarés une fois, dans `links`, et réutilisés |
| Ce que ce résultat interdit | `forbidden`, une liste de phrases | |
| Qui répond du contenu | `publisher.name`, `publisher.domains` | les domaines où la page a le droit de s’afficher |
| Qui a relu, et quand | `review.by`, `review.date` | la date s’écrit `AAAA-MM-JJ`, et rien d’autre |
| Le droit cité | `jurisdiction`, `legalBasis` | |
| Votre avertissement | `disclaimer` | il s’imprime sous chaque résultat |
| La première question du parcours | `start`, à la racine de l’arbre | c’est par là que le lecteur entre ; sans elle, rien ne s’affiche |
| Une ou deux phrases sous le titre d’un résultat | `summary` | facultatif |
| **Note :** votre remarque sous un résultat | `alert`, avec un `level` et un `text` | c’est le champ que la feuille appelle « Note » ; il n’y a pas de champ `note` sur un résultat |
| Le sens d’une question à cases | `polarity`, `"direct"` ou `"inverse"` | `check.html` avertit tant qu’il n’est pas déclaré |

Le fichier livré contient déjà un exemple complet de chacune de ces formes, avec un commentaire au-dessus de
chaque champ : ouvrez-le et lisez-le à côté de votre feuille, c’est le seul mode d’emploi dont vous ayez besoin.
Sous la ligne `AI_GO-CONTENT-END` se tiennent **cinq choses qui sont à vous** : le grand titre (`<h1>`), le chapeau,
les attributs du conteneur (`data-lang`, `data-heading-level`), le message affiché quand JavaScript ne s’exécute pas
(`<noscript>`), qui attend votre adresse de contact, et le bloc `<style>` de vos couleurs. Le `<title>` de l’onglet,
lui, est **au-dessus du premier marqueur**, et non en dessous du dernier. Le moteur ne lit aucun des six : c’est
`check.html` qui les relit. Le moteur, encore plus bas, ne se touche
pas. Une fois la recopie faite, `check.html` vous
redonne la liste de tous les chemins : comparez-la, ligne à ligne, avec la table du routage de votre feuille.
C’est cette comparaison qui vous dit que le fichier dit bien ce que vous avez relu.

## 4. Écrire le français dans le fichier

Trois règles tiennent tout le bloc de contenu : des guillemets droits doubles autour de chaque texte (une apostrophe
dans une chaîne à guillemets simples blanchit la page), aucun chevron `<` dans un texte, et l’espace insécable écrite
en six caractères, `\u00a0`, jamais tapée. Tapée, elle est invisible dans un éditeur et se perd au copier-coller.

N’y pensez pas en écrivant. Écrivez votre français normalement, avec les espaces que votre traitement de texte pose
tout seul, puis passez ceci une fois sur le fichier :

```sh
node tools/typographie.mjs ai-go.html
```

Le script fait soixante-trois lignes, que vous pouvez ouvrir avant de le lancer. Il ne touche qu’à vos textes, entre
les deux marqueurs et à l’intérieur des guillemets droits. Ce qu’il fait, exactement : il convertit en `\u00a0` toute
espace que vous avez tapée devant `:` `;` `?` `!` `%` ou devant un guillemet fermant, et après un guillemet ouvrant,
qu’elle soit ordinaire, insécable (U+00A0) ou fine insécable (U+202F) ; et il convertit aussi toute insécable que
vous avez tapée ailleurs dans ces textes. Là où vous n’avez tapé aucune espace, il n’ajoute rien : ni devant `:`, ni
sur les abréviations (`p. ex.`, `art. 3`). Tapez l’espace en écrivant, il la rendra insécable.

Cela vaut aussi pour vos textes anglais, et c’est le seul piège : le script ne sait pas dans quelle langue il lit. Une
phrase anglaise où vous auriez tapé une espace devant `%` en ressort avec une insécable, ce qui est une faute en
anglais. En anglais, ne tapez pas cette espace, et il n’y touchera pas.

Pourquoi il n’en pose pas là où vous n’avez rien tapé : il faudrait deviner, et deviner se trompe. Sur les 526 chaînes
entre guillemets droits de `reference/aigo-unil.js` et du bloc de contenu d’`ai-go.html`, une pose automatique se
déclencherait à 67 endroits où aucune espace n’est tapée : 6 dans une URL juste après le schéma, 23 juste après un
échappement `\u00a0`, qui finit par un chiffre et non par une espace, et 38 dans des chaînes qui ne sont pas du
français. Aucun de ces 67 endroits n’est une insécable française manquante.

Il ne travaille qu’entre les deux marqueurs. Le titre de la page (`<title>`), qui est plus haut, le grand titre
(`<h1>`) et le chapeau, qui sont juste en dessous du marqueur de fin, ne sont donc pas couverts : là, écrivez
`&nbsp;` dans le balisage. `check.html` vous avertit si vous en avez tapé une.

Il refuse d’écrire, et sort en 2 sans rien changer, dans trois cas : le fichier n’est pas de l’UTF-8 valide ; un des
six marqueurs `AI_GO-…` apparaît deux fois, dans le désordre, ailleurs que seul sur sa ligne, ou avec une moitié de
commentaire et pas l’autre ; ou bien un seul octet hors du bloc de contenu aurait bougé. Ce dernier contrôle est le
vrai : le script calcule le nouveau texte, puis le compare octet pour octet à ce qu’il a lu, partout hors du bloc, et
n’écrit que si tout concorde. C’est cette comparaison, et non une déduction sur les marqueurs, qui garantit que le
moteur n’est jamais touché. On repasse le script sans dommage, et sur le fichier livré tel quel il ne change pas un
octet.

Sans terminal, votre éditeur fait le même travail en deux passes, dans le bloc de contenu seulement. D’abord, en
expression régulière, chercher `\xa0` puis `\u202f` et remplacer chaque fois par les six caractères `\u00a0`. Ensuite,
chercher une espace ordinaire suivie de `:` `;` `?` `!` `%` ou `»` et la remplacer par `\u00a0` suivi du même
caractère, puis `«` suivi d’une espace ordinaire et le remplacer par `«\u00a0`. Votre éditeur ne verra pas la
différence entre l’intérieur et l’extérieur des guillemets droits, ni entre vos textes et le moteur : relisez.

Mesuré sur le bloc livré, trois questions et deux résultats écrits en français ordinaire, avec les espaces que le
traitement de texte pose tout seul : la commande a posé 7 échappements `\u00a0`, dans 7 des 27 textes bilingues du
bloc, et n’a laissé aucune insécable tapée. Repassée, elle ne déplace plus un octet, et la ligne posée sous
`AI_GO-CONTENT-END` n’a pas bougé.

**Aucune ligne à changer dans le moteur.** Il porte l’empreinte du questionnaire d’exemple livré avec lui, pour
refuser qu’on le republie tel quel sous une autre signature. Cette empreinte ne couvre que les questions et les
résultats : dès que les vôtres remplacent l’exemple, elle ne reconnaît plus rien et ne se déclenche plus. Elle
désigne notre exemple, pas le vôtre. **N’y collez jamais l’empreinte de votre propre arbre** : le moteur
refuserait alors d’afficher votre fichier. Le moteur ne se touche pas, et rien dans cette page ne vous demande
de l’ouvrir.

**Votre relecture a une durée de vie, et la page le dira toute seule.** Dix-huit mois après la `review.date`
que vous inscrivez, soit **548 jours**, le moteur ajoute sous chaque résultat une ligne disant que la
relecture a plus de 548 jours. Elle n’empêche rien : la page continue de répondre, et le lecteur voit
qu’elle vieillit. Personne ne reçoit d’alerte, c’est la page qui le dit : portez cette échéance au calendrier
de votre service en même temps que vous écrivez la date, et relégitimez le questionnaire avant qu’elle tombe.
`check.html` vous donne l’âge en jours une fois les 548 jours passés, et rien avant : c’est un avertissement de
retard, pas un compteur.

### La licence de votre texte, qui n’est pas la nôtre

Trois lignes à régler avant de publier, et aucune n’est automatique.

- **L’en-tête du bloc de contenu porte `SPDX-License-Identifier: CC0-1.0`.** Il couvre l’exemple que nous livrons, pas
  ce que vous écrivez à la place. Laissé tel quel, il place votre analyse juridique sous CC0, c’est-à-dire dans le
  domaine public : n’importe qui la republie, modifiée, sans vous nommer. **Remplacez-le par votre propre mention**, quelle
  qu’elle soit, au moment où vous remplacez le contenu.
- **Joignez `LICENSE` quand même.** Il porte la mention BSD du moteur, que la clause 1 exige de conserver, et il ne
  parle que de nos fichiers. Il n’a pas de place pour votre droit d’auteur, et n’a pas à en avoir : le vôtre se
  déclare dans votre en-tête et dans vos mentions légales.
- **Ne reprenez pas `CITATION.cff`.** Il décrit notre publication, nomme nos autrices et porte la version de notre
  moteur. Écrivez le vôtre, ou n’en mettez pas.

## 5. Ce que vous devez porter dans votre déclaration d’accessibilité

La déclaration d’accessibilité que votre droit vous demande, c’est vous qui l’écrivez, et personne ne l’a écrite
pour vous. Ce que ce fichier vous permet d’y écrire, en revanche, se dit en quatre points.

- **Ce qui est vérifié à chaque version** : la navigation au clavier, la position du focus après chaque passage,
  les annonces au lecteur d’écran, et le regroupement des cases en `fieldset`. Le harnais les contrôle.
- **Ce qui a été vérifié à la main, une fois** : la lecture à 320 pixels de large, dans un navigateur. Le harnais
  n’a pas de mise en page et ne peut pas le contrôler.
- **Un écart assumé, et vous devez le déclarer si vous le gardez** : cliquer une réponse à choix unique fait
  passer à la question suivante sans confirmation. C’est un changement de contexte à la saisie, et le critère
  **WCAG 3.2.2** demande d’en avertir d’abord. Le clavier ne le fait jamais, et un bouton « Continuer » est
  toujours présent ; le raccourci a été gardé parce que c’est ce que les gens font.
- **Ce qui n’a pas été fait** : aucun audit par un tiers, aucun essai avec une personne utilisant réellement un
  lecteur d’écran. Ne l’écrivez pas dans votre déclaration comme si c’était fait.

## 6. Ce que le moteur refuse d’afficher

Il n’affiche alors rien du tout, et liste dans un encadré ce qu’il faut corriger :

- `publisher.name` ou `publisher.domains` manquant, ou une page servie sur un domaine qu’ils ne couvrent pas (un
  sous-domaine est couvert ; `monexemple.ch` n’est pas `exemple.ch`) ;
- `review.by` ou `review.date` manquant, ou une date qui n’est pas écrite `AAAA-MM-JJ` – `2026-09-01`,
  éventuellement suivie d’une heure ISO ; `2026-6-1`, avec un mois sur un chiffre, ne l’est pas. Une date suisse, `03.12.2026`, était autrefois acceptée puis lue comme le 11 mars ; elle est
  maintenant refusée, parce qu’un fichier qui devine une date en imprime une fausse sous chaque résultat ;
- l’avertissement (`disclaimer`) absent dans une des langues déclarées ;
- un `TO_FILL_IN` encore présent **dans l’arbre** ;
- une réponse qui ne mène nulle part, un lien dont le schéma n’est ni `http`, `https`, `mailto`, `tel`, ni relatif ;
- hors du domaine d’origine, l’identifiant, le nom ou les liens de l’institution d’origine ;
- **les textes de l’exemple livré, qui ne sont pas tous marqués `TO_FILL_IN`** : l’identifiant
  `my-questionnaire` et la phrase « this text is an example » sont refusés pour eux-mêmes, parce qu’ils
  sont à nous ;
- **un lien vers un domaine que les normes réservent aux exemples** – `example.com`, `.net`, `.org`, `.edu`,
  ainsi que `example`, `invalid`, `test` et `localhost` – dès qu’un résultat le propose au lecteur : les
  deux liens livrés pointent sur `example.org` et sont donc à remplacer ;
- **le questionnaire d’exemple republié tel quel**, reconnu à ses questions et à ses résultats, même une
  fois la signature remplie et les liens changés.

Ces trois derniers points sont ceux que vous rencontrerez en premier : le fichier livré porte **treize**
points à corriger, et remplir les sept champs de signature n’en règle **que huit**. **Les cinq autres** sont
l’identifiant `my-questionnaire`, la phrase d’exemple d’un résultat, les deux liens vers `example.org` et le
questionnaire lui-même ; ils se règlent en écrivant vos questions, vos résultats et vos liens, ce qui est le
travail de la section 2. Écrire votre contenu n’est donc pas une étape parmi d’autres : c’est la condition
pour que la page s’affiche.

**Le refus est total, et c’est la chose à savoir avant de mettre la page en ligne.** Le moteur n’affiche alors
aucune question : il montre l’encadré ci-dessus, et rien d’autre. Un seul de ces points suffit. Ce n’est pas une
sévérité gratuite : une page qui afficherait la moitié d’un questionnaire non signé serait pire qu’une page qui
dit ce qui lui manque. Mais la conséquence est qu’une modification faite un jour par un collègue – un lien vers
un document de l’institution d’origine, un `TO_FILL_IN` recollé, une date réécrite à la suisse – éteint la page
en production. **Repassez le fichier dans `check.html` avant chaque mise en ligne**, et non seulement à la
première. C’est une minute, et c’est le seul moment où le refus coûte moins cher qu’il ne rapporte.

**Ce refus ne porte que sur l’arbre**, parce que c’est tout ce que le moteur lit. Le titre de l’onglet, le grand
titre, le chapeau et le message affiché quand JavaScript ne s’exécute pas sont autour de l’arbre, pas dedans :
un `TO_FILL_IN` laissé dans l’un des quatre n’éteint pas la page, et le lecteur le voit. Le fichier livré en porte
une adresse de contact à remplir, dans le message sans JavaScript. C’est `check.html` qui les signale, et
c’est la seconde raison d’y repasser le fichier avant chaque mise en ligne.

Ces messages suivent la langue de l’arbre, et c’est `defaultLang` qui la décide, ou à défaut la première langue de
`langs`. Le moteur en livre quarante-deux en français et quarante-deux en anglais ; une autre langue, ou une autre
formulation, s’écrit clé par clé dans `ui.<langue>.msg`, dans votre moitié du fichier, et ce que vous n’y mettez pas
retombe en anglais phrase par phrase. Attention : `<html lang>`, le `<title>` et `data-lang` ne jouent aucun rôle
ici. Ils décident de la langue des boutons, des étapes, du bandeau d’aperçu et de l’encadré lui-même ; la langue
des phrases à l’intérieur de l’encadré vient de `defaultLang`, et d’elle seule. Ces phrases s’adressent à qui édite
le fichier, jamais à qui le lit, et une page relue avant publication n’en montre aucune.
