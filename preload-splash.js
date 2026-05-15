const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("splashAPI", {
  finish: () => ipcRenderer.send("splash-finished")
});
