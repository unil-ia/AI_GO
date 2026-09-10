# Journal des versions · Changelog

Ce dépôt est **réécrit en un seul commit** à chaque version : l’historique Git ne montre donc qu’une entrée, et il n’y a
ni tag ni release. La version qui compte est celle du moteur, déclarée dans `CITATION.cff`, inscrite dans la ligne
`AI_GO-ENGINE-BEGIN` de `ai-go.html` et affichée sous chaque résultat à côté de l’empreinte du contenu. Ce fichier tient
lieu d’historique. This repository is rewritten as a single commit for each version: no tags, no releases; the engine
version in `CITATION.cff` is the reference, and this file is the history.

**Une pull request est la bienvenue comme base de discussion**, et la CI la teste ; mais parce que le dépôt est réécrit
en un seul commit, elle ne sera pas fusionnée telle quelle : son contenu est repris dans la version suivante et son
auteur·rice créditée ici. Pour un défaut ou une question, une issue suffit. A pull request is welcome as a basis for
discussion and CI runs on it, but it will not be merged as such: the repository is rewritten as a single commit, so the
change is carried into the next version and its author credited in this file.

## Moteur 3.0.19 · dépôt du 9 septembre 2026

**Le texte de l’arbre de l’UNIL et ses 20 chemins sont inchangés** (empreinte de contenu `cbdb4863aed9f778`).

**Ce qu’une institution ayant déjà publié doit faire.** Remplacer le bloc moteur, et rien d’autre : plus aucune ligne
du moteur ne se modifie à la main. **Toutes les empreintes changent de valeur**, y compris les huit premiers
caractères, que la 3.0.18 annonçait stables : la fonction de brassage elle-même a été remplacée, et une valeur
relevée avant ce jour ne se retrouve nulle part dans la nouvelle. Si un reçu a été remis à un service juridique,
refaites-le et joignez la date. Repassez ensuite votre fichier dans `check.html`.

- **Un symbole ne fabrique plus de lettres, et c’est la correction la plus grave de cette version.** Le verrou des
  noms réservés lisait le texte après décomposition de compatibilité, qui transforme `™` en les deux lettres « TM ».
  « UNIL™ » se lisait donc « UNILTM », où il n’y a pas de fin de mot après le L : le verrou entier tombait, et une
  copie affichait les cinq noms réservés sur un domaine étranger. Deux cent soixante-quatre caractères produisaient
  cet effet après le mot, deux cent cinquante-sept avant, sur trois cent vingt-sept qui fabriquent une lettre.
  Un caractère qui n’est pas lui-même une lettre devient
  maintenant une espace **avant** la décomposition : le lecteur voit un symbole, le garde lit une coupure, et c’est
  bien ce qu’est un symbole. Les lettres accentuées passent inchangées. Le harnais ne prend plus neuf témoins :
  il balaie les **trois cent vingt-sept** points de code de tout l’Unicode qui se décomposent en une lettre latine
  sans en être une, aux deux bords du mot, et vérifie dans l’autre sens que le français ordinaire, ses degrés,
  ses fractions et ses ordinaux, n’est pas touché. Un premier correctif laissait passer la capitale A encadrée,
  qui vit au-dessus du plan de base ; il parcourait des unités UTF-16 là où il fallait des points de code.
- **Déclarer une langue non latine n’ouvre plus que l’écriture de cette langue.** Une lettre illisible tient lieu de
  n’importe laquelle, et quatre d’entre elles nomment l’UNIL ; la règle s’effaçait pour tout arbre déclarant le
  japonais ou le russe, sans qu’un mot de japonais soit jamais écrit. La question posée est désormais celle du
  passage lui-même : chacune de ses lettres est-elle écrite dans une écriture qu’une des langues déclarées emploie ?
  Un arbre qui déclare le japonais écrit du japonais. Il n’écrit pas « UNIL » en déséret.
- **L’empreinte de l’exemple livré ne pouvait jamais se déclencher.** Elle couvrait aussi les liens, or les deux liens
  de l’exemple pointent sur `example.org`, refusé pour lui-même : toute institution était donc obligée de les
  changer, et ce changement déplaçait l’empreinte avant que la ligne ne soit lue. Elle ne couvre plus que les
  questions et les résultats – ce qu’il ne faut précisément pas republier sous une autre signature. En conséquence,
  **`docs/DEMARRER.md` ne vous demande plus de toucher au moteur** : la page conseillait d’y coller l’empreinte de
  votre propre arbre, ce qui faisait refuser votre propre fichier, et contredisait le `README.md` en même temps.
- **Le moteur écrit lui-même la mention de licence, et `derivedFrom.note` n’est plus dispensé du contrôle des
  noms réservés.** Une mention CC BY nomme l’auteur, l’œuvre, la licence et le fait de l’adaptation, et chacun de
  ces quatre nomme la source : la laisser à la prose de l’adoptant obligeait soit à dispenser cette prose du
  verrou, soit à lui refuser le moyen de se conformer. Le moteur la compose donc à partir de trois champs qui ne
  contiennent aucune phrase, `derivedFrom.name`, `.url` et **`.licence`, nouveau**, et il est seul à en écrire les
  mots. `note` redevient ce qu’elle est, la phrase que l’adoptant ajoute par-dessus, contrôlée comme le reste de
  la page : elle y écrivait « relu et certifié par l’Université de Lausanne », une ligne sous la phrase du
  moteur disant l’inverse.
- **La mise en gras est lue partout où un texte de l’arbre est dessiné.** La moitié du rendu passait par une
  fonction qui écrit le texte brut : une question intitulée `**Attention**` affichait ses astérisques. C’était la
  double lecture reprise par l’autre bout – le garde retirait les marques, le lecteur les voyait.
- **Le brassage du bloc moteur, dans `check.html`, n’est plus linéaire non plus.** Il garde ses huit caractères et son
  office, qui est de dire si le moteur a bougé, mais une collision ne s’y construit plus au crayon.
- Le compte des clés d’interface annoncé dans le bloc de contenu disait 27 et oubliait `signatureId` ; l’en-tête du
  moteur disait 28. Il y a 31 clés, les trois nouvelles portant la mention de licence, et les deux listes le disent.
- **`check.html` divergeait du navigateur sur six points, et son verdict ne portait donc pas sur la page servie.**
  Il coupait les espaces autour du nom du conteneur, quand le navigateur les garde ; il ne décodait pas les
  références de caractères, quand le navigateur les décode ; il exécutait les scripts laissés en commentaire,
  que le navigateur ignore ; il ne reconnaissait pas une balise fermante en capitales et avalait la fin du
  fichier ; il perdait `this.AI_GO_CONTENT = …`, qui déclare l’arbre dans un script classique, et l’écrivait au
  passage sur sa propre page ; et il laissait tomber les gestionnaires `DOMContentLoaded`, si bien qu’un fichier
  vidant sa date de relecture dans l’un d’eux était déclaré publiable ici et refusé à l’écran. Les six sont
  corrigés. Reste une limite, et elle est écrite : un `let` partagé d’un script à l’autre n’est pas reproduit.
- **Le reçu de `check.html` porte ses deux moitiés.** Il n’affichait que l’empreinte, et écrivait « rien de ce
  qui a été signé n’a bougé » au-dessus d’une page dont les étapes avaient été renommées et le bouton
  « Continuer » changé en « Publier sans relecture ». La signature est affichée et comparée à côté d’elle.
- **Une date de relecture écrite à la suisse était acceptée, puis lue à neuf mois près.** `03.12.2026` ne passait
  pas la forme `AAAA-MM-JJ`, alors le moteur se rabattait sur la lecture large du navigateur, qui y voit le
  **11 mars**. Le fichier était déclaré publiable, imprimait « Relu le 03.12.2026 » sous chaque résultat, et
  démarrait son propre compte à rebours de dix-huit mois neuf mois trop tôt, sans que personne en soit averti.
  La phrase de refus promettait `AAAA-MM-JJ` depuis toujours ; le contrôle le demande enfin, et le compte à
  rebours lit la date de la même façon. Onze formes sont refusées et éprouvées comme telles.
- **Le moteur imposait une péremption de dix-huit mois sans l’écrire nulle part.** Passé 548 jours après votre
  `review.date`, votre page annonce d’elle-même, sous chaque résultat et devant vos lecteurs, que sa relecture
  est périmée. Ce nombre ne vivait que dans un commentaire du bloc moteur, celui que `docs/DEMARRER.md` vous dit
  de ne pas ouvrir. Les deux guides le disent maintenant, et le harnais vérifie qu’ils le disent.
- **Le reçu était décrit de trois façons différentes selon la page.** `docs/INTEGRATE.md` disait qu’il ne dit
  rien de l’éditeur ni de la relecture ; `check.html` disait l’inverse une ligne plus bas ; `docs/ARBRE.md`
  appelait « signature » le bloc lisible éditeur-relecteur, à une ligne d’une ligne littéralement intitulée
  « signature » qui désigne autre chose. Les trois disent la même chose désormais, et aucune ne parle de
  signature au sens juridique. `docs/INTEGRATE.md` recommandait en outre de comparer l’empreinte à travers une
  mise à jour du moteur, ce que `docs/PUBLICATIONS.md` déclare vide de sens dans la même version.
- **`docs/DEMARRER.md` s’arrêtait au milieu du gué.** La feuille finissait relue, la section suivante commençait
  par « écrire le français dans le fichier », et rien entre les deux ne disait ce qui va où : aucun nom de champ
  de structure n’apparaissait dans la page. Une table de correspondance en nomme dix-neuf, ligne à ligne, entre la feuille et le fichier. La déclaration d’accessibilité que la loi demande, ses quatre points et
  l’écart WCAG 3.2.2 assumé, n’existait qu’en anglais : elle est en français dans la même page. Et le fait que
  le refus soit **total** – un seul point manquant éteint la page entière – y est écrit, avec ce qu’il faut en
  faire : repasser le fichier dans `check.html` avant chaque mise en ligne, pas seulement la première.
