"""Download the ISO reference datasets and emit the language, country and currency seed SQL.

Usage:

    python3 assets/db/tools/iso_seed.py

Sources:

- ISO 639-1 language codes and English names: the Debian iso-codes project.
- Language native names and English display names: Wikidata (P218).
- ISO 3166-1 country codes and names: the Debian iso-codes project.
- ISO 4217 currency codes, names and minor units: the SIX Financial
  list-one.xml, published by the ISO 4217 maintenance agency.

Output goes to `assets/db/sql/{language,country,currency}/`: data-only
multi-row INSERTs, no `CREATE TABLE`. Primary keys are the ISO codes
themselves (`language_id` = ISO 639-1, `country_id` = ISO 3166-1 alpha-2,
`currency_id` = ISO 4217 alpha-3). The names fixed in `languages.py` take
precedence over the downloaded ones, so a regenerated seed keeps them.
"""

from __future__ import annotations

import json
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

import languages as lang_registry

USER_AGENT = "TomeTroveIsoSeed/0.1 (https://github.com/Zolletta/TomeTrove)"

ISO_CODES_BASE = "https://salsa.debian.org/iso-codes-team/iso-codes/-/raw/main/data"
ISO_639_URL = f"{ISO_CODES_BASE}/iso_639-2.json"
ISO_3166_URL = f"{ISO_CODES_BASE}/iso_3166-1.json"
ISO_4217_URL = "https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml"

SPARQL_ENDPOINT = "https://query.wikidata.org/sparql"

# Every Wikidata item with an ISO 639-1 code, with its English label and its
# label in the language itself (the native name / autonym).
LANGUAGE_LABELS_QUERY = """
SELECT ?p ?code ?labEn ?labNative WHERE {
  ?p wdt:P218 ?code .
  OPTIONAL { ?p rdfs:label ?labEn FILTER(lang(?labEn) = "en") }
  OPTIONAL { ?p rdfs:label ?labNative FILTER(lang(?labNative) = ?code) }
}
"""


def fetch(url: str, attempts: int = 5, data: bytes | None = None, accept: str | None = None) -> bytes:
    last: Exception | None = None
    for attempt in range(attempts):
        headers = {"User-Agent": USER_AGENT}
        if accept:
            headers["Accept"] = accept
        if data is not None:
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        request = urllib.request.Request(url, data=data, headers=headers)
        try:
            with urllib.request.urlopen(request, timeout=180) as response:
                return response.read()
        except Exception as exc:  # noqa: BLE001 - transient endpoint errors, retry all
            last = exc
            time.sleep(5 * (attempt + 1))
    raise RuntimeError(f"download failed after {attempts} attempts: {url}: {last}")


def sql_literal(value: str | int | None) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, int):
        return str(value)
    escaped = value.replace("\\", "\\\\").replace("'", "''")
    return f"'{escaped}'"


def wikidata_language_labels() -> dict[str, tuple[str | None, str | None]]:
    """ISO 639-1 code -> (english label, native label) from Wikidata."""
    body = urllib.parse.urlencode({"query": LANGUAGE_LABELS_QUERY}).encode()
    raw = fetch(SPARQL_ENDPOINT, data=body, accept="application/sparql-results+json")
    bindings = json.loads(raw)["results"]["bindings"]
    by_code: dict[str, list[tuple[int, str | None, str | None]]] = {}
    for binding in bindings:
        code = binding["code"]["value"]
        qid = int(binding["p"]["value"].rsplit("/", 1)[1].lstrip("Q"))
        lab_en = binding.get("labEn", {}).get("value")
        lab_native = binding.get("labNative", {}).get("value")
        by_code.setdefault(code, []).append((qid, lab_en, lab_native))
    # A code can appear on several items; the lowest QID is the established one.
    return {code: (rows[0][1], rows[0][2]) for code, rows in ((c, sorted(r)) for c, r in by_code.items())}


def capitalized(name: str) -> str:
    return name[0].upper() + name[1:] if name and name[0].islower() else name


