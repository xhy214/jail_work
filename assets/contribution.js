'use strict';
const groups = JSON.parse(document.getElementById('sensitivityData').textContent);
const labels = {confirm_arson: '盗窃→纵火快照', confirm_arson_discipline: '纵火消融确认', confirm_arson_water: '水源→纵火迁移'};
const colors = ['#7e800f', '#a44e20', '#246d79'];
const slider = document.getElementById('partialWeight');
const svg = document.getElementById('sensitivityChart');
const svgNS = 'http://www.w3.org/2000/svg';
function svgElement(tag, attrs, text) {
  const element = document.createElementNS(svgNS, tag);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  if (text !== undefined) element.textContent = text;
  svg.append(element);
  return element;
}
function renderSensitivity() {
  const weight = Number(slider.value) / 100;
  document.getElementById('weightValue').textContent = weight.toFixed(2);
  svg.replaceChildren();
  const x = v => 65 + 750 * v, y = v => 290 - 235 * v;
  for (let i = 0; i <= 5; i++) {
    const v = i / 5;
    svgElement('line', {x1: x(0), y1: y(v), x2: x(1), y2: y(v), stroke: '#d5d7ac'});
    svgElement('text', {x: x(0) - 12, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 12}, `${Math.round(v * 100)}%`);
    svgElement('text', {x: x(v), y: 315, 'text-anchor': 'middle', 'font-size': 12}, v.toFixed(1));
  }
  groups.forEach((group, i) => {
    svgElement('line', {x1: x(0), y1: y(group.lower), x2: x(1), y2: y(group.upper), stroke: colors[i], 'stroke-width': 3});
    svgElement('circle', {cx: x(weight), cy: y(group.lower + weight * (group.upper - group.lower)), r: 6, fill: colors[i]});
    svgElement('text', {x: 65 + i * 260, y: 355, fill: colors[i], 'font-size': 13, 'font-weight': 700}, labels[group.run]);
  });
  svgElement('line', {x1: x(.96), y1: y(0), x2: x(.96), y2: y(1), stroke: '#a44e20', 'stroke-dasharray': '5 5'});
  svgElement('text', {x: x(.96), y: 38, 'text-anchor': 'end', 'font-size': 13}, '精确交点 λ=0.96');
  svgElement('line', {x1: x(weight), y1: y(0), x2: x(weight), y2: y(1), stroke: '#303118', 'stroke-dasharray': '2 4'});
  const ranking = document.getElementById('sensitivityRanking');
  ranking.replaceChildren();
  const scored = groups.map(group => ({...group, value: group.lower + weight * (group.upper - group.lower)})).sort((a, b) => b.value - a.value);
  scored.forEach(group => {
    const item = document.createElement('li');
    item.textContent = `${labels[group.run]}：${(group.value * 100).toFixed(2)}%`;
    ranking.append(item);
  });
  document.getElementById('crossingConclusion').textContent = weight === .96
    ? 'λ=0.96：快照与消融确认相同，均为57.44%。此处是代数交点，不是统计显著性界限。'
    : weight < .96
      ? '当前λ<0.96：快照组高于消融确认组，次序与它们的平均reward相反。'
      : '当前λ>0.96：消融确认组高于快照组；λ=1时仅高0.5个百分点。';
}
slider.addEventListener('input', renderSensitivity);
renderSensitivity();
