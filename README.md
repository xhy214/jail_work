# 组合器 × 多臂老虎机阶段汇报

纯静态、多页面 GitHub Pages 站点，图表由内置 SVG 和 JavaScript 渲染，无外部依赖。

## 数据来源

- 实验数据库：`runs/*/experiment.db`（10 个数据库，5,479 条试次记录）
- 组合器结构：实验所用 `try_game_simulation_schema` v5.9.0（48 元件 / 20 槽位 / 3 条兼容规则 / 4 个固定区块）
- 冠军组合：三个任务确认期数据库中的固定组合（confirm_best / confirm_water_best / confirm_arson_discipline）

页面仅展示结构与聚合统计，不包含原始提示文本、模板正文或任务载荷内容。

## 文件结构

- `index.html`：总览首页
- `pages/`：组合器（含冠军组合查阅）、探索、确认迁移、消融、运行质量详情页
- `assets/`：共享样式与图表脚本
- `.nojekyll`：GitHub Pages 静态文件标记

部署时保持目录结构，将 ZIP 内所有内容上传到仓库根目录。启用 GitHub Pages 后，首页与详情页均可通过导航直接访问。更新时覆盖同名文件并提交。
