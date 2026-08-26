"""Author name normalization.

Implements docs/reference/author-normalization.md. The rules are the
specification; this module is only their mechanical expression.
"""

from __future__ import annotations

import re
import unicodedata

# --- rejected records (rule 8 of the disambiguation section) -----------------

REJECTED_EXACT = {
    "",
    "?",
    "??",
    "-",
    "--",
    "n/a",
    "na",
    "unknown",
    "anonymous",
    "anonimo",
    "anonyme",
    "anon",
    "anon.",
    "various",
    "various authors",
    "vari",
    "aa vv",
    "aa. vv.",
    "autori vari",
    "no author",
    "nessun autore",
    "senza autore",
    "sconosciuto",
}

# --- suffix vocabulary ------------------------------------------------------

SUFFIXES = {
    "jr": "Jr.",
    "jr.": "Jr.",
    "junior": "Jr.",
    "sr": "Sr.",
    "sr.": "Sr.",
    "senior": "Sr.",
    "ii": "II",
    "2nd": "II",
    "iii": "III",
    "3rd": "III",
    "iv": "IV",
    "4th": "IV",
    "v": "V",
    "5th": "V",
}

# Credentials and honorifics: stripped from the canonical name, kept as aliases.
CREDENTIALS = {
    "phd",
    "ph.d.",
    "ph.d",
    "md",
    "m.d.",
    "dds",
    "esq",
    "esq.",
    "mba",
    "ma",
    "m.a.",
    "ba",
    "b.a.",
    "msc",
    "m.sc.",
}

TITLES = {
    "dr",
    "dr.",
    "prof",
    "prof.",
    "professor",
    "sir",
    "dame",
    "lord",
    "lady",
    "rev",
    "rev.",
    "mr",
    "mr.",
    "mrs",
    "mrs.",
    "ms",
    "ms.",
}

# --- nobiliary and patronymic particles -------------------------------------

PARTICLES = {
    "van",
    "von",
    "de",
    "del",
    "della",
    "dello",
    "degli",
    "dei",
    "di",
    "da",
    "dal",
    "dalla",
    "dos",
    "das",
    "du",
    "des",
    "le",
    "la",
    "der",
    "den",
    "ter",
    "ten",
    "af",
    "av",
    "bin",
    "ibn",
    "bint",
    "ap",
    "ben",
    "y",
    "e",
}

PARTICLE_PREFIXES = ("al-", "el-", "ad-", "as-", "az-")

# Regnal and religious titles: "papa Clemente IX" is a regnal name, filed
# under the given name, never inverted.
REGNAL_TITLES = {
    "papa",
    "pope",
    "antipapa",
    "san",
    "santo",
    "santa",
    "saint",
    "st",
    "st.",
    "re",
    "regina",
    "king",
    "queen",
    "emperor",
    "imperatore",
    "kaiser",
    "tsar",
    "sultan",
    "duke",
    "duca",
    "conte",
    "count",
}

# Unambiguous on their own; the others need an ordinal to be read as regnal,
# because "Re" and "Conte" are also ordinary Italian surnames.
RELIGIOUS_TITLES = {"papa", "pope", "antipapa", "san", "santo", "santa", "saint", "st", "st."}

_ROMAN = re.compile(r"[IVXLCDM]+\.?", re.ASCII)

# --- corporate and institutional markers ------------------------------------

CORPORATE_MARKERS = (
    " inc",
    " inc.",
    " ltd",
    " ltd.",
    " llc",
    " gmbh",
    " s.p.a.",
    " s.r.l.",
    " & ",
    " company",
    " corporation",
    " university",
    " università",
    " universität",
    " institute",
    " istituto",
    " department",
    " dept",
    " congress",
    " association",
    " associazione",
    " museum",
    " museo",
    " society",
    " società",
    " foundation",
    " fondazione",
    " ministry",
    " ministero",
    " committee",
    " commission",
    " press",
    " publishing",
    " editore",
    " editrice",
)

# --- script detection -------------------------------------------------------

SCRIPT_RANGES = (
    ("Cyrillic", "ru"),
    ("Greek", "el"),
    ("Arabic", "ar"),
    ("Hebrew", "he"),
    ("Devanagari", "hi"),
    ("Han", "zh"),
    ("Hiragana", "ja"),
    ("Katakana", "ja"),
    ("Hangul", "ko"),
    ("Thai", "th"),
    ("Armenian", "hy"),
    ("Georgian", "ka"),
)

SURNAME_FIRST_SCRIPTS = ("Han", "Hiragana", "Katakana", "Hangul")

_WS = re.compile(r"\s+")
_PARENTHETICAL = re.compile(r"\s*[\(\[][^\)\]]*[\)\]]")


