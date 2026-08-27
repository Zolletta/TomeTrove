"""Harvest writers from Wikidata and emit the author seed SQL.

Usage:

    python3 assets/db/tools/harvest.py --language it
    python3 assets/db/tools/harvest.py --all

Output goes to `assets/db/sql/author/`: data-only multi-row INSERTs, no
`CREATE TABLE`, no `author_id`. See docs/reference/author-normalization.md.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

import languages as lang_registry
import normalize

ENDPOINT = "https://query.wikidata.org/sparql"
USER_AGENT = "TomeTroveAuthorSeed/0.1 (https://github.com/Zolletta/TomeTrove)"

# Occupation: writer (Q36180) and every subclass — poet, novelist, playwright,
# essayist, screenwriter, and so on.
WRITER_OCCUPATION = "wd:Q36180"

# Languages spoken/written/signed, native language, language of work.
LANGUAGE_PROPERTIES = ("P1412", "P103", "P6886")

ROWS_PER_FILE = 5000
CHUNK = 300

QIDS_QUERY = """
SELECT DISTINCT ?p WHERE {{
  ?p wdt:P31 wd:Q5 ; wdt:P106/wdt:P279* {occupation} ; wdt:{prop} wd:{lang} .
}}
"""

DETAIL_QUERY = """
SELECT ?p ?olid ?labEn ?labLocal ?aliasEn ?aliasLocal WHERE {{
  VALUES ?p {{ {values} }}
  OPTIONAL {{ ?p wdt:P648 ?olid }}
  OPTIONAL {{ ?p rdfs:label ?labEn FILTER(lang(?labEn) = "en") }}
  OPTIONAL {{ ?p rdfs:label ?labLocal FILTER(lang(?labLocal) = "{code}") }}
  OPTIONAL {{ ?p skos:altLabel ?aliasEn FILTER(lang(?aliasEn) = "en") }}
  OPTIONAL {{ ?p skos:altLabel ?aliasLocal FILTER(lang(?aliasLocal) = "{code}") }}
}}
"""


def sparql(query: str, attempts: int = 5) -> list[dict]:
    body = urllib.parse.urlencode({"query": query}).encode()
    last: Exception | None = None
    for attempt in range(attempts):
        request = urllib.request.Request(
            ENDPOINT,
            data=body,
            headers={
                "Accept": "application/sparql-results+json",
                "User-Agent": USER_AGENT,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=180) as response:
                return json.load(response)["results"]["bindings"]
        except Exception as exc:  # noqa: BLE001 - the endpoint throttles, retry all
            last = exc
            time.sleep(5 * (attempt + 1))
    raise RuntimeError(f"SPARQL failed after {attempts} attempts: {last}")


def qid_of(binding: dict) -> str:
    return binding["value"].rsplit("/", 1)[1]


def harvest_qids(language_qid: str) -> set[str]:
    found: set[str] = set()
    for prop in LANGUAGE_PROPERTIES:
        rows = sparql(QIDS_QUERY.format(occupation=WRITER_OCCUPATION, prop=prop, lang=language_qid))
        found |= {qid_of(row["p"]) for row in rows}
        print(f"    {prop}: {len(rows)} rows, running total {len(found)}", flush=True)
    return found


def harvest_details(qids: list[str], code: str, cache: Path | None = None) -> dict[str, dict]:
    """Fetch labels, aliases and OpenLibrary ids, caching the raw result.

    The cache exists so the normalization rules can be re-run over an already
    harvested language without hitting the endpoint again.
    """
    if cache and cache.exists():
        raw = json.loads(cache.read_text(encoding="utf-8"))
        if sorted(raw) == sorted(qids):
            print(f"    details from cache {cache}", flush=True)
            return {qid: {**rec, "aliases": set(rec["aliases"])} for qid, rec in raw.items()}
    records: dict[str, dict] = {}
    for index in range(0, len(qids), CHUNK):
        chunk = qids[index : index + CHUNK]
        values = " ".join(f"wd:{qid}" for qid in chunk)
        for row in sparql(DETAIL_QUERY.format(values=values, code=code)):
            qid = qid_of(row["p"])
            record = records.setdefault(qid, {"olid": None, "label_en": None, "label_local": None, "aliases": set()})
            if "olid" in row:
                record["olid"] = row["olid"]["value"]
            if "labEn" in row:
                record["label_en"] = row["labEn"]["value"]
            if "labLocal" in row:
                record["label_local"] = row["labLocal"]["value"]
            for key in ("aliasEn", "aliasLocal"):
                if key in row:
                    record["aliases"].add(row[key]["value"])
        print(f"    details {min(index + CHUNK, len(qids))}/{len(qids)}", flush=True)
    if cache:
        cache.parent.mkdir(parents=True, exist_ok=True)
        serializable = {qid: {**rec, "aliases": sorted(rec["aliases"])} for qid, rec in records.items()}
        cache.write_text(json.dumps(serializable, ensure_ascii=False), encoding="utf-8")
    return records


def build_row(qid: str, record: dict, code: str) -> dict | None:
    """Turn one Wikidata record into the column values of an author row."""
    local = record["label_local"]
    english = record["label_en"]

    original = None
    original_language = None
    latin_source = None

    if local and not normalize.is_latin(local):
        original = local
        original_language = code
        # No Latin label means no canonical name: mechanical transliteration of
        # CJK is wrong by construction, so the record is skipped rather than
        # invented. The same applies to any script without an English label.
        latin_source = english if english and normalize.is_latin(english) else None
    else:
        latin_source = local if local and normalize.is_latin(local) else english

    if not latin_source:
        return None

    parsed = normalize.parse(latin_source, surname_first=code in normalize.SURNAME_FIRST_LANGUAGES)
    if parsed is None:
        return None

    aliases = sorted({alias for alias in record["aliases"] if alias and alias != parsed.latin})
    return {
        "surname": parsed.surname,
        "latin": parsed.latin,
        "original": original,
        "language_id": original_language,
        "aliases": aliases,
        "wikidata": qid,
        "openlibrary": record["olid"],
    }


def sql_literal(value) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, int):
        return str(value)
    escaped = value.replace("\\", "\\\\").replace("'", "''")
    return f"'{escaped}'"


COLUMNS = (
    "author_surname",
    "author_name_latin",
    "author_name_original",
    "author_original_language_id",
    "author_aliases",
    "author_wikidata_id",
    "author_openlibrary_id",
)


def write_sql(rows: list[dict], code: str, name_en: str, out_dir: Path) -> list[Path]:
    rows = sorted(rows, key=lambda row: (row["latin"], row["wikidata"]))
    written: list[Path] = []
    parts = [rows[i : i + ROWS_PER_FILE] for i in range(0, len(rows), ROWS_PER_FILE)] or [[]]
    for number, part in enumerate(parts, start=1):
        path = out_dir / f"author_{code}_{number:04d}.sql"
        with path.open("w", encoding="utf-8") as fh:
            fh.write(f"-- TomeTrove author seed: {name_en} ({code}), part {number} of {len(parts)}\n")
            fh.write("-- Generated by assets/db/tools/harvest.py from Wikidata. Do not hand-edit.\n")
            fh.write("-- Rules: docs/reference/author-normalization.md\n")
            fh.write("-- Load ../language/language_0001.sql first: author_original_language_id references it.\n")
            fh.write(f"-- Rows: {len(part)}\n\n")
            fh.write("SET NAMES utf8mb4;\n\n")
            if part:
                fh.write(f"INSERT INTO author ({', '.join(COLUMNS)}) VALUES\n")
                values = []
                for row in part:
                    values.append(
                        "  ("
                        + ", ".join(
                            (
                                sql_literal(row["surname"]),
                                sql_literal(row["latin"]),
                                sql_literal(row["original"]),
                                sql_literal(row["language_id"]),
                                sql_literal(json.dumps(row["aliases"], ensure_ascii=False)),
                                sql_literal(row["wikidata"]),
                                sql_literal(row["openlibrary"]),
                            )
                        )
                        + ")"
                    )
                fh.write(",\n".join(values) + ";\n")
        written.append(path)
    return written


def existing_wikidata_ids(out_dir: Path) -> set[str]:
    """QIDs already emitted, so a writer is never seeded twice."""
    found: set[str] = set()
    for path in sorted(out_dir.glob("author_*.sql")):
        found |= set(re.findall(r"'(Q\d+)'", path.read_text(encoding="utf-8")))
    return found


def run(codes: list[str], out_dir: Path, cache_dir: Path | None) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    for code in codes:
        entry = lang_registry.BY_CODE[code]
        _code, language_qid, name_en, _native = entry
        print(f"[{code}] {name_en}: collecting writer qids", flush=True)
        qids = harvest_qids(language_qid)
        # Regenerating a language: drop its own files first so its rows do not
        # count as "already seeded" against themselves.
        for path in out_dir.glob(f"author_{code}_*.sql"):
            path.unlink()
        already = existing_wikidata_ids(out_dir)
        fresh = sorted(qids - already)
        print(f"[{code}] {len(qids)} writers, {len(qids) - len(fresh)} already seeded elsewhere", flush=True)
        records = harvest_details(fresh, code, cache_dir / f"{code}.json" if cache_dir else None)
        rows = []
        skipped = 0
        for qid in fresh:
            record = records.get(qid)
            row = build_row(qid, record, code) if record else None
            if row is None:
                skipped += 1
                continue
            rows.append(row)
        paths = write_sql(rows, code, name_en, out_dir)
        print(f"[{code}] wrote {len(rows)} rows ({skipped} skipped) to {', '.join(p.name for p in paths)}", flush=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--language", action="append", default=[], help="ISO 639-1 code to harvest (repeatable)")
    parser.add_argument("--all", action="store_true", help="harvest every language in the registry, in registry order")
    parser.add_argument(
        "--out",
        default=str(Path(__file__).resolve().parents[1] / "sql" / "author"),
        help="output directory (default: assets/db/sql/author)",
    )
    parser.add_argument("--cache-dir", default=None, help="directory for the raw harvest cache (not committed)")
    args = parser.parse_args()

    if args.all:
        codes = [row[0] for row in lang_registry.LANGUAGES]
    elif args.language:
        codes = args.language
    else:
        parser.error("pass --language <code> or --all")
    unknown = [code for code in codes if code not in lang_registry.BY_CODE]
    if unknown:
        parser.error(f"unknown language code(s): {', '.join(unknown)}")

    run(codes, Path(args.out), Path(args.cache_dir) if args.cache_dir else None)
    return 0


if __name__ == "__main__":
    sys.exit(main())
