/* =============================================================================
 * The decision tree of the University of Lausanne (UNIL), published for
 * REFERENCE ONLY. DO NOT COPY THIS FILE. Start from the content block of
 * ai-go.html instead.
 *
 * ALL RIGHTS RESERVED. The BSD licence at the root of this repository covers
 * the engine, the validator and the harness. It does not cover this file.
 *
 * THIS CONTENT IS UNIL'S, AND IT IS ONLY AN EXAMPLE. It encodes Swiss federal
 * and Vaud cantonal law (the FADP, the Vaud LPrD, the Human Research Act,
 * official secrecy) and decisions UNIL took for its own community. Under
 * another law, or in another institution, it is WRONG, and the engine refuses
 * to display it outside unil.ch (see the origin policy in the engine block of
 * ai-go.html). It will look 90 % applicable to you, which is more dangerous
 * than looking foreign: nobody re-examines the remaining 10 %.
 *
 * WHAT IS SWISS IN HERE. Re-examine all of it; these carry the weight:
 *
 *   q3, q4      a risk-based reading of identifiability. The thresholds are a
 *               legal judgement, not a fact.
 *   q5          the categories of SENSITIVE data under the LPD and the
 *               LPrD-VD. The GDPR lists different ones.
 *   q6          the definition of health data at art. 3 of the Swiss Human
 *               Research Act, quoted verbatim.
 *   q7          "donnees delicates": an intermediate category with no direct
 *               equivalent in most legal systems and no accepted English
 *               term (this tree says "high-risk personal data", on purpose).
 *   q8          an impact assessment carried out with a data protection
 *               officer.
 *   q10         Swiss professional secrecy and official secrecy.
 *   all results the tool categories (commercial, institutional, local)
 *               reflect what UNIL has under contract. Yours will differ.
 *
 * THE TRAP IS QUESTION q4, and it is the reason this warning is here rather
 * than in a document nobody opens. q4 is the only checkbox question in this
 * tree where ticking a box takes the reader OUT of the personal-data branch
 * instead of deeper into it: it asks whether the re-identification risk is
 * LOW, so ticking is reassuring and routes to q10, not to q5. It carries
 * polarity: "inverse" for that reason. A well-meaning maintainer who
 * "corrects" it by swapping ifAny and else, to match every other checkbox
 * question, would send low-risk data into the sensitive branch and people who
 * ticked nothing straight to the least restrictive outcome. The declaration
 * changes nothing at runtime; it exists to be read.
 *
 * No reuse licence is granted on this content (see the README, Licences). It
 * is here so that an adopting institution can read a complete, reviewed,
 * bilingual tree (11 questions, 10 steps, 7 results, 20 paths) and so that the
 * engine is tested against a real one: reference/aigo-unil.paths.js freezes
 * its 20 paths as a non-regression oracle, and the harness mounts THIS content
 * on the engine extracted from ai-go.html.
 *
 * The object below is frozen: its content fingerprint is 59b6dc65 and the
 * harness refuses any change to it. Only this header comment is editable.
 *
 * The variable is named AI_GO_CONTENT, like the content block of ai-go.html,
 * so that producing the UNIL production page is one paste and no rename.
 *
 * House rule: every content string uses DOUBLE QUOTES. Legal French is full
 * of apostrophes, and one straight apostrophe inside a single-quoted string
 * breaks the whole file. Non-breaking spaces are written as the six
 * characters \u00a0, never typed literally.
 * ========================================================================== */