def build_languages() -> list[tuple[str, str, str]]:
    """(ISO 639-1 code, name_en, name_native), in code order."""
    entries = json.loads(fetch(ISO_639_URL))["639-2"]
    iso_codes = sorted({entry["alpha_2"] for entry in entries if entry.get("alpha_2")})
    iso_names = {entry["alpha_2"]: entry["name"] for entry in entries if entry.get("alpha_2")}
    labels = wikidata_language_labels()

    rows: list[tuple[str, str, str]] = []
    for code in iso_codes:
        if code in lang_registry.BY_CODE:
            _code, _qid, name_en, name_native = lang_registry.BY_CODE[code]
            rows.append((code, name_en, name_native))
            continue
        lab_en, lab_native = labels.get(code, (None, None))
        name_en = lab_en or iso_names[code]
        rows.append((code, name_en, capitalized(lab_native) if lab_native else name_en))
    return rows


def build_countries() -> list[tuple[str, str]]:
    """(alpha-2 code, english short name), in code order."""
    entries = json.loads(fetch(ISO_3166_URL))["3166-1"]
    return sorted((entry["alpha_2"], entry.get("common_name") or entry["name"]) for entry in entries)


def build_currencies() -> list[tuple[str, str, int | None]]:
    """(alpha-3 code, english name, minor units), in code order."""
    root = ET.fromstring(fetch(ISO_4217_URL))
    by_code: dict[str, tuple[str, str, int | None]] = {}
    for entry in root.iter("CcyNtry"):
        code = entry.findtext("Ccy")
        name_node = entry.find("CcyNm")
        if code is None or name_node is None or name_node.text is None:
            continue  # "no universal currency" territories
        if name_node.get("IsFund"):
            continue  # funds share their currency's code
        minor = entry.findtext("CcyMnrUnts")
        units = int(minor) if minor and minor.isdigit() else None
        by_code.setdefault(code, (code, name_node.text.strip(), units))
    return [by_code[code] for code in sorted(by_code)]


def write_seed(path: Path, table: str, standard: str, columns: tuple[str, ...], rows: list[tuple], notes: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        fh.write(f"-- TomeTrove {table} seed: {standard}, part 1 of 1\n")
        fh.write("-- Generated by assets/db/tools/iso_seed.py. Do not hand-edit.\n")
        for note in notes:
            fh.write(f"-- {note}\n")
        fh.write(f"-- Rows: {len(rows)}\n\n")
        fh.write("SET NAMES utf8mb4;\n\n")
        fh.write(f"INSERT INTO {table} ({', '.join(columns)}) VALUES\n")
        fh.write(",\n".join("  (" + ", ".join(sql_literal(value) for value in row) + ")" for row in rows) + ";\n")


def main() -> int:
    sql_dir = Path(__file__).resolve().parents[1] / "sql"

    languages = build_languages()
    write_seed(
        sql_dir / "language" / "language_0001.sql",
        "language",
        "ISO 639-1",
        ("language_id", "language_name_en", "language_name_native"),
        languages,
        [
            "language_id is the ISO 639-1 code, referenced verbatim by the author",
            "seed files. Codes and English names from the Debian iso-codes project,",
            "native names from Wikidata; the names fixed in",
            "assets/db/tools/languages.py take precedence. In code order.",
        ],
    )
    print(f"language: {len(languages)} rows", flush=True)

    countries = build_countries()
    write_seed(
        sql_dir / "country" / "country_0001.sql",
        "country",
        "ISO 3166-1 alpha-2",
        ("country_id", "country_name_en"),
        countries,
        ["country_id is the officially assigned alpha-2 code. Codes and names", "from the Debian iso-codes project. In code order."],
    )
    print(f"country: {len(countries)} rows", flush=True)

    currencies = build_currencies()
    write_seed(
        sql_dir / "currency" / "currency_0001.sql",
        "currency",
        "ISO 4217",
        ("currency_id", "currency_name_en", "currency_minor_units"),
        currencies,
        [
            "currency_id is the alpha-3 code. Active currencies from the SIX",
            "list-one.xml (ISO 4217 maintenance agency), funds excluded, in code",
            "order. Minor units NULL where the standard lists N.A.",
        ],
    )
    print(f"currency: {len(currencies)} rows", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
