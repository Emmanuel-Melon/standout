import type { QueryIntent } from "./intent.types";

const HIRING_LANGUAGE = [
  '"we\'re hiring"',
  '"now hiring"',
  '"hiring for"',
  '"open role"',
  '"looking for a"',
];
const CONTACT_LANGUAGE = [
  '"email me"',
  '"email us"',
  '"DM or email"',
  '"send resume"',
  '"send CV"',
];
const BASE_FILTERS = "-is:retweet lang:en";

function buildQuery(intent: QueryIntent): string[] {
  const roleClause = intent.roles.length
    ? `(${intent.roles.map((r) => `"${r}"`).join(" OR ")})`
    : "";
  const skillClause = intent.skills.length
    ? `(${intent.skills.map((s) => `"${s}"`).join(" OR ")})`
    : "";
  const hiringClause = `(${HIRING_LANGUAGE.join(" OR ")})`;
  const contactClause = `(${CONTACT_LANGUAGE.join(" OR ")})`;

  // generate 2-3 variant queries rather than one giant AND chain,
  // since X search degrades with too many combined terms
  return [
    [hiringClause, roleClause, contactClause, BASE_FILTERS]
      .filter(Boolean)
      .join(" "),
    [hiringClause, skillClause, contactClause, BASE_FILTERS]
      .filter(Boolean)
      .join(" "),
  ];
}
