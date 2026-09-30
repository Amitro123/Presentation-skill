#!/usr/bin/env python3
"""Print the CHANGELOG.md section for a version:  python3 tools/release_notes.py v1.2.0"""
import pathlib
import re
import sys

tag = sys.argv[1]
text = (pathlib.Path(__file__).resolve().parents[1] / "CHANGELOG.md").read_text(encoding="utf-8")
m = re.search(rf"^## {re.escape(tag)}\s*\n(.*?)(?=^## |\Z)", text, re.S | re.M)
if not m or not m.group(1).strip():
    sys.exit(f"CHANGELOG.md has no section '## {tag}'")
print(m.group(1).strip())
