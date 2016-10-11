
var backupID

function backup (mainWin) {
  if (backupID !== undefined) {
    clearInterval(backupID)
  }

  backupID = setInterval(() => {
    mainWin.webContents.send('request-backup')
  }, 10000)
}

function closeBackUp () {
  if (backupID !== undefined) {
    clearInterval(backupID)
  }
}

module.exports = {
  backup: backup,
  closeBackUp: closeBackUp
}
