# AI_GO : quel outil IA pour vos données ?
[![tests](https://github.com/unil-ia/AI_GO/actions/workflows/test.yml/badge.svg)](https://github.com/unil-ia/AI_GO/actions/workflows/test.yml)

En deux minutes, sans compte, le questionnaire vous dit quelle famille d’outils IA vous pouvez utiliser avec un
jeu de données : LLMs commerciaux (grands modèles de langue), LLMs institutionnels (sous contrat avec votre institution) ou LLMs en local
uniquement. Écrit à l’Université de Lausanne pour le droit suisse : LPD et LPrD-VD (protection des données, fédérale et vaudoise),
LRH (recherche sur l’être humain), secret de fonction.

**Ce n’est pas un avis juridique** : outil d’aide à la décision, il ne garantit pas la conformité,
et qui l’utilise reste responsable de l’appréciation finale. Il le dit sous chaque résultat.

**Essayez-le : <https://ia.unil.ch/AI_GO>** (FR/EN, ordinateur et mobile ; même questionnaire mot pour mot,
implémentation antérieure : voir [« Le dépôt »](#le-d%C3%A9p%C3%B4t)). Le billet :
[AI_GO : deux minutes pour savoir quel outil d’IA vous pouvez utiliser avec vos données](https://wp.unil.ch/iaunil/ai_go-deux-minutes-pour-savoir-quel-outil-dia-vous-pouvez-utiliser-avec-vos-donnees/).

![L’écran de résultat du questionnaire publié : la solution recommandée sur fond bleu, la liste des outils autorisés en dessous, l’avertissement, et la barre de progression où les étapes sautées sont barrées](docs/capture.png)

**Ce dépôt n’est pas un service en ligne : c’est le questionnaire, publié pour être lu, et le moteur qui le fait tourner.**
**Le moteur** : un seul fichier HTML libre, `ai-go.html`, avec son validateur `check.html`. Le guide qui sert à le
poser sur un site est en anglais, [docs/INTEGRATE.md](docs/INTEGRATE.md).

**Pour essayer le questionnaire de l’UNIL en local**, et pas l’exemple de trois questions : ouvrez `ai-go.html`
dans un éditeur, remplacez tout ce qui est entre `AI_GO-CONTENT-BEGIN` et `AI_GO-CONTENT-END` par le contenu de
`reference/aigo-unil.js`, enregistrez, double-cliquez. C’est le geste exact que le harnais refait et vérifie à chaque
exécution : il en attend 20 chemins et l’empreinte `cbdb4863aed9f778`.

## Ce que le questionnaire demande

Onze questions, sept résultats, vingt chemins. Elles partent des personnes concernées : y en a-t-il, sont-elles identifiables, le risque de
réidentification par recoupement est-il faible ? Elles trient ensuite les catégories que le droit suisse distingue : les données sensibles de la LPD
et de la LPrD-VD, la santé et la génétique humaine au sens de l’art. 3 LRH, les données délicates, l’analyse d’impact menée avec le DPO, les données
secondaires, l’anonymisation. Une dernière question ferme les six chemins sur vingt où les données ne sont pas, ou plus, personnelles : le partage
est-il restreint par un secret de fonction, un secret professionnel, un accord de confidentialité (NDA) ou un protocole d’accord (MOU) ? Les sept
résultats ouvrent sur trois conduites : utilisation libre, LLMs institutionnels ou en local, LLMs en local uniquement.

Intitulés, options, textes d’aide, notes sous chaque résultat, schéma et 20 chemins : le questionnaire se lit en
entier dans [docs/ARBRE.md](docs/ARBRE.md), en anglais dans [docs/TREE.en.md](docs/TREE.en.md). À lire et à citer, tous droits réservés.

## Comment il a été fait

Les questions, les résultats et les décisions qu’ils portent ont été écrits par la **Cellule stratégique IA de l’UNIL** avec trois étudiantes en droit
de la **Professeure Aurelia Tamò-Larrieux** : **Selma Lamas Valverde**, **Emma Lo Cicero** et **Clara Montangero**. Relu par la Cellule stratégique IA
et le DPO de l’UNIL ; la date est dans `reference/aigo-unil.js` (`review.date`), affichée sous chaque résultat.

En septembre 2026, pour le porter sur ce moteur sans changer une décision, ses 20 chemins ont été relevés deux fois, indépendamment, puis gelés dans
`reference/aigo-unil.paths.js` : le harnais signale toute modification du routage. Ce qui n’a pas été fait, à commencer par tout test avec une
personne qui utilise un lecteur d’écran, est dit dans [docs/INTEGRATE.md](docs/INTEGRATE.md).

## Faire le vôtre

Le travail est dans les questions : l’étape 1 prend des semaines, les étapes 2 à 4 une demi-journée. Un éditeur de texte suffit, plus une ligne de commande si votre langue met des espaces insécables.

1. **Écrivez** vos questions et vos résultats sur la feuille de départ, [docs/DEMARRER.md](docs/DEMARRER.md) :
   vide, sous CC0, à remplir avec votre service juridique et la liste de vos outils sous contrat, celle qui
   vieillira le plus vite. [docs/ARBRE.md](docs/ARBRE.md) montre la même forme remplie, tous droits
   réservés : à lire et à citer, pas à reprendre sans nous écrire. Si vous partez du nôtre, écrivez-nous d’abord, puis déclarez `derivedFrom` : hors
   unil.ch, ses clés `name`, `url` et `licence` sont seules à pouvoir nommer AI_GO, l’UNIL ou la DCSR (Division calcul et soutien à la recherche).
2. **Téléchargez** `ai-go.html` avec l’icône de téléchargement à côté du bouton **Raw** (le fichier doit finir en
   `.html`), puis ouvrez-le par double-clic : tel quel, il montre un exemple bilingue de trois questions,
   coiffé d’un encadré « Aperçu : non publiable » qui liste les treize textes à remplacer. Cet encadré est votre
   liste de courses, pas un défaut : il disparaît quand ils sont remplis.
   Recopiez vos textes entre `AI_GO-CONTENT-BEGIN` et `AI_GO-CONTENT-END`, ainsi que, juste en dessous du
   marqueur de fin, le grand titre et le chapeau ; adaptez `<html lang>`, le `<title>` et `data-lang`, sinon la
   page est annoncée dans la mauvaise langue. Ces trois-là ne décident pas de la langue des phrases de refus :
   `defaultLang` la décide, et le moteur en porte quarante-deux en français et quarante-deux en anglais ; ses boutons
   n’existent qu’en français et en anglais, les autres langues vont dans `ui`. Règles d’écriture en tête du bloc ;
   pour les espaces insécables du français, téléchargez de la même façon `tools/typographie.mjs` dans un dossier
   `tools/` à côté du fichier, puis lancez `node tools/typographie.mjs ai-go.html` : voir
   [docs/DEMARRER.md](docs/DEMARRER.md). Le moteur, plus bas, ne se touche pas.
3. **Vérifiez** : téléchargez `check.html` de la même façon, à garder en local. Elle s’ouvre dans la langue de
   votre navigateur, français à défaut, et deux boutons en changent. Domaine, puis votre fichier : verdict,
   tous les chemins, questions inatteignables. Faites relire ces chemins par qui a validé vos questions.
4. **Publiez** : le moteur refuse d’afficher quoi que ce soit tant qu’un `TO_FILL_IN` demeure. Remplissez `publisher.name`, `publisher.domains`
   (préproduction comprise), `review.by`, `review.date`, `jurisdiction`, `legalBasis` et `disclaimer` (deux langues). Les treize points de l’encadré
   sont ces huit-là, plus l’identifiant, la remarque d’exemple, les deux liens `example.org` et les questions elles-mêmes. Puis fichier seul, bloc
   HTML d’un CMS ou iframe, et `LICENSE` à côté dans les trois cas : [docs/INTEGRATE.md](docs/INTEGRATE.md).

## Le dépôt

`ai-go.html` (bloc de contenu d’exemple en haut, moteur 3.1.11 en bas ; s’ouvre par double-clic), `check.html`
(validateur), `test/run.mjs` (harnais : `node test/run.mjs`), `tools/typographie.mjs` (les insécables du français,
étape 2), `tools/anglais.mjs` (qui rend `docs/TREE.en.md` depuis l’arbre), `LICENSE` (les trois régimes, à joindre à toute redistribution), `CITATION.cff` (citer), `reference/`
(questionnaire de l’UNIL, FR/EN, empreinte de contenu `cbdb4863aed9f778`, et ses 20 chemins gelés à côté), `docs/`, [SECURITY.md](SECURITY.md),
[CONTRIBUTING.md](CONTRIBUTING.md), [CHANGELOG.md](CHANGELOG.md) (ni release, ni tag : il dit pourquoi) et
[docs/PUBLICATIONS.md](docs/PUBLICATIONS.md), où vérifier l’empreinte de votre copie (un seul commit, par choix : une copie se désigne par son empreinte, pas par un tag).

**Ce qui tourne sur ia.unil.ch/AI_GO n’est pas encore ce fichier.** La page sert une implémentation antérieure
du même questionnaire ; les 20 chemins de ce dépôt y ont été relevés, et le harnais vérifie qu’il les reproduit.

## Nous écrire

Adapter le questionnaire à votre droit cantonal ou au RGPD, comparer vos chemins aux nôtres, signaler un défaut :
écrivez à <iaunil@unil.ch> ou ouvrez une [issue](https://github.com/unil-ia/AI_GO/issues). Une faille de sécurité
se signale comme le dit [SECURITY.md](SECURITY.md).

## Crédits et licences

Questionnaire : Cellule stratégique IA de l’Université de Lausanne, avec Selma Lamas Valverde, Emma Lo Cicero et
Clara Montangero, étudiantes en droit de la Professeure Aurelia Tamò-Larrieux. Le code du moteur a été écrit avec
l’assistance de Claude (Anthropic) ; le raisonnement qu’il porte est le leur. Citer : `CITATION.cff`.

`ai-go.html` en entier, `check.html`, `test/run.mjs`, `tools/typographie.mjs` et `tools/anglais.mjs` : BSD 3-Clause. Joignez `LICENSE`
quand vous les redistribuez : c’est là que vivent les conditions et l’exclusion de garantie. Bloc de contenu
d’exemple, format de l’arbre et feuille de départ (`docs/DEMARRER.md`) : sous BSD, et sous CC0 en plus, à votre choix. Le questionnaire de l’UNIL (`reference/`,
`docs/ARBRE.md`, `docs/TREE.en.md`, `docs/capture.png`) : tous droits réservés, publié pour référence ; le citer avec la source, oui,
tout autre usage, écrivez-nous. GitHub affiche « Other » parce que `LICENSE` porte ces trois régimes et non un seul.
En cas de divergence avec une page ou un billet plus ancien, ce dépôt et le site font foi.

## In English

AI_GO tells you in two minutes which family of AI tools you may use with a given dataset: commercial, institutional under
contract, or local LLMs only. **It is not legal advice**: a decision-support tool, whoever uses it stays responsible.
Try it: <https://ia.unil.ch/AI_GO> (same questionnaire word for word, but an earlier implementation: that page is not the
engine of this repository and prints no receipt line). This repository holds UNIL’s questionnaire (11 questions,
7 results, 20 paths, Swiss law; all rights reserved, read it in English in [docs/TREE.en.md](docs/TREE.en.md), in French
in [docs/ARBRE.md](docs/ARBRE.md)), and the engine: one HTML file with a validator, its guide
[docs/INTEGRATE.md](docs/INTEGRATE.md), and a blank sheet for your own questions, [docs/DEMARRER.md](docs/DEMARRER.md), in French. The engine takes a third interface language.
