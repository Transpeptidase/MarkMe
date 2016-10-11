const Menu = require('electron').Menu

function addMenu (mainWin) {
  var template = [
    // for file
    {
      label: 'File',
      submenu: [{
        label: 'Open File...',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          mainWin.webContents.send('request-open')
        }
      }, {
        label: 'New File',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          mainWin.webContents.send('request-new')
        }
      }, {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          mainWin.webContents.send('request-save')
        }
      }, {
        label: 'Save As...',
        accelerator: 'CmdOrCtrl+Shift+S',
        click: () => {
          mainWin.webContents.send('request-saveas')
        }
      }]
    },

    // for edit
    {
      label: 'Edit',
      submenu: [{
        role: 'undo'
      }, {
        role: 'redo'
      }, {
        type: 'separator'
      }, {
        role: 'cut'
      }, {
        role: 'copy'
      }, {
        role: 'paste'
      }, {
        role: 'pasteandmatchstyle'
      }, {
        role: 'delete'
      }, {
        role: 'selectall'
      }]
    },

    // for view
    {
      label: 'View',
      submenu: [{
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
        }
      }, {
        type: 'separator'
      }, {
        role: 'resetzoom'
      }, {
        role: 'zoomin'
      }, {
        role: 'zoomout'
      }, {
        type: 'separator'
      }, {
        role: 'togglefullscreen'
      }]
    }

  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

module.exports = addMenu
