"""Create local web assets from the user-supplied brand archive, without network access."""

from copy import deepcopy
from io import BytesIO
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET
from zipfile import ZipFile

from fontTools.ttLib import TTFont

SVG = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG)
PROJECT = Path(__file__).resolve().parents[1]


def tag(name):
    return f"{{{SVG}}}{name}"


def only_match(archive, suffix):
    matches = [name for name in archive.namelist() if name.endswith(suffix)]
    if len(matches) != 1:
        raise ValueError(f"Expected one asset ending in {suffix}, found {len(matches)}")
    return archive.read(matches[0])


def write_svg(destination, root):
    for node in root.iter():
        node.tail = None
        if node.tag != tag("title"):
            node.text = None
    destination.write_bytes(ET.tostring(root, encoding="utf-8", xml_declaration=True))


def main():
    target = PROJECT / "public" / "brand"
    fonts_path = PROJECT / "public" / "fonts" / "poppins"
    target.mkdir(parents=True, exist_ok=True)
    fonts_path.mkdir(parents=True, exist_ok=True)
    with ZipFile(sys.argv[1]) as archive:
        source = ET.fromstring(only_match(archive, "/Horizontal.svg"))
        allowed = {tag(name) for name in ["svg", "style", "g", "rect", "path"]}
        for node in source.iter():
            if node.tag not in allowed or any(key.lower().startswith("on") or "href" in key.lower() for key in node.attrib):
                raise ValueError("Unexpected active SVG content; manual review required.")
        logo = source.find(tag("g"))
        if logo is None:
            raise ValueError("The original logo group is missing.")
        for node in logo.iter():
            node.attrib.pop("class", None)
            node.attrib.pop("style", None)
        for variant, color in [("dark", "#1b1e27"), ("light", "#ffffff"), ("blue", "#24408c")]:
            root = ET.Element(tag("svg"), {"viewBox": "188 244 424 122", "fill": color})
            root.append(deepcopy(logo))
            write_svg(target / f"zarabi-{variant}.svg", root)
        mark = logo.find(f".//{tag('path')}")
        if mark is None:
            raise ValueError("The official monogram path is missing.")
        geometry = {"viewBox": "188 244 129 122", "path": mark.attrib["d"]}
        (PROJECT / "src" / "brand-mark.json").write_text(json.dumps(geometry, indent=2) + "\n")
        icon = ET.Element(tag("svg"), {"viewBox": "0 0 64 64"})
        ET.SubElement(icon, tag("rect"), {"width": "64", "height": "64", "rx": "12", "fill": "#1b1e27"})
        inset = ET.SubElement(icon, tag("svg"), {"x": "9", "y": "9", "width": "46", "height": "46", "viewBox": geometry["viewBox"], "fill": "#ffffff"})
        inset.append(deepcopy(mark))
        write_svg(PROJECT / "public" / "favicon.svg", icon)
        with ZipFile(BytesIO(only_match(archive, "/poppins.zip"))) as fonts:
            for weight in ["Regular", "Medium", "SemiBold"]:
                font = TTFont(BytesIO(fonts.read(f"Poppins-{weight}.otf")))
                font.flavor = "woff2"
                font.save(fonts_path / f"poppins-{weight.lower()}.woff2")
            (fonts_path / "OFL.txt").write_bytes(fonts.read("SIL Open Font License.txt"))
    print("Prepared official dark/light/blue vector logos, monogram, favicon and three licensed Poppins webfonts.")


if __name__ == "__main__":
    main()
