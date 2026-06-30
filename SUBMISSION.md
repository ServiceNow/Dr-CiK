# Submitting to the Dr-CiK leaderboard

The **official Dr-CiK leaderboard runs on the hidden test set** — the 80 human-authored
tasks whose labels (`future_values`, `gt_evidence`) are **withheld**. Because the answers
are private, you **submit your model's outputs, not metrics**, and the maintainers score
them with the official scorer and post a **verified** entry. (The 199 synthetic *dev*
tasks have public labels for development.)

This is what makes a Dr-CiK number trustworthy: retrieval quality, citation quality, and
topical relevance are not enough — the score reflects *forecast-useful* context, computed
by us on data you can't see.

## 1. Get the tasks

```python
from datasets import load_dataset
tasks = load_dataset("ServiceNow/Dr-CiK", "tasks", split="train")
hidden = tasks.filter(lambda t: t["labels_public"] is False)   # the 80 test tasks
docs = load_dataset("ServiceNow/Dr-CiK", "documents", split="train")
```

For each hidden task you have everything needed to run: `history_timestamps`,
`history_values`, `future_timestamps` (the horizon to predict), `prediction_length`,
`document_ids`, and the document corpus. Only `future_values` and `gt_evidence` are empty.

## 2. Produce outputs

Pick one or both tracks:

### Forecasting track → `forecasts.jsonl`
One JSON object per hidden task, with **probabilistic** forecasts (sample trajectories)
covering that task's `future_timestamps`:

```json
{"benchmark_id": "task_1", "samples": [[12.4, 12.5, ...], [12.1, 12.7, ...]]}
```
- Each inner array is one sample trajectory of length `prediction_length`.
- Provide at least **100** samples per task (more is better for CRPS).
- Scored on **scaled MAE, scaled RMSE, scaled CRPS** (winsorized at 5.0 per task, then
  mean ± standard error over tasks).

### Deep-research track → `deep_research.jsonl`
One JSON object per hidden task, with the context your agent recovered:

```json
{"benchmark_id": "task_1", "cited_document_ids": ["doc_13", "doc_41"],
 "evidence": ["...quoted/extracted supporting evidence..."]}
```
- Scored on **evidence recall**, **supporting-document recall**, and **distractor
  avoidance**.

You must produce outputs for **all** hidden tasks (no cherry-picking).

## 3. Submit

Open a pull request adding a folder under `submissions/<your-method-name>/` containing:

```
submissions/<your-method-name>/
├── metadata.json        # required
├── forecasts.jsonl      # forecasting track (optional if DR-only)
└── deep_research.jsonl  # deep-research track (optional if forecasting-only)
```

`metadata.json`:
```json
{
  "method": "MyAgent + Forecaster",
  "organization": "Your Lab",
  "type": "agentic",                 // agentic | direct_llm | ts_model | statistical | retrieval
  "base_model": "gemini-3.1-flash-lite",
  "reproduction": "https://github.com/you/your-repo",
  "contact": "you@example.com",
  "notes": "anything reviewers should know"
}
```

See [`submissions/template/`](submissions/template) for a minimal example.

## 4. Verification

Maintainers run the official private scorer on your outputs against the withheld labels,
sanity-check the submission (full coverage, plausible outputs, working reproduction link),
and add a **✓ verified** row to the leaderboard. We may ask for the reproduction to be
runnable before publishing.

Questions: open an issue, or contact the maintainers listed in the
[README](README.md#contact).
