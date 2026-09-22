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

## Moteur 3.1.11 · publié le 2026-09-22

Commit : celui qui porte cette version, inscrit ici à la publication suivante. 21 fichiers, bloc
moteur `h:5d68b57f`.

- `ai-go.html`  
  `6e0c54c93049fc3503a4946e32b10bbeb88caaaaf9a91b0d91f0035373237cec`
- `check.html`  
  `3fbaeb8491ddb07de06873bad2555bb17c742b42c94c2e55280b829a04946a9b`
- `test/run.mjs`  
  `7bdbb898fdcb8fbfca11e8fc2482636e001d4cc24256619906aa18d8066dfab3`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.1.10 · publié le 2026-09-22

Commit : `61db643`. 21 fichiers, bloc
moteur `h:2de7f625`.

- `ai-go.html`  
  `53fbc7a29353a0266329c29ee1c8e7b56f3cb2798d7ff307e9913a7299b5c9e3`
- `check.html`  
  `3fbaeb8491ddb07de06873bad2555bb17c742b42c94c2e55280b829a04946a9b`
- `test/run.mjs`  
  `47074241008d2bc406fcf720b440d3dc487353b64dafbfe4903db5665644ecd0`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.1.9 · publié le 2026-09-22

Commit : `8ed476f`. 21 fichiers, bloc
moteur `h:3813b56d`.

- `ai-go.html`  
  `4b83f0566ddb756a4e5eeea2e39789cbc680f86a0eaab12b83c8a1f888a03374`
- `check.html`  
  `db24cdad2db5bcf11313cab01e5729b205649c94589a4b3964cb997ee7298794`
- `test/run.mjs`  
  `dfe3f25cb836d8e24c8b111c698c9234ffded5a1bea0b848453a775220add83e`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.1.8 · publié le 2026-09-22

Commit : `b559b90`. 21 fichiers, bloc
moteur `h:4f0797dd`.

- `ai-go.html`  
  `3cd05de4476f238b93a4a9c64fd2cb1909fa0c602a4a7852ae1d3da4eaad44fc`
- `check.html`  
  `47c8d216d4c507ead19cc103107a7cff6bbd1e36509d734b745b42048a35e8be`
- `test/run.mjs`  
  `1cac78513c18bac4ed36c1d0f3658caf64fa174b50e2467836b7cdf65f48ec81`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.1.7 · publié le 2026-09-22

Commit : `342857b`. 21 fichiers, bloc
moteur `h:ade68566`.

- `ai-go.html`  
  `85bbe9addb1eed34b1fbdd1a98012a95f3599221f58e7580854a2ee8169a66f9`
- `check.html`  
  `8c0c3dd9d7ca08e8b7173f3a16bf794989e4dcc71d4b834f78550796056c68ff`
- `test/run.mjs`  
  `0a46e3f1d8563e8ad1932c26240a84536560421450fa72b8197ac25ecfb3f7cd`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.1.6 · publié le 2026-09-22

Commit : `161638e`. 21 fichiers, bloc
moteur `h:ed9e4a5a`.

- `ai-go.html`  
  `a9d70013b82835a02cadc4ffc5cbefb3a3a1da9c70fc222e4a33a80da7969fdf`
- `check.html`  
  `8c0c3dd9d7ca08e8b7173f3a16bf794989e4dcc71d4b834f78550796056c68ff`
- `test/run.mjs`  
  `af364d5b74ad697e7c9d86f9624993ab5d4548146aa673b7cd7472b4830c6efe`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.1.5 · publié le 2026-09-22

Commit : `e468f38`. 21 fichiers, bloc
moteur `h:e80428bb`.

- `ai-go.html`  
  `d786ab29b46bfa4f9c8da8eacedc88942d807e196aba6e7ec39984532958afda`
- `check.html`  
  `117a43cb4a31aa67ccd8647b7b405c591003babd434f7276955835741385c34a`
- `test/run.mjs`  
  `cfb3dcda44ead27aaa0475025b475a5a173ed7d232d52337f5895d16c45c419d`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.1.4 · publié le 2026-09-22

Commit : `33cd296`. 21 fichiers, bloc
moteur `h:d12f31b2`.

- `ai-go.html`  
  `73582b846b81aeb766b1ecccce0e73a6fe18e4bd104437e50573edd8b80f91fa`
- `check.html`  
  `3585445cb536a7e261ca027e4f2bc8761e4e13a9186f7d98c5712f1267e5c5e8`
- `test/run.mjs`  
  `582f5f6c241e0e1f437f638b1af34dbd8883ee23bc7c91263935aee9912b5720`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.1.3 · publié le 2026-09-22

Commit : `9b55029`. 21 fichiers, bloc
moteur `h:506b1a81`.

- `ai-go.html`  
  `e7d431b5e1247f7b98903a9e56faeb33cc9c11b947379adbece84e51fcbf17b3`
- `check.html`  
  `3585445cb536a7e261ca027e4f2bc8761e4e13a9186f7d98c5712f1267e5c5e8`
- `test/run.mjs`  
  `ea5f81d0fde0f838de93c1ff0975a66dc69296fc54545fcf378cc04cb0434bbe`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.1.2 · publié le 2026-09-22

Commit : `afbba63`. 21 fichiers, bloc
moteur `h:13a9aeda`.

- `ai-go.html`  
  `20a20f3701de199a5103d32fb33a5a2e9249686ad7495426b228cb6929fb291f`
- `check.html`  
  `ec6877bb58ca69d861db77caff48a02f7fd9a70dab56c2470527253592f7f559`
- `test/run.mjs`  
  `d09706899114ba5d78ec9853ff7eac9db8da402a85cc4388212d6df63240cce9`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.1.1 · publié le 2026-09-22

Commit : `0dd5da3`. 21 fichiers, bloc
moteur `h:42e62758`.

- `ai-go.html`  
  `5454b9b00b89b29f2e84201622774e7568dbf758db63f9fcc1b2ed64b482522a`
- `check.html`  
  `ec6877bb58ca69d861db77caff48a02f7fd9a70dab56c2470527253592f7f559`
- `test/run.mjs`  
  `bf6a6b479f92d084e0cf123ea1219e75af75976eeee119682a29710db04a7df6`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.1.0 · publié le 2026-09-15

Commit : `bf9bba9`. 19 fichiers, bloc
moteur `h:466c1b8c`.

- `ai-go.html`  
  `23848e52e8ddbaf86f1acebbed17a29d7e5e3c9672ec5b4e60edba202dfb7acb`
- `check.html`  
  `4f3080c0185350b43dc0bfe99959968646a613853d2677a6bce943eb898dc6fe`
- `test/run.mjs`  
  `e49ebd5606f6fced1880434173e8d3cc64fb8e66ebe41e9efb5c6138f5ab64bd`
- `tools/typographie.mjs`  
  `d4a1c26890731162b74f21b7b0c92ab73d6941cdaf08269c623f21ea23c7b34b`

## Moteur 3.0.19 · publié le 2026-09-09

Commit : `2c1c8fc`. 19 fichiers, bloc
moteur `h:137e2aac`.

- `ai-go.html`  
  `8b83429d416a75b89a5e3d99f43e9fdd5a664edda1119e6aaf56783648b6a562`
- `check.html`  
  `4f3080c0185350b43dc0bfe99959968646a613853d2677a6bce943eb898dc6fe`
- `test/run.mjs`  
  `1d6426df48524f1664737934f3c5c4d84b4f4bb8a197449a4d6404bdb6b9d0bc`
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
