const ipc = require('electron').ipcMain
const dialog = require('./dialog')
const globalInfo = require('./globalInfo')
const file = require('./file')

module.exports = function (win) {
  ipc.on('response-open', (event, buffer) => {
    if (globalInfo.fileContent === buffer) {
      dialog.openFileDialog(win)
    } else {
      dialog.showIfSaveDiaglog(win, buffer, () => {
        dialog.openFileDialog(win)
      })
    }
  })

  ipc.on('response-new', (event, buffer) => {
    let callback = () => {
      globalInfo.filename = ''
      globalInfo.fileContent = ''
      win.webContents.send('open_contents', '')
      win.setTitle('New File')
    }

    if (globalInfo.fileContent === buffer) {
      callback()
    } else {
      dialog.showIfSaveDiaglog(win, buffer, callback)
    }
  })

  ipc.on('response-save', (event, buffer) => {
    if (globalInfo.filename === '') {
      dialog.saveAsDialog(win, buffer, () => {
        globalInfo.fileContent = buffer
        win.setTitle(globalInfo.filename)
      })
    } else {
      file.writeToFile(globalInfo.filename, buffer)
      globalInfo.fileContent = buffer
    }
  })

  ipc.on('response-saveas', (event, buffer) => {
    dialog.saveAsDialog(win, buffer, () => {
      globalInfo.fileContent = buffer
      win.setTitle(globalInfo.filename)
    })
  })

  ipc.on('response-close', (event, buffer) => {
    if (globalInfo.fileContent === buffer) {
      win.destroy()
    } else {
      dialog.showIfSaveDiaglog(win, buffer, () => {
        win.destroy()
      })
    }
  })
}