var AI_GO_CONTENT = {

  id: "aigo-unil",
  version: "2026-09-01",
  langs: ["fr","en"],
  defaultLang: "fr",
  start: "q1",

  /* Traceability of the legal review. The engine DISPLAYS it under every
     result: it is interface, not an internal note. check.html warns when the
     review date is more than one year old. Publisher, reviewer and date
     below are UNIL's own signature. */
  publisher: { name: "Universit\u00e9 de Lausanne", domains: ["unil.ch"] },
  review: { by: "Cellule strat\u00e9gique IA + DPO", date: "2026-06-09" },
  /* Disclaimer as displayed on the UNIL site, in both languages. */
  disclaimer: {
    fr: "**Avertissement\u00a0:** Outil d\u2019aide \u00e0 la d\u00e9cision, il ne garantit pas une s\u00e9curit\u00e9 et une conformit\u00e9 l\u00e9gale \u00e0 100\u00a0%, l\u2019utilisateur\u00b7rice demeure responsable de l\u2019\u00e9valuation finale et des mesures mises en \u0153uvre.",
    en: "**Disclaimer:** A decision-support tool, it does not guarantee 100% security and legal compliance; the user remains responsible for the final assessment and for the measures implemented."
  },
  jurisdiction: "CH-VD",
  legalBasis: ["LPD", "LPrD-VD", "LRH", "secret de fonction"],

  /* The breadcrumb. The step TOTAL is derived from this list: no "of 10"
     frozen in a translated string, no number parsed out of a question id.
     Adding an eleventh step is one line here. */
  steps: [
    { id: "s1"  , name: { fr: "Données personnelles", en: "Personal data" } },
    { id: "s2"  , name: { fr: "Identifiabilité", en: "Identifiability" } },
    { id: "s3"  , name: { fr: "Risque d’identification", en: "Identification risk" } },
    { id: "s4"  , name: { fr: "Risque de réidentification", en: "Re-identification risk" } },
    { id: "s5"  , name: { fr: "Données sensibles", en: "Sensitive data" } },
    { id: "s6"  , name: { fr: "Lien LRH", en: "HRA link" } },
    { id: "s7"  , name: { fr: "Données délicates", en: "High-risk data" } },
    { id: "s8"  , name: { fr: "Analyse d’impact DPO", en: "DPO impact assessment" } },
    { id: "s9"  , name: { fr: "Données secondaires", en: "Secondary data" } },
    { id: "s10" , name: { fr: "Restriction de partage", en: "Sharing restriction" } },
  ],

  /* Every URL is declared once here and referenced by id from the results.
     external: true makes the engine add target="_blank", rel="noopener
     noreferrer" AND the hidden mention "opens in a new tab" for screen
     readers. A translator never sees a URL, and therefore cannot break one.
     localOnly shares the URL of local with a different label: that is data,
     not a duplicate. */
  links: {
    commercial: {
      label: { fr: "LLMs commerciaux", en: "Commercial LLMs" },
      external: true,
      href: "https://padlet.com/AI_research/ai-tools-for-research-administration-and-developers-8kemyoqn7h33bs7q"
    },
    institutional: {
      label: {
        fr: "LLMs institutionnels (contractualisés par l’UNIL)",
        en: "Institutional LLMs (contracted by UNIL)"
      },
      external: true,
      href: "https://wp.unil.ch/iaunil/microsoft-copilot-un-modele-de-langage-ia-securise-a-disposition-a-lunil/"
    },
    local: {
      label: {
        fr: "LLMs en local (sur infrastructure UNIL ou personnelle)",
        en: "Local LLMs (on UNIL or personal infrastructure)"
      },
      external: true,
      href: "https://wp.unil.ch/iaunil/modele-ia-local-pour-les-donnees-privees-sensibles-et-liees-au-secret-de-fonction/"
    },
    localOnly: {
      label: {
        fr: "LLMs en local UNIQUEMENT (sur infrastructure UNIL ou personnelle)",
        en: "Local LLMs ONLY (on UNIL or personal infrastructure)"
      },
      external: true,
      href: "https://wp.unil.ch/iaunil/modele-ia-local-pour-les-donnees-privees-sensibles-et-liees-au-secret-de-fonction/"
    },
  },

  nodes: {

    /* ---- q1 · single choice ------------------------------------------- */
    q1: {
      type: "single",
      step: "s1",
      title: {
        fr: "Les données concernent-elles des individus ?",
        en: "Does the data concern individuals?"
      },
      help: {
        fr: "Indiquez si vos données portent directement ou indirectement sur des personnes physiques.",
        en: "Indicate whether your data relates directly or indirectly to natural persons."
      },
      /* label omitted on "yes" / "no": the engine uses its own Yes / No strings,
         so adding an interface language costs two strings, not two per question. */
      answers: [
        { value: "yes", to: "q2",
          detail: {
            fr: "Mes données concernent des individus",
            en: "My data concerns individuals"
          } },
        { value: "no", to: "q10",
          detail: {
            fr: "Mes données ne concernent pas des individus",
            en: "My data does not concern individuals"
          } },
      ]
    },

    /* ---- q2 · checkboxes ------------------------------------------------ */
    /* The routing is a property of the WHOLE set of boxes, "at least one
       ticked" versus "none", never of one box taken alone. Adding an option
       is enough: the routing follows, without touching any code. */
    q2: {
      type: "multi",
      step: "s2",
      title: {
        fr: "Les individus sont-ils identifiables ?",
        en: "Are the individuals identifiable?"
      },
      help: {
        fr: "**Cochez tous les critères qui s’appliquent à vos données, ou cliquez sur «\u00a0Continuer\u00a0» si aucun critère ne s’applique.**",
        en: "**Check all criteria that apply to your data, or click “Continue” if none apply.**"
      },
      options: [
        { value: "direct"       , label: {
          fr: "Données directement identifiantes (nom, prénom, email, téléphone, AVS, visage, IP, etc.)",
          en: "Directly identifying data (name, first name, email, phone, social security number, face, IP, etc.)"
        } },
        { value: "indirect"     , label: {
          fr: "Données indirectement identifiantes (date de naissance précise, lieu d’habitation précis, etc.)",
          en: "Indirectly identifying data (precise date of birth, precise place of residence, etc.)"
        } },
        { value: "correlation"  , label: {
          fr: "Corrélation possible avec la personne (informations rares ou contexte permettant l’identification)",
          en: "Possible correlation with the person (rare information or context enabling identification)"
        } },
      ],
      next: {"ifAny":"q3","else":"q10"}
    },

    /* ---- q3 · single choice ------------------------------------------- */
    q3: {
      type: "single",
      step: "s3",
      title: {
        fr: "Le risque d’identification des individus est-il faible ?",
        en: "Is the risk of identifying individuals low?"
      },
      help: {
        fr: [
          "**Exemples de données faiblement identifiantes :**",
          {
            items: [
              "Sexe (H/F)",
              "Date de naissance (année seulement)",
              "Profession généralisée",
              "Pathologie commune"
            ]
          }
        ],
        en: [
          "**Examples of weakly identifying data:**",
          {
            items: [
              "Sex (M/F)",
              "Date of birth (year only)",
              "Generalised occupation",
              "Common medical condition"
            ]
          }
        ]
      },
      /* label omitted on "yes" / "no": the engine uses its own Yes / No strings,
         so adding an interface language costs two strings, not two per question. */
      answers: [
        { value: "yes", to: "q4",
          detail: {
            fr: "Uniquement des données faiblement identifiantes",
            en: "Only weakly identifying data"
          } },
        { value: "no", to: "q5",
          detail: {
            fr: "Contient des données plus identifiantes",
            en: "Contains more identifying data"
          } },
      ]
    },

    /* ---- q4 · checkboxes ------------------------------------------------ */
    /* INVERSE POLARITY: the only node of the graph where TICKING a box takes
       the person OUT of the "personal data" branch. Ticking an item here
       leads to q10 (sharing restriction), not to q5 (sensitive data). It is
       the most counter-intuitive point of the whole tree, and therefore the
       one an adopter will "fix" in good faith. polarity: "inverse" below
       declares that intent as data, so that it survives translation and
       review. The engine checks the value only; the routing lives entirely
       in `next`. */
    q4: {
      type: "multi",
      step: "s4",
      polarity: "inverse",
      title: {
        fr: "Le risque de réidentification par recoupement est-il faible ?",
        en: "Is the risk of re-identification through cross-referencing low?"
      },
      help: {
        fr: "**Cochez les éléments qui s’appliquent, ou cliquez sur «\u00a0Continuer\u00a0» si aucun ne s’applique.**",
        en: "**Check the items that apply, or click “Continue” if none apply.**"
      },
      options: [
        { value: "croisement"   , label: {
          fr: "Peu de croisement possible entre les données",
          en: "Little cross-referencing possible between the data"
        } },
        { value: "agregation"   , label: {
          fr: "Résultats statistiques agrégés",
          en: "Aggregated statistical results"
        } },
        { value: "tranches"     , label: {
          fr: "Âge en tranches larges (ex\u00a0: 20–30 ans)",
          en: "Age in broad ranges (e.g. 20–30 years)"
        } },
        { value: "general"      , label: {
          fr: "Généralisation des données",
          en: "Generalisation of the data"
        } },
        { value: "population"   , label: {
          fr: "Population large et diversifiée",
          en: "Large and diverse population"
        } },
      ],
      next: {"ifAny":"q10","else":"q5"}
    },

    /* ---- q5 · checkboxes ------------------------------------------------ */
    q5: {
      type: "multi",
      step: "s5",
      title: { fr: "Données sensibles ?", en: "Sensitive data?" },
      help: {
        fr: "**Cochez toutes les catégories qui s’appliquent, ou cliquez sur «\u00a0Continuer\u00a0» si aucune ne s’applique.**",
        en: "**Check all categories that apply, or click “Continue” if none apply.**"
      },
      options: [
        { value: "religion"     , label: {
          fr: "Opinions/activités religieuses, philosophiques, politiques ou syndicales",
          en: "Religious, philosophical, political or trade-union opinions/activities"
        } },
        { value: "sante"        , label: {
          fr: "Santé, sphère intime ou appartenance à une race",
          en: "Health, intimate sphere or racial origin"
        } },
        { value: "social"       , label: { fr: "Mesures d’aide sociale", en: "Social assistance measures" } },
        { value: "penal"        , label: {
          fr: "Poursuites ou sanctions pénales et administratives",
          en: "Criminal or administrative proceedings or sanctions"
        } },
        { value: "biometrique"  , label: {
          fr: "Données biométriques identifiant une personne de manière univoque",
          en: "Biometric data uniquely identifying a person"
        } },
        { value: "genetique"    , label: { fr: "Données génétiques", en: "Genetic data" } },
      ],
      next: {"ifAny":"q6","else":"q7"}
    },

    /* ---- q6 · single choice ------------------------------------------- */
    q6: {
      type: "single",
      step: "s6",
      title: {
        fr: "Les données sont-elles liées à la santé ou à la génétique humaine ?",
        en: "Is the data related to human health or genetics?"
      },
      help: {
        fr: [
          "**Définition légale (art.\u00a03 LRH)\u00a0:**",
          "«\u00a0Les informations concernant une personne déterminée ou déterminable qui ont un lien avec son état de santé ou sa maladie, données génétiques comprises\u00a0»"
        ],
        en: [
          "**Legal definition (art. 3 HRA):**",
          "“Information concerning an identified or identifiable person which relates to their state of health or illness, including genetic data”"
        ]
      },
      /* label omitted on "yes" / "no": the engine uses its own Yes / No strings,
         so adding an interface language costs two strings, not two per question. */
      answers: [
        { value: "yes", result: "sensitive_lrh",
          detail: {
            fr: "Données liées à la santé ou à la génétique humaine",
            en: "Data related to human health or genetics"
          } },
        { value: "no", result: "sensitive_no_lrh",
          detail: { fr: "Autres données sensibles", en: "Other sensitive data" } },
      ]
    },

    /* ---- q7 · checkboxes ------------------------------------------------ */
    q7: {
      type: "multi",
      step: "s7",
      title: { fr: "Données délicates ?", en: "High-risk personal data?" },
      help: {
        fr: [
          "Catégorie intermédiaire sans être sensible, mais présentant un risque élevé pour la personnalité.",
          "**Cochez toutes les catégories qui s’appliquent, ou cliquez sur «\u00a0Continuer\u00a0» si aucune ne s’applique.**"
        ],
        en: [
          "Intermediate category: not sensitive, but posing a high risk to personal rights.",
          "**Check all categories that apply, or click “Continue” if none apply.**"
        ]
      },
      options: [
        { value: "prive"        , label: {
          fr: "Aspects privés mais non intimes (au contraire de la santé, la religion, les opinions)",
          en: "Private but not intimate aspects (unlike health, religion, opinions)"
        } },
        { value: "vulnerabilite", label: {
          fr: "Révèlent une vulnérabilité potentielle",
          en: "Reveal a potential vulnerability"
        } },
        { value: "revenu"       , label: {
          fr: "Données sur le revenu ou la fortune",
          en: "Data on income or wealth"
        } },
        { value: "affaires"     , label: {
          fr: "Relations d’affaires (selon les cas) ou bancaires (selon les cas)",
          en: "Business relationships (case-by-case) or banking relationships (case-by-case)"
        } },
      ],
      next: {"ifAny":"q8","else":"q9"}
    },

    /* ---- q8 · single choice ------------------------------------------- */
    q8: {
      type: "single",
      step: "s8",
      title: {
        fr: "Analyse d’impact avec le DPO",
        en: "Impact assessment with the DPO"
      },
      help: {
        fr: [
          "Le risque pour les personnes est-il faible (réduit) selon l’analyse d’impact effectuée avec le DPO ?",
          "**Note\u00a0:** L’analyse d’impact est une obligation légale lorsque le risque est élevé pour les individus."
        ],
        en: [
          "Is the risk to individuals low (reduced) according to the impact assessment carried out with the DPO?",
          "**Note:** An impact assessment is a legal obligation when the risk to individuals is high."
        ]
      },
      /* label omitted on "yes" / "no": the engine uses its own Yes / No strings,
         so adding an interface language costs two strings, not two per question. */
      answers: [
        { value: "yes", result: "personal_with_secret",
          detail: {
            fr: "Risque faible confirmé par le DPO",
            en: "Low risk confirmed by the DPO"
          } },
        { value: "no", result: "delicate_low_risk",
          detail: {
            fr: "Pas d’analyse ou risque important tant qu’une analyse n’a pas démontré le contraire",
            en: "No assessment, or significant risk until an assessment proves otherwise"
          } },
      ]
    },

    /* ---- q9 · single choice ------------------------------------------- */
    q9: {
      type: "single",
      step: "s9",
      title: { fr: "Données secondaires ?", en: "Secondary data?" },
      help: {
        fr: [
          "Le projet implique-t-il l’utilisation de données secondaires ?",
          "**Définition\u00a0:** Données déjà collectées pour une finalité autre que le projet actuel\u00a0; données que l’équipe n’a pas elle-même produites."
        ],
        en: [
          "Does the project involve the use of secondary data?",
          "**Definition:** Data already collected for a purpose other than the current project; data that the team did not produce itself."
        ]
      },
      /* label omitted on "yes" / "no": the engine uses its own Yes / No strings,
         so adding an interface language costs two strings, not two per question. */
      answers: [
        { value: "yes", to: "q9a",
          detail: {
            fr: "Utilisation de données secondaires",
            en: "Use of secondary data"
          } },
        { value: "no", result: "personal_with_secret",
          detail: { fr: "Données primaires uniquement", en: "Primary data only" } },
      ]
    },

    /* ---- q9a · single choice ------------------------------------------ */
    /* Sub-step: shares step 9 with q9 and is displayed as "9a". The suffix is
       declared here, so the screen AND the screen-reader announcement say
       the same thing. */
    q9a: {
      type: "single",
      step: "s9",
      stepSuffix: "a",
      title: { fr: "Anonymisation des données", en: "Data anonymisation" },
      help: {
        fr: [
          "Les données sont-elles anonymes ou efficacement anonymisées ?",
          "**Note\u00a0:** La pseudonymisation ne suffit pas\u00a0: les données restent traçables."
        ],
        en: [
          "Is the data anonymous or effectively anonymised?",
          "**Note:** Pseudonymisation is not enough: the data remains traceable."
        ]
      },
      /* label omitted on "yes" / "no": the engine uses its own Yes / No strings,
         so adding an interface language costs two strings, not two per question. */
      answers: [
        { value: "yes", result: "anonymized_with_secret",
          detail: {
            fr: "Anonymisation complète et irréversible",
            en: "Full and irreversible anonymisation"
          } },
        { value: "no", result: "personal_with_secret",
          detail: {
            fr: "Données encore identifiables",
            en: "Data still identifiable"
          } },
      ]
    },

    /* ---- q10 · single choice ------------------------------------------ */
    /* Three nodes lead here (q1 "no", q2 nothing ticked, q4 at least one
       ticked). Back is a stack operation: it returns to the real parent,
       never to a hard-coded question. */
    q10: {
      type: "single",
      step: "s10",
      title: {
        fr: "Les données ont-elles une restriction sur leur partage ?",
        en: "Is there a restriction on sharing the data?"
      },
      help: {
        fr: "**Note\u00a0:** p.\u00a0ex. secret de fonction, secret professionnel, NDA, MOU",
        en: "**Note:** e.g. official secrecy, professional secrecy, NDA, MOU"
      },
      /* label omitted on "yes" / "no": the engine uses its own Yes / No strings,
         so adding an interface language costs two strings, not two per question. */
      answers: [
        { value: "yes", result: "no_personal_with_secret",
          detail: {
            fr: "Les données ont au moins une restriction applicable",
            en: "The data has at least one applicable restriction"
          } },
        { value: "no", result: "open_data_no_personal",
          detail: {
            fr: "Le partage des données est libre",
            en: "The data can be shared freely"
          } },
      ]
    },
  },

  /* --------------------------------------------------------------- results */
  results: {

    open_data_no_personal: {
      level: "success",
      title: {
        fr: "Pas de données personnelles · Pas de restriction",
        en: "No personal data · No restriction"
      },
      summary: {
        fr: "Vos données ne présentent pas de restrictions particulières.",
        en: "Your data has no particular restrictions."
      },
      solution: { label: "plain", text: { fr: "Utilisation libre", en: "Unrestricted use" } },
      allowed: ["commercial","institutional","local"]
    },

    no_personal_with_secret: {
      level: "warning",
      title: {
        fr: "Pas de données personnelles · Données avec restrictions",
        en: "No personal data · Data with restrictions"
      },
      summary: {
        fr: "Vos données ont des restrictions sur leur partage.",
        en: "Your data has sharing restrictions."
      },
      solution: { label: "legal", text: {
        fr: "LLMs institutionnels ou LLMs en local",
        en: "Institutional LLMs or local LLMs"
      } },
      allowed: ["institutional","local"],
      alert: { level: "warning", text: {
        fr: "**Important\u00a0:** L’utilisation de LLMs commerciaux cloud n’est pas légale sauf pour les solutions proposées par l’institution.",
        en: "**Important:** Using cloud-based commercial LLMs is not lawful, except for the solutions provided by the institution."
      } }
    },

    sensitive_lrh: {
      level: "danger",
      title: {
        fr: "Données personnelles · Sensibles · LRH · Restriction",
        en: "Personal data · Sensitive · HRA · Restriction"
      },
      summary: {
        fr: "Vos données sont sensibles et soumises à la LRH.",
        en: "Your data is sensitive and subject to the HRA."
      },
      solution: { label: "plain", text: { fr: "LLMs en local UNIQUEMENT", en: "Local LLMs ONLY" } },
      allowed: ["localOnly"],
      forbidden: [
        {
          fr: "AUCUN LLM cloud institutionnel",
          en: "NO institutional cloud LLMs"
        },
        { fr: "AUCUN LLM commercial", en: "NO commercial LLMs" },
      ],
      alert: { level: "danger", text: {
        fr: "**Protection maximale requise\u00a0:** Ces données nécessitent le plus haut niveau de protection. Contactez la DCSR.",
        en: "**Maximum protection required:** This data requires the highest level of protection. Contact the DCSR."
      } }
    },

    sensitive_no_lrh: {
      level: "danger",
      title: {
        fr: "Données personnelles · Sensibles · Restriction",
        en: "Personal data · Sensitive · Restriction"
      },
      summary: {
        fr: "Vos données sont sensibles et nécessitent une protection renforcée.",
        en: "Your data is sensitive and requires enhanced protection."
      },
      solution: { label: "plain", text: { fr: "LLMs en local UNIQUEMENT", en: "Local LLMs ONLY" } },
      allowed: ["localOnly"],
      forbidden: [
        { fr: "AUCUN LLM externe ou cloud", en: "NO external or cloud LLMs" },
        { fr: "AUCUN LLM commercial", en: "NO commercial LLMs" },
      ],
      alert: { level: "danger", text: {
        fr: "**Protection renforcée requise\u00a0:** Données sensibles nécessitant des mesures de sécurité strictes.",
        en: "**Enhanced protection required:** Sensitive data requiring strict security measures."
      } }
    },

    delicate_low_risk: {
      level: "danger",
      title: {
        fr: "Données personnelles · Délicates · Restriction",
        en: "Personal data · High-risk · Restriction"
      },
      summary: {
        fr: "Vos données sont délicates avec un risque non réduit.",
        en: "Your data is high-risk and the risk has not been mitigated."
      },
      solution: { label: "plain", text: { fr: "LLMs en local UNIQUEMENT", en: "Local LLMs ONLY" } },
      allowed: ["localOnly"],
      alert: { level: "info", text: {
        fr: "**Note\u00a0:** Tant qu’une analyse d’impact n’a pas réduit le risque, ces données nécessitent une protection locale.",
        en: "**Note:** Until an impact assessment has reduced the risk, this data requires local protection."
      } }
    },

    personal_with_secret: {
      level: "warning",
      title: {
        fr: "Données personnelles · Restriction de partage",
        en: "Personal data · Sharing restriction"
      },
      summary: {
        fr: "Vos données sont personnelles et soumises au secret de fonction.",
        en: "Your data is personal and subject to official secrecy."
      },
      solution: { label: "plain", text: {
        fr: "LLMs institutionnels ou LLMs en local",
        en: "Institutional LLMs or local LLMs"
      } },
      allowed: ["institutional","local"],
      alert: { level: "warning", text: {
        fr: "**Important\u00a0:** Les LLMs commerciaux externes ne sont pas autorisés pour ces données personnelles.",
        en: "**Important:** External commercial LLMs are not permitted for this personal data."
      } }
    },

    anonymized_with_secret: {
      level: "success",
      title: {
        fr: "Données anonymisées · Sans restriction de partage",
        en: "Anonymised data · No sharing restriction"
      },
      summary: {
        fr: "Vos données sont correctement anonymisées.",
        en: "Your data is correctly anonymised."
      },
      solution: { label: "plain", text: { fr: "Utilisation libre", en: "Unrestricted use" } },
      allowed: ["commercial","institutional","local"],
      alert: { level: "info", text: {
        fr: "**Note\u00a0:** Vérifiez que l’anonymisation est irréversible avant d’utiliser des LLMs externes.",
        en: "**Note:** Verify that the anonymisation is irreversible before using external LLMs."
      } }
    },
  }
};

/* Works as a content block in a browser and as require() in Node tooling. */
if (typeof module !== "undefined" && module.exports) module.exports = AI_GO_CONTENT;
