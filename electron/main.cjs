const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Kein System-Rahmen
    transparent: true, // Transparenter Hintergrund für abgerundete Ecken via CSS
    backgroundColor: '#00000000', // Vollständig transparent als Startfarbe
    hasShadow: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Erlaubt window.require in der Renderer-Process
      webSecurity: false, 
    },
    icon: path.join(__dirname, '../src/logo.svg')
  });

  // Versuche zuerst den Vite Dev Server zu laden, sonst fallback auf build Ordner
  win.loadURL('http://localhost:5173').catch(() => {
      win.loadFile(path.join(__dirname, '../dist/index.html'));
  });

  // IPC Listener für die Fenstersteuerung aus der React App
  ipcMain.on('minimize-window', () => {
    win.minimize();
  });

  ipcMain.on('maximize-window', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on('close-window', () => {
    win.close();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
