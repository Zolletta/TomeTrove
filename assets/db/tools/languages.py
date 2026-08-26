"""The language registry used to batch the author seed.

`language_id` values are fixed here and reused by the temporary language seed
(`assets/db/sql/author/0000_language_seed_tmp.sql`) and by every author file,
so a regenerated seed produces the same keys.

Batch order matters: a writer working in several languages is emitted once, in
the batch of the first language of this list that claims them.
"""

from __future__ import annotations

# (language_id, ISO 639-1, Wikidata item, English name, native name)
LANGUAGES: list[tuple[int, str, str, str, str]] = [
    (1, "it", "Q652", "Italian", "Italiano"),
    (2, "en", "Q1860", "English", "English"),
    (3, "fr", "Q150", "French", "Français"),
    (4, "de", "Q188", "German", "Deutsch"),
    (5, "es", "Q1321", "Spanish", "Español"),
    (6, "pt", "Q5146", "Portuguese", "Português"),
    (7, "ru", "Q7737", "Russian", "Русский"),
    (8, "nl", "Q7411", "Dutch", "Nederlands"),
    (9, "pl", "Q809", "Polish", "Polski"),
    (10, "sv", "Q9027", "Swedish", "Svenska"),
    (11, "da", "Q9035", "Danish", "Dansk"),
    (12, "no", "Q9043", "Norwegian", "Norsk"),
    (13, "fi", "Q1412", "Finnish", "Suomi"),
    (14, "cs", "Q9056", "Czech", "Čeština"),
    (15, "hu", "Q9067", "Hungarian", "Magyar"),
    (16, "ro", "Q7913", "Romanian", "Română"),
    (17, "el", "Q9129", "Greek", "Ελληνικά"),
    (18, "tr", "Q256", "Turkish", "Türkçe"),
    (19, "ar", "Q13955", "Arabic", "العربية"),
    (20, "he", "Q9288", "Hebrew", "עברית"),
    (21, "fa", "Q9168", "Persian", "فارسی"),
    (22, "hi", "Q1568", "Hindi", "हिन्दी"),
    (23, "bn", "Q9610", "Bengali", "বাংলা"),
    (24, "ja", "Q5287", "Japanese", "日本語"),
    (25, "zh", "Q7850", "Chinese", "中文"),
    (26, "ko", "Q9176", "Korean", "한국어"),
    (27, "uk", "Q8798", "Ukrainian", "Українська"),
    (28, "ca", "Q7026", "Catalan", "Català"),
    (29, "sr", "Q9299", "Serbian", "Српски"),
    (30, "hr", "Q6654", "Croatian", "Hrvatski"),
    (31, "bg", "Q7918", "Bulgarian", "Български"),
    (32, "sk", "Q9058", "Slovak", "Slovenčina"),
    (33, "sl", "Q9063", "Slovene", "Slovenščina"),
    (34, "et", "Q9072", "Estonian", "Eesti"),
    (35, "lv", "Q9078", "Latvian", "Latviešu"),
    (36, "lt", "Q9083", "Lithuanian", "Lietuvių"),
    (37, "is", "Q294", "Icelandic", "Íslenska"),
    (38, "ga", "Q9142", "Irish", "Gaeilge"),
    (39, "eu", "Q8752", "Basque", "Euskara"),
    (40, "gl", "Q9307", "Galician", "Galego"),
    (41, "la", "Q397", "Latin", "Latina"),
    (42, "vi", "Q9199", "Vietnamese", "Tiếng Việt"),
    (43, "th", "Q9217", "Thai", "ไทย"),
    (44, "id", "Q9240", "Indonesian", "Bahasa Indonesia"),
    (45, "ms", "Q9237", "Malay", "Bahasa Melayu"),
    (46, "ta", "Q5885", "Tamil", "தமிழ்"),
    (47, "ur", "Q1617", "Urdu", "اردو"),
    (48, "af", "Q14196", "Afrikaans", "Afrikaans"),
    (49, "sw", "Q7838", "Swahili", "Kiswahili"),
    (50, "hy", "Q8785", "Armenian", "Հայերեն"),
    (51, "ka", "Q8108", "Georgian", "ქართული"),
    (52, "yi", "Q8641", "Yiddish", "ייִדיש"),
    (53, "eo", "Q143", "Esperanto", "Esperanto"),
]

BY_CODE = {code: row for row in LANGUAGES for code in (row[1],)}


def language_id(code: str) -> int:
    return BY_CODE[code][0]