def script_of(text: str) -> str:
    """Dominant Unicode script name of ``text`` ("Latin" when Latin-script)."""
    counts: dict[str, int] = {}
    for char in text:
        if not char.isalpha():
            continue
        try:
            name = unicodedata.name(char)
        except ValueError:
            continue
        first = name.split(" ")[0]
        if first in ("HIRAGANA", "KATAKANA", "HANGUL", "CJK"):
            script = {"CJK": "Han", "HIRAGANA": "Hiragana", "KATAKANA": "Katakana", "HANGUL": "Hangul"}[first]
        else:
            script = first.capitalize()
        counts[script] = counts.get(script, 0) + 1
    if not counts:
        return "Common"
    return max(counts, key=lambda k: counts[k])


def script_language(script: str) -> str | None:
    for name, code in SCRIPT_RANGES:
        if script == name:
            return code
    return None


def is_latin(text: str) -> bool:
    return script_of(text) in ("Latin", "Common")


def strip_qualifier(label: str) -> str:
    """Drop a source disambiguator: "Michele Alboreto (calciatore)"."""
    return _WS.sub(" ", _PARENTHETICAL.sub("", label)).strip()


def _is_roman_numeral(token: str) -> bool:
    return bool(_ROMAN.fullmatch(token))


def _is_pen_name_tail(token: str) -> bool:
    """True when the last token cannot be a surname ("Wu Ming 1", "Militant A")."""
    stripped = token.strip(".")
    if not stripped:
        return True
    if not any(char.isalpha() for char in stripped):
        return True
    return len(stripped) == 1


def is_rejected(name: str) -> bool:
    cleaned = _WS.sub(" ", name).strip()
    lowered = cleaned.lower().strip(".")
    if lowered in REJECTED_EXACT or cleaned.lower() in REJECTED_EXACT:
        return True
    if not cleaned:
        return True
    if re.fullmatch(r"[^A-Za-zÀ-ÿ]+", cleaned):  # no letter at all
        return True
    letters = [c for c in cleaned if c.isalpha()]
    if len(letters) < 2:  # single letter, with or without a dot
        return True
    return False


def is_corporate(name: str) -> bool:
    lowered = " " + name.lower()
    if any(marker in lowered for marker in CORPORATE_MARKERS):
        return True
    # "United States. Congress" — a whole word ending in a dot, mid-name,
    # followed by another capitalized word. Titles ("Dr.") and initials
    # ("D.") are excluded, which is why the word must be at least 4 letters.
    tokens = name.split()
    for token, following in zip(tokens, tokens[1:]):
        if not token.endswith(".") or token.lower() in TITLES:
            continue
        if len(token) >= 5 and token[:-1].isalpha() and following[:1].isupper():
            return True
    return False


class Name:
    """A normalized author name."""

    def __init__(
        self,
        surname: str,
        given: str,
        suffix: str | None,
        corporate: bool = False,
        pen_name: str | None = None,
    ):
        self.surname = surname
        self.given = given
        self.suffix = suffix
        self.corporate = corporate
        self.pen_name = pen_name

    @property
    def latin(self) -> str:
        if self.pen_name:
            return self.pen_name
        if self.corporate or not self.given:
            return self.surname
        out = f"{self.surname}, {self.given}"
        if self.suffix:
            out += f", {self.suffix}"
        return out

    def __repr__(self) -> str:
        return f"Name(surname={self.surname!r}, given={self.given!r}, suffix={self.suffix!r})"


def _strip_titles_and_credentials(tokens: list[str]) -> tuple[list[str], list[str]]:
    dropped: list[str] = []
    while tokens and tokens[0].lower().rstrip(",") in TITLES:
        dropped.append(tokens.pop(0))
    while tokens and tokens[-1].lower().rstrip(",") in CREDENTIALS:
        dropped.append(tokens.pop())
    return tokens, dropped


def _pop_suffix(tokens: list[str]) -> tuple[list[str], str | None]:
    if len(tokens) >= 2:
        candidate = tokens[-1].lower().rstrip(",")
        # A lone "V" is far more often an initial than a generational suffix.
        if candidate in SUFFIXES and not (candidate == "v" and len(tokens) == 2):
            return tokens[:-1], SUFFIXES[candidate]
    return tokens, None


def _is_particle(token: str) -> bool:
    lowered = token.lower()
    return lowered in PARTICLES or lowered.startswith(PARTICLE_PREFIXES)


def _split_particles(tokens: list[str]) -> tuple[str, str]:
    """Return ``(given, surname)`` for a Western-order token list."""
    start = len(tokens) - 1
    while start - 1 >= 1 and _is_particle(tokens[start - 1]):
        start -= 1
    return " ".join(tokens[:start]), " ".join(tokens[start:])


