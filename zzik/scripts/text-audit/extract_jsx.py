#!/usr/bin/env python3
"""Extract JSX text nodes from ripgrep output"""
import sys
import csv
import re

w = csv.writer(sys.stdout)
for line in sys.stdin:
    try:
        parts = line.strip().split(":", 2)
        if len(parts) < 3:
            continue
        path, lineno, rest = parts

        # Extract JSX text: >text<
        matches = re.findall(r'>([^<>\n]{2,})<', rest)
        for s in matches:
            s = s.strip()
            # Skip template variables
            if re.fullmatch(r"[{][^}]+[}]", s):
                continue
            if re.fullmatch(r"[A-Za-z0-9_.:/\\-]{2,}", s):
                continue
            if len(s) < 2:
                continue
            w.writerow([path, lineno, "jsx", s, len(s)])
    except Exception:
        pass
