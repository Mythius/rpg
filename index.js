const { app, BrowserWindow } = require('electron');

function createWindow () {
  let win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    },
    icon: __dirname + '/favicon.ico'
  })

  win.loadFile('index.html')

  win.setMenu(null);
}

app.on('ready', createWindow)