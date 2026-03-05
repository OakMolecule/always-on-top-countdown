const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  windowAction: (action, payload) => ipcRenderer.send('window-action', action, payload),
  setWindowSize: (opts) => ipcRenderer.send('set-window-size', opts),
  openDevTools: () => ipcRenderer.send('open-devtools'),
  getVersion: () => ipcRenderer.invoke('get-version')
});
