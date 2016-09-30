const dialog = require('electron').dialog
const file = require('./file')

const globalInfo = require('./globalInfo')

const Markdown = [
  {
    name: 'Markdown',
    extensions: ['md', 'Markdown']
  }
]

function openFileDialog (win) {
  dialog.showOpenDialog({filters: Markdown}, (filePaths) => {
    if (!Array.isArray(filePaths) || !filePaths.length) {
      return
    }
    file.readFromFile(filePaths[0], (data) => {
      globalInfo.filename = filePaths[0]
      globalInfo.fileContent = data
      win.webContents.send('open_contents', data)
      win.setTitle(globalInfo.filename)
    })
  })
}

function saveAsDialog (win, buffer, callback) {
  dialog.showSaveDialog({filters: Markdown}, (filePath) => {
    console.log('sa')
    console.log(filePath)
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

  dialog.showMessageBox(options, function (index) {
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

module.exports = {
  openFileDialog: openFileDialog,
  showIfSaveDiaglog: showIfSaveDiaglog,
  saveAsDialog: saveAsDialog
}
