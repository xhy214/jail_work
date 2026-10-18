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
