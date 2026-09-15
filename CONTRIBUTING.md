# Contribuer · Contributing

**Une issue suffit** pour un défaut, une question ou une adaptation à votre droit cantonal, en français ou en anglais :
<https://github.com/unil-ia/AI_GO/issues>. Une faille de sécurité se signale en privé, voir [SECURITY.md](SECURITY.md).

**Une pull request est la bienvenue comme base de discussion**, et l’intégration continue la teste, mais elle ne sera pas
fusionnée telle quelle : ce dépôt est réécrit en un seul commit à chaque version, comme l’explique
[CHANGELOG.md](CHANGELOG.md). Son contenu est repris dans la version suivante et son auteur·rice créditée dans ce même
fichier. Ce n’est pas une façon de s’approprier un travail, c’est la conséquence d’une règle de publication choisie.

**Avant d’ouvrir une pull request**, lancez `node test/run.mjs` : sans dépendance, sans installation, il doit finir au
vert. Le dépôt s’impose quelques règles qui surprennent, et le harnais en vérifie la plupart : le nom AI_GO partout,
aucun tiret cadratin, un README d’au plus 110 lignes, l’apostrophe typographique dans `README.md` et
`docs/ARBRE.md`, et le questionnaire de l’UNIL gelé, transcrit mot pour mot dans `docs/ARBRE.md`. Le commit unique,
lui, ne se vérifie pas ici : c’est une règle de publication, et [CHANGELOG.md](CHANGELOG.md) l’explique.

**L’espace insécable s’écrit `\u00a0`, jamais tapée**, dans `ai-go.html` comme dans `check.html` : tapée, elle est
invisible dans un éditeur et se perd au copier-coller, et le harnais la refuse dans ces deux fichiers, dans ces
deux-là seulement. `tools/typographie.mjs` convertit en `\u00a0`, entre les deux marqueurs du bloc de contenu et à
l’intérieur des guillemets droits, toute espace tapée devant `:` `;` `?` `!` `%` ou un guillemet, qu’elle soit
ordinaire, insécable ou fine, ainsi que toute insécable tapée ailleurs dans ces textes ; là où aucune espace n’a été
tapée, il n’ajoute rien. Il refuse d’écrire si le fichier n’est pas de l’UTF-8 valide, si un des six marqueurs
`AI_GO-…` est dupliqué, désordonné ou mal formé, ou si un seul octet hors du bloc de contenu aurait bougé. Le harnais
l’exécute pour de vrai et vérifie que les deux guides annoncent le bon nombre de lignes : si vous changez sa
longueur, changez-les aussi.

**Les valeurs gelées, et comment les recalculer.** Le dépôt fige quelques empreintes plutôt que de les recalculer
à chaque exécution, parce qu’une valeur figée attrape un changement que personne n’a voulu. Aucune ne se devine :
à chaque fois, le harnais imprime dans son message d’échec la valeur qu’il a calculée, et il suffit de la coller.

| Valeur | Où elle est écrite | Ce qu’elle protège |
|---|---|---|
| Empreinte du bloc moteur | ligne `AI_GO-ENGINE-BEGIN` de `ai-go.html` | le moteur n’a pas été retouché en silence |
| Empreinte de contenu de l’exemple livré | `STARTER_FINGERPRINT` dans `test/run.mjs` | l’exemple est bien celui qui est livré |
| Empreinte du questionnaire gelé | `cbdb4863aed9f778`, dans le harnais et cinq pages | le contenu de l’UNIL n’a pas bougé |
| Gel des champs non signés | `test/run.mjs` | ce que l’empreinte ne signe pas est gelé quand même |
| Diagramme et vingt chemins | `test/run.mjs` | `docs/ARBRE.md` décrit encore le routage réel |
| Empreinte de lecture de l’exemple livré | `POLICY.example`, dans le bloc moteur ; elle ne couvre pas les liens, l’autre si | l’exemple ne se publie pas tel quel sous une signature |
| SHA-256 des quatre fichiers | `docs/PUBLICATIONS.md` | on désigne une copie sans dépendre de GitHub |

L’avant-dernière est celle qui a le plus coûté : l’exemple livré est passé au bilingue et cette empreinte est
restée sur l’ancienne, si bien que le verrou ne pouvait plus se déclencher, sans qu’une seule assertion bouge.
Le harnais compare désormais cette valeur au bloc qu’elle prétend reconnaître, à chaque exécution.

La dernière est la seule à se poser au moment de publier, et non en travaillant : le registre des
publications décrit ce qui part, donc son entrée de tête se régénère juste avant le commit. Tant qu’elle est
périmée, le harnais est rouge et nomme le fichier en cause.

**Ce qui ne se change pas ici** : le texte du questionnaire de l’UNIL (`reference/`, `docs/ARBRE.md`) est publié pour
référence, tous droits réservés. Une erreur de fond s’écrit à la Cellule stratégique IA, <iaunil@unil.ch>, elle ne se
corrige pas par une pull request.

## In English

An issue is enough. A pull request is welcome as a basis for discussion and CI runs on it, but it will not be merged as
such: this repository is rewritten as a single commit for each version, so the change is carried into the next version
and its author credited in `CHANGELOG.md`. Run `node test/run.mjs` first. The UNIL questionnaire itself is all rights
reserved and is not changed here: write to <iaunil@unil.ch>.
