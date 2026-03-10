const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "UNICEPLAC - POINT",
    icon: path.join(__dirname, '../public/logo-oficial.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  // Iniciar backend
  startBackend();

  // Carregar o app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  const backendPath = isDev 
    ? path.join(__dirname, '../ponto-medicina-backend/server.js')
    : path.join(process.resourcesPath, 'ponto-medicina-backend/server.js');

  // Configurar variáveis de ambiente para produção
  const env = {
    ...process.env,
    PORT: 3000,
    DATABASE_URL: isDev 
      ? 'file:./dev.db'
      : `file:${path.join(process.resourcesPath, 'prisma/dev.db')}`
  };

  backendProcess = fork(backendPath, [], { 
    env,
    stdio: 'pipe'
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend Error] ${data}`);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers para comunicação com o frontend
ipcMain.handle('get-backend-url', () => {
  return 'http://localhost:3000';
});