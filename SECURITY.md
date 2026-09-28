# Security policy

## Supported version

Security fixes are applied to the latest version on the default branch.

## Reporting a vulnerability

Do not publish exploitable details, credentials, account data, or private health information in a public issue. Contact the repository owner privately through their GitHub profile and include the affected route or component, reproduction steps, impact, and a suggested fix if available.

## Secret handling

Real `.env` files, Firebase Admin keys, Gemini keys, SMTP app passwords, JWT secrets, database URLs, SQLite files, uploaded photos, and session data must remain outside version control. Use `.env.example` only as a list of variable names and safe placeholders. Store production secrets in the deployment platform's encrypted environment settings and rotate any credential that is accidentally exposed.

Before publishing changes, run a secret scan and inspect `git status` to confirm that runtime data and generated artifacts are not staged.
