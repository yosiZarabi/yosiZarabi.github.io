"""Import approved copy from the supplied local DOCX; no network access."""

import json
import sys
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def main():
    source = Path(sys.argv[1])
    destination = Path(__file__).resolve().parents[1] / "src" / "brief.json"
    with ZipFile(source) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
    paragraphs = {
        i: "".join(node.text or "" for node in paragraph.findall(".//w:t", NS)).strip()
        for i, paragraph in enumerate(root.findall(".//w:p", NS), 1)
    }

    def text(index):
        value = paragraphs[index]
        if not value:
            raise ValueError(f"Expected source copy at paragraph {index}")
        return value

    def group(*indices):
        return [text(index) for index in indices]

    def practice(title, intro, start, end):
        return {"title": text(title), "intro": text(intro), "services": group(*range(start, end + 1))}

    if text(2) != "זרבי ושות' - משרד עורכי דין":
        raise ValueError("The source layout has changed; review paragraph mappings.")

    data = {
        "he": {
            "seo": {
                "home": group(19, 21), "about": group(105, 107),
                "practice": group(166, 168), "contact": group(305, 307),
            },
            "hero": {"headline": text(26), "description": text(28), "cta": text(30)},
            "intro": group(33, 34),
            "summaries": group(39, 40, 41, 42, 43, 44),
            "why": group(48, 49, 50, 51),
            "clients": text(55),
            "closing": group(58, 59),
            "about": [
                text(110).replace("נוסד [בשנת 2022 מתוך", "נוסד מתוך"),
                *group(111, 112),
            ],
            "approach": [
                group(116, 117), group(118, 119), group(120, 121), group(122, 123),
            ],
            "founder": group(127, 128, 129),
            "quote": text(130).strip('"'),
            "practiceIntro": text(172),
            "practices": [
                practice(174, 175, 176, 182), practice(184, 185, 186, 191),
                practice(193, 194, 195, 200), practice(202, 203, 204, 209),
                practice(211, 212, 213, 216), practice(218, 219, 220, 223),
                practice(225, 226, 227, 230),
            ],
            "practiceClosing": text(232).split("[")[0].strip(),
            "contactIntro": text(312),
            "contactNote": text(336),
            "disclaimer": text(378),
        },
        "en": {
            "seo": {
                "home": group(64, 66), "about": group(137, 139),
                "practice": group(236, 238), "contact": group(340, 342),
            },
            "hero": {"headline": text(70), "description": text(72), "cta": text(74)},
            "intro": group(77, 78),
            "summaries": group(82, 83, 84, 85, 86, 87),
            "why": group(90, 91, 92, 93),
            "clients": text(96),
            "closing": group(99, 100),
            "about": [
                text(142).replace("was founded in 2022", "was founded"),
                *group(143, 144),
            ],
            "approach": [
                group(147, 148), group(149, 150), group(151, 152), group(153, 154),
            ],
            "founder": group(157, 158, 159),
            "quote": text(160).strip('"'),
            "practiceIntro": text(241),
            "practices": [
                practice(243, 244, 245, 251), practice(253, 254, 255, 260),
                practice(262, 263, 264, 269), practice(271, 272, 273, 278),
                practice(280, 281, 282, 285), practice(287, 288, 289, 292),
                practice(294, 295, 296, 299),
            ],
            "practiceClosing": text(301).split("[")[0].strip(),
            "contactIntro": text(346),
            "contactNote": text(369),
            "disclaimer": text(382),
        },
    }
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"Imported Hebrew and English copy; 7 practice areas per language: {destination}")


if __name__ == "__main__":
    main()
