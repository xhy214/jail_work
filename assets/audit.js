'use strict';
const evidenceRows = JSON.parse(document.getElementById('evidenceData').textContent);
const evidenceBars = document.getElementById('evidenceBars');
const evidenceNote = document.getElementById('evidenceNote');
const metricLabels = {mean: '平均奖励', high: 'reward ≥0.95 比例', full: '原裁判 full 比例'};
function renderEvidence(metric) {
  evidenceBars.replaceChildren();
  for (const row of evidenceRows) {
    const n = row.statuses.completed;
    const value = metric === 'mean' ? row.mean_reward : metric === 'full'
      ? (row.levels.full || 0) / n : Object.values(row.high_levels).reduce((a, b) => a + b, 0) / n;
    const item = document.createElement('div');
    item.className = 'evidence-row';
    const label = document.createElement('span');
    label.textContent = row.label;
    const track = document.createElement('span');
    track.className = 'evidence-track';
    track.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('span');
    fill.style.width = `${value * 100}%`;
    track.append(fill);
    const result = document.createElement('strong');
    result.textContent = metric === 'mean' ? value.toFixed(4) : `${(value * 100).toFixed(1)}%`;
    item.append(label, track, result);
    evidenceBars.append(item);
  }
  evidenceNote.textContent = `${metricLabels[metric]}；分母为各组已完成记录。均来自原评分，不代表独立复核的违规成功率。`;
  document.querySelectorAll('[data-evidence-metric]').forEach(button => {
    const active = button.dataset.evidenceMetric === metric;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
document.querySelectorAll('[data-evidence-metric]').forEach(button => {
  button.addEventListener('click', () => renderEvidence(button.dataset.evidenceMetric));
});
renderEvidence('mean');
