const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 650, // Optimierte Höhe für Sidebar-Inhalte ohne Bildschirm-Beschränkungen
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
      devTools: true, // Immer aktivieren
    },
    // __dirname ist der Ordner der aktuellen Datei (electron/)
    // Im Entwicklungsmodus: ../public/favicon.ico
    // Im Produktionsmodus: ../dist/favicon.ico (da Vite dorthin baut)
    icon: path.join(__dirname, app.isPackaged ? '../dist/favicon.ico' : '../public/favicon.ico'),
    show: false, // Verstecke Fenster bis bereit
  });

  const devUrl = 'http://localhost:5173'; // Korrekte Port-Konfiguration
  const prodFile = path.join(__dirname, '../dist/index.html');

  // --- START: Verbessertes Laden für Entwicklung ---
  // Diese Funktion versucht, die Entwicklungs-URL zu laden. Wenn sie fehlschlägt,
  // wartet sie kurz und versucht es erneut. Das gibt dem Vite-Server Zeit zum Starten.
  const loadDevUrl = async (url, retries = 30) => {
    try {
      await win.loadURL(url);
      console.log('Successfully connected to development server!');
      win.show(); // Zeige Fenster erst wenn erfolgreich geladen
    } catch (err) {
      console.log(`Failed to load ${url}. Retrying in 1 second... (${retries} retries left)`);
      if (retries > 0) {
        setTimeout(() => loadDevUrl(url, retries - 1), 1000);
      } else {
        console.error('Could not connect to development server after all retries. Loading production build...');
        try {
          win.loadFile(prodFile);
          win.show();
        } catch (prodErr) {
          console.error('Failed to load production build:', prodErr);
          win.loadURL('data:text/html,<h1>Failed to load app</h1>');
          win.show();
        }
      }
    }
  };

  // Wenn die App nicht im Paketmodus läuft (d.h. im Entwicklungsmodus), lade die Dev-URL.
  if (!app.isPackaged) {
    loadDevUrl(devUrl);
  } else {
      win.loadFile(prodFile);
      win.show();
  }
  // --- END: Verbessertes Laden für Entwicklung ---

  // Hot Reload für Development
  if (!app.isPackaged) {
    // Öffne DevTools sofort
    win.webContents.openDevTools({ mode: 'detach' });

    // Automatisch neu laden wenn Vite-Änderungen erkannt werden
    win.webContents.on('did-fail-load', () => {
      console.log('Electron window failed to load. This usually means the Vite server restarted.');
      setTimeout(() => {
        console.log('Attempting to reload...');
        win.reload();
      }, 2000);
    });

    // Auch bei erfolgreichem Laden prüfen
    win.webContents.on('dom-ready', () => {
      console.log('DOM is ready!');
      win.show(); // Sicherstellen, dass das Fenster sichtbar ist
    });
  }

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

  // Bei Fehler direkt zeigen
  win.webContents.on('did-finish-load', () => {
    if (!app.isPackaged) {
      console.log('Electron window finished loading successfully.');
    }
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
