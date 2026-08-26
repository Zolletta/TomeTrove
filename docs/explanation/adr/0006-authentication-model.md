# ADR 0006: Authentication model

- Status: Accepted
- Date: 2026-08-24

## Context

TomeTrove is "the definitive book list." While it starts as a personal app, the intent is multi-user: other people should be able to create accounts and use the app, with access scoped to TomeTrove. The authentication model must be chosen early — adding auth late is expensive because every route changes.

### Requirements

1. **Separate from the main Cloudflare management account** — TomeTrove runs on its own Cloudflare account, distinct from the author's primary account used for domain management and billing.
2. **Other people can create their own accounts** — users should not depend on the author to provision an identity for them.
3. **Accounts scoped to TomeTrove** — the authorization should be TomeTrove-specific, not a general-purpose platform identity.

### Open-source IdPs (research)

Several mature open-source identity providers exist for self-hosting (retrieved 2026-08-24):

| Project                | License    | Stack                                            | Protocols                            | Best for                                                                                  |
|------------------------|------------|--------------------------------------------------|--------------------------------------|-------------------------------------------------------------------------------------------|
| **Keycloak**           | Apache 2.0 | Java (Quarkus) + PostgreSQL                      | OIDC, OAuth 2.0, SAML 2.0, LDAP      | Enterprise SAML/LDAP, deepest customization. CNCF incubating, Red Hat backed. ~36k stars. |
| **Authentik**          | MIT (core) | Python (Django) + Go outposts + PostgreSQL/Redis | OIDC, SAML, LDAP, RADIUS, proxy auth | Homelab to SMB, modern UI, forward-auth outposts                                          |
| **Zitadel**            | AGPL-3.0   | Go single binary + PostgreSQL                    | OIDC, OAuth, SAML                    | Multi-tenant B2B SaaS, event-sourced, cloud-native                                        |
| **Authelia**           | Apache 2.0 | Go single binary + SQLite/PostgreSQL             | OIDC (certified), no SAML            | Lightweight reverse-proxy auth, minimal resources                                         |
| **Ory (Hydra/Kratos)** | Apache 2.0 | Go, headless                                     | OAuth 2.1, OIDC                      | API-first teams building their own UI                                                     |

All of these are full identity platforms — running a second application (the IdP) alongside the Worker just to authenticate users. For a learning project, that is significant infrastructure overhead (a database, updates, a second deployment). They become worthwhile if self-hosted identity is itself a learning goal, or if the app goes multi-user at scale with requirements Access cannot meet.

### Cloudflare Access (Zero Trust)

[Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies-access/) is a **policy engine that sits in front of the Worker** and requires identity before requests reach the application code. The Worker never sees an unauthenticated request; it validates a JWT in the `Cf-Access-Jwt-Assertion` header.

Access is **deny-by-default**: every request is blocked unless it matches an Allow policy. It supports **multiple identity providers simultaneously** — they appear as login options on the same Access login page. Adding an IdP later does not replace existing ones; they accumulate.

Built-in authentication methods (retrieved 2026-08-24 from `developers.cloudflare.com/cloudflare-one/integrations/identity-providers/`):

- **Cloudflare built-in IdP** — users log in with their Cloudflare account. "Restrict to account members" limits access to members of the TomeTrove CF account. Requires the admin to add users as account members — **not self-service**.
- **One-time PIN (OTP)** — the admin adds a user's email to an Access policy; the user enters their email, receives a PIN, and logs in. **Not self-service** — admin-gated by the email allowlist.
- **External IdPs** — GitHub, Google, Microsoft Entra, generic OIDC/SAML, and all the open-source IdPs above. Users authenticate with their existing account on the provider; Access still requires a policy to allow them.

Key limitation: **Access has no self-service signup.** It is an admin-managed perimeter tool, not a user-registration system. Someone must always be allowed by a policy — by specific email, email domain, or IdP group/organization membership.

### GitHub as an IdP with Cloudflare Access

GitHub can be configured as an identity provider for Access (retrieved 2026-08-24 from `developers.cloudflare.com/cloudflare-one/integrations/identity-providers/github/`):

1. Create a GitHub OAuth App (GitHub → Settings → Developer settings → OAuth Apps).
2. Set the callback URL to `https://<team-name>.cloudflareaccess.com/cdn-cgi/access/callback`.
3. Register GitHub as an IdP in Zero Trust with the OAuth App's client ID and secret.
4. Authorize Cloudflare Access to read organizations/teams (read-only) and email addresses (read-only).

When a user visits TomeTrove, they hit the Access login page, click "GitHub," and authenticate with their GitHub account. Access validates the OAuth flow and, if they match the Allow policy, lets the request through to the Worker. The Worker receives a JWT (`Cf-Access-Jwt-Assertion`) containing the user's GitHub identity (username, email).

The OAuth App is TomeTrove-specific: it shows "TomeTrove" on GitHub's authorization page, and users can revoke its access from their GitHub settings at any time. The OAuth scope is minimal (organizations/teams read-only + email read-only). The *authorization* is scoped to TomeTrove even though the *identity* is the user's GitHub identity.

