/* Dr-CiK task showcase — multi-task, dependency-free.
   Reads tasks from the window.DRCIK_SHOWCASE registry (populated by data/*.js)
   and window.DRCIK_SHOWCASE_MANIFEST (the picker order). */

const DISTRACTOR_LABELS = {
  confounder: "Confounder",
  noisy: "Noisy Parallel Signal",
  timeseries: "Time-Series Misdirection",
  profile: "Profile Shift",
  temporal: "Temporal Mismatch",
};
const DISTRACTOR_ORDER = ["confounder", "noisy", "timeseries", "profile", "temporal"];

let taskState = null;
let showGroundTruth = true;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
function toTitleCase(value) {
  return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function formatDateLabel(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  return text;
}
function formatAxisDateLabel(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric" });
  }
  return text;
}
function formatValue(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  if (Math.abs(n) >= 100) return n.toFixed(0);
  if (Math.abs(n) >= 10) return n.toFixed(1);
  return n.toFixed(2);
}
function normalisePoints(points, kind) {
  return (points || [])
    .map((point, index) => {
      const value = Number(point && point.v);
      const rawTime = String((point && point.t) || "").trim();
      const date = rawTime ? new Date(rawTime) : null;
      return { kind, rawTime, value, x: date && !Number.isNaN(date.getTime()) ? date.getTime() : index };
    })
    .filter((point) => Number.isFinite(point.value));
}
function buildTickPoints(points, count) {
  if (!points.length) return [];
  const ticks = [];
  const lastIndex = points.length - 1;
  for (let step = 0; step < count; step += 1) {
    const index = Math.round((step * lastIndex) / Math.max(count - 1, 1));
    const point = points[index];
    if (!ticks.some((item) => item.rawTime === point.rawTime)) ticks.push(point);
  }
  return ticks;
}
function buildPath(points, xScale, yScale) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${xScale(point.x).toFixed(2)} ${yScale(point.value).toFixed(2)}`)
    .join(" ");
}
function formatAxisValue(value, range = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  const maximumFractionDigits = Math.abs(range) >= 50 || Math.abs(n) >= 100 ? 0 : 1;
  return n.toLocaleString(undefined, { maximumFractionDigits });
}

function renderSeriesChart(container, payload, options = {}) {
  const history = normalisePoints(payload.history, "history");
  const future = normalisePoints(payload.future, "future");
  const showFuture = options.showFuture !== false;
  const height = Number(options.height || 380);
  const width = Math.max(container.clientWidth || 720, 320);
  const margin = { top: 24, right: 20, bottom: 56, left: 54 };
  const scalePoints = history.concat(future);
  const displayPoints = history.concat(showFuture ? future : []);
  if (!scalePoints.length) {
    container.innerHTML = '<div class="sc-empty">No time-series data is available.</div>';
    return;
  }
  const minX = Math.min(...scalePoints.map((p) => p.x));
  const maxX = Math.max(...scalePoints.map((p) => p.x));
  const rawMinY = Math.min(...scalePoints.map((p) => p.value));
  const rawMaxY = Math.max(...scalePoints.map((p) => p.value));
  const yPadding = rawMaxY === rawMinY ? Math.max(Math.abs(rawMaxY) * 0.08, 1) : (rawMaxY - rawMinY) * 0.08;
  const minY = rawMinY - yPadding;
  const maxY = rawMaxY + yPadding;
  const xScale = (v) => margin.left + ((v - minX) / Math.max(maxX - minX, 1)) * (width - margin.left - margin.right);
  const yScale = (v) => margin.top + ((maxY - v) / Math.max(maxY - minY, 1)) * (height - margin.top - margin.bottom);
  const chartId = `chart-${Math.random().toString(36).slice(2, 9)}`;
  const tooltipId = `${chartId}-tooltip`;
  const splitPoint = history.length ? history[history.length - 1] : null;
  const svg = [];

  svg.push(`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Time series chart">`);
  svg.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="transparent"></rect>`);
  for (let i = 0; i <= 4; i += 1) {
    const y = margin.top + ((height - margin.top - margin.bottom) / 4) * i;
    svg.push(`<line x1="${margin.left}" x2="${width - margin.right}" y1="${y}" y2="${y}" stroke="rgba(23,24,25,0.08)" stroke-width="1"></line>`);
  }
  svg.push(`<line x1="${margin.left}" x2="${margin.left}" y1="${margin.top}" y2="${height - margin.bottom}" stroke="var(--sc-axis)" stroke-width="1"></line>`);
  for (let i = 0; i <= 4; i += 1) {
    const value = maxY - ((maxY - minY) / 4) * i;
    const y = yScale(value);
    svg.push(`<line x1="${margin.left - 6}" x2="${margin.left}" y1="${y}" y2="${y}" stroke="var(--sc-axis)" stroke-width="1"></line>`);
    svg.push(`<text x="${margin.left - 10}" y="${y + 4}" fill="var(--sc-axis)" font-size="12" text-anchor="end">${escapeHtml(formatAxisValue(value, maxY - minY))}</text>`);
  }
  if (splitPoint) {
    const splitX = xScale(splitPoint.x);
    svg.push(`<rect x="${splitX}" y="${margin.top}" width="${Math.max(width - margin.right - splitX, 0)}" height="${height - margin.top - margin.bottom}" fill="rgba(21,103,96,0.05)"></rect>`);
    svg.push(`<line x1="${splitX}" x2="${splitX}" y1="${margin.top}" y2="${height - margin.bottom}" stroke="rgba(23,24,25,0.22)" stroke-dasharray="5 5"></line>`);
  }
  if (history.length) {
    svg.push(`<path d="${buildPath(history, xScale, yScale)}" fill="none" stroke="var(--sc-history)" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"></path>`);
  }
  if (showFuture && future.length) {
    svg.push(`<path d="${buildPath(future, xScale, yScale)}" fill="none" stroke="var(--sc-future)" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="7 6"></path>`);
  }
  const axisY = height - margin.bottom;
  svg.push(`<line x1="${margin.left}" x2="${width - margin.right}" y1="${axisY}" y2="${axisY}" stroke="var(--sc-axis)" stroke-width="1"></line>`);
  for (const [index, point] of buildTickPoints(scalePoints, 5).entries()) {
    const x = xScale(point.x);
    const anchor = index === 0 ? "start" : index === 4 ? "end" : "middle";
    svg.push(`<line x1="${x}" x2="${x}" y1="${axisY}" y2="${axisY + 6}" stroke="var(--sc-axis)" stroke-width="1"></line>`);
    svg.push(`<text x="${x}" y="${height - 16}" fill="var(--sc-axis)" font-size="12" text-anchor="${anchor}">${escapeHtml(formatAxisDateLabel(point.rawTime))}</text>`);
  }
  svg.push(`<circle id="${chartId}-marker" r="4.5" fill="var(--sc-future)" opacity="0"></circle>`);
  svg.push("</svg>");
  container.innerHTML = `<div class="sc-chart-tooltip" id="${tooltipId}" hidden></div>${svg.join("")}`;

  const svgElement = container.querySelector("svg");
  const tooltip = container.querySelector(`#${tooltipId}`);
  const marker = container.querySelector(`#${chartId}-marker`);
  const interactivePoints = displayPoints.length ? displayPoints : scalePoints;
  const handleMove = (event) => {
    const rect = svgElement.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const nearest = interactivePoints.reduce((best, point) => {
      const distance = Math.abs(xScale(point.x) - pointerX);
      return !best || distance < best.distance ? { point, distance } : best;
    }, null);
    if (!nearest) return;
    const { point } = nearest;
    const x = xScale(point.x), y = yScale(point.value);
    marker.setAttribute("cx", String(x));
    marker.setAttribute("cy", String(y));
    marker.setAttribute("opacity", "1");
    tooltip.hidden = false;
    tooltip.innerHTML = `<strong>${escapeHtml(point.kind === "future" ? "Future" : "History")}</strong><br>${escapeHtml(formatDateLabel(point.rawTime))}<br>${escapeHtml(formatValue(point.value))}`;
    tooltip.style.left = `${Math.min(Math.max(x + 12, 8), rect.width - 150)}px`;
    tooltip.style.top = `${Math.max(y - 56, 8)}px`;
  };
  const hideTooltip = () => { marker.setAttribute("opacity", "0"); tooltip.hidden = true; };
  svgElement.addEventListener("pointermove", handleMove);
  svgElement.addEventListener("pointerleave", hideTooltip);
}

