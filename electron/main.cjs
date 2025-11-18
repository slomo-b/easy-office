const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      nodeIntegration: true, // Erlaubt Node.js API im Renderer (wichtig für fileSystem)
      contextIsolation: false, // Erlaubt Zugriff auf window.require
      webSecurity: false // Hilft beim Laden lokaler Ressourcen
    },
  });

  // Lädt die gebaute App aus dem dist Ordner
  // WICHTIG: Vor dem Starten von 'npm run electron' muss 'npm run build' ausgeführt werden!
  win.loadFile(path.join(__dirname, '../dist/index.html'));

  // Falls du im Entwicklungsmodus mit Hot-Reload arbeiten willst (npm run dev läuft parallel):
  // win.loadURL('http://localhost:5173');
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