- **Une lettre restait effacée si le moteur ne savait pas que c’en était une, et c’est le trou le plus grave
  de la journée.** La liste des « caractères qui ressemblent à des lettres » était écrite à la main et oubliait
  l’alphabet pleine chasse et les alphabets mathématiques : U+FF29 et U+1D408, tous deux la lettre I, tous deux
  dessinés comme un I à l’écran, étaient pris pour des symboles, remplacés par une espace, et « UNＩL » était
  contrôlé comme « UN L » pendant que le lecteur lisait UNIL. **Cent vingt-sept graphies du nom de l’origine
  passaient par là.** La question n’est plus posée à une liste mais à la langue elle-même (`\p{L}`) : une lettre
  reste une lettre, quoi qu’elle devienne en se décomposant, et seul un caractère qui n’en est pas une devient
  une coupure. Le harnais balaie maintenant les **947 lettres** qui se décomposent en une lettre du nom, chacune
  mise à la place de celle qu’elle imite.
- **Un passage légitime en tête de phrase cachait tout ce qui venait après.** Quand le premier appariement
  appartenait à une écriture déclarée, la lecture de cette chaîne était abandonnée au lieu de continuer plus
  loin : « 日本語版 Guide UNɪL » passait, quand « Guide UNɪL » seul était refusé. Quatre-vingts cas construits
  passaient ainsi. Ce qui est accepté, c’est un appariement ; la recherche reprend juste après lui.
- **`check.html` ne démarrait plus du tout dans un navigateur.** Un commentaire de ce même fichier portait une
  balise fermante écrite en capitales ; le navigateur y ferme le script, et la page restait blanche. Le harnais
  cherchait ces balises en respectant la casse et ne voyait rien. Il ne la respecte plus, et le fichier ne porte
  la balise nulle part, dans aucune casse.
- **Les trois champs qui acquittent la licence portent des valeurs, pas des phrases.** Exempts du verrou et sans
  bornes, ils laissaient écrire `licence: "Officially validated by"`, et le moteur composait alors une
  certification une proposition avant sa propre négation. Un nom tient sur une ligne, en 120 caractères, sans
  point suivi d’autres mots ; une licence est un identifiant, 40 caractères, portant un chiffre, un tiret ou
  une initiale de deux à six capitales – « CC BY 4.0 », « Apache-2.0 », « MIT », « etalab 2.0 ». C’est une
  forme, pas une liste de mots interdits, que ce fichier a appris à ne pas croire.
- **Deux règles écrites le matin refusaient l’après-midi des institutions et des licences parfaitement
  réelles.** Une borne qui lisait un point suivi d’un mot comme une seconde phrase refusait l’Universität
  St. Gallen, St. Andrews University et l’Istituto A. Faedo ; cinq noms européens sur vingt-six. Une autre
  demandait à une licence de porter un chiffre, un tiret ou une initiale, et refusait Unlicense, Licence
  Ouverte, Open Government Licence, Crown copyright, Domaine public et le nom complet de CC BY 4.0 ; vingt et
  une licences sur quarante et une. Les deux voulaient empêcher qu’on écrive une certification dans un champ
  exempt. Ce n’est plus une devinette sur la grammaire : **le moteur met la licence entre guillemets** là où
  il la dessine, où une proposition se lit comme un nom de licence et non comme une affirmation, et les deux
  champs n’ont plus qu’une longueur et une ligne à respecter. Trente valeurs réelles sont éprouvées ici, dix noms et vingt licences.
- **Un `**` non fermé mangeait des caractères, en silence.** La syntaxe étant désormais lue dans les titres et
  les libellés, « Formule : 2**8 octets » s’affichait « 2**8 octets » amputé de ses étoiles et de son
  exposant – un nombre changé sous les yeux du lecteur. Un renvoi de note, un motif de fichier et une
  puissance s’écrivent tous avec deux étoiles et aucun n’est une mise en gras : un nombre impair de marqueurs
  veut dire que l’autrice a tapé des étoiles, et la chaîne est alors rendue telle quelle.
- **Une date ISO complète était refusée avec la même sévérité qu’une date ambiguë.** `2026-06-01T00:00:00Z`
  est le même jour que `2026-06-01` et n’est ambigu pour personne : c’est ce qu’un tableur exporte. La date
  est lue, l’heure ignorée. `2026-6-1`, où le mois tient sur un chiffre, reste refusé.
- **Le refus d’un mot écrit dans une écriture inconnue disait de le réécrire, ce qui n’a pas de sens.** Un
  questionnaire français citant 個人情報, le terme juridique japonais, s’entendait répondre « réécrivez-le dans
  vos propres termes ». Le moteur dit maintenant qu’il ne sait pas lire cette écriture, et que la déclarer
  dans `langs` lève le refus. Il le dit dans les deux langues.
- **Un fichier de plus dans une copie de travail faisait rougir le harnais.** Il exigeait exactement dix-neuf
  fichiers, si bien qu’une institution qui gardait son propre questionnaire à côté du nôtre – la chose
  évidente à faire – obtenait un rouge pour n’avoir rien fait de mal. Ce qui manque est un échec ; ce qui est
  en trop est nommé, pas jugé.
- **Une limite du verrou, mesurée et écrite plutôt que masquée.** Une lettre collée au nom en fait un autre
  mot : c’est juste pour « UNILa », et cela vaut aussi pour l’ordinal « ª », qu’Unicode range parmi les
  lettres et que l’œil lit comme un signe posé à côté. La propriété qui les distinguerait est exactement celle
  qui fait lire le I pleine chasse comme un I, c’est-à-dire le trou fermé plus haut. Une liste de plages avait
  déjà été écrite ici à la main et avait déjà pourri ; il n’en sera pas écrit une seconde. `SECURITY.md` le dit,
  et le harnais vérifie que ce qui est écrit est bien ce qui se passe.
- **Une institution pouvait signer sa page du nom de l’origine, sans déclarer une seule langue.** Le verrou
  exemptait toute chaîne ne portant aucune lettre latine, au motif qu’une prose écrite dans une autre écriture
  n’imite rien. C’est vrai d’une phrase et faux d’un champ : `publisher.name` porte quatre lettres et rien
  d’autre, et « ᴜɴɪʟ » y passait avec zéro point de contrôle, sur un domaine étranger, sous les yeux des
  lecteurs. L’exemption est retirée. **Le prix en est écrit dans `SECURITY.md`** : un mot de quatre lettres
  dans une écriture qu’aucune `langs` n’emploie est désormais refusé, et le refus nomme le remède.
- **Le reçu ne distinguait pas deux arbres aux conclusions opposées.** `Infinity` et `-Infinity` nomment deux
  résultats différents et s’écrivent tous deux `null` à la sérialisation : deux fichiers, l’un affichant
  « autorisé », l’autre « interdit », rendaient le même couple de valeurs, tous deux publiables. Une cible est
  un nom, donc du texte. **Et les trois projections lisent maintenant l’arbre gelé**, celui que le moteur
  affiche ; une clé posée non énumérable disparaissait du reçu sans disparaître de l’écran.
- **`check.html` certifiait un arbre que le navigateur ne sert pas.** Il cherchait les commentaires HTML dans
  tout le fichier, scripts compris : un ouvre-commentaire dans une chaîne JavaScript, un ferme-commentaire deux
  cents lignes plus bas, et tout script entre les deux était classé « commentaire » et jamais joué – sans un
  mot, `notRunNote` excluant cette catégorie. Il rejouait aussi les gestionnaires `load`, alors que le moteur
  monte sur `DOMContentLoaded` et garde sa copie ; les deux verdicts étaient inversés. Et son bac à sable
  supprimait `document`, ce qui ne rend pas un fichier plus sûr mais en fait **un autre programme** : une
  branche gardée par `typeof document !== "undefined"` disparaissait du contrôle, et l’idiome le plus courant
  pour renseigner une date avant le montage y levait une erreur imputée au fichier. Le document du bac à sable
  est présent et inerte.
- **Deux cent vingt-quatre insertions invisibles sur deux cent vingt-quatre traversaient le nom réservé.** La
  propriété Unicode employée ne couvre ni les caractères de contrôle – `U+0000` et `U+0008` passaient sans
  déplacer un pixel – ni les caractères de format, et seul le bloc usuel des marques combinantes était retiré.
  Trois familles, une classe.
- **Seize symboles sur seize cachaient le nom de l’intérieur.** Le chiffre romain un et le I cerclé ne dessinent
  qu’un I, et les remplacer par une espace effaçait le I **du milieu** : « UNⅠL » se lisait « UN L » et
  passait. La règle a donc deux branches, mesurées sur tout l’Unicode : **207 formes qui dessinent plusieurs
  lettres coupent le mot ; 120 qui n’en dessinent qu’une sont lues comme cette lettre.**
- **`derivedFrom.url` était le troisième champ exempté et le seul resté sans forme.** Le moteur l’écrit entre
  parenthèses dans sa propre phrase, et il suffisait d’y refermer la parenthèse pour ajouter « Validé par
  l’Université de Lausanne » à une attribution que l’adoptante n’est pas censée rédiger. Une adresse, une
  ligne, deux cents caractères, ni parenthèses ni guillemets, et le même contrôle de schéma qu’un lien.
- **Une page française servait le questionnaire en anglais** si l’anglaise avait été visitée avant, la session
  écrasant le `data-lang` de la page. La session ne rend plus une langue que si la page n’en déclare aucune.
- **L’annonce au lecteur d’écran prononçait les astérisques du gras**, la ligne du reçu échouait au contraste
  WCAG AA à 3,78:1, l’URL d’attribution faisait défiler la page à 320 pixels, l’encadré de refus n’avait ni
  titre ni langue déclarée, et la page restait vide sans JavaScript. Les cinq sont corrigés.
- **Vingt-quatre substitutions sur vingt-quatre faisaient encore passer le nom, mesurées sur le dépôt publié.**
  Les lettres enfermées « négatives » – cerclées blanc sur noir, carrées blanc sur noir – et les indicateurs
  régionaux dessinent chacun une lettre latine et sont les seuls de leur famille qu’Unicode n’a pas décomposés.
  Ils n’étaient donc ni lus comme des lettres, ni transformés en jokers : « UNIL » écrit dans l’une d’elles
  passait. Laquelle chacun dessine se **déduit** d’un point de départ et d’un décalage, comme pour leurs sœurs ;
  ce n’est pas une liste écrite à la main. Les trois familles sont balayées en entier par le harnais.
- **Le validateur laissait passer un texte à remplacer visible par le lecteur.** Le garde du moteur parcourt
  l’arbre, et c’est son périmètre ; le titre de la page, le grand titre, le chapeau et le message affiché quand
  les scripts ne s’exécutent pas n’en font pas partie. Le message de repli livré avec ce fichier portait un
  `TO_FILL_IN` – le seul texte que voit un lecteur sans JavaScript – et il a traversé un verdict « publiable,
  rien à signaler » sans un mot, alors que le guide promet de l’attraper « où que ce soit ». `check.html` lit déjà
  tout ce que la page montre ; le contrôle manquait là, et il y est.
