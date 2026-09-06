/* =============================================================================
 * ORACLE: the expected paths of the UNIL tree, frozen before migration.
 *
 * ALL RIGHTS RESERVED, like the tree it describes. Published for reference,
 * not licensed for reuse. The BSD licence at the root covers the engine, the
 * validator and the harness, not this file.
 *
 * Established from two independent sources: a manual reading of the original
 * production page, and a path enumeration over the extracted tree. Both give
 * 20 paths with the same distribution per result (3+3+2+2+2+6+2). Had a single
 * script produced both the tree and the oracle, a reading error would have
 * falsified both sides of the comparison identically.
 *
 * USAGE: a MIGRATION verdict, frozen, never regenerated. check.html compares
 * it to the paths it enumerates, and so does the harness.
 *
 * When the tree legitimately evolves, this file turns red. That is intended:
 * do not regenerate it. Record the change (check.html, section Update, which
 * compares the routing of two files) and decide whether it must go back to
 * legal review. A regenerated oracle proves nothing.
 *
 * Notation: rule equivalence classes (any / none), not checkbox combinations.
 * A question with six checkboxes yields two branches, "at least one" and
 * "none", because that is exactly what the routing distinguishes.
 * ========================================================================== */

var PATHS_AIGO_UNIL = [
  "q1=no → q10=no ⇒ open_data_no_personal",
  "q1=no → q10=yes ⇒ no_personal_with_secret",
  "q1=yes → q2=any → q3=no → q5=any → q6=no ⇒ sensitive_no_lrh",
  "q1=yes → q2=any → q3=no → q5=any → q6=yes ⇒ sensitive_lrh",
  "q1=yes → q2=any → q3=no → q5=none → q7=any → q8=no ⇒ delicate_low_risk",
  "q1=yes → q2=any → q3=no → q5=none → q7=any → q8=yes ⇒ personal_with_secret",
  "q1=yes → q2=any → q3=no → q5=none → q7=none → q9=no ⇒ personal_with_secret",
  "q1=yes → q2=any → q3=no → q5=none → q7=none → q9=yes → q9a=no ⇒ personal_with_secret",
  "q1=yes → q2=any → q3=no → q5=none → q7=none → q9=yes → q9a=yes ⇒ anonymized_with_secret",
  "q1=yes → q2=any → q3=yes → q4=any → q10=no ⇒ open_data_no_personal",
  "q1=yes → q2=any → q3=yes → q4=any → q10=yes ⇒ no_personal_with_secret",
  "q1=yes → q2=any → q3=yes → q4=none → q5=any → q6=no ⇒ sensitive_no_lrh",
  "q1=yes → q2=any → q3=yes → q4=none → q5=any → q6=yes ⇒ sensitive_lrh",
  "q1=yes → q2=any → q3=yes → q4=none → q5=none → q7=any → q8=no ⇒ delicate_low_risk",
  "q1=yes → q2=any → q3=yes → q4=none → q5=none → q7=any → q8=yes ⇒ personal_with_secret",
  "q1=yes → q2=any → q3=yes → q4=none → q5=none → q7=none → q9=no ⇒ personal_with_secret",
  "q1=yes → q2=any → q3=yes → q4=none → q5=none → q7=none → q9=yes → q9a=no ⇒ personal_with_secret",
  "q1=yes → q2=any → q3=yes → q4=none → q5=none → q7=none → q9=yes → q9a=yes ⇒ anonymized_with_secret",
  "q1=yes → q2=none → q10=no ⇒ open_data_no_personal",
  "q1=yes → q2=none → q10=yes ⇒ no_personal_with_secret"
];

if (typeof module !== "undefined" && module.exports) module.exports = PATHS_AIGO_UNIL;
