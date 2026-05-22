const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

Menu.setApplicationMenu(null);

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.allowPrerelease = false;
autoUpdater.forceDevUpdateConfig = false;

let splash;
let mainWindow;
let mainWindowCreated = false;

// evita dupla instância
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// =======================
// SPLASH
// =======================
function createSplash() {
  splash = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    backgroundColor: "#000",
    show: true,
    webPreferences: {
      preload: path.join(__dirname, "preload-splash.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splash.loadFile("splash.html");

  splash.on("closed", () => {
    splash = null;
  });
}

// =======================
// MAIN WINDOW
// =======================
function createMain() {
  if (mainWindowCreated) return;
  mainWindowCreated = true;

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile("index.html");

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    if (splash && !splash.isDestroyed()) {
      splash.close();
    }
  });

  // checa update só depois que a página carregou completamente
  mainWindow.webContents.once("did-finish-load", () => {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(err => {
        console.error("[updater] checkForUpdates falhou:", err.message);
      });
    }, 3000);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    mainWindowCreated = false;
  });
}

// =======================
// START
// =======================
app.whenReady().then(() => {
  createSplash();

  setTimeout(() => {
    createMain();
  }, 13000);
});

// =======================
// AUTO UPDATER EVENTS
// =======================
autoUpdater.on("checking-for-update", () => {
  console.log("[updater] Verificando atualizações...");
});

autoUpdater.on("update-not-available", () => {
  console.log("[updater] Nenhuma atualização disponível.");
});

autoUpdater.on("update-available", (info) => {
  console.log("[updater] Update disponível:", info.version);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-available", {
      version: info.version,
      notes: info.releaseNotes || ""
    });
  }
});

autoUpdater.on("download-progress", (progress) => {
  console.log("[updater] Progresso:", Math.round(progress.percent) + "%");
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-progress", progress.percent);
  }
});

autoUpdater.on("update-downloaded", () => {
  console.log("[updater] Download concluído.");
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-downloaded");
  }
});

autoUpdater.on("error", (err) => {
  console.error("[updater] Erro:", err.message);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-error", err.message);
  }
});

// =======================
// IPC
// =======================
ipcMain.on("download-update", () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on("restart-app", () => {
  setTimeout(() => {
    autoUpdater.quitAndInstall(false, true);
  }, 300);
});

ipcMain.on("splash-finished", () => {
  if (splash && !splash.isDestroyed()) {
    splash.close();
  }

  createMain();
});
