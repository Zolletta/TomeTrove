# Set up GitHub OAuth

TomeTrove signs users in with GitHub OAuth, run by the Worker itself (`/auth/github/login` and `/auth/github/callback`), and keeps the session in an HS256 JWT cookie. This guide creates the two OAuth apps (production and localhost) and configures the Worker secrets. The rationale supersedes [ADR 0006](../explanation/adr/0006-authentication-model.md); TODO: link the new ADR from [#47](https://github.com/Zolletta/TomeTrove/issues/47).

GitHub OAuth apps accept a single callback URL, so production and local development each need their own app.

## Create the OAuth apps

1. Open [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers) and select **New OAuth App**.
2. Fill in the form for each environment:

    | Field                      | Production                                         | Localhost                                     |
    |----------------------------|----------------------------------------------------|-----------------------------------------------|
    | Application name           | `TomeTrove`                                        | `TomeTrove (localhost)`                       |
    | Homepage URL               | `https://tometrove.zolletta.org`                   | `http://localhost:8787`                       |
    | Authorization callback URL | `https://tometrove.zolletta.org/auth/github/callback` | `http://localhost:8787/auth/github/callback` |

3. Leave **Enable Device Flow** unchecked and select **Register application**.
4. Copy the **Client ID**, then select **Generate a new client secret** and copy the secret. GitHub shows it only once.

The callback URL is always `<APP_URL>/auth/github/callback`. The Worker requests only the `read:user` scope and stores only the numeric GitHub user ID ([PRIVACY.md](https://github.com/Zolletta/TomeTrove/blob/main/PRIVACY.md)).

## Apply the production migration

Sign-in writes to the `user` table, so `tometrove_production` needs the migrations in `drizzle/` before the first production login. `GET /api/health` does not check the database, so a missing table shows up only as a failed callback. After the migration has been verified on `tometrove_staging`, export `TIDB_HOST`, `TIDB_PORT`, `TIDB_USER` and `TIDB_PASSWORD`, then run:

```bash
TIDB_DATABASE=tometrove_production npx drizzle-kit migrate
```

## Configure production secrets

`ENVIRONMENT` and `APP_URL` are plain variables in `wrangler.jsonc`. Set the four secrets with Wrangler, pasting each value at the prompt:

```bash
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put JWT_SECRET
npx wrangler secret put DATABASE_URL
```

- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` come from the production OAuth app.
- `JWT_SECRET` is a random 32-byte hex string: generate it with `openssl rand -hex 32`. Changing it signs out every user.
- `DATABASE_URL` is the TiDB Cloud connection string for `tometrove_production`, in the form `mysql://<user>:<password>@<host>/tometrove_production`.

## Configure local development

1. Copy the example file: `cp .dev.vars.example .dev.vars`. `.dev.vars` is ignored by Git.
2. Fill in the client ID and secret of the localhost OAuth app, a separate `JWT_SECRET` from `openssl rand -hex 32`, and a `DATABASE_URL` that points to `tometrove_staging`.
3. Start the Worker with `npm run dev` and open `http://localhost:8787/auth/github/login`.

After GitHub redirects back, the Worker creates or updates the `user` row in `tometrove_staging`, sets the `tometrove_session` cookie and redirects to `/`. `http://localhost:8787/api/user/me` then returns the internal `user_id` and the `user_github_id`.

> [!NOTE]
> Automated tests never call GitHub or TiDB: they mock GitHub and use an in-memory user repository. Use the localhost app to test the real flow.
