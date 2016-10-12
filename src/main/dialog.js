const dialog = require('electron').dialog
const file = require('./file')
const fs = require('fs')
const closeBackUp = require('./backup').closeBackUp

const globalInfo = require('./globalInfo')

const Markdown = [
  {
    name: 'Markdown',
    extensions: ['md', 'markdown', 'Markdown']
  }
]

function helpOpenFile (win, filename) {
  file.readFromFile(filename, (data) => {
    globalInfo.filename = filename
    globalInfo.fileContent = data
    win.webContents.send('open_contents', data)
    win.setTitle(globalInfo.filename)
  })
}

function openFileDialog (win) {
  dialog.showOpenDialog({filters: Markdown}, (filePaths) => {
    if (!Array.isArray(filePaths) || !filePaths.length) {
      return
    }

    fs.exists(file.getBackUpFile(filePaths[0]), res => {
      if (res) {
        backupDialog(win, filePaths[0])
      } else {
        helpOpenFile(win, filePaths[0])
      }
    })
  })
}

function saveAsDialog (win, buffer, callback) {
  dialog.showSaveDialog({filters: Markdown}, (filePath) => {
    if (filePath) {
      globalInfo.filename = filePath
      file.writeToFile(filePath, buffer, callback)
    }
  })
}

function showIfSaveDiaglog (win, buffer, callback) {
  var options = {
    type: 'question',
    buttons: ['Save', 'Don\'t Save', 'Cancel'],
    message: 'Do you want to save?',
    detail: 'Current file has some unsaved changes.'
  }

  dialog.showMessageBox(options, (index) => {
    if (index === 0) {
      if (globalInfo.filename === '') {
        saveAsDialog(win, buffer, callback)
      } else {
        file.writeToFile(globalInfo.filename, buffer, callback)
      }
    } else if (index === 1) {
      callback()
    }
  })
}

function backupDialog (win, filename) {
  var options = {
    type: 'question',
    buttons: ['Recovery from BackUp', 'Edit anyway', 'Quit'],
    message: 'Which you want choose?',
    detail: 'An edit session for this file crashed.'
  }
  dialog.showMessageBox(options, (index) => {
    if (index === 0) {
      file.readFromFile(file.getBackUpFile(filename), (data) => {
        globalInfo.filename = filename
        globalInfo.fileContent = data
        win.webContents.send('open_contents', data)
        win.setTitle(globalInfo.filename)
        file.writeToFile(filename, data)
      })
    } else if (index === 1) {
      helpOpenFile(win, filename)
    } else {
      closeBackUp()
      win.destroy()
    }
  })
}

module.exports = {
  openFileDialog: openFileDialog,
  showIfSaveDiaglog: showIfSaveDiaglog,
  saveAsDialog: saveAsDialog
}