- **Un montage direct prenait la langue de la session d’une autre page.** Le montage automatique sait si la page
  a déclaré sa langue ; un appel direct à `AI_GO.mount()` ne le disait pas. Passer `lang`, c’est déclarer
  une langue. `AI_GO.mount()` était par ailleurs exporté sans être documenté nulle part : `docs/INTEGRATE.md`
  le documente désormais, avec ses sept options et leur correspondance avec les attributs `data-*`.
- **Le harnais éprouvait ses classes de caractères avec un seul témoin chacune**, et c’est le diagnostic le plus
  utile de la journée : sur vingt-huit mutations du moteur, cinq des sept survivantes étaient un chiffre ou une
  propriété Unicode changée, avec l’assertion en face qui ne regardait qu’un voisin de la même famille. Chaque
  classe porte désormais un témoin par sous-famille : onze invisibles (contrôle, format, ignorable par défaut),
  huit marques (attachées, espaçantes, englobantes), les six caractères qui peuvent refermer la phrase du moteur
  dans une URL, cinq distances dans le futur pour une date de relecture, et les douze champs que la signature
  couvre, un par un.
- **Le harnais n’approuvait que le fichier qui gardait un texte à remplacer sous les yeux du lecteur.** L’assertion
  posée la veille pour attraper la sentinelle du message sans JavaScript l’exigeait sans condition : une institution
  qui avait correctement écrit son adresse de contact voyait le harnais échouer, et le compte de lignes que `LICENSE`
  annonce faisait tomber un chapeau écrit sur trois lignes. C’est la sixième fois qu’une assertion punit l’adoptante,
  et le remède est toujours le même : elle passe sous `onlyDelivered`, qui nomme dans le rapport ce qui n’a pas été jugé.
  Sur un fichier adapté, le harnais rend désormais 542 sur 542 et sort à zéro, là où il rendait deux échecs.
- **L’âge de la relecture était calculé deux fois.** Le moteur plancher un entier depuis minuit UTC ; `check.html`
  gardait une fraction de jour et l’arrondissait pour l’afficher. Pendant la journée du 548e jour le reçu qu’une
  institution classe disait « 549 jours » et la page qu’il décrit ne montrait aucune bannière. Le commentaire d’à côté
  disait déjà que la borne doit être celle du moteur et jamais une seconde copie : le calcul ne l’était pas. `check.html`
  appelle maintenant `reviewAgeDays` et rend son entier.
- **La bannière de péremption n’était jamais dessinée dans une épreuve.** Un audit par mutation l’a montré en la
  faisant disparaître de trois façons sans un rouge : un `if (false)`, un seuil multiplié par cent, une comparaison
  retournée. Le nombre 548 était vérifié comme un nombre écrit dans un fichier, jamais comme une bannière qui
  apparaît. Le pied de page est désormais monté, on va jusqu’au résultat, et on regarde ce que le lecteur voit.
- **Chaque borne est prise à n et à n+1.** « Le harnais confond le nombre est le bon et le nombre est appliqué au bon
  endroit » : neuf des douze trous de cet audit étaient là. Les 200 caractères d’un nom de source et de son adresse,
  les 100 d’un nom de licence, les 32 niveaux du gel, les 40 points d’un encadré et les 548 jours sont éprouvés des
  deux côtés de leur limite, et non plus à quarante unités de distance.
- **Les vingt-six lettres de chaque famille enclose.** Ces trois familles sont les seules qu’Unicode laisse sans
  décomposition et que le moteur dérive par un décalage ; le harnais ne les éprouvait que sur les lettres des mots
  réservés, dont aucun ne porte de Z. Baisser la borne haute d’un cran ne cassait rien. Les soixante-dix-huit
  lettres sont balayées, et le nom ne doit se reconstruire que sur celle qui l’écrit.
- **`chromeText` est exporté, et deux défauts vivaient là où rien ne pouvait les atteindre** : une sentinelle posée
  au tout premier caractère du texte affiché, la place d’un titre de page, et la borne haute du décodage des
  références de caractères, derrière laquelle une chaîne pouvait se cacher.
- **Cinq affirmations que le code ne tenait pas.** « La voie que documente `docs/INTEGRATE.md` » : `AI_GO.mount()`
  n’y était documenté nulle part, et l’est maintenant, avec ses sept options. « Dix formes » de date refusées : onze.
  Le `<title>` placé par `CITATION.cff` entre le troisième et le quatrième marqueur : il est au-dessus du premier.
  « Un `TO_FILL_IN`, où que ce soit » : le garde ne parcourt que l’arbre, et les deux guides le disent
  désormais. Une relecture « de plus d’un an » : 548 jours.
- **L’en-tête `SPDX-License-Identifier: CC0-1.0` restait au-dessus du texte de l’adoptante**, et rien ne lui disait
  de le remplacer : son analyse juridique partait dans le domaine public sans qu’elle l’eût voulu. Le fichier le dit
  à la ligne où elle écrit, et les deux guides ajoutent ce qu’elle doit faire de `LICENSE` et de `CITATION.cff`.
- **Le message sans JavaScript manquait aux deux énumérations des choses à éditer**, qui comptaient « trois
  choses » et « four things ». C’est précisément pourquoi une institution a failli publier son texte à remplacer.
- **Le balayage des textes à remplacer lisait la chaîne brute**, quand celui des noms réservés passe par `plain()`
  depuis 3.0.19. C’est le défaut central de cette version une dixième fois, et cette fois du côté qui restait. Une
  revue de robustesse a monté les fichiers dans un vrai navigateur : `TO_**FILL**_IN`, `TO_<ZWSP>FILL_IN` et le
  marqueur en pleine chasse sont dessinés `TO_FILL_IN` par Chrome et traversaient un verdict « publiable ».
  `plain()` défait les trois d’un coup, puisque c’est son travail ; la chaîne brute reste examinée en plus.
- **Un tableau de chaînes était contrôlé fragment par fragment, et rendu joint.** `["UN**IL", "**"]` est propre
  morceau par morceau et dessine « UNIL, » : la syntaxe en ligne est lue après la réunion, pas avant. Le contrôle
  lit désormais aussi le texte que leur somme dessine.
- **Un forçage bidirectionnel dessine à l’envers de ce qu’il contient.** « Guide <RLO>LINU » se lit
  « Guide UNIL » ; le contrôle partait avec les invisibles et comparait `LINU`. Ce n’est pas un refus de plus à
  inventer mais une lecture de plus à offrir : la course forcée entre dans `plain()` dans l’ordre où elle est peinte,
  et les balayages qui existent la nomment avec leurs propres phrases. Sans forçage, rien ne change.
- **`check.html` lisait le source et non le dessin.** Un commentaire HTML et une balise en ligne ne séparent rien à
  l’écran ; ils étaient remplacés par une espace, et un marqueur coupé par l’un des deux n’en était plus un. La
  règle est maintenant celle du rendu : un élément en ligne joint, tout le reste sépare, de sorte que deux blocs ne
  se lisent pas comme un mot. Et les trois alphabets stylisés qu’HTML nomme (`&Uopf;` ajouré, `&Ufr;` gothique,
  `&Uscr;` anglaise) sont décodés par règle : quatre d’entre eux peignaient le nom d’origine dans un grand titre.
- **Trois limites restent ouvertes et sont écrites dans `SECURITY.md`** : le texte qu’une feuille de style ajoute
  par `content`, les ressemblances de perception (`∪`, `©`, `®`), et les endroits où le bac à sable du validateur
  n’est pas un navigateur. Aucune n’est un oubli ; les taire en serait un.
- **L’empreinte du moteur couvrait l’emballage qui le porte.** Une revue de fidélité a comparé 102 fichiers dans
  un Chrome réel : quatre portaient un moteur identique octet pour octet, s’affichaient exactement comme le témoin,
  et s’entendaient dire que leur moteur avait été modifié. La fermeture écrite avec une espace, avec une barre
  oblique, avec un saut de ligne ; trois formes qu’un navigateur ferme pareil et qu’un système de publication
  réécrit sans prévenir. **Un faux positif sur l’intégrité est aussi coûteux qu’un faux négatif** : il fait renoncer
  à publier un bon fichier. L’empreinte porte désormais sur le moteur et non sur ses balises, et un seul caractère
  changé à l’intérieur la déplace toujours.
- **Le même fichier écrit en capitales perdait son moteur entièrement.** `inlineScripts` avait été rendu insensible
  à la casse le matin, `innerScript` ne l’avait pas été : corriger un chemin n’avait pas corrigé son jumeau, pour la
  deuxième fois de la journée.
- **« Il le dit quand il ne sait pas exécuter » n’était pas systématique.** La réserve n’était posée que sur la
  branche où l’arbre reste introuvable : dès qu’un script en ligne l’avait déclaré, un module ou un script chargé
  depuis un autre fichier était sauté sans un mot, et le verdict décrivait une page que le navigateur ne sert pas.
  Une réserve qui ne vaut que quand tout va mal n’est pas une réserve.
- **Cinq affirmations de plus que le code ne tenait pas**, toutes dans la documentation, dont quatre écrites le jour
  même : `mount()` rend `null` quand l’arbre est refusé et ne le disait pas ; deux de ses sept options n’ont pas
  d’attribut `data-*`, pas une ; l’énumération des choses à éditer se contredisait dans sa propre phrase et oubliait
  le conteneur et les couleurs ; la sous-section des limites ouvertes, posée trop haut, **avalait** le paragraphe des
  cinq limites déjà écrites, si bien que le lecteur s’entendait annoncer trois limites puis cinq sans rien entre les
  deux ; et `README.md` comptait « les deux cas » pour trois modes.
- **Le validateur se figeait pour toujours sur un fichier conforme de 502 questions.** La garde de profondeur de
  l’énumérateur retournait AVANT de pousser dans la liste, si bien que la liste restait vide, que la borne des
  5000 chemins ne mordait plus jamais, et que la marche parcourait 2^501 branches. Le moteur déclarait cet arbre
  publiable ; la page qui devait le relire ne rendait plus la main. Une borne qui ne rend pas la main n’est pas une
  borne : la troncature arrête désormais la marche entière, et le verdict dit que l’énumération est incomplète.
