#!/usr/bin/env python3
"""Build html-presentation.skill and plugin/skills/ from the canonical skills/html-presentation/.

    python3 tools/package_skill.py          # build
    python3 tools/package_skill.py --check  # exit 1 if the committed outputs are out of date
"""
from __future__ import annotations

import io
import pathlib
import shutil
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
NAME = "html-presentation"
SOURCE = ROOT / "skills" / NAME
SKILL_FILE = ROOT / f"{NAME}.skill"
PLUGIN_SKILL = ROOT / "plugin" / "skills" / NAME
FIXED_DATE = (2026, 1, 1, 0, 0, 0)  # constant timestamps keep the zip byte-identical between builds


def files() -> list[pathlib.Path]:
    out = []
    for p in sorted(SOURCE.rglob("*")):
        if p.is_file() and "__pycache__" not in p.parts and p.suffix != ".pyc":
            out.append(p)
    return out


def data(p: pathlib.Path) -> bytes:
    b = p.read_bytes()
    return b.replace(b"\r\n", b"\n") if p.suffix in {".md", ".js", ".py", ".html", ".json"} else b


def skill_zip() -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for p in files():
            info = zipfile.ZipInfo(f"{NAME}/{p.relative_to(SOURCE).as_posix()}", FIXED_DATE)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (0o755 if p.suffix in {".js", ".py"} else 0o644) << 16
            z.writestr(info, data(p))
    return buf.getvalue()


def check() -> int:
    stale = []
    if not SKILL_FILE.exists() or SKILL_FILE.read_bytes() != skill_zip():
        stale.append(SKILL_FILE.name)
    src = {p.relative_to(SOURCE): data(p) for p in files()}
    dst = {p.relative_to(PLUGIN_SKILL): p.read_bytes() for p in PLUGIN_SKILL.rglob("*") if p.is_file()} if PLUGIN_SKILL.exists() else {}
    if src != dst:
        stale.append(str(PLUGIN_SKILL.relative_to(ROOT)))
    if stale:
        print("out of date: " + ", ".join(stale) + " — run: python3 tools/package_skill.py")
        return 1
    print("packaged skill and plugin are up to date")
    return 0


def build() -> None:
    SKILL_FILE.write_bytes(skill_zip())
    if PLUGIN_SKILL.exists():
        shutil.rmtree(PLUGIN_SKILL)
    for p in files():
        dest = PLUGIN_SKILL / p.relative_to(SOURCE)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data(p))
    print(SKILL_FILE.relative_to(ROOT))
    print(PLUGIN_SKILL.relative_to(ROOT))


if __name__ == "__main__":
    sys.exit(check() if "--check" in sys.argv else build() or 0)
