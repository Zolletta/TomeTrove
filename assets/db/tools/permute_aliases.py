"""Fill `author.author_aliases` with generated name permutations after load.

The seed files ship only the aliases the source provided, which keeps them
small; the permutations are computed here over the loaded rows. See
docs/reference/author-normalization.md#alias-generation.

Usage:

    python3 assets/db/tools/permute_aliases.py --dsn mysql://user:pass@host:4000/tometrove
    python3 assets/db/tools/permute_aliases.py --dsn ... --dry-run

`--dry-run` prints what would change and touches nothing. Requires PyMySQL
(`pip install pymysql`); the DSN may also be given as `TOMETROVE_DSN`.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.parse

import normalize

BATCH = 1000

SELECT_SQL = """
SELECT author_id, author_surname, author_name_latin, author_aliases
FROM author
WHERE author_id > %s
ORDER BY author_id
LIMIT %s
"""

UPDATE_SQL = "UPDATE author SET author_aliases = %s WHERE author_id = %s"


def parse_dsn(dsn: str) -> dict:
    parsed = urllib.parse.urlparse(dsn)
    if parsed.scheme not in ("mysql", "mysql+pymysql"):
        raise SystemExit(f"unsupported DSN scheme: {parsed.scheme!r} (expected mysql://)")
    return {
        "host": parsed.hostname or "127.0.0.1",
        "port": parsed.port or 4000,
        "user": urllib.parse.unquote(parsed.username or ""),
        "password": urllib.parse.unquote(parsed.password or ""),
        "database": parsed.path.lstrip("/"),
        "charset": "utf8mb4",
    }


def merged_aliases(latin: str, existing: list[str]) -> list[str]:
    """Source aliases first, then generated permutations, deduplicated."""
    parsed = normalize.parse(latin)
    generated = normalize.aliases(parsed) if parsed else []
    out: list[str] = []
    for alias in list(existing) + generated:
        if alias and alias != latin and alias not in out:
            out.append(alias)
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dsn", default=os.environ.get("TOMETROVE_DSN"), help="mysql://user:pass@host:port/db")
    parser.add_argument("--dry-run", action="store_true", help="report changes without writing")
    args = parser.parse_args()
    if not args.dsn:
        parser.error("pass --dsn or set TOMETROVE_DSN")

    try:
        import pymysql
    except ImportError:
        raise SystemExit("PyMySQL is required: pip install pymysql") from None

    connection = pymysql.connect(**parse_dsn(args.dsn))
    last_id = 0
    seen = 0
    changed = 0
    with connection:
        while True:
            with connection.cursor() as cursor:
                cursor.execute(SELECT_SQL, (last_id, BATCH))
                rows = cursor.fetchall()
            if not rows:
                break
            updates = []
            for author_id, _surname, latin, aliases_json in rows:
                last_id = author_id
                seen += 1
                existing = json.loads(aliases_json) if aliases_json else []
                aliases = merged_aliases(latin, existing)
                if aliases != existing:
                    updates.append((json.dumps(aliases, ensure_ascii=False), author_id))
            changed += len(updates)
            if updates and not args.dry_run:
                with connection.cursor() as cursor:
                    cursor.executemany(UPDATE_SQL, updates)
                connection.commit()
            print(f"  {seen} rows read, {changed} updated", flush=True)

    verb = "would update" if args.dry_run else "updated"
    print(f"{seen} authors read, {verb} {changed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
