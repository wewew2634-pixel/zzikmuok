#!/usr/bin/env python3
"""Extract quoted strings from ripgrep output"""
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

        # Extract all quoted strings
        strings = []
        strings.extend(re.findall(r'"([^"]{2,})"', rest))
        strings.extend(re.findall(r"'([^']{2,})'", rest))
        strings.extend(re.findall(r'`([^`]{2,})`', rest))

        for s in strings:
            # Filter out code-like paths
            if re.fullmatch(r"[A-Za-z0-9_.:/\\-]{2,}", s):
                continue
            if len(s.strip()) < 2:
                continue
            w.writerow([path, lineno, "quoted", s, len(s)])
    except Exception:
        pass
