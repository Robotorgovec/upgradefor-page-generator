#!/usr/bin/env python3
import re
import sys
from pathlib import Path

FILES = [Path('public/assets/layout.css'), Path('site/assets/layout.css')]

rule_re = re.compile(r'(?P<selector>[^{}]+)\{(?P<body>[^{}]*)\}', re.MULTILINE)

violations = []
for file_path in FILES:
    css = file_path.read_text(encoding='utf-8')
    for m in rule_re.finditer(css):
        selector = ' '.join(m.group('selector').split())
        body = m.group('body')
        if 'position' not in body:
            continue
        if not re.search(r'position\s*:\s*(sticky|fixed)', body):
            continue
        if 'header' not in selector:
            continue
        if 'body.notifications-open header' in selector:
            continue
        violations.append(f"{file_path}: disallowed header sticky/fixed rule -> {selector}")

if violations:
    print('\n'.join(violations), file=sys.stderr)
    sys.exit(1)

print('css header guard passed')
