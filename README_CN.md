# 置顶倒计时器

[English](./README.md)

一个简约、跨平台的倒计时器，始终显示在所有窗口之上。使用 Electron 构建。

![应用截图](./screenshots/main.png)

<!-- 在此添加截图 -->

## ✨ 功能特点

- **始终置顶**：保持在所有其他窗口之上
- **自定义外观**：
  - 5 种倒计时显示颜色主题
  - 可调节背景透明度
  - 可调整窗口大小，UI 自适应
- **灵活控制**：
  - 启动、暂停和重置倒计时
  - 切换置顶模式
  - 最小化到任务栏
  - 可选窗口控制按钮（可隐藏）
- **点击穿透模式**：允许鼠标点击穿透到下层窗口
- **侧边设置面板**：从右侧滑出的非侵入式设置面板
- **跨平台支持**：支持 Windows、macOS 和 Linux

![设置面板](./screenshots/settings.png)

<!-- 在此添加截图 -->

## 📥 下载

下载适用于您平台的最新版本：

- **Windows**：`.exe` 安装程序或便携版
- **macOS**：`.dmg` 或 `.zip`
- **Linux**：`.AppImage` 或 `.deb`

[查看所有版本](https://github.com/OakMolecule/always-on-top-countdown/releases)

## 🚀 快速开始

1. 下载并安装适用于您平台的应用程序
2. 启动应用
3. 设置您想要的倒计时时间（分钟和秒）
4. 点击播放按钮 ▶ 开始倒计时
5. 点击设置按钮 ⚙ 自定义外观

![使用演示](./screenshots/demo.gif)

<!-- 在此添加演示 gif -->

## 🎨 个性化定制

### 颜色主题

从 5 个内置颜色主题中选择：

- 白色（默认）
- 红色
- 绿色
- 橙色
- 蓝色

### 背景透明度

调整背景透明度以融入您的桌面（10% - 95%）

### 窗口控制按钮

切换窗口控制按钮的显示（📌 置顶、▁ 最小化、✕ 关闭）

## 🔧 开发

### 前置要求

- Node.js（v16 或更高版本）
- npm 或 yarn

### 安装配置

```bash
# 克隆仓库
git clone https://github.com/OakMolecule/always-on-top-countdown.git
cd always-on-top-countdown

# 安装依赖
npm install

# 开发模式运行
npm start
```

### 构建

```bash
# 为所有平台构建
npm run pack

# 构建输出将在 ./dist 目录中
```

### 项目结构

```
.
├── main.js          # Electron 主进程
├── renderer.js      # UI 逻辑和事件处理
├── preload.js       # IPC 预加载脚本
├── index.html       # 主 HTML 结构
├── style.css        # 样式和主题
├── logo.png         # 应用图标
└── package.json     # 项目配置
```

## 🎯 使用技巧

- **拖动**：点击并拖动顶部空白区域来移动窗口
- **调整大小**：拖动窗口边缘调整大小（最小：150×120，默认：200×160）
- **快速设置**：设置面板会记住您的偏好设置
- **点击穿透**：启用此功能可与计时器后面的窗口交互
- **键盘操作**：使用 Tab 键在输入框之间导航

## 🐛 已知问题

- 在某些 Linux 系统上，窗口透明度可能无法正常工作
- macOS：点击穿透模式需要辅助功能权限

## 📝 许可证

MIT 许可证 - 可自由使用和修改。

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📧 联系方式

如果您有任何问题或建议，请在 GitHub 上提出 issue。

---

用 ❤️ 和 Electron 制作
