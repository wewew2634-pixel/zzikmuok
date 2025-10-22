#!/usr/bin/env python3
"""Merge and deduplicate text extraction CSVs"""
import csv
import sys
import os

rows = []
seen = set()

for f in ("tmp/quoted.csv", "tmp/jsx.csv"):
    if not os.path.exists(f):
        continue
    try:
        with open(f, newline='', encoding='utf-8') as r:
            for row in csv.reader(r):
                if len(row) < 5:
                    continue
                key = tuple(row[:4])  # file,line,type,text
                if key in seen:
                    continue
                seen.add(key)
                rows.append(row)
    except Exception:
        pass

# Sort by file, line, type
rows.sort(key=lambda x: (x[0], int(x[1]), x[2]))

w = csv.writer(sys.stdout)
w.writerow(["file", "line", "type", "text", "length"])
w.writerows(rows)