function buildSeries(task) {
  const series = task.series || {};
  const ht = series.history_timestamps || [];
  const hv = series.history_values || [];
  const ft = series.future_timestamps || [];
  const fv = series.future_values || [];
  return {
    history: ht.map((t, i) => ({ t, v: Number(hv[i]) })),
    future: ft.map((t, i) => ({ t, v: Number(fv[i]) })),
  };
}
function documentTitle(content, fallback) {
  const lines = String(content || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 8)) {
    const m = line.match(/^(subject|title|re):\s*(.+)$/i);
    if (m) return m[2].trim();
  }
  return lines[0] || fallback;
}
function renderChips(task, series) {
  const metadata = task.task_metadata || {};
  const chips = [
    task.benchmark_id || "",
    metadata.frequency ? `Frequency: ${metadata.frequency}` : "",
    metadata.prediction_length ? `Horizon: ${metadata.prediction_length}` : "",
    `${series.history.length} history points`,
    `${series.future.length} future points`,
  ].filter(Boolean);
  document.getElementById("task-chips").innerHTML = chips
    .map((chip) => `<span class="sc-chip">${escapeHtml(chip)}</span>`).join("");
}
function renderContext(task) {
  const metadata = task.task_metadata || {};
  const series = task.series || {};
  const frequency = metadata.frequency || "1 hour";
  const predictionLength = metadata.prediction_length || (series.future_timestamps || []).length;
  const background = (task.context || {}).background || metadata.target_description || "";
  const objectiveText = predictionLength
    ? `Predict the next ${predictionLength} values at ${frequency} frequency.`
    : `Predict future values at ${frequency} frequency.`;
  const blocks = [["Target", background], ["Forecasting Objective", objectiveText]]
    .filter(([, v]) => String(v || "").trim());
  document.getElementById("task-context").innerHTML = blocks
    .map(([label, text]) => `
      <section class="sc-description-block">
        <div class="sc-description-label">${escapeHtml(label)}</div>
        <p>${escapeHtml(text)}</p>
      </section>`).join("");
}
function renderGroundTruth(task) {
  const items = ((task.annotations || {}).gt_evidence || []).map((item, index) => ({
    id: item.id || `E${index + 1}`,
    text: item.evidence || item.text || "",
  }));
  document.getElementById("gt-evidence-list").innerHTML = items
    .map((item) => `
      <article class="sc-gt-evidence-item">
        <div class="sc-gt-evidence-id">${escapeHtml(item.id)}</div>
        <div class="sc-doc-content">${escapeHtml(item.text)}</div>
      </article>`).join("");
}
function renderDocuments(task) {
  const documents = task.documents || [];
  const supporting = documents.filter((d) => d.role === "supporting");
  const distractors = documents.filter((d) => d.role === "distractor");
  document.getElementById("document-counts").innerHTML = showGroundTruth
    ? `<span class="sc-chip">${supporting.length} supporting</span><span class="sc-chip">${distractors.length} distractors</span>`
    : `<span class="sc-chip">${documents.length} documents</span>`;

  if (!showGroundTruth) {
    document.getElementById("documents-view").innerHTML = `
      <h3 class="sc-doc-section-title">Document Space</h3>
      <div class="sc-doc-stack">
        ${documents.map((doc, i) => renderDocumentCard(doc, `Document ${String(i + 1).padStart(2, "0")}`, "reading")).join("")}
      </div>`;
    return;
  }
  const grouped = {};
  for (const doc of distractors) {
    const key = String(doc.subtype || "distractor").toLowerCase();
    (grouped[key] = grouped[key] || []).push(doc);
  }
  const groups = DISTRACTOR_ORDER.filter((k) => grouped[k]).concat(
    Object.keys(grouped).filter((k) => !DISTRACTOR_ORDER.includes(k))
  );
  document.getElementById("documents-view").innerHTML = `
    <div>
      <h3 class="sc-doc-section-title">Supporting Documents</h3>
      <div class="sc-doc-stack">
        ${supporting.map((doc, i) => renderDocumentCard(doc, `Supporting ${String(i + 1).padStart(2, "0")}`, "supporting")).join("")}
      </div>
    </div>
    <div style="margin-top:28px;">
      <h3 class="sc-doc-section-title">Distractor Documents</h3>
      <div class="sc-distractor-wall">
        ${groups.map((key) => `
          <section class="sc-distractor-group">
            <div class="sc-distractor-group-head">
              <div class="sc-distractor-group-label">${escapeHtml(DISTRACTOR_LABELS[key] || toTitleCase(key))}</div>
              <span class="sc-chip">${grouped[key].length} documents</span>
            </div>
            <div class="sc-doc-stack">
              ${grouped[key].map((doc, i) => renderDocumentCard(doc, `Distractor ${String(i + 1).padStart(2, "0")}`, "distractor")).join("")}
            </div>
          </section>`).join("")}
      </div>
    </div>`;
}
function renderDocumentCard(doc, label, kind) {
  const content = String(doc.content || "");
  const title = documentTitle(content, doc.document_id || label);
  const cardClass = kind === "distractor" ? "sc-doc-card-distractor" : kind === "supporting" ? "sc-doc-card-supporting" : "sc-doc-card-reading";
  return `
    <article class="sc-doc-card ${cardClass}">
      <div class="sc-doc-meta">
        <div class="sc-doc-meta-label">${escapeHtml(label)}</div>
        <span class="sc-chip">${escapeHtml(doc.document_id || "")}</span>
      </div>
      <h3 class="sc-doc-section-title">${escapeHtml(title)}</h3>
      <div class="sc-doc-content">${escapeHtml(content)}</div>
    </article>`;
}
function updateGroundTruthVisibility() {
  const chartEl = document.getElementById("task-series-chart");
  renderSeriesChart(chartEl, taskState.series, { height: 380, showFuture: showGroundTruth });
  document.getElementById("gt-evidence-block").hidden = !showGroundTruth;
  document.querySelector("[data-future-legend]").hidden = !showGroundTruth;
  document.getElementById("show-gt-title").textContent = showGroundTruth ? "Show GT" : "Hide GT";
  document.getElementById("show-gt-subtitle").textContent = showGroundTruth
    ? "Series, evidence, and labels visible"
    : "Unified reading mode";
  renderDocuments(taskState.task);
}
function renderTask(task) {
  const series = buildSeries(task);
  taskState = { task, series };
  const variable = ((task.showcase || {}).time_series_variable || {}).name || "Time series";
  document.getElementById("task-title").textContent = `${toTitleCase(variable)} forecast`;
  const origin = task.origin ? `${toTitleCase(task.origin)} task` : "Example task";
  document.getElementById("task-origin").textContent = origin;
  renderChips(task, series);
  renderContext(task);
  renderGroundTruth(task);
  updateGroundTruthVisibility();
}