### Access policy options for GitHub

Access is deny-by-default, so a policy must allow users. Options from most to least friction:

| Policy                            | Friction                               | How it works                                            |
|-----------------------------------|----------------------------------------|---------------------------------------------------------|
| Specific emails                   | High — admin adds each person manually | `Allow: Include: email = alice@x.com, bob@y.com`        |
| Email domain                      | Low — one rule covers a domain         | `Allow: Include: emails ending in @yourdomain.com`      |
| GitHub org membership             | Low — manage membership on GitHub side | `Allow: Include: GitHub organization = TomeTrove-Users` |
| Broad pattern (e.g. `@gmail.com`) | Near-zero — but very open              | `Allow: Include: emails ending in @gmail.com`           |

The **GitHub org** approach is the sweet spot: create a GitHub org (e.g. `TomeTrove-Users`), invite people or open it to self-join, and the Access policy allows anyone in that org. Roster management happens on GitHub — a tool the author already knows — rather than maintaining an email allowlist in Cloudflare. Removing someone from the org on the GitHub side revokes their access on their next login.

## Options

1. **No auth, single-user** — the app is private-by-obscurity. Simplest; fine while learning; risky if the URL leaks. Rejected: does not meet the multi-user requirement.
2. **Cloudflare Access + OTP** — admin adds emails to a policy; users get a PIN. Zero application code. Rejected: not self-service; admin-gated per email.
3. **Cloudflare Access + built-in CF IdP** — users log in with a Cloudflare account; admin adds them as account members. Rejected: requires users to create a Cloudflare account (unfamiliar, full-platform identity not scoped to TomeTrove); still admin-gated.
4. **Cloudflare Access + GitHub OAuth** — users authenticate with their GitHub account; Access policy gates who is allowed (via GitHub org, email domain, or email list). Near-zero application code; delegates credential management to GitHub; expandable with additional IdPs later. **Chosen.**
5. **Cloudflare Access + self-hosted IdP (Keycloak/Authentik)** — the IdP handles self-service signup; Access federates via OIDC. Rejected for now: running a second application (IdP + its database) is significant overhead for a learning project. Can be added later as an additional IdP without replacing GitHub.
6. **Custom auth in the Worker** — the Worker handles registration, login, sessions (in KV), password hashing, email verification. Full self-service, app-specific accounts. Rejected for now: high TS learning value but also where security mistakes happen; better suited as a second project once TS fundamentals are solid. The Worker still validates the Access JWT, so there is TS learning value in the integration layer.
7. **External auth provider as a service (Clerk/Auth0/WorkOS/Stytch)** — drop-in auth UI + user management; the Worker validates the provider's JWT. Rejected: external dependency with pricing at scale; less TS to learn since the provider does the heavy lifting; GitHub via Access covers the same needs at no cost.

## Decision

Adopt **Cloudflare Access with GitHub as the identity provider**.

Users authenticate with their existing GitHub account (or create a free one if they don't have one). Access gates who is allowed via a policy — initially a GitHub organization (`TomeTrove-Users`) or email allowlist, manageable on the GitHub side. The Worker validates the `Cf-Access-Jwt-Assertion` JWT to identify the user and maps their GitHub identity to a TomeTrove user row in TiDB.

This decision is **expandable**: additional IdPs (Google, OTP, a self-hosted Keycloak, etc.) can be added later without replacing GitHub — they appear as additional login options on the same Access page. Credential management (signup, password resets, 2FA, session security) is delegated to GitHub entirely; the Worker never sees a password.

The one accepted friction is that Access is **admin-gated by design** — someone must be allowed by a policy. This is minimized by using a GitHub organization for roster management rather than a per-email allowlist.

## Consequences

- **Positive**: near-zero auth application code — the Worker only validates a JWT and maps it to a user row; credential management (passwords, 2FA, resets, suspicious-login detection) is entirely GitHub's responsibility, which is both convenient and more secure than rolling custom auth; expandable — additional IdPs can be added later without replacing GitHub or rewriting the Worker; the OAuth authorization is TomeTrove-specific (users see "TomeTrove" on GitHub's authorization page and can revoke it independently); users use an identity they likely already have (GitHub) rather than creating a platform-specific account; the JWT validation and user-mapping code in the Worker is genuine TS learning (parsing, verifying, typing the claims) without the security risk of building auth from scratch.
- **Negative**: Access is admin-gated — there is no "anyone can sign up without approval" mode; the policy must allow users (by GitHub org, email domain, or email list), which means the author manages the roster; users without a GitHub account must create one — minor friction for non-developers; the identity is a GitHub identity, not a TomeTrove-specific account — the authorization is scoped (via the OAuth App) but the identity is shared across all GitHub OAuth apps the user has authorized; Access requires a Cloudflare Zero Trust setup on the TomeTrove account, which is one more thing to configure and maintain.
- **Neutral**: this decision does not preclude custom auth or a self-hosted IdP in the future — they can be added as additional IdPs alongside GitHub; the Worker's user-mapping logic (GitHub identity → TiDB user row) is independent of the IdP and would work with any OIDC provider Access fronts.
