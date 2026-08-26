# Privacy Policy

TomeTrove stores the minimum data needed to authenticate you and manage your book collection. No email address, name, or profile information from GitHub is stored.

## Data we store

- **GitHub User ID** (numeric) — used solely for authentication via OAuth.
- **Book collection** — your wish list, including which books you track and whether you monitor them for price alerts.
- **Reading preferences** — the languages you can read, with optional constraints by [editorial Type](https://tometrove.app/reference/ontology/).
- **Account preferences** — your country (ISO 3166-1), preferred currency (ISO 4217), accepted book formats (physical, used physical, ebooks), and alert threshold.
- **Price history** — price quotes fetched on your behalf, linked to your account.
- **Shared lists** — any public lists you create, with their filter settings and share tokens.

## What we do not store

- No GitHub email, username, or profile data.
- No payment information — TomeTrove does not process transactions.
- No tracking cookies or third-party analytics.

## Infrastructure

The application is hosted on Cloudflare Serverless services. Data is stored in a TiDB Cloud database (EU Region).

## Third parties

No data is sold, shared, or used for commercial profiling. The only third party with access to the data is the hosting provider (TiDB Cloud, EU Region) acting as a data processor.

## Your rights under GDPR

TomeTrove is not a business, but we voluntarily comply with the principles of the [General Data Protection Regulation (GDPR)](https://eur-lex.europa.eu/eli/reg/2016/679/oj):

- **Right to access (Art. 15):** you can view all your data in the app at any time.
- **Right to data portability (Art. 20):** you can export all your data in JSON format from the personal area.
- **Right to erasure (Art. 17):** you can delete your account and all associated data by clicking "Delete this account" in the personal area. Deletion is physical — all rows referencing your account are permanently removed from the database. This action is irreversible.

Shared catalog data (books, authors, stores, consolidated price history) is not personal data — it is anonymous and may be retained after account deletion.
