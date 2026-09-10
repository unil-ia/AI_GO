# AI_GO : quel outil IA pour vos données ?
[![tests](https://github.com/unil-ia/AI_GO/actions/workflows/test.yml/badge.svg)](https://github.com/unil-ia/AI_GO/actions/workflows/test.yml)

En deux minutes, sans compte, le questionnaire vous dit quelle famille d’outils IA vous pouvez utiliser avec un
jeu de données : LLMs commerciaux, LLMs institutionnels (sous contrat avec votre institution) ou LLMs en local
uniquement. Écrit à l’Université de Lausanne pour le droit suisse : LPD et LPrD-VD (protection des données),
LRH (recherche sur l’être humain), secret de fonction.

**Essayez-le : <https://ia.unil.ch/AI_GO>** (FR/EN, ordinateur et mobile ; implémentation antérieure, voir
« Le dépôt »). Le billet :
[AI_GO : deux minutes pour savoir quel outil d’IA vous pouvez utiliser avec vos données](https://wp.unil.ch/iaunil/ai_go-deux-minutes-pour-savoir-quel-outil-dia-vous-pouvez-utiliser-avec-vos-donnees/).

![Le questionnaire de l’UNIL collé dans le bloc de contenu d’ai-go.html, ouvert en local : étape 5 sur 10, « Données sensibles ? », six cases à cocher](docs/capture.png)

**Le moteur** : un seul fichier HTML libre, `ai-go.html`, avec son validateur `check.html`. Le guide qui sert à le
poser sur un site est en anglais, [docs/INTEGRATE.md](docs/INTEGRATE.md).

## Ce que le questionnaire demande

Onze questions, sept résultats, vingt chemins. Elles partent des personnes concernées : y en a-t-il, sont-elles
identifiables, le risque de réidentification par recoupement est-il faible ? Elles trient ensuite les catégories que
le droit suisse distingue : les données sensibles de la LPD et de la LPrD-VD, la santé et la génétique humaine au
sens de l’art. 3 LRH, les données délicates, l’analyse d’impact menée avec le DPO, les données secondaires,
l’anonymisation. Une dernière question vaut pour toutes les branches : le partage de ces données est-il restreint,
par un secret de fonction, un secret professionnel, un accord de confidentialité (NDA) ou un protocole d’accord
(MOU) ? Les sept résultats ouvrent sur trois conduites : utilisation libre, LLMs institutionnels ou en local, LLMs
en local uniquement.

Le questionnaire lui-même se lit en entier dans [docs/ARBRE.md](docs/ARBRE.md) : les intitulés, les options, les
textes d’aide, les notes affichées sous chaque résultat, le schéma et les 20 chemins écrits en phrases. Il y est
publié pour être lu et cité, tous droits réservés : ce README est sous BSD, il décrit le questionnaire de l’UNIL et
ne le reproduit pas.

## Comment il a été fait

Les questions, les résultats et les décisions qu’ils portent ont été écrits par la **Cellule stratégique IA de
l’UNIL** avec trois étudiantes en droit de la **Professeure Aurelia Tamò-Larrieux** : **Selma Lamas Valverde**,
**Emma Lo Cicero** et **Clara Montangero**. Relu par la Cellule stratégique IA et le DPO de l’UNIL ; la date est
dans `reference/aigo-unil.js` (`review.date`), affichée sous chaque résultat.

En septembre 2026, pour le porter sur ce moteur sans changer une décision, ses 20 chemins ont été relevés deux
fois, indépendamment, puis gelés dans `reference/aigo-unil.paths.js` : le harnais signale toute modification du
routage. Ce qui n’a pas été fait, à commencer par tout test avec une personne qui utilise un lecteur d’écran, est
dit dans [docs/INTEGRATE.md](docs/INTEGRATE.md).

## Faire le vôtre

Le travail est dans les questions : l’étape 1 prend des semaines, les étapes 2 à 4 une demi-journée avec quelqu’un qui sait ouvrir un éditeur de texte.

1. **Écrivez** vos questions et vos résultats sur la feuille de départ, [docs/DEMARRER.md](docs/DEMARRER.md) :
   vide, sous CC0, à remplir avec votre service juridique et la liste de vos outils sous contrat, celle qui
   vieillira le plus vite. [docs/ARBRE.md](docs/ARBRE.md) montre la même forme remplie, tous droits réservés : à
   lire, pas à recopier. Si vous partez du nôtre, écrivez-nous d’abord, puis déclarez `derivedFrom` : hors
   unil.ch, ses clés `name`, `url` et `licence` sont seules à pouvoir nommer AI_GO, l’UNIL ou la DCSR, refusés
   ailleurs, signature comprise ; elles portent des valeurs, pas des phrases, le moteur écrivant la mention.
2. **Téléchargez** `ai-go.html` avec l’icône de téléchargement à côté du bouton **Raw** (le fichier doit finir en
   `.html`), puis ouvrez-le par double-clic : tel quel, il montre un exemple bilingue de trois questions, à remplacer.
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
4. **Publiez** : le moteur refuse d’afficher quoi que ce soit tant qu’un `TO_FILL_IN` demeure. Remplissez
   `publisher.name`, `publisher.domains` (préproduction comprise), `review.by`, `review.date`, `jurisdiction`,
   `legalBasis` et `disclaimer`. Puis fichier seul, bloc HTML d’un CMS ou iframe, et `LICENSE` à côté dans les
   trois cas : [docs/INTEGRATE.md](docs/INTEGRATE.md).

## Le dépôt

`ai-go.html` (bloc de contenu d’exemple en haut, moteur 3.0.19 en bas ; s’ouvre par double-clic), `check.html`
(validateur), `test/run.mjs` (harnais : `node test/run.mjs`), `tools/typographie.mjs` (les insécables du français,
étape 2), `LICENSE` (les trois régimes, à joindre à toute redistribution), `CITATION.cff` (citer), `reference/`
(questionnaire de l’UNIL, FR/EN, empreinte de contenu `cbdb4863aed9f778`, et ses 20 chemins gelés à côté), `docs/`, [SECURITY.md](SECURITY.md),
[CONTRIBUTING.md](CONTRIBUTING.md), [CHANGELOG.md](CHANGELOG.md) (ni release, ni tag : il dit pourquoi).

**Ce qui tourne sur ia.unil.ch/AI_GO n’est pas encore ce fichier.** La page en ligne sert une implémentation
antérieure du même questionnaire ; les 20 chemins de ce dépôt ont été relevés sur cette page, et le harnais
vérifie que `ai-go.html` les reproduit.

## Nous écrire

Adapter le questionnaire à votre droit cantonal ou au RGPD, comparer vos chemins aux nôtres, signaler un défaut :
écrivez à <iaunil@unil.ch> ou ouvrez une [issue](https://github.com/unil-ia/AI_GO/issues). Une faille de sécurité
se signale comme le dit [SECURITY.md](SECURITY.md).

## Crédits et licences

Questionnaire : Cellule stratégique IA de l’Université de Lausanne, avec Selma Lamas Valverde, Emma Lo Cicero et
Clara Montangero, étudiantes en droit de la Professeure Aurelia Tamò-Larrieux. Le code du moteur a été écrit avec
l’assistance de Claude (Anthropic) ; le raisonnement qu’il porte est le leur. Citer : `CITATION.cff`.

`ai-go.html` en entier, `check.html`, `test/run.mjs` et `tools/typographie.mjs` : BSD 3-Clause. Joignez `LICENSE`
quand vous les redistribuez : c’est là que vivent les conditions et l’exclusion de garantie. Bloc de contenu
d’exemple, format de l’arbre et feuille de départ (`docs/DEMARRER.md`) : sous BSD, et sous CC0 en plus, à votre choix. Le questionnaire de l’UNIL (`reference/`,
`docs/ARBRE.md`, `docs/capture.png`) : tous droits réservés, publié pour référence ; le citer avec la source, oui,
tout autre usage, écrivez-nous. GitHub affiche « Other » parce que `LICENSE` porte ces trois régimes et non un seul.
En cas de divergence avec une page ou un billet plus ancien, ce dépôt et le site font foi.

## In English

AI_GO tells you in two minutes which family of AI tools you may use with a given dataset: commercial, institutional
under contract, or local LLMs only. Try it: <https://ia.unil.ch/AI_GO>. This repository holds UNIL’s questionnaire
(11 questions, 7 results, 20 paths, Swiss law; all rights reserved, and read in [docs/ARBRE.md](docs/ARBRE.md)) and
the engine: one HTML file, BSD 3-Clause, with a validator. Guide: [docs/INTEGRATE.md](docs/INTEGRATE.md).
