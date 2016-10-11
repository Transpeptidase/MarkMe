const ipc = require('electron').ipcMain
const dialog = require('./dialog')
const globalInfo = require('./globalInfo')
const file = require('./file')
const closeBackUp = require('./backup').closeBackUp

module.exports = function (win) {
  ipc.on('response-open', (event, buffer) => {
    let curFile = globalInfo.filename
    if (globalInfo.fileContent === buffer) {
      file.deleteBackUpFile(curFile)
      dialog.openFileDialog(win)
    } else {
      dialog.showIfSaveDiaglog(win, buffer, () => {
        file.deleteBackUpFile(curFile)
        dialog.openFileDialog(win)
      })
    }
  })

  ipc.on('confirm-contents', (event, buffer) => {
    globalInfo.fileContent = buffer
  })

  ipc.on('response-new', (event, buffer) => {
    let curFile = globalInfo.filename
    let callback = () => {
      file.deleteBackUpFile(curFile)
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
    let curFile = globalInfo.filename
    if (globalInfo.filename === '') {
      dialog.saveAsDialog(win, buffer, () => {
        globalInfo.fileContent = buffer
        win.setTitle(globalInfo.filename)
      })
    } else {
      file.deleteBackUpFile(curFile)
      file.writeToFile(globalInfo.filename, buffer)
      globalInfo.fileContent = buffer
    }
  })

  ipc.on('response-saveas', (event, buffer) => {
    var curFile = globalInfo.fileContent
    dialog.saveAsDialog(win, buffer, () => {
      file.deleteBackUpFile(curFile)
      globalInfo.fileContent = buffer
      win.setTitle(globalInfo.filename)
    })
  })

  ipc.on('response-close', (event, buffer) => {
    if (globalInfo.fileContent === buffer) {
      closeBackUp()
      file.deleteBackUpFile(globalInfo.filename)
      win.destroy()
    } else {
      dialog.showIfSaveDiaglog(win, buffer, () => {
        closeBackUp()
        file.deleteBackUpFile(globalInfo.filename)
        win.destroy()
      })
    }
  })

  ipc.on('response-backup', (event, buffer) => {
    if (globalInfo.filename !== '' && globalInfo.fileContent !== buffer) {
      file.writeToFile(file.getBackUpFile(globalInfo.filename), buffer)
    }
  })
}
