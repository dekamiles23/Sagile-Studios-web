const { contextBridge, ipcRenderer } = require("electron");

// cache de eventos que chegaram antes do listener ser registrado
const cache = {
  "update-available":  null,
  "update-progress":   null,
  "update-downloaded": null,
  "update-error":      null
};

["update-available", "update-progress", "update-downloaded", "update-error"].forEach(ch => {
  ipcRenderer.on(ch, (_e, data) => {
    cache[ch] = data ?? true;
  });
});

function on(channel, cb) {
  if (cache[channel] !== null) {
    setTimeout(() => cb(cache[channel]), 0);
  }
  ipcRenderer.on(channel, (_e, data) => cb(data ?? true));
}

const updaterAPI = {
  onAvailable:    (cb) => on("update-available",  cb),
  onProgress:     (cb) => on("update-progress",   cb),
  onDownloaded:   (cb) => on("update-downloaded", cb),
  onError:        (cb) => on("update-error",      cb),
  downloadUpdate: ()   => ipcRenderer.send("download-update"),
  restart:        ()   => ipcRenderer.send("restart-app")
};

const electronAPI = { isElectron: true };

contextBridge.exposeInMainWorld("updater",     updaterAPI);
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
// expõe "api" para compatibilidade com checagem de ambiente (intro, video, etc.)
contextBridge.exposeInMainWorld("api", { isElectron: true });
