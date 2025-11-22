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
      // __dirname points to the path of the currently executing script (electron/main.cjs)
      // path.join resolves the path to the preload script
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, // Protect against prototype pollution
      nodeIntegration: false, // Keep renderer process and main process separate
    },
    icon: path.join(__dirname, '../src/logo.svg')
  });

  const devUrl = 'http://localhost:5173';
  const prodFile = path.join(__dirname, '../dist/index.html');

  // --- START: Verbessertes Laden für Entwicklung ---
  // Diese Funktion versucht, die Entwicklungs-URL zu laden. Wenn sie fehlschlägt,
  // wartet sie kurz und versucht es erneut. Das gibt dem Vite-Server Zeit zum Starten.
  const loadDevUrl = (url, retries = 5) => {
    win.loadURL(url).catch((err) => {
      console.log(`Failed to load ${url}. Retrying in 1 second... (${retries} retries left)`);
      if (retries > 0) {
        setTimeout(() => loadDevUrl(url, retries - 1), 1000);
      } else {
        console.error('Could not connect to development server. Trying to load production build...');
        win.loadFile(prodFile);
      }
    });
  };

  // Wenn die App nicht im Paketmodus läuft (d.h. im Entwicklungsmodus), lade die Dev-URL.
  if (!app.isPackaged) {
    loadDevUrl(devUrl);
  } else {
      win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  // --- END: Verbessertes Laden für Entwicklung ---

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