- **L’erreur de saisie n’existait que pour une synthèse vocale.** Cliquer « Continuer » sans avoir répondu laissait
  l’écran identique **au caractère près**, mesuré sur la sérialisation complète du DOM : le seul texte vivait dans la
  région annoncée, et le déplacement du focus ne se peint pas après un clic de souris. C’est le miroir de la panne
  habituelle, accessible au lecteur d’écran et invisible à l’œil, et c’est le critère WCAG 3.3.1, qui demande une
  erreur décrite **sous forme de texte**. La phrase existait déjà ; elle est maintenant écrite à l’écran.
- **Un souligné dans un code de langue retournait le verrou contre l’adoptante.** `he_IL` sortait de la table des
  écritures, la liste des écritures déclarées devenait vide, et chaque mot hébreu de quatre lettres devenait un nom
  réservé contrefait : dix refus, avec un conseil qui lui disait de déclarer la langue qu’elle venait de déclarer.
  Le souligné compte maintenant comme le tiret, ici et dans les cinq découpages du validateur.
- **Une étiquette d’interface vide vidait le bouton, sous un verdict « publiable ».** La superposition vérifiait la clé
  et jamais la valeur, alors que le même fichier applique déjà deux fois le principe inverse. Un libellé posé à la
  chaîne vide, à `null`, à un nombre ou à un tableau rend désormais la main au libellé du moteur.
- **Trois phrases décrivaient mal la forme d’un texte**, et une page monolingue partait hors ligne en s’entendant
  accuser d’un défaut de traduction : un bloc `{ items: [...] }` posé seul est lu comme une table de langues, et
  c’est délibéré. Ce sont les phrases qui étaient fausses, pas le code ; aucune ligne de moteur n’a bougé.
- **Mon propre correctif du forçage bidirectionnel n’était éprouvé que refermé.** Les trois témoins portaient tous
  leur U+202C final, si bien qu’une lecture qui EXIGE le terminateur passait le harnais ; Chrome, lui, dessine
  aussi bien un forçage qui tient jusqu’au bout de la chaîne. Deux témoins de plus, non refermés.
- **Deux questionnaires sur une page prenaient tous deux l’historique**, et le second remplaçait l’entrée du
  premier sous lui : le bouton Retour du premier mourait à son premier clic. Le guide demandait à l’intégrateur
  d’y penser, et décrivait le symptôme inverse. Le montage automatique le donne désormais au premier conteneur
  seulement, sans état global ; `data-history="false"` sert à en désigner un autre.
- **`destroy()` ne rendait pas la clé que le montage avait réservée**, si bien qu’un remontage en prenait une autre,
  que la session précédente n’était plus reprise, et que les réponses s’accumulaient en copies orphelines.
- **`check.html` ne pouvait jamais déclarer une troisième langue complète** : il exigeait `msg` sous forme de chaîne
  alors que c’est un objet, et la seule retouche qui éteignait l’avertissement reversait les quarante-deux phrases
  de refus à l’anglais. Chaque clé est maintenant demandée dans la forme qu’elle a.
- **Deux mots réservés rendant la même portée rendaient deux points identiques**, mot pour mot, dans le même
  encadré : le lecteur croyait à deux défauts là où il y en avait un.
- **Neuf trous de couverture nommés par l’audit par mutation.** Le plus instructif : l’assertion qui annonçait
  « all 26 letters » n’était informative que sur **une seule**, parce qu’elle interrogeait le VERDICT, qui compare
  sans casse contre huit mots réservés dont aucun ne porte de Z, et non la LECTURE. Les autres : les 28 balises
  en ligne du validateur éprouvées une par une et non trois sur vingt-huit, les quatre textes à remplacer et les
  huit domaines réservés aux exemples parcourus et non échantillonnés, la borne de péremption prise à n et à n+1
  et non à quarante jours de distance, la date qu’un tableur horodate avec une espace, le séparateur qui recolle
  un tableau, et la liste de domaines vide en aperçu local.
- **Le fichier porte deux verrous, et un seul était éprouvé.** Trois expressions se construisent avec des propriétés
  Unicode et retombent, sur un moteur JavaScript d’avant 2018, sur des plages écrites à la main. Le repli est
  délibéré ; ce qui ne l’était pas, c’est que rien ne l’exerçait jamais. Écart mesuré : **96 728 points de code**
  que le second verrou ne reconnaît pas comme des lettres, dont tout ce qui se trouve au-dessus du plan de base.
  Le harnais charge désormais le moteur une **seconde fois** avec un `RegExp` qui refuse les propriétés, comme le
  ferait un navigateur de cette époque, et vérifie que les sept écritures ordinaires du nom restent refusées ;
  l’écart est nommé dans `SECURITY.md` au lieu d’être passé sous silence.
- **Six corrections annoncées la veille ne tenaient pas jusqu’à leur propre invariant.** Une re-mesure a repris
  chacune et l’a rejouée au lieu de la croire sur parole, et c’est la consigne qui a le plus rapporté de la
  journée. La pire : **`destroy()` rendait la clé à chaque appel**, si bien qu’un second appel libérait la
  réservation d’une instance **vivante** ; deux questionnaires se retrouvaient sur une seule session, et l’un
  pouvait montrer à son lecteur la branche juridique de l’autre. Un drapeau de fermeture le ferme.
- **L’empreinte du moteur avait perdu treize mille caractères.** En la faisant porter sur le seul code pour tuer
  quatre faux positifs, j’en avais fait sortir toute la feuille de style du moteur, celle qui porte la couche
  d’accessibilité : **la correction était pire que le défaut**. Elle porte désormais sur une forme canonique du
  bloc entier, où seuls les noms de balises et la fermeture sont normalisés. Le code, la feuille de style et un
  attribut posé sur la balise la déplacent chacun ; les quatre écritures de la fermeture ne la bougent pas.
- **Le retrait des scripts exigeait `</script>` exactement**, si bien qu’avec une espace avant le chevron le
  retrait échouait, **le code du moteur devenait du « texte visible »** et six faux blocages tombaient sur un
  fichier qu’un navigateur dessine comme le témoin.
- **Le septième découpage de code de langue avait été oublié.** J’avais appris le souligné à six endroits sur
  sept : une page `<html lang="en_GB">` montait tout le questionnaire en français, et le reçu n’en disait rien.
- **Une langue écrite avec sa région ne trouvait aucun libellé.** `data-lang="fr-CH"` servait les trente et un
  libellés en anglais sous des questions restées françaises : la page parlait deux langues à la fois. Le code
  exact est cherché d’abord, son code primaire ensuite, et déclarer `ui["fr-CH"]` l’emporte toujours.
- **Le contrôle de `msg` avait échangé un faux positif contre un faux négatif.** Ne vérifier que sa forme rendait
  `msg: {}`, la retouche exacte qu’un adoptant fait pour éteindre un avertissement, silencieux, et laissait les
  quarante-deux phrases de refus en anglais sous des questions allemandes. Les sous-clés sont comptées et
  **nommées** une par une, et cela reste un avertissement, jamais un refus : le repli phrase par phrase est voulu.
- **Mon assertion sur l’étiquette vide était du code mort** : une fonction d’aide jamais appelée, et une assertion
  qui se bornait à constater que le moteur possède des libellés. Refaite avec un montage réel et cinq témoins,
  et vérifiée en retirant le correctif dans une copie : elle tue son mutant.
- **Trois bornes que rien ne gardait** : `data-heading-level="9"` aurait écrit un `<h9>`, un hôte qui contient
  « localhost » ne doit pas désarmer la déclaration de domaine, et cinq commentaires étaient restés en arrière du
  code qu’ils décrivent, dont « 8 hex » pour une empreinte qui en fait seize.
- **À 200 % de zoom, le message d’erreur naissait sous le pli et l’écran ne bougeait pas d’un pixel.** Le
  correctif de la veille tenait à la lettre et ratait son but : la phrase existait, une seule fois, contrastée à
  7,25:1 et annoncée, mais 34 px hors de la fenêtre, et le clic de souris ne peint aucun anneau de focus. Elle est
  désormais amenée sous les yeux.
- **À l’impression, les quatre niveaux de gravité devenaient la même boîte.** Le raccourci `border` du bloc
  `@media print` écrasait la couleur que les quatre règles de niveau posent : sur le papier qui part au plan de
  gestion de données, « rien ne sort de la machine » et « usage libre » se ressemblaient trait pour trait.
- **Les deux listes du verdict n’avaient aucun nom.** « Autorisé » et « interdit » arrivaient l’une comme l’autre
  en « liste, N éléments », et ce qui les distingue est au-dessus, hors de la liste ; une navigation par listes ne
  le lit jamais. Chaque liste porte le nom de son bloc.
- **La boîte « chargement impossible » n’avait reçu aucune des deux corrections que sa jumelle avait reçues**, ni
  rôle, ni langue, ni titre navigable, alors qu’elle est parfois la seule chose que la page affiche.
- **Trois attributs de conteneur que les guides nomment pouvaient être rendus inertes** sans qu’une seule des 650
  assertions bouge : `data-mode`, `data-storage="none"` et `data-history="false"`. Ils sont désormais éprouvés
  chacun **seul dans sa portée**, parce que monté à la suite d’un autre, le troisième passait pour une autre raison.
- **Le registre des clés de session n’était tenu par rien, dans ses deux moitiés** : rendre la clé à qui remonte
  après avoir détruit, et n’en donner jamais deux fois la même à deux instances vivantes.
- **L’exemption d’origine s’ouvrait à un fichier qui ne déclare aucun domaine**, et la clause qui l’en empêche
  survivait à son retrait.
- **`mountAll` cherchait la marque d’historique DANS LA PORTÉE.** Deux appels sur des portées différentes, ce que
  fait une application qui monte un second widget après coup, ne se voyaient donc pas : les deux questionnaires
  la prenaient, et le symptôme d’origine revenait **en pire**, le bouton Retour du premier déplaçant le second.
  L’historique du navigateur appartient au document entier, et c’est le document qui est interrogé.
- **`destroy()` laissait la marque sur le conteneur mort**, si bien que le questionnaire encore vivant à côté ne
  pouvait plus jamais la prendre. `data-ai-go-mounted` reste, lui : c’est ce qui tient l’idempotence du montage.
- **La profondeur d’historique survivait à une reprise de session.** Portée par la seule instance, elle comptait
  ce qu’une visite **précédente** avait poussé : le bouton Retour de la page appelait alors `history.back()` sur
  des entrées qui n’étaient pas les siennes, et faisait sortir le lecteur de la page au lieu de le ramener d’une
  question. Elle voyage désormais dans l’entrée, à côté du marqueur et hors de l’instantané, dont la forme ne
  bouge pas.
