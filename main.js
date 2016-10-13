const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const shell = electron.shell
// const fontManager = require('font-manager')

const addMenu = require('./src/main/menu')
const addIpc = require('./src/main/ipc')
const backup = require('./src/main/backup').backup
// const globalInfo = require('./src/main/globalInfo')
// const fontManager = require('font-manager')

let mainWin

app.on('ready', () => {
  createWindow()
  addMenu(mainWin)
  addIpc(mainWin)
  backup(mainWin)
  mainWin.setTitle('New File')
  // fontManager.getAvailableFontsSync()
  // fontManager.getAvailableFonts(function (fonts) {
  //   // fonts = fonts.family.sort()
  //   // var re = [fonts[0]]
  //   // for (var i = 1; i < fonts.length; i++) {
  //   //   if (fonts[i] !== re[re.length - 1]) {
  //   //     re.push(fonts[i])
  //   //   }
  //   // }
  //   // globalInfo.fonts = re
  // })
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