def parse(name: str, surname_first: bool = False) -> Name | None:
    """Normalize a free-text personal name into a :class:`Name`.

    ``surname_first`` applies the surname-first rule used for Han, Kana and
    Hangul originals. Returns ``None`` for rejected records.
    """
    cleaned = strip_qualifier(name.replace("\u00a0", " "))
    if is_rejected(cleaned):
        return None

    if is_corporate(cleaned):
        return Name(cleaned, "", None, corporate=True)

    # Rule 2: already inverted. "King, Jr., Martin Luther" rejoins correctly.
    if "," in cleaned:
        parts = [p.strip() for p in cleaned.split(",") if p.strip()]
        suffix = None
        for part in list(parts[1:]):
            if part.lower().rstrip(".") in SUFFIXES:
                suffix = SUFFIXES[part.lower().rstrip(".")]
                parts.remove(part)
        if len(parts) >= 2:
            surname_tokens, _ = _strip_titles_and_credentials(parts[0].split())
            given_tokens, _ = _strip_titles_and_credentials(" ".join(parts[1:]).split())
            if not surname_tokens or not given_tokens:
                return None
            return Name(" ".join(surname_tokens), " ".join(given_tokens), suffix)
        cleaned = " ".join(parts)
        comma_suffix = suffix
    else:
        comma_suffix = None

    tokens = cleaned.split()
    tokens, _ = _strip_titles_and_credentials(tokens)
    tokens, suffix = _pop_suffix(tokens)
    suffix = suffix or comma_suffix
    if not tokens:
        return None

    # Rule 3: mononym.
    if len(tokens) == 1:
        return Name(tokens[0], "", suffix)

    # Regnal names — a leading regnal title, or a single name plus an ordinal —
    # keep their order and are filed under the given name: "papa Clemente IX",
    # "Louis XIV". With two or more names before the ordinal the ordinal is a
    # generational suffix instead, handled by _pop_suffix above.
    leading = tokens[0].lower()
    if leading in REGNAL_TITLES and (leading in RELIGIOUS_TITLES or _is_roman_numeral(tokens[-1])):
        return Name(tokens[1], "", suffix, pen_name=" ".join(tokens))
    if len(tokens) == 2 and _is_roman_numeral(tokens[-1]):
        return Name(tokens[0], "", suffix, pen_name=" ".join(tokens))

    # A trailing initial is a misplaced given-name initial, not a surname:
    # "Gastone Rossi D." files as "Rossi, Gastone D.".
    if len(tokens) >= 3 and _is_pen_name_tail(tokens[-1]) and tokens[-1].strip(".").isalpha():
        initial = tokens[-1] if tokens[-1].endswith(".") else f"{tokens[-1]}."
        given, surname = _split_particles(tokens[:-1])
        if given:
            return Name(surname, f"{given} {initial}", suffix)

    # Pen names whose last token is a number or a single letter are not
    # inverted: "Wu Ming 1" keeps its order, filed under its first token.
    if _is_pen_name_tail(tokens[-1]):
        return Name(tokens[0], "", suffix, pen_name=" ".join(tokens))

    if surname_first:
        return Name(tokens[0], " ".join(tokens[1:]), suffix)

    given, surname = _split_particles(tokens)
    if not given:  # every token but the last was a particle
        return Name(" ".join(tokens), "", suffix)
    return Name(surname, given, suffix)


# --- alias generation -------------------------------------------------------

MAX_GIVEN_TOKENS = 4


def _initials(tokens: list[str]) -> tuple[str, str, str]:
    letters = [t[0].upper() for t in tokens if t and t[0].isalpha()]
    spaced = " ".join(f"{c}." for c in letters)
    tight = "".join(f"{c}." for c in letters)
    bare = "".join(letters)
    return spaced, tight, bare


def aliases(name: Name) -> list[str]:
    """Generated permutations of a canonical name, canonical form excluded."""
    if name.corporate or name.pen_name or not name.given:
        return []

    given_tokens = name.given.split()
    surname = name.surname
    out: list[str] = []

    def add(*forms: str) -> None:
        for form in forms:
            form = _WS.sub(" ", form).strip().strip(",")
            if form and form != name.latin and form not in out:
                out.append(form)

    spaced, tight, bare = _initials(given_tokens)
    capped = len(given_tokens) > MAX_GIVEN_TOKENS

    def with_suffix(base: str, inverted: bool) -> list[str]:
        if not name.suffix:
            return [base]
        return [f"{base}, {name.suffix}" if inverted else f"{base} {name.suffix}", base]

    full_given = " ".join(given_tokens)
    for form in with_suffix(f"{full_given} {surname}", False):
        add(form)
    for form in with_suffix(f"{spaced} {surname}", False):
        add(form)
    add(f"{tight} {surname}", f"{bare} {surname}")
    for form in with_suffix(f"{surname}, {spaced}", True):
        add(form)
    add(f"{surname}, {tight}")
    if name.suffix:
        add(f"{surname}, {full_given}")

    if not capped and len(given_tokens) > 1:
        # First name spelled out, the rest initialed, and the first-name-only form.
        rest = " ".join(f"{t[0].upper()}." for t in given_tokens[1:] if t)
        add(f"{given_tokens[0]} {rest} {surname}", f"{surname}, {given_tokens[0]} {rest}")
        add(f"{given_tokens[0]} {surname}", f"{surname}, {given_tokens[0]}")

    # Particle-last filing form used by Dutch and Portuguese catalogues.
    surname_tokens = surname.split()
    if len(surname_tokens) > 1 and _is_particle(surname_tokens[0]):
        particles = " ".join(surname_tokens[:-1])
        add(f"{surname_tokens[-1]}, {full_given} {particles}")

    return out
