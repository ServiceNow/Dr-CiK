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
    protocol: "paper240", // default view; hidden80 is the official (currently empty) ranking
    view: "forecasting",
    sortKey: "scrps",
    sortDir: "asc",
    families: new Set(["no_context", "deep_research", "original_context"]),
  };

  const root = document.getElementById("leaderboard");
  if (!root) return;

  const fmt = (v) =>
    Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  const cellValue = (row, key) => (Array.isArray(row[key]) ? row[key][0] : row[key]);
  const activeRows = () => {
    const block = DATA[state.view];
    return state.protocol === "paper240" ? block.rows : block.hidden_rows || [];
  };

  function sortedRows() {
    const block = DATA[state.view];
    let rows = activeRows().slice();
    if (state.view === "forecasting" && state.protocol === "paper240") {
      rows = rows.filter((r) => state.families.has(r.family));
    }
    rows.sort((a, b) => {
      const cmp = cellValue(a, state.sortKey) - cellValue(b, state.sortKey);
      return state.sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }

  function bestValueFor(rows, key, lowerBetter) {
    const vals = rows.map((r) => cellValue(r, key)).filter(Number.isFinite);
    if (!vals.length) return null;
    return lowerBetter ? Math.min(...vals) : Math.max(...vals);
  }

  function renderToolbar() {
    const protos = Object.keys(DATA.protocols)
      .map(
        (k) =>
          `<button class="${state.protocol === k ? "active" : ""}" data-proto="${k}">${DATA.protocols[k].label}</button>`
      )
      .join("");
    const views = [
      ["forecasting", "Forecasting"],
      ["deep_research", "Deep-research quality"],
    ]
      .map(
        ([k, label]) =>
          `<button class="${state.view === k ? "active" : ""}" data-view="${k}">${label}</button>`
      )
      .join("");

    let filters = "";
    if (state.view === "forecasting" && state.protocol === "paper240") {
      const fams = DATA.forecasting.families;
      filters = Object.keys(fams)
        .map(
          (k) =>
            `<button class="chip-toggle ${state.families.has(k) ? "active" : ""}" data-family="${k}">
              <span class="fam-dot fam-${k}"></span>${fams[k].label}</button>`
        )
        .join("");
    }

    return `<div class="lb-toolbar">
      <div class="seg" role="tablist">${protos}</div>
      <div class="seg" role="tablist">${views}</div>
    </div>
    ${filters ? `<div class="lb-filters">${filters}</div>` : ""}`;
  }

  function metricHeader(m) {
    const dir = m.lowerBetter ? "↓" : "↑";
    const active = state.sortKey === m.key;
    const glyph = active ? (state.sortDir === "asc" ? "▲" : "▼") : "";
    return `<th class="sortable ${m.primary ? "metric-primary" : ""}" data-sort="${m.key}">
      ${m.label} <span style="opacity:.6">${dir}</span>${active ? `<span class="arrow">${glyph}</span>` : ""}
    </th>`;
  }

  function emptyState() {
    return `<div class="lb-empty">
      <p><strong>No verified submissions yet.</strong> The official leaderboard runs on the
      hidden test set — submit your model's outputs and we'll score and post a verified entry.</p>
      <a class="badge solid" href="${DATA.submission_url}">How to submit →</a>
    </div>`;
  }

  function render() {
    const block = DATA[state.view];
    const proto = DATA.protocols[state.protocol];
    const metrics = block.metrics;
    const rows = sortedRows();
    const primary = metrics.find((m) => m.primary) || metrics[0];
    const isForecast = state.view === "forecasting";
    const isPaper = state.protocol === "paper240";

    let tableHtml;
    if (!rows.length) {
      tableHtml = emptyState();
    } else {
      const best = bestValueFor(rows, primary.key, !!primary.lowerBetter);
      const pv = rows.map((r) => cellValue(r, primary.key)).filter(Number.isFinite);
      const pMin = Math.min(...pv), pMax = Math.max(...pv);
      const barFrac = (v) => {
        if (!Number.isFinite(v) || pMax === pMin) return 0.5;
        const f = (v - pMin) / (pMax - pMin);
        return primary.lowerBetter ? 1 - f : f;
      };

      const headCols = [
        `<th class="left">#</th>`,
        `<th class="left">Model</th>`,
        isForecast && isPaper ? `<th class="left">Context</th>` : `<th class="left">Type</th>`,
        ...metrics.map(metricHeader),
        isForecast ? `<th>Fail</th>` : "",
      ].join("");

      const body = rows
        .map((r, i) => {
          const rankClass = i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";
          const typeTag = `<span class="type-tag type-${r.type}">${TYPE_LABELS[r.type] || r.type}</span>`;
          const contextCell =
            isForecast && isPaper
              ? `<span class="fam-tag"><span class="fam-dot fam-${r.family}"></span>${DATA.forecasting.families[r.family].label}</span>`
              : typeTag;
          const badge = isPaper
            ? `<span class="trust-badge paper">paper</span>`
            : `<span class="trust-badge verified">✓ verified</span>`;

          const metricCells = metrics
            .map((m) => {
              const raw = r[m.key];
              const v = Array.isArray(raw) ? raw[0] : raw;
              const se = Array.isArray(raw) ? raw[1] : null;
              const isBest = best != null && Math.abs(v - best) < 1e-9 && m.key === primary.key;
              const seStr = se != null ? ` <span class="se">± ${fmt(se)}</span>` : "";
              const unit = state.view === "deep_research" ? "%" : "";
              if (m.primary) {
                return `<td class="metric-cell metric-primary"><div class="bar-wrap">
                  <span>${fmt(v)}${unit}${seStr}${isBest ? '<span class="best-pill">BEST</span>' : ""}</span>
                  <div class="bar-track"><div class="bar-fill" style="width:${(barFrac(v) * 100).toFixed(1)}%"></div></div>
                </div></td>`;
              }
              return `<td class="metric-cell">${fmt(v)}${unit}${seStr}</td>`;
            })
            .join("");

          const failCell = isForecast ? `<td class="fail-cell ${r.fail ? "has" : ""}">${r.fail || 0}</td>` : "";
          const modelSub = isForecast && isPaper ? (TYPE_LABELS[r.type] || "") : "";
          return `<tr>
            <td class="left rank ${rankClass}">${i + 1}</td>
            <td class="left"><div class="model-cell"><span class="model-name">${r.model} ${badge}</span>${
              modelSub ? `<span class="model-sub">${modelSub}</span>` : ""
            }</div></td>
            <td class="left">${contextCell}</td>
            ${metricCells}
            ${failCell}
          </tr>`;
        })
        .join("");

      tableHtml = `<div class="lb-card"><div class="lb-scroll">
          <table class="lb"><thead><tr>${headCols}</tr></thead><tbody>${body}</tbody></table>
        </div></div>
        ${
          isForecast && isPaper
            ? `<div class="lb-legend">
                <span><span class="fam-dot fam-no_context"></span>No context — baseline</span>
                <span><span class="fam-dot fam-deep_research"></span>Deep research — Codex-synthesized evidence</span>
                <span><span class="fam-dot fam-original_context"></span>Original context — oracle ceiling</span>
              </div>`
            : ""
        }`;
    }

    root.innerHTML = `
      ${renderToolbar()}
      <p class="lb-note"><span class="proto-tag proto-${state.protocol}">${proto.tag}</span> ${proto.note}</p>
      ${state.protocol === "paper240" ? `<p class="lb-note">${block.note}</p>` : ""}
      ${tableHtml}
      <div class="submit-cta">
        <p><strong>Have a deep-research or forecasting method?</strong> The official ranking is on the
        hidden test set — submit your model's outputs and we'll score and post a verified entry.</p>
        <a class="badge solid" href="${DATA.submission_url}">How to submit</a>
      </div>`;

    bind();
  }

  function bind() {
    root.querySelectorAll("[data-proto]").forEach((b) =>
      b.addEventListener("click", () => {
        state.protocol = b.dataset.proto;
        render();
      })
    );
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
        if (state.families.size === 0) state.families.add(f);
        render();
      })
    );
    root.querySelectorAll("[data-sort]").forEach((th) =>
      th.addEventListener("click", () => {
        const key = th.dataset.sort;
        const m = DATA[state.view].metrics.find((x) => x.key === key);
        if (state.sortKey === key) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        else {
          state.sortKey = key;
          state.sortDir = m && m.lowerBetter ? "asc" : "desc";
        }
        render();
      })
    );
  }

  render();
})();
