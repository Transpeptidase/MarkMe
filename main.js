const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const shell = electron.shell

const addMenu = require('./src/main/menu')
const addIpc = require('./src/main/ipc')
const backup = require('./src/main/backup').backup

let mainWin

app.on('ready', () => {
  createWindow()
  addMenu(mainWin)
  addIpc(mainWin)
  backup(mainWin)
  mainWin.setTitle('New File')
})

app.on('window-all-closed', () => {
  app.quit()
})

function createWindow (filepath) {
  mainWin = new BrowserWindow({
    show: false,
    icon: './images/logo.png'
  })

  mainWin.loadURL(`file://${__dirname}/index.html`)

  mainWin.once('ready-to-show', () => {
    mainWin.maximize()
    mainWin.show()
  })

  mainWin.on('close', (e) => {
    mainWin.webContents.send('request-close')
    e.preventDefault()
  })

  mainWin.webContents.on('will-navigate', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })
  mainWin.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })
}
