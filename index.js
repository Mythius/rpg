const { app, BrowserWindow } = require('electron');
const createDesktopShortcut = require('create-desktop-shortcuts');

if (process.argv.length > 1 && process.argv[1] != '.') {
    const shortcutsCreated = createDesktopShortcut({
        windows: { 
            filePath: '%appdata%\\..\\local\\chemicc\\chemicc.exe',
            icon: __dirname + '\\favicon.ico'
        }
    });
}

function createWindow() {
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