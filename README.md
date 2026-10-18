# SRTP 10 月阶段研究汇报

纯 HTML/CSS/JavaScript 网站，无项目依赖安装或构建步骤。

## 本地直接跑

Python 3.10+，无需安装依赖：

```sh
git clone https://github.com/xhy214/jail_work.git
cd jail_work
python -m boundarycheck local
```

终端隐藏输入API key，再从实际模型列表中选模型。默认使用已给定的API地址，执行16次小规模真实调用。结果保存在被Git忽略的`runs/local-*`目录。[完整本地说明](docs/local-quickstart.md)。

## 模型边界一致性测试代码

[使用文档](docs/boundarycheck.md) · [核心代码](boundarycheck/core.py) · [演示配置](examples/boundary_demo.json)

保持同一测试请求，只改单个显示因素，并加入原样重复对照。首版自动判定合成内部标记保护和无害算术；更广泛内容安全测试需要另行接入标注。

```sh
python3 -m boundarycheck plan --config examples/boundary_demo.json
python3 -m boundarycheck run --config examples/boundary_demo.json --mode mock --output runs/boundary-demo
python3 -m unittest discover -s tests -v
```

20项测试和192次模拟调用已通过。模拟结果不是实际模型漏洞；真实运行使用`--mode live`，并安全配置`TARGET_API_BASE`、`TARGET_MODEL`、`TARGET_API_KEY`。

## 本轮新增方法与已执行实验

- [部分回答敏感性与排名翻转](pages/contribution.html)：新增交互实验页面。
- [新贡献定义、推导与一分钟讲稿](docs/new-contribution.md)。
- [复算代码](scripts/ranking_sensitivity.py)与[101点扫描结果](data/audit/ranking_sensitivity.json)。

新结果：同一目标任务两运行组在partial权重λ=0.96处交换排名；平均reward次序与完整内容比例次序相反。这是原裁判标签下的描述性发现，不是独立验证的攻击成功率。方法属于敏感性分析的评测应用，新颖性尚待文献检索。

运行 `python3 scripts/ranking_sensitivity.py` 可从公开聚合数据完全复现，无需API。

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