function getRegistry() { return window.DRCIK_SHOWCASE || {}; }
function getManifest() {
  if (Array.isArray(window.DRCIK_SHOWCASE_MANIFEST)) return window.DRCIK_SHOWCASE_MANIFEST;
  return Object.keys(getRegistry()).map((id) => ({ id, title: id }));
}
function currentTaskId() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("task");
  const reg = getRegistry();
  if (requested && reg[requested]) return requested;
  const manifest = getManifest();
  return (manifest[0] && manifest[0].id) || Object.keys(reg)[0];
}
function populatePicker(selectedId) {
  const select = document.getElementById("task-picker");
  const manifest = getManifest();
  select.innerHTML = manifest
    .map((m) => {
      const meta = [m.variable ? toTitleCase(m.variable) : m.title, m.frequency].filter(Boolean).join(" · ");
      return `<option value="${escapeHtml(m.id)}" ${m.id === selectedId ? "selected" : ""}>${escapeHtml(meta || m.id)}</option>`;
    })
    .join("");
  select.addEventListener("change", () => {
    const id = select.value;
    const url = new URL(window.location.href);
    url.searchParams.set("task", id);
    window.history.replaceState({}, "", url);
    const task = getRegistry()[id];
    if (task) renderTask(task);
  });
}

window.addEventListener("load", () => {
  const toggle = document.getElementById("show-gt-toggle");
  toggle.addEventListener("change", () => { showGroundTruth = toggle.checked; updateGroundTruthVisibility(); });
  window.addEventListener("resize", () => {
    if (taskState) {
      renderSeriesChart(document.getElementById("task-series-chart"), taskState.series, { height: 380, showFuture: showGroundTruth });
    }
  });
  try {
    const id = currentTaskId();
    const task = getRegistry()[id];
    if (!task) throw new Error("No task data found. Make sure the data/*.js files are present.");
    populatePicker(id);
    renderTask(task);
  } catch (error) {
    document.querySelector(".sc-main").innerHTML = `<div class="sc-empty">${escapeHtml(error.message)}</div>`;
  }
});
