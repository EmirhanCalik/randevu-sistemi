const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 950,
    height: 800,
    minWidth: 700,
    minHeight: 600,
    title: 'Randevu Sistemi',
    icon: path.join(__dirname, 'logo.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  app.quit();
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
