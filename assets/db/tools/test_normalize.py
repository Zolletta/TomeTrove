"""Checks the normalizer against the examples in the normalization reference.

Run: python3 assets/db/tools/test_normalize.py
"""

from __future__ import annotations

import sys

import normalize

CASES: list[tuple[str, str, str]] = [
    # input, expected surname, expected author_name_latin
    ("Poe, Edgar Allan", "Poe", "Poe, Edgar Allan"),
    ("Homer", "Homer", "Homer"),
    ("Voltaire", "Voltaire", "Voltaire"),
    ("Craig S. Farmer", "Farmer", "Farmer, Craig S."),
    ("J. R. R. Tolkien", "Tolkien", "Tolkien, J. R. R."),
    ("Italo Calvino", "Calvino", "Calvino, Italo"),
    ("Martin Luther King Jr.", "King", "King, Martin Luther, Jr."),
    ("Martin Luther King Jr", "King", "King, Martin Luther, Jr."),
    ("John D. Rockefeller, Sr.", "Rockefeller", "Rockefeller, John D., Sr."),
    ("Henry Ford III", "Ford", "Ford, Henry, III"),
    ("Henry Ford 3rd", "Ford", "Ford, Henry, III"),
    ("King, Jr., Martin Luther", "King", "King, Martin Luther, Jr."),
    ("Vincent van Gogh", "van Gogh", "van Gogh, Vincent"),
    ("Ludwig von Mises", "von Mises", "von Mises, Ludwig"),
    ("Eduardo De Filippo", "De Filippo", "De Filippo, Eduardo"),
    ("Ernesto Di Napoli", "Di Napoli", "Di Napoli, Ernesto"),
    ("Sor Juana Inés de la Cruz", "de la Cruz", "de la Cruz, Sor Juana Inés"),
    ("Leonardo da Vinci", "da Vinci", "da Vinci, Leonardo"),
    ("Gabriele d'Annunzio", "d'Annunzio", "d'Annunzio, Gabriele"),
    ("Dr. Jane Goodall", "Goodall", "Goodall, Jane"),
    ("Jane Smith PhD", "Smith", "Smith, Jane"),
    ("Michele Alboreto (calciatore)", "Alboreto", "Alboreto, Michele"),
    ("Aurel Cosma (junior)", "Cosma", "Cosma, Aurel"),
    ("Wu Ming 1", "Wu", "Wu Ming 1"),
    ("papa Clemente IX", "Clemente", "papa Clemente IX"),
    ("Papa Giovanni Paolo I", "Giovanni", "Papa Giovanni Paolo I"),
    ("Louis XIV", "Louis", "Louis XIV"),
    ("Bernardino Re", "Re", "Re, Bernardino"),
    ("Gastone Rossi D.", "Rossi", "Rossi, Gastone D."),
    ("Militant A", "Militant", "Militant A"),
    ("United States. Congress", "United States. Congress", "United States. Congress"),
    ("Walt Disney Company", "Walt Disney Company", "Walt Disney Company"),
]

REJECTED = ["", "?", "Unknown", "anonymous", "Various", "n/a", "X", "1234", "AA. VV."]

ALIAS_CASES: dict[str, list[str]] = {
    "Poe, Edgar Allan": [
        "Edgar Allan Poe",
        "E. A. Poe",
        "E.A. Poe",
        "EA Poe",
        "Poe, E. A.",
        "Poe, E.A.",
        "Edgar A. Poe",
        "Poe, Edgar A.",
        "Edgar Poe",
        "Poe, Edgar",
    ],
    "Martin Luther King Jr.": [
        "Martin Luther King Jr.",
        "Martin Luther King",
        "King, Martin Luther",
        "M. L. King Jr.",
    ],
    "Vincent van Gogh": ["Vincent van Gogh", "V. van Gogh", "Gogh, Vincent van"],
    "Homer": [],
    "Wu Ming 1": [],
    "Walt Disney Company": [],
}

SCRIPT_CASES = [("Толстой, Лев", "Cyrillic", "ru"), ("Καζαντζάκης", "Greek", "el"), ("三島 由紀夫", "Han", "zh"), ("Italo Calvino", "Latin", None)]

failures: list[str] = []

for raw, surname, latin in CASES:
    parsed = normalize.parse(raw)
    if parsed is None:
        failures.append(f"{raw!r}: rejected, expected {latin!r}")
        continue
    if parsed.surname != surname or parsed.latin != latin:
        failures.append(f"{raw!r}: got surname={parsed.surname!r} latin={parsed.latin!r}, expected {surname!r} / {latin!r}")

for raw in REJECTED:
    if normalize.parse(raw) is not None:
        failures.append(f"{raw!r}: accepted, expected rejection")

for raw, expected in ALIAS_CASES.items():
    parsed = normalize.parse(raw)
    got = normalize.aliases(parsed) if parsed else []
    missing = [alias for alias in expected if alias not in got]
    if missing:
        failures.append(f"{raw!r}: missing aliases {missing} (got {got})")
    if not expected and got:
        failures.append(f"{raw!r}: expected no aliases, got {got}")
    if parsed and parsed.latin in got:
        failures.append(f"{raw!r}: canonical form present in aliases")

for raw, script, language in SCRIPT_CASES:
    got_script = normalize.script_of(raw)
    got_language = normalize.script_language(got_script)
    if got_script != script or got_language != language:
        failures.append(f"{raw!r}: got script={got_script!r} language={got_language!r}, expected {script!r} / {language!r}")

# Surname-first (Han/Kana/Hangul originals, applied to the Latin label).
mishima = normalize.parse("Yukio Mishima")
if mishima is None or mishima.latin != "Mishima, Yukio":
    failures.append(f"'Yukio Mishima': got {mishima!r}")

if failures:
    print(f"{len(failures)} failure(s):")
    for line in failures:
        print(f"  - {line}")
    sys.exit(1)

print(f"ok: {len(CASES)} name cases, {len(REJECTED)} rejections, {len(ALIAS_CASES)} alias cases, {len(SCRIPT_CASES)} script cases")
