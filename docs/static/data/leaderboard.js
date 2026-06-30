/*
 * Dr-CiK leaderboard data.
 *
 * Numbers are transcribed verbatim from the Dr-CiK paper (arXiv:2605.27904):
 *   - FORECASTING  : Table 7 (full 240-task benchmark; mean +/- standard error).
 *   - DEEP_RESEARCH: Table 2 (deep-research quality on the main benchmark).
 *
 * Forecasting metrics (sMAE, sRMSE, sCRPS, ranks): LOWER is better.
 * Deep-research metrics (recall, avoidance): HIGHER is better.
 *
 * Context families:
 *   no_context       - forecaster sees only the time series (baseline).
 *   deep_research    - forecaster sees Codex-agent-synthesized evidence.
 *   original_context - forecaster sees the source ground-truth context (oracle ceiling).
 */
window.DRCIK_LEADERBOARD = {
  paper_url: "https://arxiv.org/abs/2605.27904",
  forecasting: {
    note:
      "Context-aided forecasting on the full 240-task Dr-CiK benchmark (Table 7). " +
      "Values are mean ± standard error over tasks with valid metrics. " +
      "“Fail” counts tasks excluded for that model. Gemini = gemini-3.1-flash-lite; " +
      "all MoiraiAgent variants use Gemini; “+ Med.” = medium reasoning effort. " +
      "* = direct-prompt LLM forecaster.",
    metrics: [
      { key: "scrps", label: "sCRPS", lowerBetter: true, primary: true },
      { key: "smae", label: "sMAE", lowerBetter: true },
      { key: "srmse", label: "sRMSE", lowerBetter: true },
      { key: "rank_point", label: "Avg. Rank (point)", lowerBetter: true },
      { key: "rank_dist", label: "Avg. Rank (dist.)", lowerBetter: true }
    ],
    families: {
      no_context: { label: "No context", note: "Time series only (baseline)" },
      deep_research: { label: "Deep research", note: "Codex-agent synthesized evidence" },
      original_context: { label: "Original context", note: "Ground-truth context (oracle ceiling)" }
    },
    rows: [
      // No context
      { model: "MoiraiAgent", family: "no_context", type: "agentic", scrps: [0.338, 0.033], smae: [0.356, 0.034], srmse: [0.545, 0.046], rank_point: [9.86, 0.35], rank_dist: [11.80, 0.37], fail: 1 },
      { model: "Chronos", family: "no_context", type: "ts_model", scrps: [0.319, 0.029], smae: [0.416, 0.043], srmse: [0.613, 0.053], rank_point: [10.57, 0.37], rank_dist: [9.47, 0.36], fail: 0 },
      { model: "Gemini", family: "no_context", type: "direct_llm", scrps: [0.319, 0.034], smae: [0.409, 0.045], srmse: [0.606, 0.053], rank_point: [10.83, 0.34], rank_dist: [10.99, 0.35], fail: 0 },
      { model: "SES", family: "no_context", type: "statistical", scrps: [0.378, 0.025], smae: [0.503, 0.040], srmse: [0.677, 0.046], rank_point: [13.10, 0.38], rank_dist: [12.77, 0.38], fail: 0 },
      { model: "ETS", family: "no_context", type: "statistical", scrps: [0.418, 0.027], smae: [0.507, 0.034], srmse: [0.681, 0.042], rank_point: [13.88, 0.42], rank_dist: [13.61, 0.42], fail: 0 },
      { model: "Aurora", family: "no_context", type: "ts_model", scrps: [0.483, 0.058], smae: [0.554, 0.063], srmse: [0.733, 0.069], rank_point: [12.28, 0.33], rank_dist: [12.80, 0.35], fail: 0 },
      { model: "ARIMA", family: "no_context", type: "statistical", scrps: [0.488, 0.055], smae: [0.692, 0.073], srmse: [0.834, 0.074], rank_point: [14.09, 0.33], rank_dist: [13.43, 0.34], fail: 0 },
      { model: "Naive", family: "no_context", type: "statistical", scrps: [0.499, 0.043], smae: [0.767, 0.066], srmse: [0.910, 0.068], rank_point: [15.76, 0.36], rank_dist: [15.91, 0.36], fail: 0 },

      // Deep research (Codex agent) evidence
      { model: "Qwen3.5-9b", family: "deep_research", type: "direct_llm", scrps: [0.297, 0.027], smae: [0.431, 0.040], srmse: [0.610, 0.050], rank_point: [11.72, 0.37], rank_dist: [9.79, 0.34], fail: 11 },
      { model: "MoiraiAgent", family: "deep_research", type: "agentic", scrps: [0.310, 0.035], smae: [0.375, 0.041], srmse: [0.516, 0.051], rank_point: [8.90, 0.35], rank_dist: [9.62, 0.35], fail: 1 },
      { model: "Gemini + Med.", family: "deep_research", type: "direct_llm", scrps: [0.314, 0.033], smae: [0.370, 0.035], srmse: [0.518, 0.047], rank_point: [10.23, 0.38], rank_dist: [10.40, 0.39], fail: 0 },
      { model: "Qwen3.5-4b", family: "deep_research", type: "direct_llm", scrps: [0.314, 0.029], smae: [0.457, 0.042], srmse: [0.646, 0.055], rank_point: [11.88, 0.35], rank_dist: [10.28, 0.34], fail: 12 },
      { model: "Qwen3.5-27b", family: "deep_research", type: "direct_llm", scrps: [0.323, 0.038], smae: [0.414, 0.040], srmse: [0.571, 0.051], rank_point: [11.09, 0.39], rank_dist: [10.19, 0.39], fail: 11 },
      { model: "Gemini", family: "deep_research", type: "direct_llm", scrps: [0.326, 0.033], smae: [0.455, 0.049], srmse: [0.620, 0.059], rank_point: [10.61, 0.41], rank_dist: [10.95, 0.41], fail: 0 },
      { model: "Mistral-Medium-3.1", family: "deep_research", type: "direct_llm", scrps: [0.375, 0.040], smae: [0.443, 0.041], srmse: [0.607, 0.054], rank_point: [12.14, 0.40], rank_dist: [12.27, 0.40], fail: 8 },
      { model: "Aurora", family: "deep_research", type: "ts_model", scrps: [0.483, 0.058], smae: [0.556, 0.063], srmse: [0.733, 0.069], rank_point: [12.41, 0.32], rank_dist: [12.85, 0.35], fail: 0 },
      { model: "Phi4-mini", family: "deep_research", type: "direct_llm", scrps: [0.493, 0.049], smae: [1.478, 0.136], srmse: [1.633, 0.141], rank_point: [18.54, 0.35], rank_dist: [16.43, 0.43], fail: 31 },
      { model: "Llama3.2-3b", family: "deep_research", type: "direct_llm", scrps: [0.551, 0.049], smae: [1.318, 0.113], srmse: [1.496, 0.113], rank_point: [16.64, 0.40], rank_dist: [15.28, 0.42], fail: 36 },
      { model: "TimeOmni-7B", family: "deep_research", type: "ts_model", scrps: [0.600, 0.051], smae: [0.600, 0.051], srmse: [0.801, 0.058], rank_point: [16.15, 0.35], rank_dist: [18.15, 0.30], fail: 23 },

      // Original (oracle) context
      { model: "MoiraiAgent", family: "original_context", type: "agentic", scrps: [0.206, 0.030], smae: [0.242, 0.031], srmse: [0.343, 0.042], rank_point: [4.81, 0.26], rank_dist: [5.38, 0.28], fail: 0 },
      { model: "MoiraiAgent + Med.", family: "original_context", type: "agentic", scrps: [0.210, 0.029], smae: [0.246, 0.031], srmse: [0.348, 0.042], rank_point: [4.96, 0.28], rank_dist: [5.55, 0.29], fail: 0 },
      { model: "Gemini", family: "original_context", type: "direct_llm", scrps: [0.233, 0.032], smae: [0.289, 0.038], srmse: [0.411, 0.048], rank_point: [6.55, 0.36], rank_dist: [6.75, 0.37], fail: 0 },
      { model: "Aurora", family: "original_context", type: "ts_model", scrps: [0.487, 0.058], smae: [0.557, 0.063], srmse: [0.732, 0.069], rank_point: [12.46, 0.32], rank_dist: [12.81, 0.34], fail: 0 }
    ]
  },
  deep_research: {
    note:
      "Deep-research quality, evaluated independently of the downstream forecaster (Table 2). " +
      "Each agent is scored on how much ground-truth supporting evidence it recovers and how " +
      "well it avoids distractors. Higher is better on all three metrics.",
    metrics: [
      { key: "evidence_recall", label: "Evidence recall", higherBetter: true, primary: true },
      { key: "sup_doc_recall", label: "Supporting-doc recall", higherBetter: true },
      { key: "distractor_avoidance", label: "Distractor avoidance", higherBetter: true }
    ],
    rows: [
      { model: "Codex", type: "agentic", evidence_recall: 38.5, sup_doc_recall: 48.9, distractor_avoidance: 41.0 },
      { model: "OpenDR", type: "agentic", evidence_recall: 4.8, sup_doc_recall: 9.9, distractor_avoidance: 23.5 },
      { model: "Retrieval", type: "retrieval", evidence_recall: 4.3, sup_doc_recall: 10.0, distractor_avoidance: 20.4 },
      { model: "DrBench", type: "agentic", evidence_recall: 3.9, sup_doc_recall: 9.2, distractor_avoidance: 29.0 },
      { model: "Bench2Future", type: "agentic", evidence_recall: 3.8, sup_doc_recall: 7.5, distractor_avoidance: 22.7 }
    ]
  }
};
