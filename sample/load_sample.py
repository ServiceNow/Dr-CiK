#!/usr/bin/env python3
"""Minimal, dependency-free reader for the bundled Dr-CiK sample.

Loads each sample task, splits its corpus into supporting vs. distractor
documents, and prints a short summary. The full benchmark (279 tasks, 10,342
documents) lives on Hugging Face: https://huggingface.co/datasets/ServiceNow/Dr-CiK
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

SAMPLE_DIR = Path(__file__).resolve().parent
TASK_DIR = SAMPLE_DIR / "tasks"
DOC_DIR = SAMPLE_DIR / "documents"


def load_task(task_path: Path) -> dict:
    return json.loads(task_path.read_text(encoding="utf-8"))


def main() -> None:
    for task_path in sorted(TASK_DIR.glob("task_*.json")):
        task = load_task(task_path)
        meta = task["task_metadata"]
        series = task["series"]
        docs = task["documents"]

        roles = Counter(d["role"] for d in docs)
        subtypes = Counter(d["subtype"] for d in docs if d["role"] == "distractor")

        print(f"# {task['benchmark_id']}  (origin: {task['origin']})")
        print(f"  variable          : {task['showcase']['time_series_variable']['name']}")
        print(f"  frequency         : {meta['frequency']}")
        print(f"  history length    : {len(series['history_values'])}")
        print(f"  prediction length : {meta['prediction_length']}")
        print(f"  documents         : {len(docs)} "
              f"({roles.get('supporting', 0)} supporting, "
              f"{roles.get('distractor', 0)} distractor)")
        print(f"  distractor types  : {dict(subtypes)}")
        print(f"  gt evidence spans : {len(task['annotations']['gt_evidence'])}")

        # Example: read the full text of the first supporting document.
        first_support = next(d for d in docs if d["role"] == "supporting")
        text = (DOC_DIR / f"{first_support['document_id']}.md").read_text(encoding="utf-8")
        print(f"  first supporting  : {first_support['document_id']} "
              f"({len(text)} chars)")
        print()


if __name__ == "__main__":
    main()
