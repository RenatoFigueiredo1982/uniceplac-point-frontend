const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "MedPoint - Sistema de Internato",
    icon: path.join(__dirname, '../public/logo-oficial.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Necessário para carregar o CSS/JS local no build
    },
  });

  win.setMenuBarVisibility(false);

  // Lógica de caminho absoluto para evitar erro de 'local resource'
  const indexPath = path.join(__dirname, '../dist/index.html');
  win.loadFile(indexPath).catch(err => console.error("Erro ao carregar:", err));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});