- **La boîte de refus ignorait deux choses que l’adoptante avait déclarées** : son `data-heading-level`, sous
  lequel elle écrivait un `<h2>` en dur, et son arbre, si bien que quatre phrases d’interface que le validateur
  **exige** d’une traduction n’étaient jamais lues. L’arbre n’est passé que là où il est **gelé** : à l’appel où le
  gel a échoué, lire l’arbre brut rendrait au garde exactement ce qu’il refuse de lire.
- **Sept écritures manquaient à la table des langues** : l’alias `iw` de l’hébreu, quatre langues vivantes en
  écriture arabe (`ug`, `ku`, `ckb`, `ks`, `arz`) et le cantonais `yue`. Des données, pas de la logique :
  déclarer `ug` accorde exactement ce que déclarer `ar` accorde déjà, et l’échappée « toute langue non latine
  éteint le pli » reste refusée. On énumère, on ne généralise pas.
- **Le harnais passe de 498 à 664 assertions**, et vérifie désormais ses propres chiffres : le compte qu’il
  annonce ici, et le nombre de pages qui portent l’empreinte du questionnaire gelé, sont relus par lui. Sur un
  fichier dont le contenu a été remplacé il passe au vert et nomme les six contrôles qu’il n’a pas faits, ce que
  `docs/INTEGRATE.md` promettait sans que ce fût vrai ; et si le questionnaire est illisible, il le dit en une
  phrase au lieu de mourir sur une trace de pile quarante lignes plus loin.

## Moteur 3.0.18 · dépôt du 9 septembre 2026

**Le texte de l’arbre de l’UNIL et ses 20 chemins sont inchangés** (empreinte de contenu `59b6dc657b9c9c1f`,
telle que la 3.0.18 la calculait : la 3.0.19 a remplacé la fonction de brassage, et cette même valeur y vaut
`cbdb4863aed9f778`).

**Ce qu’une institution ayant déjà publié doit faire.** Remplacer le bloc moteur, puis vider ou remplacer une ligne :
le moteur porte l’empreinte de l’exemple livré, et si vous avez écrit votre propre contenu elle ne reconnaît plus
rien. Repassez ensuite votre fichier dans `check.html` et relisez le verdict. **Le reçu change de valeur pour tout le
monde**, parce qu’il couvre maintenant davantage : si un reçu a été remis à un service juridique, refaites-le.

- **L’empreinte passe de huit à seize caractères, et c’est le changement qui vous concerne le plus.** Elle valait un
  mot de trente-deux bits : un auditeur a produit en quelques secondes, en bourrant un texte d’aide d’espaces
  invisibles, deux arbres aux verdicts contradictoires portant le même reçu. Une valeur qu’un service juridique
  consigne doit valoir mieux que soixante-cinq mille essais. Les huit premiers caractères étaient alors les mêmes
  qu’avant, l’allongement n’ayant ajouté qu’une seconde somme à la première. **Ce n’est plus vrai : voyez la
  3.0.19, qui a dû remplacer le brassage lui-même.** Une empreinte relevée avant la 3.0.19 ne se lit plus au
  début de la nouvelle, ni au début de rien. Toutes les valeurs gelées se sont allongées le même jour, sauf
  l’empreinte du bloc moteur, qui garde ses huit caractères : elle dit si le moteur a été retouché, pas ce que le
  contenu vaut.
- **Le validateur ne signalait une traduction manquante que sur six des quatorze champs affichés.** Un arbre à moitié
  écrit en français obtenait « publiable, aucun avertissement », et servait au lecteur anglophone l’étiquette
  « Recommended solution » au-dessus d’une phrase française. La solution recommandée est celle qu’un service
  juridique signe : c’était la pire des huit à manquer. Il les couvre toutes, y compris les cases, les détails de
  réponse, les interdictions et la note d’attribution.
- **La règle de langue de page ne lisait pas l’attribut que le moteur lit.** Un conteneur portant `data-lang="en"`
  sur une page française fait monter le moteur en anglais, et rien ne le signalait ; à l’inverse une page et un
  conteneur d’accord entre eux étaient signalés à tort dès que `defaultLang` disait autre chose. Le seul cas où la
  voix ment vraiment était celui qui passait. Le signalement nomme désormais l’attribut qui décide, et un troisième
  cas s’y ajoute : une langue montée que l’arbre ne déclare pas.
- **Le garde vérifiait une chaîne que le lecteur ne voit jamais.** Le rendu compose le gras à partir de deux
  astérisques et les retire ; le garde, lui, les gardait. Une paire vide suffisait donc à cacher quatre noms réservés
  d’un coup : « Universit\*\*\*\*é de Lausanne » passait sans un refus et s’affichait en entier. C’est la même faille
  que les cinq campagnes précédentes ont fermée cinq fois sous cinq formes, et la cause était toujours celle-là :
  deux lectures du même texte. Il n’y en a plus qu’une, et les deux fonctions qui la produisent sont côte à côte.
- **Le repli des écritures confondables refusait du texte innocent.** Quatre lettres d’une écriture que le moteur ne
  sait pas lire valent quatre caractères génériques, et quatre caractères génériques ressemblent à « UNIL » : neuf
  phrases ordinaires sur vingt étaient refusées, dont un nom de personne japonais, chacune accusée de nommer
  l’Université de Lausanne. C’est désormais l’arbre qui tranche, par ses `langs` : un questionnaire écrit en
  français et en anglais n’a pas de raison de porter une telle suite, un questionnaire qui déclare le chinois en a.
  Le nom écrit en clair reste refusé dans les deux cas : la déclaration achète l’ambiguïté, jamais le nom.
- **La phrase que l’attribution paie était réécrivable.** Déclarer `derivedFrom` donne le droit de nommer sa source,
  et le prix est la phrase qui dit que cette source n’a pas relu l’adaptation et n’en répond pas. C’était un libellé
  d’interface : une copie l’a remplacée par « Questionnaire validé et certifié par… » et a obtenu un aval, ou l’a
  effacée d’une espace, sans que le reçu bouge. Le moteur la dit maintenant lui-même.
- **Le reçu ne couvrait pas ce que le lecteur lit.** Les noms d’étapes, imprimés sous la barre de progression, et les
  libellés d’interface étaient hors de l’empreinte comme de la signature : on renommait ses étapes en « Aucune donnée
  personnelle / Traitement libre / Publication autorisée » et son bouton en « Publier sans contrôle », et le reçu
  restait identique au caractère près. Il couvre désormais douze champs, dont le harnais vérifie que dix le déplace
  seul.
- **Une valeur de réponse qui n’est pas une chaîne était acceptée.** Le bouton du lecteur porte une chaîne et le
  routage compare à l’identique : une valeur numérique créait une branche que personne ne pouvait prendre au clavier,
  que le validateur comptait et que le reçu signait. Trois chemins signés sur cinq étaient inatteignables.
- **Le validateur ne s’ouvrait pas dans la langue qu’il annonçait.** Il ne lisait que la première langue du
  navigateur, si bien qu’une lectrice dont le navigateur annonçait `fr-FR` recevait la page en anglais, et le choix
  n’était pas retenu au rechargement. Il lit la liste entière, retient le choix pour l’onglet, et les trois pages qui
  décrivaient un autre comportement disent la même chose que lui.
- **Trois chiffres de l’entrée précédente étaient faux**, et cette entrée-ci a été relue de la même façon.
- **Le harnais.** Cinq de ses assertions ne pouvaient pas attraper ce qu’elles annonçaient. « Aucune clé de refus
  n’est du code mort » cherchait le texte dans le source, si bien qu’emballer un refus dans une condition fausse la
  laissait verte : elle exerce maintenant un corpus de trente-six arbres malformés et vérifie que le moteur peut
  être amené à prononcer chacune de ses phrases. Le gras n’était vérifié nulle part. Le registre cherchait ses
  empreintes n’importe où dans l’entrée au lieu de les lier au nom du fichier. La borne de relecture était lue dans
  le fichier qu’elle teste. Et la parité des deux tables du validateur n’en comparait que 88 sur 92. Il passe de 483
  à 498 assertions.

## Moteur 3.0.17 · dépôt du 8 septembre 2026

**Le texte de l’arbre de l’UNIL et ses 20 chemins sont inchangés** (empreinte de contenu `59b6dc65`). Une liste de
chemins relue et signée avec une version antérieure décrit encore exactement ce que fait celle-ci.

**Ce qu’une institution ayant déjà publié doit faire.** Remplacer le bloc moteur, repasser son fichier dans
`check.html`, relire le verdict. Deux corrections changent ce que le validateur affiche, et une troisième change ce
qu’il refuse : si un reçu a été remis à un service juridique, refaites-le.

- **Le fichier livré était en anglais, et tout le reste s’adresse en français à des institutions suisses.** Vingt et
  un auditeur·rices l’ont relevé indépendamment : on téléchargeait une page `lang="en"` intitulée « Which tools may I
  use for my data? » portant trois questions factices. L’exemple est désormais écrit dans les deux langues, français
  par défaut, et la page suit : titre, grand titre et chapeau. Les textes à remplacer y sont toujours, donc il n’est
  toujours pas publiable tel quel.
- **`check.html` ne parlait qu’anglais**, alors que c’est la seule page qu’une adoptante doit utiliser et que son
  verdict part au service juridique. Ses 88 chaînes d’interface existent dans les deux langues, la page s’ouvre dans
  celle du navigateur, et deux boutons en changent. Le harnais vérifie que les deux tables portent les mêmes clés :
  une clé présente d’un seul côté servirait l’autre langue en silence.
- **Le reçu était muet sur qui répond de l’arbre.** L’empreinte de contenu ne signe que les questions, les réponses
  et les résultats, si bien qu’ajouter, retirer ou changer `derivedFrom` ne la déplaçait pas d’un caractère. Une
  seconde valeur la complète et couvre la signature. L’empreinte de contenu, elle, n’a pas bougé, et c’est délibéré.
- **Un suffixe déclaré comme domaine annulait la garde de domaine.** `domains: ["ch"]` faisait tourner le fichier sur
  n’importe quel `.ch`, `unil.ch` compris. Un nom sans son extension est refusé, et le refus dit ce qu’il vérifie
  plutôt que de prétendre vérifier une propriété.
