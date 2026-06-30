# Third-Party Dependency Licenses

Licenses of the Python packages required by Dr-CiK (the released method + public
benchmark sample). Versions reflect the pins in `requirements.txt`. License
values are taken from each package's distribution metadata; for a formal audit,
confirm against the upstream project's `LICENSE` file.

All dependencies are permissive and OSI-approved (BSD / MIT / Apache-2.0 / PSF,
plus tqdm's MPL-2.0-or-MIT). None are strong copyleft (no GPL/LGPL/AGPL), so the
release carries no source-disclosure obligation.

## Core (installed by default)

| Package | Version | License |
|---------|---------|---------|
| numpy | 1.26.4 | BSD-3-Clause |
| openai | 2.33.0 | Apache-2.0 |
| pandas | 3.0.2 | BSD-3-Clause |
| requests | 2.32.5 | Apache-2.0 |
| tqdm | 4.67.1 | MPL-2.0 AND MIT (dual-licensed) |
| datasets | 2.17.1 | Apache-2.0 |
| matplotlib | 3.10.6 | Matplotlib License (PSF-based, BSD-style permissive) |
| psutil | 7.1.0 | BSD-3-Clause |

## Optional — Moirai (uni2ts) backend

Installed only when running the Moirai agent backend.

| Package | Version | License |
|---------|---------|---------|
| flask | 3.1.2 | BSD-3-Clause |
| gluonts | 0.14.4 | Apache-2.0 |
| mcp | 1.16.0 | MIT |
| scipy | 1.11.4 | BSD-3-Clause |
| pytz | 2025.2 | MIT |
| torch | 2.4.1 | BSD-3-Clause (BSD-style) |
| uni2ts | 2.0.0 | Apache-2.0 |

## Compliance notes

- **Attribution**: when redistributing, retain each project's copyright and
  license text.
- **Apache-2.0** packages (openai, requests, datasets, gluonts, uni2ts) also
  require preserving any upstream `NOTICE` file and stating significant changes.
- **tqdm** is dual-licensed; the MIT terms may be relied upon, making MPL-2.0's
  file-level copyleft inapplicable.
- **matplotlib**'s custom license is PSF/BSD-style and DFSG-compatible
  (attribution only).
- Vendored Moirai *source code* (not a pip dependency) is covered separately in
  `open_review_release/THIRD_PARTY_NOTICES.md`.
