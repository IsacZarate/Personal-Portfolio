"""Verify public resume consistency, basic PDF accessibility, and privacy.

Requires pypdf; layout and assistive-technology review remain manual checks.
Never place the private original or excluded contact values in this script.
"""
import json
import re
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent


def normalize(value):
    return re.sub(r"\s+", " ", value.replace("\u2013", " - ").replace("\u2014", " - ")).strip()


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)
    elif isinstance(value, dict):
        for key, item in value.items():
            if key not in {"reviewedAt", "website"}:
                yield from strings(item)


def main():
    data = json.loads((ROOT / "src/data/resume.json").read_text(encoding="utf-8"))
    reader = PdfReader(ROOT / "public/resume/isac-zarate-resume.pdf")
    pdf_text = normalize(" ".join(page.extract_text() or "" for page in reader.pages))
    catalog = reader.trailer["/Root"]
    assert catalog.get("/StructTreeRoot"), "PDF lacks structure tags"
    assert catalog.get("/MarkInfo").get_object().get("/Marked"), "PDF is not marked as tagged"
    assert str(catalog.get("/Lang", "")).lower().startswith("en"), "PDF lacks English document language"
    assert reader.metadata.get("/Title") == data["name"] + " Resume", "PDF lacks a descriptive title"
    assert not reader.metadata.get("/Author"), "Private PDF author metadata must be absent"
    links = {(annotation.get_object().get("/A") or {}).get("/URI") for page in reader.pages for annotation in page.get("/Annots", [])}
    assert "mailto:" + data["email"] in links, "PDF email link is missing"
    assert data["website"].rstrip("/") + "/" in links, "PDF portfolio link is missing"

    with ZipFile(ROOT / "docs/resume/isac-zarate-resume.docx") as archive:
        xml = ET.fromstring(archive.read("word/document.xml"))
        docx_text = normalize(" ".join(node.text or "" for node in xml.iter() if node.tag.endswith("}t")))
        core = ET.fromstring(archive.read("docProps/core.xml"))
        for property_name in ("creator", "lastModifiedBy"):
            assert all(not node.text for node in core.iter() if node.tag.endswith("}" + property_name)), "Private DOCX metadata must be absent"
        assert "word/comments.xml" not in archive.namelist(), "Public document must not contain comments"
        assert not any(node.tag.endswith("}del") or node.tag.endswith("}ins") for node in xml.iter()), "Public document must not contain revision history"

    for expected in strings(data):
        assert normalize(expected) in pdf_text, "PDF is missing a sourced fact: " + expected
        assert normalize(expected) in docx_text, "DOCX is missing a sourced fact: " + expected

    public_text = pdf_text + " " + docx_text + " " + json.dumps(data) + " " + str(reader.metadata)
    assert not re.search(r"\b(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b", public_text), "Phone-like text must not be published"
    assert not re.search(r"\b\d{1,6}\s+(?:[\w.'-]+\s+){1,4}(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr)\b", public_text, re.I), "Postal-address-like text must not be published"
    print(f"Public resume verification passed: {len(reader.pages)} page(s), matching facts, tags, language, links, and privacy.")


if __name__ == "__main__":
    main()