- **Le garde interdisait d’écrire ce que la licence oblige à écrire.** Un auditeur juridique avait relevé la
  contradiction : la phrase de refus disait « réécrivez-le dans vos propres termes », point, ce qui est une
  interdiction d’attribuer. Le chemin existait pourtant, `derivedFrom.note`, imprimé sous chaque résultat après la
  phrase de non-endossement que l’adoptante ne peut pas réécrire. Le refus le nomme désormais. L’avertissement, lui,
  reste fermé : il est la parole de qui publie, et c’est exactement là qu’une copie se ferait passer pour l’original.
- **`example.org` était refusé partout**, alors que la RFC 2606 réserve ce nom aux exemples. Le partage est
  mécanique : une entrée qu’aucun résultat n’offre n’est dessinée sur aucun écran et passe ; dès qu’un résultat
  l’offre, elle est refusée, parce qu’un lien mort servi à une lectrice reste un défaut.
- **L’aperçu local comptait sans dire quoi.** Ouvert par double-clic, il annonçait « non publiable, 1 point » sans
  nommer lequel, et il fallait passer par `check.html` pour l’apprendre. Il liste maintenant ses points, et le
  harnais vérifie que l’aperçu et le refus strict nomment les mêmes, phrase pour phrase.
- **`docs/PUBLICATIONS.md`, le registre des publications.** Ce dépôt est réécrit en un seul commit : l’identifiant
  d’une version ancienne n’existe plus sur GitHub dès la suivante, et un lecteur juridique n’avait plus rien à
  désigner. Le registre porte, pour chaque version publiée, sa date, son commit, l’empreinte de son bloc moteur et
  le SHA-256 complet des quatre fichiers qui voyagent seuls. Le harnais refuse une version dont l’entrée de tête est
  périmée. Désignez une copie par son empreinte, jamais par son numéro de version.
- **Les valeurs gelées ont leur procédure.** `CONTRIBUTING.md` les énumère, dit ce que chacune protège, et rappelle
  qu’aucune ne se devine : le harnais imprime toujours la valeur qu’il a calculée.
- **Le harnais passe de 450 à 482 assertions.** Une vingtaine supposaient un exemple d’une seule langue et une page
  en anglais : elles lisent maintenant le titre, le grand titre et le chapeau dans le fichier au lieu de les citer,
  et reconnaissent une phrase de refus dans la langue où le moteur la sert.

## Moteur 3.0.16 · dépôt du 8 septembre 2026

**Le texte de l’arbre et ses 20 chemins sont inchangés** (empreinte de contenu 59b6dc65). Aucune question, aucune
réponse, aucune destination n’a bougé : une liste de chemins relue et signée avec la 3.0.12, la 3.0.13 ou la 3.0.14
décrit encore exactement ce que fait cette version, et le harnais le vérifie à chaque exécution.

**Ce qu’une institution ayant déjà publié doit faire.** Remplacer le bloc moteur par celui de cette version, comme
l’explique [docs/INTEGRATE.md](docs/INTEGRATE.md), puis repasser son fichier dans `check.html` et relire le verdict.
Trois des défauts corrigés ici se voyaient depuis une page en ligne, et le reçu que `check.html` remet au service
juridique en dépendait : si ce reçu a été remis, refaites-le.

- **Le validateur pouvait certifier un autre questionnaire que celui servi.** `check.html` prenait la première
  déclaration d’objet du bloc au lieu de celle que la balise `data-ai-go` nomme. Avec deux arbres déclarés, il
  calculait chemins et empreinte sur le premier et annonçait « publiable » pendant que la page montait le second : le
  reçu ne décrivait pas la page. Il résout désormais la variable nommée, refuse l’ambiguïté au lieu de deviner, et
  refuse `let` et `const`, qui ne sont pas des propriétés de `window` et que le moteur ne trouverait pas.
- **Le garde-fou de publication avait trois angles morts.** Il ne regardait que les chaînes primitives, si bien que
  des champs affichés à l’écran passaient sans être vus, sur un domaine étranger et sans un seul refus. Il comparait
  les noms sans replier les écritures confondables : « UNIL » était refusé, « UNІL » avec un І cyrillique ne l’était
  pas. Et plusieurs de ses phrases de refus nommaient une autre chaîne que celle réellement trouvée. Le moteur décrit
  maintenant en un seul endroit ce qu’est un texte affichable, replie ces lettres vers le latin avant de comparer, et
  nomme dans chaque refus le terme qu’il a trouvé. Il porte trente-six phrases de refus, en français et en anglais.
- **Deux défauts de routage.** Une session restaurée n’était pas dédoublonnée : `["a","a"]` routait vers « au moins
  une case cochée » avec zéro case cochée à l’écran. Et l’API publique `answer` ne vérifiait ni que la question était
  la question courante, ni que la valeur était proposée.
- **L’outil de typographie pouvait réécrire le moteur, par quatre chemins.** Un marqueur de fin manquant, dupliqué ou
  placé avant celui de début lui faisait traiter tout le fichier en sortant en 0. Une ligne ouvrant un commentaire
  sans le fermer était acceptée comme marqueur. Un marqueur de fin posé après le bloc moteur satisfaisait toutes les
  conditions documentées et faisait réécrire ce bloc. Et un octet non UTF-8 situé hors du bloc était remplacé en
  silence. La garantie ne se déduit plus de la forme des marqueurs : le script calcule le nouveau texte, le compare
  octet pour octet à ce qu’il a lu, partout hors du bloc de contenu, et n’écrit que si rien n’a bougé. Il contrôle en
  plus les six marqueurs du fichier et leur ordre, et refuse un fichier qui n’est pas de l’UTF-8 valide.
- **Cinq pages promettaient une pose d’insécable que l’outil ne fait pas, et taisaient celle qu’il fait.** Elles
  disaient « il n’en ajoute aucune ». En vérité il convertit en `\u00a0` toute espace tapée devant `:` `;` `?` `!`
  `%` ou un guillemet, l’espace ordinaire comprise, et il n’ajoute rien là seulement où aucune espace n’a été tapée.
  Les cinq pages disent maintenant la règle exacte, y compris qu’elle vaut aussi pour l’anglais, où cette insécable
  est une faute. Sur les 504 chaînes entre guillemets droits de `reference/aigo-unil.js` et du bloc de contenu
  d’`ai-go.html`, une pose là où rien n’est tapé se déclencherait à 59 endroits et se tromperait aux 59.
- **Deux guides plaçaient le grand titre et le chapeau au mauvais endroit.** Ils sont juste sous le marqueur de fin
  du bloc de contenu, et non au-dessus du marqueur de début ; seul le titre de la page est plus haut. Les pages
  françaises les nommaient de trois façons : c’est désormais le titre de la page, le grand titre et le chapeau.
- **Le README republiait sous BSD un contenu déclaré tous droits réservés.** Il reproduisait mot pour mot les onze
  intitulés de questions et les sept résultats avec leurs notes, identiques à `reference/aigo-unil.js`, que la même
  `LICENSE` déclare non réutilisable. Les deux tableaux sont retirés : le README dit ce que le questionnaire couvre
  et renvoie à `docs/ARBRE.md`, qui en porte la version complète et le régime qui va avec.
- **Les licences.** `LICENSE` ne se couvrait pas lui-même et laissait sans régime les lignes d’`ai-go.html` hors des
  deux blocs, c’est-à-dire la région même que le guide fait coller dans un CMS ; elles sont 53, et non 69 comme il
  était écrit. La clause 1 de la BSD était intenable : aucun des fichiers distribués seuls ne portait la notice ni
  l’exclusion de garantie. Les quatre la portent désormais, le bloc moteur compris, qui voyage seul deux fois.
- **Le garde lisait un arbre que le rendu ne lisait pas.** Un titre posé sur la chaîne de prototypes, une clé
  `nodes` rendue non énumérable, un accesseur armé après le montage : trois écritures que l’écran affichait et que le
  contrôle ne voyait pas, toutes en JavaScript ordinaire, sans un caractère exotique. Le moteur gèle maintenant
  l’arbre avant de le contrôler, en valeurs simples et sans prototype, et refuse ce qui ne peut pas être gelé. Ce
  qu’il vérifie est donc exactement ce qu’il affiche.
- **Une table de sosies ne peut pas tenir.** Écrite à la main, élargie deux fois, il lui manquait encore des jumeaux
  pour neuf majuscules latines, et deux alphabets entiers la contournaient : le lisu, et les petites capitales. Le
  moteur ne compare plus lettre à lettre mais par squelette, où toute lettre qu’il ne sait pas lire tient lieu de
  n’importe laquelle. « ꓴꓠꓲꓡ » et « ᴜɴɪʟ » sont refusés ; du cyrillique, du grec, du japonais et de l’arabe
  ordinaires ne le sont pas, et le harnais vérifie les deux sens.
- **Trois verrous se contournaient sans ruse.** `\b` en JavaScript ne connaît que l’ASCII, donc « UNIL_2026 »
  passait ; le lien de l’origine survivait à un `www.`, à un point final, à un port ou à un caractère encodé ; et
  l’exemption réservée au champ des domaines s’étendait à tout chemin commençant par son nom. En sens inverse,
  `data-mode="preview"` désarmait le garde sur une page en ligne : hors machine locale, il n’y a plus qu’un mode.
- **La confidentialité était promise et vérifiée par une recherche de mot.** `SECURITY.md` dit que le moteur n’envoie
  les réponses nulle part ; on pouvait lui faire poster toute la session à n’importe quelle page encadrante sans
  qu’une assertion bouge. Le harnais observe maintenant les envois et piège les interfaces interdites : une page non
  encadrée n’envoie rien, un message sortant ne porte que la hauteur, et aucune valeur de réponse ne quitte la page.
- **Le harnais.** Il ne démarrait pas depuis un chemin contenant une espace ou un accent, faute de `fileURLToPath`.
  Trois de ses assertions ne pouvaient pas échouer : un débordement de pile que la borne du moteur rend impossible ;
  la liste des clés d’interface, qui cherchait « no » dans un fichier où le mot apparaît 391 fois ; et une assertion
  posée à `true`. Une section qui jette ne tue plus le run, elle le signale, et un run réduit dit ce qu’il n’a pas
  regardé au lieu d’afficher un vert qui ressemble à un vert complet. Il passe de 370 à 450 assertions, en perdant les cinq qui
  garantissaient la duplication retirée du README, et couvre les mutations qui lui survivaient.

