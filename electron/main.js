const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      nodeIntegration: true, // Notwendig für electronFileSystem.ts (window.require)
      contextIsolation: false, // Erlaubt direkten Zugriff im Renderer
      webSecurity: false // Hilft manchmal bei lokalen Datei-Referenzen, optional
    },
  });

  // Im Entwicklungsmodus (wenn npm run dev läuft) kann man hier die URL laden:
  // win.loadURL('http://localhost:5173');
  
  // Für den Production-Build laden wir die index.html
  // Pfad muss relativ zur Position von main.js sein (einen Ordner hoch zu dist)
  win.loadFile(path.join(__dirname, '../dist/index.html'));
  
  // Menüleiste ausblenden (optional)
  // win.setMenuBarVisibility(false);
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