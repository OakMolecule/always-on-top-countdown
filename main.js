const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 300,
    minWidth: 360,
    minHeight: 240,
    frame: false,           // 无窗口边框
    transparent: true,      // 透明背景（mac & windows 支持有限）
    alwaysOnTop: true,      // 始终置顶
    skipTaskbar: false,
    resizable: true,
    maximizable: false,     // 禁用最大化（包括双击标题栏）
    fullscreenable: false,  // 禁用全屏
    icon: path.join(__dirname, 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    // mac 特性：使其能在所有桌面空间显示
    titleBarStyle: 'hidden',
  });

  // 在所有桌面空间都显示（mac）
  if (process.platform === 'darwin') {
    win.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true});
  }

  win.loadFile('index.html');

  // 可选：开发者工具
  win.webContents.openDevTools({mode: 'detach'});

  win.on('closed', () => {
    win = null;
  });
}

// 接收渲染进程请求设置 点击穿透（忽略鼠标）或取消
ipcMain.on('set-ignore-mouse', (event, ignore) => {
  if (win && !win.isDestroyed()) {
    // 第二个参数可为 { forward: true } 使鼠标事件传递到下面的窗口（windows
    // 支持）
    win.setIgnoreMouseEvents(ignore, {forward: true});
  }
});

// 接收最小化 / 关闭 等动作
ipcMain.on('window-action', (event, action) => {
  if (!win || win.isDestroyed()) return;
  if (action === 'minimize') win.minimize();
  if (action === 'close') win.hide();
  if (action === 'toggle-always-on-top')
    win.setAlwaysOnTop(!win.isAlwaysOnTop());
  if (action === 'quit') app.quit();
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // mac 习惯保持应用激活
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) createWindow();
});