## Moteur 3.0.15 · dépôt du 8 septembre 2026

Publiée le matin, remplacée le jour même par la 3.0.16, qui reprend et complète tout ce qu’elle corrigeait. Elle
apportait la première moitié du travail décrit ci-dessus : le garde cessait d’ignorer les objets `String` et les
accesseurs cachés, une table de sosies repliait le cyrillique et le grec, les refus nommaient le terme trouvé,
l’outil de typographie refusait trois formes de marqueurs mal posés, et les quatre fichiers sous BSD recevaient leur
notice. Si vous l’avez prise, prenez la 3.0.16 : les défauts qu’elle laissait ouverts se voyaient depuis une page en
ligne.

## Moteur 3.0.14 · dépôt du 7 septembre 2026

- **La liste des caractères invisibles reste une liste fermée tant qu’elle est écrite à la main.** Élargie à chaque
  audit, il lui manquait encore 4 108 points de code, dont le bloc des balises U+E0000 à U+E0FFF : `UNI` suivi de
  U+E0001 puis `L` passait dans `publisher.name`. Le moteur et le validateur lisent désormais la propriété Unicode
  « par défaut ignorable », avec la liste écrite en secours pour les moteurs qui ignorent les échappements de propriété.
- **`check.html` remplaçait les invisibles par une espace au lieu de les retirer.** Un caractère de largeur nulle posé
  au milieu d’un mot du titre de page passait donc entier, les treize testés compris. Le validateur lit maintenant par
  le normaliseur du moteur, exporté pour qu’il n’en existe qu’un.
- **Les entités HTML n’étaient décodées qu’à moitié** : rien sans point-virgule, rien au-delà du plan de base, et ni
  `&shy;` ni `&zwnj;` ni `&ZeroWidthSpace;`. Le décodage suit maintenant la règle, point de code par point de code,
  et une table nommée pour ce qui peint une espace, un invisible, une esperluette ou le tiret bas.
- **Une langue déclarée pouvait n’être qu’une clé héritée d’`Object.prototype`**, ou porter `null`, et comptait comme
  traduite. Elle doit désormais être une clé propre portant un texte utilisable.
- **Une session pouvait sauter ou inventer une question** et être restaurée : le chemin enregistré est maintenant
  rejoué question par question et comparé à la route réelle avant d’être affiché.
- **Les phrases de refus étaient en anglais, dans un encadré déjà traduit.** Elles suivent maintenant la langue de
  l’arbre : trente-cinq phrases en français dans le moteur, et `ui.<langue>.msg` pour les réécrire ou en ajouter une
  autre langue. Une phrase réécrite ne fait plus tomber les trente-quatre autres, qui étaient remplacées en bloc.
- **`docs/DEMARRER.md`** : la feuille de départ, vide, sous CC0. C’est la même forme que `docs/ARBRE.md`, sans le
  contenu de l’UNIL : les quatre décisions qui précèdent la première question, puis les gabarits à remplir.
- **`tools/typographie.mjs`** : vingt-sept lignes qui écrivent en `\u00a0` les espaces insécables du français,
  U+00A0 et U+202F, dans le bloc de contenu. Il n’en pose aucune là où rien n’a été tapé, parce que le fichier porte
  deux langues et que l’anglais interdit cette espace. Il refuse d’écrire, et sort en 2, si les deux marqueurs ne
  forment pas une paire dans l’ordre, chacun seul sur sa ligne : faute de ce contrôle, un marqueur de fin effacé
  faisait réécrire le moteur en silence. Sur le fichier livré, aucun octet ne change. Le harnais l’exécute pour de
  vrai, jamais une copie de ses règles.

## Moteur 3.0.13 · dépôt du 7 septembre 2026

- **La liste des caractères invisibles était une liste fermée**, donc une liste qu’on contourne : U+2063 seul faisait
  passer le nom de l’institution d’origine alors que la page l’affichait entier. La liste a été élargie, dans le moteur
  et dans le validateur, aux plages qui manquaient.
- **`check.html` lisait le titre sans décoder les entités HTML.** Un navigateur peint `&eacute;` comme un « é » : le nom
  d’origine pouvait se tenir dans un titre sans être vu.
- **Un titre déclaré et donné vide passait** : `{ en: null }` pour une langue déclarée, ou une espace de largeur nulle
  comme nom de source. Une langue déclarée exige désormais une chaîne qui reste non vide une fois les invisibles retirés.
- **Le gel oubliait `ui`**, que le moteur fusionne et affiche : on pouvait falsifier un libellé de l’arbre gelé sans que
  l’empreinte ni le gel auxiliaire ne bougent.

## Moteur 3.0.12 · dépôt du 7 septembre 2026

- **Le nom allemand de l’UNIL n’était jamais refusé.** Le motif exigeait le tréma, alors que le texte est comparé après
  suppression des signes diacritiques : ce verrou-là ne pouvait pas se déclencher. Les trois langues sont testées.
- **`check.html` prétendait tout vérifier sauf le domaine, le champ laissé vide.** Le contrôle du titre et du chapeau
  était conditionné à un domaine saisi. Il s’exécute désormais toujours, en avertissement quand aucun domaine n’est donné.
- **`LICENSE` oubliait `CONTRIBUTING.md`**, et l’assertion censée l’empêcher ne vérifiait que la présence d’une phrase.
  Elle compare maintenant l’énumération à l’inventaire réel des fichiers.
- **`ai-go.html` promettait que `check.html` liste les clés d’interface manquantes.** Il ne le faisait pas, et une
  troisième langue partait en ligne à moitié en anglais avec un verdict vert. Il le fait.
- **Le harnais lisait les pages de ce dépôt avant de savoir qu’il y était** : un dépôt réduit au moteur, ce que le guide
  invite à constituer, s’arrêtait sur une erreur de fichier introuvable au lieu de vérifier ce qu’il pouvait.

## Moteur 3.0.11 · dépôt du 7 septembre 2026

- **Une session rejetée était quand même affichée.** Le rejeu détectait bien le verdict forgé, mais l’état avait déjà été
  écrit dans l’instance avant la vérification, et le montage rendait la page sans le remettre à zéro : le verdict était
  refusé et montré tout de même. L’état est maintenant construit à part et n’est adopté que s’il tient.

## Moteur 3.0.10 · dépôt du 7 septembre 2026

Dernière passe, sur ce que trois auditeur·rices ont encore trouvé.

- **Le gel des 20 phrases, perdu dans une réécriture, est rétabli** : une phrase inversée passait sur la foi de son
  dernier mot. Même chose pour le schéma, rétabli à la passe précédente.
- **`derivedFrom` échappait au gel des champs non signés** : on pouvait en ajouter un à l’arbre de l’UNIL sans rien faire
  bouger.
- **Le titre de page était lu brut** alors que l’arbre est lu normalisé : un accent décomposé dans le titrage passait un
  verrou que les questions ne passent pas.
- **Un titre vide n’est pas un titre.** Une question sans libellé, ou un résultat sans verdict, passait tous les contrôles
  et se publiait tel quel.
- **Une question rattachée à une étape inexistante** affichait « Étape 0 sur 3 » sans que rien ne le signale.
- **`derivedFrom` doit nommer quelqu’un** : un objet sans `name` achetait l’exemption et n’affichait aucune mention.
- **Une session ne peut plus affirmer un verdict que ses réponses n’atteignent pas.** L’état enregistré était cru sur
  parole : rejoué depuis le début avec les réponses qu’il porte, il doit désormais tomber exactement là où il prétend.

## Moteur 3.0.9 · dépôt du 7 septembre 2026

- **Deux cases nommées `__proto__` échappaient au refus des doublons** : le registre était un objet ordinaire, qui répond
  déjà « déjà vu » pour ce nom. Le même piège avait été évité sur les réponses simples, pas sur les cases.
- **Un `reference/` illisible passait pour un `reference/` supprimé** : une faute de syntaxe rendait le harnais vert en
  désactivant les contrôles documentaires. L’absence n’est tolérée que si les deux fichiers manquent vraiment.
- **La cellule de routage du README est comparée en entier** : on pouvait y ajouter une destination sans rien casser.
- Le tableau disait « rien de propre à l’UNIL » pour q9 et q9a alors que `docs/ARBRE.md` signale que leur branche conclut
  sans jamais poser q10. Les deux disent maintenant la même chose.

## Moteur 3.0.8 · dépôt du 7 septembre 2026

- **Les caractères invisibles coupaient un mot dans les deux sens.** Les retirer recolle un mot fendu (`UN‑IL`), les
  remplacer par une espace rétablit une séparation effacée (`Université‑de Lausanne`) : le verrou lit désormais les deux
  formes, faute de quoi la moitié des cas passait encore.

## Moteur 3.0.7 · dépôt du 7 septembre 2026

Cinquième passe. Onze auditeur·rices isolé·es, dont trois n’ont rien trouvé à redire ; ce qui suit vient des huit autres.

- **Un fichier seulement signé était déclaré publiable.** Remplir les sept champs de signature et ne toucher à rien
  d’autre donnait un verdict vert alors que la page posait encore les trois questions d’exemple, portait son titre livré
  et renvoyait à `example.org`. L’identifiant, les liens et la remarque de l’exemple comptent désormais pour ce qu’ils
  sont : des marqueurs à remplacer.
- **Les caractères invisibles traversaient le verrou.** Espace sans chasse, trait d’union conditionnel, gluon, marque
  d’ordre des octets : aucun n’est une espace ni un signe combinant, et chacun coupait un mot en deux sous le filtre.
- **Le tableau du README montrait un intitulé, pas la question posée.** Pour q8, « Analyse d’impact avec le DPO » se lit
  comme « avez-vous fait une analyse ? », alors que la question est « le risque est-il faible selon cette analyse ? » :
  l’autre lecture mène à l’autre branche, et à l’autre conclusion juridique. La colonne porte maintenant la question.
- **Le guide se trompait sur ce que contiennent les marqueurs** : le titrage, le chapeau, l’enveloppe `main` et une règle
  `body` sont dans la région à coller, pas en dehors. Un collage dans un CMS donnait deux titrages.
- **La règle du tiret cadratin est celle de ce dépôt, pas du format** : le harnais ne la faisait pas peser sur le fichier
  d’une institution qui écrit ses propres questions.
- **La liste des clés d’interface était partielle** : douze sur vingt-sept. Une troisième langue partait avec quinze
  chaînes en anglais.
