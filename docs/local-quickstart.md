# 拉到本地直接运行

需要Python 3.10或更新版本，仅使用标准库，无需pip安装。Windows、macOS和Linux均可使用；下文若`python`不可用，替换成`python3`或Windows的`py -3`。

```sh
git clone https://github.com/xhy214/jail_work.git
cd jail_work
python -m boundarycheck local
```

如果已克隆过，在仓库目录先运行`git pull`。

程序将：

1. 规划16次调用的小规模真实接口测试。
2. 在终端隐藏输入API key，不回显、不保存。
3. 从`https://api2imgtocn.shubiaobiao.com/v1/models`读取模型列表，让你输入编号或模型ID。
4. 执行测试，将SQLite、`summary.json`和`report.md`保存在带时间戳的`runs/local-*`目录。

这是本地终端运行，不需要保存或发布云环境设置。显示`API key (hidden; not saved):`时直接粘贴并回车，屏幕不显示字符属于正常现象。请在本机交互终端执行，不要将密钥贴入代码、聊天或命令行参数。

## 想先检查模型列表

```sh
python -m boundarycheck models
```

## 指定模型，省去选模型步骤

```sh
python -m boundarycheck local --model YOUR_EXACT_MODEL_ID
```

把`YOUR_EXACT_MODEL_ID`替换为接口列表中的实际名称。若接口不支持模型列表，程序也允许手工填写。

## 扩大到192次调用

```sh
python -m boundarycheck local --config examples/boundary_demo.json
```

先完成16次接口测试，确认没有参数、截断或认证错误，再运行较大测试。小规模通过不等于已获得可靠科研结论。

## 不花API费用的离线自检

```sh
python -m unittest discover -s tests -v
python -m boundarycheck run --config examples/boundary_smoke.json --mode mock --output runs/offline-demo
```

mock输出是模拟数据，不能用于真实模型结论。

## 输出和边界

首版使用合成标记保护和无害算术，检查成对实验及随机波动对照。通用有害内容任务的独立标注接口尚未实现，不能将其宣称为原有危险任务实验。

`runs/`和`.env`文件已忽略，不会自动提交到Git。真实接口的兼容性需在本机实际验证；本仓库已验证的是离线测试及模拟HTTP传输。

## 输入模型后看起来没反应

更新后程序会立刻显示选中模型、请求总数、输出路径及每个请求的开始/结束；等待时每10秒打印一次耗时。HTTP套接字超时设为60秒，并非整个实验60秒完成。

```text
[1/16] synthetic_marker_protection / baseline starting request...
[1/16] synthetic_marker_protection / baseline waiting for API... 10s elapsed
[1/16] synthetic_marker_protection / baseline completed in 12.3s
```

若仍在运行旧版，可先Ctrl+C，再git pull，然后用完整模型ID重跑：

```sh
python -m boundarycheck local --model gpt-4.1-mini-2025-04-14
```

模型编号随列表变化，完整ID更稳定。认证、权限、模型不存在或限流错误会提前结束；连续3次其他失败也停止，其余请求保留pending。报告中显示错误类型和HTTP状态码，不输出服务端正文或密钥。Ctrl+C保留已落盘数据，下一次默认使用新目录。

看到`completed`与`failed`后表示程序已经结束。只要同一个重复块有任意一次失败，整个四调用块都排除。查看`summary.json`中的`complete_pairs`判断实际有效组数。新版本会在最终输出中列出错误汇总；`TruncatedCompletion`表示token截断，`HTTPError HTTP 429`表示限流等。旧数据库只能重算当时记录的错误类型，无法恢复未保存的HTTP状态码。
