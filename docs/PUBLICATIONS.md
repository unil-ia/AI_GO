# Registre des publications

Ce dépôt est réécrit en un seul commit à chaque version : l’identifiant d’un commit ancien n’existe plus sur
GitHub dès la version suivante, et il n’y a ni tag ni release. Ce registre est ce qui reste. Il permet à
quiconque détient une copie de dire de quelle publication elle vient, et à l’Université de Lausanne de dire ce
qu’elle a publié à une date donnée, sans dépendre de GitHub ni de l’historique Git.

**Désignez une copie par son empreinte, jamais par son numéro de version.** Un numéro se réécrit ; une
empreinte SHA-256 ne se réécrit pas. Pour vérifier la copie que vous détenez :

```sh
shasum -a 256 ai-go.html check.html test/run.mjs tools/typographie.mjs
```

This repository is rewritten as a single commit for each version, so an older commit id stops existing on
GitHub as soon as the next one lands. This register is what survives: designate a copy by its SHA-256, never
by its version number. The command above prints the four digests to compare with the entry below.

Le contenu du questionnaire de l’UNIL, lui, n’a pas bougé depuis la 3.0.12. **Son empreinte, elle, a bougé
deux fois, et la comparer d’une version à l’autre n’a aucun sens.** Elle valait `59b6dc65` jusqu’à la 3.0.17,
`59b6dc657b9c9c1f` à la 3.0.18, et vaut `cbdb4863aed9f778` depuis la 3.0.19. La 3.0.18 annonçait que les huit
premiers caractères ne bougeraient pas ; **cette phrase est retirée**, la 3.0.19 ayant dû remplacer la fonction
de brassage après qu’une collision y a été construite. Une empreinte se lit donc avec la version du moteur qui
l’a calculée, et jamais seule. Le texte, lui, n’a pas bougé : une liste de chemins relue et signée avec une
version antérieure décrit encore exactement ce que fait celle-ci.

## Moteur 3.0.19 · publié le 2026-09-09

Commit : celui qui porte cette version, inscrit ici à la publication suivante. 19 fichiers, bloc
moteur `h:5e54e7fd`.

- `ai-go.html`  
  `d60e7a793f54f86c506689a2267502e5fb3fd6a6168ddee06a5e122c169b8cf6`
- `check.html`  
  `4f3080c0185350b43dc0bfe99959968646a613853d2677a6bce943eb898dc6fe`
- `test/run.mjs`  
  `3a2d3bcbc7422dafe9e1bbd09a48f400a39ed1b190ced6ed8f116adf010478d2`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.0.18 · publié le 2026-09-09

Commit `48455c0`, 19 fichiers, bloc moteur `h:6db17334`.

- `ai-go.html`  
  `dc97edc0ca0dbe152039ee6180b47539da0e965eca025e30b72655cfcc1d946d`
- `check.html`  
  `75dd179431cbb21e3b6a6ece656812047e0912473a9ed0d8416c2bce43619864`
- `test/run.mjs`  
  `3e0df8506b8a2a036d97b65220f3721ccd583cce937b7e48e14503cfe65471a2`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.0.17 · publié le 2026-09-08

Commit `5dd696f`, 19 fichiers, bloc moteur `h:f8d73b7e`.

- `ai-go.html`  
  `7d28bcbfccf751b471f9bb1bda9ad7f1d0cddb8c8dcf429af21b46e6cdcc2543`
- `check.html`  
  `d9e5b24aa5beff398571d5085dfd4aa213ec61ff451178dfdc6a2471e703f207`
- `test/run.mjs`  
  `c3f22e2c4bbeeed0c73a5d2447b6b8688f1b2e3bb2ca59ca9791e3eb50226d18`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.0.16 · publié le 2026-09-08

Commit `25d050b`, 18 fichiers, bloc moteur `h:ca5dd63f`.

- `ai-go.html`  
  `2fc989b781db6e31c624fdb97d4e33e1fb2efa61e8f23d40da88391013f784c9`
- `check.html`  
  `1ce3b967d6e4f2ba23ef2a49fdff1d3fb408c86b4ea1737a4f493f8c396f00f4`
- `test/run.mjs`  
  `c5aed456e5cc845c06edc08e2826589963678d737c0ad79c74a68e8846279ba6`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.0.15 · publié le 2026-09-08

Commit `13ad1d3`, 18 fichiers, bloc moteur `h:90cf3219`.

- `ai-go.html`  
  `cd602ecacd3fecca2baa871163cad1fcf1a3e01592b64c2b1b9e927afdc63996`
- `check.html`  
  `84cef4208db79872b1a4e1eec258ee676b1721f85a2f3b7f1e992e4c60cc39a2`
- `test/run.mjs`  
  `f76f7ecac69901ba42fd59e489af184ce6aac099328409313c396760c550c764`
- `tools/typographie.mjs`  
  `fd66cc77efcf7fb33f45c8e7a1bad99256ce2944b4ad59ef5b2d61db05cf2bdc`

## Moteur 3.0.14 · publié le 2026-09-07

Commit `f8941df`, 18 fichiers, bloc moteur `h:f9b4d517`.

- `ai-go.html`  
  `3821aef1eab089f8bb0f72285789537d72b1996d626975875107c0c9a39e4c14`
- `check.html`  
  `c3973cd0c0183faa36454ba6de9e9244b76014bd5ad20306bd9d915786ff9dbb`
- `test/run.mjs`  
  `92f1cd7a19b8d03c55bd5418df174708690295c7577401ec45e76b971047303a`
- `tools/typographie.mjs`  
  `3fd61b880eaece062484579a3dcd92659b861d391369baa3a76803b71b77b66a`

## Moteur 3.0.13 · publié le 2026-09-07

Commit `3414295`, 16 fichiers, bloc moteur `h:f2c72f14`.

- `ai-go.html`  
  `28536a2566ccc90a3b9555e160a8d85d609cb430219a4f0552d6b3f77730a80a`
- `check.html`  
  `b96f60ced1f0ca5d84d8885ed20146d179f068d4b688f797f362a5e451e35d53`
- `test/run.mjs`  
  `c2320f6d0d11291353ef34611969d5e19eff05f99bcf0313ed6c8d3269b50b4d`
- `tools/typographie.mjs` : pas encore dans cette version