- **Le gel du schéma, perdu dans une réécriture, est rétabli** : un libellé de boîte inversé passait au vert.
- `docs/ARBRE.md` signale que R6, comme R7, conclut sur une question que sa branche ne pose jamais.
- Ajout de `CONTRIBUTING.md` : la politique de la pull request non fusionnée était dans le seul CHANGELOG.

## Moteur 3.0.6 · dépôt du 7 septembre 2026

- Un commentaire du moteur décrivait encore `attribution: false`, retiré en 3.0.5. Le code faisait ce qu’il fallait, le
  commentaire disait le contraire.

## Moteur 3.0.5 · dépôt du 7 septembre 2026

- **Deux cases à cocher partageant une même valeur sont refusées.** Les réponses cochées sont tenues comme un ensemble de
  valeurs : deux cases de même valeur paraissent indépendantes et ne le sont pas. Cocher les deux puis en décocher une
  vide l’ensemble, l’autre reste cochée à l’écran, et « Continuer » prend la branche « aucune ». C’est une mauvaise
  branche juridique avec une case cochée devant, exactement ce que cet outil existe pour éviter. Le doublon était déjà
  refusé sur les réponses simples, pas sur les cases.
- La documentation dit ce que le moteur ne garantit pas : dans un CMS, il écrase l’état d’historique de la page (utiliser
  `data-history="false"`), et les réponses restent lisibles par tout script de la même origine.

## Moteur 3.0.4 · dépôt du 7 septembre 2026

Quatrième passe, sur les contournements du verrou et les angles morts du harnais.

- **Le verrou lisait des chaînes brutes.** « Université␣de Lausanne » avec une espace insécable, une tabulation, une
  espace doublée ou un accent écrit en deux points de code passait, alors que la page affiche exactement le nom
  d’origine. La comparaison se fait désormais sur le texte tel qu’il se lit.
- **`check.html` lisait un antislash autrement qu’un navigateur.** `https://evil.test\.hes-example.ch/page` est servi
  depuis `evil.test` ; le validateur y voyait un sous-domaine de `hes-example.ch` et répondait « publiable ».
- **Le gel auxiliaire oubliait l’identité de l’arbre** : son `id` et sa `version` pouvaient changer sans rien faire
  bouger. Ils en font partie.
- **Une arête sans étiquette n’était pas une arête** pour le contrôle du schéma : `q1 --> q9` y était invisible.
- **Les tableaux du README sont comparés cellule par cellule**, plus par inclusion : on pouvait allonger un titre, une
  solution ou une note sans que rien ne bouge. Le titre d’une question est le titre gelé, suivi du seul nombre de cases.
- **Les blocs de `docs/ARBRE.md` sont rendus depuis l’arbre et comparés à l’identique** : y coller l’aide d’une autre
  question ou le résumé d’un autre résultat ne passe plus.
- **L’empreinte est décrite pour ce qu’elle est** dans le validateur : une somme de contrôle courte, qui détecte une
  dérive involontaire, pas une signature qui résiste à quelqu’un qui cherche à la contrefaire.

## Moteur 3.0.3 · dépôt du 7 septembre 2026

Troisième passe, après un troisième audit indépendant. Deux des corrections de la 3.0.2 avaient introduit des verdicts
faux : elles sont réparées ici. Le texte de l’arbre et ses 20 chemins restent inchangés (empreinte 59b6dc65).

- **Faux positif introduit en 3.0.2 :** `publisher.domains` était balayé par les termes réservés, et « unil.ch » contient
  « unil ». Toute autre institution du domaine, `hec.unil.ch` par exemple, se voyait refuser son propre nom de domaine.
  Les noms d’hôtes ne sont plus lus comme de la prose ; `publisher.name` et `review.by` le restent.
- **Exemption d’origine trop littérale :** elle exigeait la chaîne exacte `unil.ch` dans `publisher.domains`, si bien que
  déclarer plus précisément `ia.unil.ch`, l’adresse même de la migration annoncée, faisait refuser l’arbre d’origine chez
  lui. Un sous-domaine du domaine d’origine suffit désormais.
- **`attribution: false` a disparu.** Déclarer `derivedFrom` achetait l’exemption qui permet de nommer sa source ; la
  phrase disant que la source n’a pas relu l’adaptation était l’autre moitié du marché, et pouvait être désactivée.
- **`check.html` lit maintenant le titre, le titrage et le chapeau de la page.** Le moteur ne voit que l’arbre : une copie
  qui avait réécrit ses questions mais gardé le bandeau de l’institution d’origine passait sans un mot. Ce sont les plus
  gros caractères de la page ; le validateur est le seul à lire le fichier entier, il le signale comme une erreur.

## Moteur 3.0.2 · dépôt du 7 septembre 2026

Deuxième passe de corrections, après un second audit indépendant. Le texte de l’arbre et ses 20 chemins sont inchangés
(empreinte de contenu 59b6dc65). Le bloc moteur change pour la première fois depuis le 3 septembre : son empreinte passe
de `eac1abce` à `f2632539`.

- **Garde-fou.** Hors du domaine d’origine, `publisher.name` et `review.by` ne peuvent plus citer l’institution
  d’origine. Ces deux champs étaient exemptés, si bien qu’une copie de bonne foi pouvait se mettre en ligne signée
  « Université de Lausanne », exactement ce que ce verrou existe pour empêcher. Seul `derivedFrom` reste exempté : nommer
  la source est sa raison d’être.
- **Énumérateur de chemins.** La profondeur de récursion tombe de 2000 à 500 : à 2000 elle débordait la pile par défaut
  de certaines plateformes, alors qu’aucun questionnaire n’enchaîne 500 questions. Le drapeau de troncature est inchangé.
- **Harnais.** Les règles du dépôt s’exécutent désormais même si le contenu d’exemple a été touché : une sortie anticipée
  les faisait toutes passer au vert d’un coup. Un fichier adapté garde presque toutes les assertions au lieu d’en perdre
  les quatre cinquièmes. Les assertions écrites sur la forme de l’exemple livré basculent alors sur une copie de secours
  de même forme, au lieu de s’effondrer sur un nom de nœud qui n’existe plus ; une assertion vérifie, tant que le fichier
  porte l’exemple, que cette copie de secours ne dérive pas.
- **Harnais, exactitude documentaire.** Chaque question et chaque résultat de `docs/ARBRE.md` est vérifié dans son propre
  bloc, titre en ligne exacte, puces égales aux options ou aux réponses du fichier gelé, solution recommandée sur sa
  propre ligne. Le schéma est comparé arête par arête dans les deux sens. Les 20 chemins doivent nommer une étape par
  question. Le README doit porter le titre, la solution et la note de chaque résultat mot pour mot, et aucun article de
  loi que l’arbre ne cite pas. Les orthographes fautives du nom sont refusées.
- **`check.html`.** Le champ de domaine sort de la zone de dépôt : y cliquer ouvrait aussi le sélecteur de fichier. Une
  entrée qui ne se réduit pas à un nom d’hôte n’est plus lue comme « aucun domaine ». Ces comportements ont maintenant
  des tests.
- **`CITATION.cff`.** Le champ `notes`, absent du schéma CFF 1.2.0, est retiré ; son contenu passe dans `abstract`.
- **Gel.** L’empreinte de contenu ne signe que le départ, les questions, les résultats et les liens : l’avertissement de
  responsabilité, l’éditeur, la relecture, la juridiction, la base légale, les étapes et les langues pouvaient changer
  sans la faire bouger. Le harnais les gèle séparément, et l’en-tête du fichier de référence ne promet plus davantage.
- **Chemins.** Chaque phrase des 20 chemins porte, entre accents graves, la route que le moteur énumère ; le harnais la
  compare à l’oracle. La phrase reste une aide de lecture écrite à la main, et le document le dit.
- **Articles de loi.** La règle qui refuse un article que l’arbre ne cite pas reconnaît maintenant « article 9 RGPD »
  comme « art. 3 LRH », alinéas et lettres compris.
- **Licences.** `LICENSE` couvre explicitement les fichiers qui ne relevaient d’aucun des trois régimes. `CITATION.cff`
  n’annonce plus une licence unique pour un dépôt qui en porte trois : c’est exactement l’erreur contre laquelle
  `LICENSE` ouvre en mettant en garde.
- **Documentation.** `SECURITY.md` dit où vivent les réponses (`sessionStorage` et l’état d’historique, rien d’autre).
  Le README dit comment obtenir `check.html`, qu’il est en anglais, quels sept champs remplir, et comment servir une
  troisième langue. `docs/INTEGRATE.md` dit quelle région coller dans un CMS.

## Moteur 3.0.1 · dépôts des 7, 6 et 3 septembre 2026

Trois dépôts ont porté ce même moteur ; ils sont donnés ici du plus récent au plus ancien.

### Dépôt du 7 septembre 2026

Corrections issues d’un premier audit indépendant. Bloc moteur inchangé à l’octet (empreinte `eac1abce`), texte de
l’arbre et 20 chemins inchangés (59b6dc65).

- Trois affirmations fausses retirées : l’affichage à 320 px n’est pas vérifié par le harnais mais dans un navigateur ;
  `check.html` ne compare pas ses chemins à l’oracle, c’est le harnais qui le fait ; le résultat R7 recommande
  l’utilisation libre et affiche une note de vérification, ce n’est pas une condition.
- `docs/ARBRE.md` devient une transcription mot pour mot du fichier gelé.
- Le harnais détecte un contenu adapté par son empreinte au lieu des identifiants de nœuds, ce qui rendait rouge un
  fichier légitimement adapté ; deux trous bouchés (expression régulière globale, lettres accentuées manquantes).
- `check.html` recalcule le verdict quand on change le domaine après avoir déposé le fichier.
- Le README dit d’adapter `<html lang>`, le `<title>` et `data-lang`, et précise que `derivedFrom`, `publisher` et
  `review` échappent au refus des termes réservés hors unil.ch. Cette dernière phrase a été corrigée en 3.0.2.
- Ajout de `SECURITY.md` et de ce fichier.

### Dépôt du 6 septembre 2026

Première page d’accueil en français : les 11 questions et les 7 résultats en tableaux, `docs/ARBRE.md`, une capture,
`docs/INTEGRATE.md` pour le guide technique en anglais.

### Dépôt du 3 septembre 2026

Passage à un fichier unique `ai-go.html`, contenu au-dessus de six marqueurs et moteur en dessous, avec `check.html` et
un harnais sans dépendance.
