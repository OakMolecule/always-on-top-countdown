const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  windowAction: (action, payload) => ipcRenderer.send('window-action', action, payload),
  setWindowSize: (opts) => ipcRenderer.send('set-window-size', opts)
});
