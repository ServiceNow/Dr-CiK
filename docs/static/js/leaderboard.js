/* Dr-CiK interactive leaderboard. Pure vanilla JS, no dependencies. */
(function () {
  const DATA = window.DRCIK_LEADERBOARD;
  if (!DATA) return;

  const TYPE_LABELS = {
    agentic: "Agentic",
    direct_llm: "Direct-prompt LLM",
    ts_model: "Time-series model",
    statistical: "Statistical",
    retrieval: "Retrieval",
  };

  const state = {
    view: "forecasting",
    sortKey: "scrps",
    sortDir: "asc", // asc = best-first for lower-better
    families: new Set(["no_context", "deep_research", "original_context"]),
  };

  const root = document.getElementById("leaderboard");
  if (!root) return;

  function fmt(v) {
    return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  }

  function cellValue(row, key) {
    const v = row[key];
    return Array.isArray(v) ? v[0] : v;
  }

  function activeMetrics() {
    return DATA[state.view].metrics;
  }

  function sortedRows() {
    const block = DATA[state.view];
    let rows = block.rows.slice();
    if (state.view === "forecasting") {
      rows = rows.filter((r) => state.families.has(r.family));
    }
    const m = block.metrics.find((x) => x.key === state.sortKey) || block.metrics[0];
    const lowerBetter = !!m.lowerBetter;
    rows.sort((a, b) => {
      const av = cellValue(a, state.sortKey);
      const bv = cellValue(b, state.sortKey);
      const cmp = av - bv;
      return state.sortDir === "asc" ? cmp : -cmp;
    });
    return { rows, primaryLowerBetter: lowerBetter };
  }

  function bestValueFor(rows, key, lowerBetter) {
    const vals = rows.map((r) => cellValue(r, key)).filter((v) => Number.isFinite(v));
    if (!vals.length) return null;
    return lowerBetter ? Math.min(...vals) : Math.max(...vals);
  }

  function renderToolbar() {
    const views = [
      ["forecasting", "Forecasting"],
      ["deep_research", "Deep-research quality"],
    ];
    const seg = views
      .map(
        ([k, label]) =>
          `<button class="${state.view === k ? "active" : ""}" data-view="${k}">${label}</button>`
      )
      .join("");

    let filters = "";
    if (state.view === "forecasting") {
      const fams = DATA.forecasting.families;
      filters = Object.keys(fams)
        .map((k) => {
          const on = state.families.has(k);
          return `<button class="chip-toggle ${on ? "active" : ""}" data-family="${k}">
            <span class="fam-dot fam-${k}"></span>${fams[k].label}</button>`;
        })
        .join("");
    }

    return `<div class="lb-toolbar">
      <div class="seg" role="tablist">${seg}</div>
      <div class="lb-filters">${filters}</div>
    </div>`;
  }

  function metricHeader(m) {
    const dirArrow = m.lowerBetter ? "↓" : "↑";
    const active = state.sortKey === m.key;
    const sortGlyph = active ? (state.sortDir === "asc" ? "▲" : "▼") : "";
    return `<th class="sortable ${m.primary ? "metric-primary" : ""}" data-sort="${m.key}">
      ${m.label} <span style="opacity:.6">${dirArrow}</span>${active ? `<span class="arrow">${sortGlyph}</span>` : ""}
    </th>`;
  }

  function render() {
    const block = DATA[state.view];
    const { rows, primaryLowerBetter } = sortedRows();
    const metrics = block.metrics;
    const primary = metrics.find((m) => m.primary) || metrics[0];
    const best = bestValueFor(rows, primary.key, !!primary.lowerBetter);

    // bar scaling on primary metric
    const pv = rows.map((r) => cellValue(r, primary.key)).filter(Number.isFinite);
    const pMin = Math.min(...pv), pMax = Math.max(...pv);
    const barFrac = (v) => {
      if (!Number.isFinite(v) || pMax === pMin) return 0.5;
      const frac = (v - pMin) / (pMax - pMin);
      return primary.lowerBetter ? 1 - frac : frac; // longer bar = better
    };

    const isForecast = state.view === "forecasting";
    const headCols = [
      `<th class="left">#</th>`,
      `<th class="left">Model</th>`,
      isForecast ? `<th class="left">Context</th>` : `<th class="left">Type</th>`,
      ...metrics.map(metricHeader),
      isForecast ? `<th>Fail</th>` : "",
    ].join("");

    const body = rows
      .map((r, i) => {
        const rankClass = i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";
        const typeTag = `<span class="type-tag type-${r.type}">${TYPE_LABELS[r.type] || r.type}</span>`;
        const contextCell = isForecast
          ? `<span class="fam-tag"><span class="fam-dot fam-${r.family}"></span>${DATA.forecasting.families[r.family].label}</span>`
          : typeTag;

        const metricCells = metrics
          .map((m) => {
            const raw = r[m.key];
            const v = Array.isArray(raw) ? raw[0] : raw;
            const se = Array.isArray(raw) ? raw[1] : null;
            const isBest = best != null && Math.abs(v - best) < 1e-9 && m.key === primary.key;
            const seStr = se != null ? ` <span class="se">± ${fmt(se)}</span>` : "";
            const unit = state.view === "deep_research" ? "%" : "";
            if (m.primary) {
              return `<td class="metric-cell metric-primary">
                <div class="bar-wrap">
                  <span>${fmt(v)}${unit}${seStr}${isBest ? '<span class="best-pill">BEST</span>' : ""}</span>
                  <div class="bar-track"><div class="bar-fill" style="width:${(barFrac(v) * 100).toFixed(1)}%"></div></div>
                </div>
              </td>`;
            }
            return `<td class="metric-cell">${fmt(v)}${unit}${seStr}</td>`;
          })
          .join("");

        const failCell = isForecast
          ? `<td class="fail-cell ${r.fail ? "has" : ""}">${r.fail || 0}</td>`
          : "";

        const modelSub = isForecast ? (TYPE_LABELS[r.type] || "") : "";
        return `<tr>
          <td class="left rank ${rankClass}">${i + 1}</td>
          <td class="left"><div class="model-cell"><span class="model-name">${r.model}</span>${
            modelSub ? `<span class="model-sub">${modelSub}</span>` : ""
          }</div></td>
          <td class="left">${contextCell}</td>
          ${metricCells}
          ${failCell}
        </tr>`;
      })
      .join("");

    root.innerHTML = `
      ${renderToolbar()}
      <p class="lb-note">${block.note}</p>
      <div class="lb-card"><div class="lb-scroll">
        <table class="lb">
          <thead><tr>${headCols}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div></div>
      ${
        isForecast
          ? `<div class="lb-legend">
              <span><span class="fam-dot fam-no_context"></span>No context — baseline</span>
              <span><span class="fam-dot fam-deep_research"></span>Deep research — Codex-synthesized evidence</span>
              <span><span class="fam-dot fam-original_context"></span>Original context — oracle ceiling</span>
            </div>`
          : ""
      }
      <div class="submit-cta">
        <p><strong>Have a deep-research or forecasting method?</strong> We welcome leaderboard submissions — open an issue on GitHub with your results and a reproduction link.</p>
        <a class="badge solid" href="https://github.com/ServiceNow/Dr-CiK/issues/new">Submit a result</a>
      </div>`;

    bind();
  }

  function bind() {
    root.querySelectorAll("[data-view]").forEach((b) =>
      b.addEventListener("click", () => {
        state.view = b.dataset.view;
        const m = DATA[state.view].metrics.find((x) => x.primary) || DATA[state.view].metrics[0];
        state.sortKey = m.key;
        state.sortDir = m.lowerBetter ? "asc" : "desc";
        render();
      })
    );
    root.querySelectorAll("[data-family]").forEach((b) =>
      b.addEventListener("click", () => {
        const f = b.dataset.family;
        if (state.families.has(f)) state.families.delete(f);
        else state.families.add(f);
        if (state.families.size === 0) state.families.add(f); // never empty
        render();
      })
    );
    root.querySelectorAll("[data-sort]").forEach((th) =>
      th.addEventListener("click", () => {
        const key = th.dataset.sort;
        const m = DATA[state.view].metrics.find((x) => x.key === key);
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortKey = key;
          state.sortDir = m && m.lowerBetter ? "asc" : "desc";
        }
        render();
      })
    );
  }

  render();
})();
