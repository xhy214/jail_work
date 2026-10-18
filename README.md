# SRTP 10 月阶段研究汇报

纯 HTML/CSS/JavaScript 网站，无项目依赖安装或构建步骤。

## 2026-10-18 汇报入口

- [流程总览](index.html)：实验框架与本轮材料入口。
- [评分审计](pages/audit.html)：4,054 条全量算分核查、指标对照与27条初筛。
- [研究路线](pages/research.html)：三个可证伪研究问题与验证顺序。
- [五分钟讲稿与问答](docs/briefing-2026-10-18.md)。
- [完整审计说明](docs/audit-report.md)。

已完成90条分层抽样、27条单次定性初筛；其余63条及独立裁判尚待完成。初筛标签不是人工金标准，分歧数量不能解释成误判率，reward不能解释成违规成功率。候选创新仍需实验和文献检索确认。

## 本地运行

在仓库根目录执行 `python3 -m http.server 8000 --bind 127.0.0.1`。浏览器打开站点首页。新增页面支持打印，可使用浏览器另存为PDF。

## 复算聚合证据

持有授权实验数据库时执行：

```sh
python3 scripts/audit_metrics.py --runs-dir /path/to/RL/shashasha/runs --output-dir /tmp/audit-recomputed
```

仅使用Python标准库；只读数据库，无网络请求，不导出原始交互。固定种子为20261013。聚合结果及90条抽样索引位于 [data/audit](data/audit)。27条定性结果须由审查者复核，不能用该脚本自动生成。

仓库不包含原始压缩包、实验数据库、原始交互或API凭据。
