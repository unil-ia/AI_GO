# Sécurité · Security

## Signaler une faille

Écrivez à la Cellule stratégique IA de l’UNIL : <iaunil@unil.ch>, en français ou en anglais. N’ouvrez pas d’issue
publique pour une faille exploitable. Nous accusons réception et disons ce que nous faisons ; ce dépôt est maintenu par
une petite équipe, sans engagement de délai.

## Ce qui est dans le périmètre

Le moteur (bloc `AI_GO-ENGINE-BEGIN` de `ai-go.html`), le validateur `check.html` et le harnais `test/run.mjs`. Par
construction, le moteur n’utilise jamais `innerHTML`, ne fait aucune requête réseau, n’écrit rien dans `localStorage` et
n’envoie qu’un seul message vers l’extérieur, la hauteur de l’iframe ; le harnais le vérifie à chaque exécution.

## Où vivent les réponses

Les réponses de la personne restent dans son navigateur, à deux endroits : `sessionStorage`, sous la clé
`aigo:<id>:state`, et l’état des entrées d’historique de l’onglet, pour que le bouton Précédent retrouve la bonne étape.
Les deux disparaissent avec l’onglet et ne sont pas partagés entre onglets. Le moteur ne les envoie nulle part, puisqu’il
ne fait aucune requête ; mais ils restent lisibles, comme le questionnaire affiché, par tout autre script chargé sur la
même page : dans un CMS, ce qui est sur la page voit ce qui est sur la page. Rien n’est écrit dans `localStorage` ni dans un cookie. `data-storage="none"` supprime
même l’usage de `sessionStorage` (voir `docs/INTEGRATE.md`).

## Ce qui n’en est pas

Le garde-fou de publication (`guard`) est une **courtoisie, pas une frontière de sécurité** : qui publie le fichier le
possède et peut éditer le moteur. Cinq limites connues, délibérées ou inhérentes, qu’il ne faut pas prendre pour des
failles : le titre de la page, le grand titre, le chapeau et le message affiché sans JavaScript ne font pas partie
de l’arbre, c’est `check.html` qui les signale, pas le moteur ; et `check.html` rejoue les scripts du fichier
un par un, si bien qu’un `let` déclaré dans
l’un et repris dans le suivant, que le navigateur partage, ne lui est pas visible – il le dit alors au lieu de
deviner. Le garde, lui, ne lit pas l’arbre que vous lui passez : il en prend d’abord une copie de valeurs simples,
sans prototype et sans accesseur, et c’est cette copie que le rendu affiche. Un champ arrivant par le prototype
échappe donc au contrôle et à l’écran en même temps, ce qui est le bon sens de l’échappée. Une autre, assumée : un mot de **quatre lettres** écrit dans une écriture qu’aucune de vos `langs` n’emploie
est refusé, parce que quatre lettres que ce fichier ne sait pas lire ressemblent aux quatre d’un nom réservé.
Citer un terme juridique japonais dans un questionnaire français demande donc de déclarer `ja`. Le refus le dit.
L’échappée inverse, « pas une lettre latine dans la chaîne, donc de la prose », a été retirée : elle était vraie
d’une phrase et fausse d’un champ, et `publisher.name` est un champ – une institution pouvait signer sa page
du nom de l’origine, en petites capitales, sans déclarer une seule langue et sans un point de contrôle.

La dernière, mesurée : le verrou lit un nom **entre deux non-lettres**, et une lettre collée au nom en fait
un autre mot. C’est juste pour « UNILa », et cela vaut aussi pour une lettre qui se dessine en petit, comme
l’ordinal « ª », qu’Unicode classe parmi les lettres et que l’œil lit comme un signe posé à côté. Les séparer
demanderait une liste de formes de présentation, et la propriété qui les distinguerait est celle-là même qui
fait lire le I pleine chasse et le I mathématique comme des I, ce qui est le trou que ce verrou vient de
fermer. Le nom reste donc lisible pour qui accepte de lui accoler une marque. Le contenu juridique du
questionnaire n’est pas un sujet de sécurité : pour une erreur de fond, écrivez-nous ou
ouvrez une issue. `check.html` exécute le fichier qu’on lui donne : gardez cette page en local.

### Ce que le contrôle de page ne voit pas encore

Quatre limites **de plus**, mesurées en septembre 2026 dans un vrai navigateur, et laissées ouvertes plutôt que
tues. Les deux premières portent sur ce que `check.html` lit ; les deux autres sur le garde lui-même.

- **Le texte qu’une feuille de style ajoute.** `content` sur `::before` ou `::after` peint des lettres que le source
  ne porte pas : `check.html` lit le fichier, pas le rendu, et ne les verra pas. Écrivez vos titres dans le HTML.
- **Les ressemblances de perception.** `∪` pour un U, `©` pour un C, `®` pour un R : ces signes ne sont pas
  des lettres, aucune normalisation ne les y ramène, et le repli du moteur les laisse passer. Un lecteur pressé peut
  y lire un nom. Le jugement reste le vôtre.
- **Le rejeu des scripts va plus loin que le `let` partagé nommé plus haut.** Un `<template>`, un
  gestionnaire enregistré après le moteur ou un module ES lui font rendre un verdict que l’écran dément.
  Il le dit quand il ne sait pas exécuter ; ouvrez la page pour trancher.
- **Sur un moteur JavaScript d’avant 2018, le verrou est plus faible.** Trois expressions se construisent avec des
  propriétés Unicode et retombent sinon sur des plages écrites à la main : elles reconnaissent alors 96 728 points
  de code de moins comme des lettres, dont tout ce qui se trouve au-dessus du plan de base. Le harnais charge
  désormais le moteur une seconde fois dans ces conditions et vérifie que les écritures ordinaires du nom restent
  refusées ; l’écart n’en est pas moins réel, et il est écrit ici, non passé sous silence.

## In English

Report a vulnerability to <iaunil@unil.ch>, not in a public issue. Scope: the engine block of `ai-go.html`, `check.html`
and `test/run.mjs`. Out of scope: the publication guard, which is a courtesy and not a security boundary, and the legal
content of the questionnaire. `check.html` runs whatever file is dropped on it: keep that page local.
