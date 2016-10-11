const fs = require('fs')
const path = require('path')

function readFromFile (filePath, callback) {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (!err) {
      callback(data)
    }
  })
}

function writeToFile (filePath, contents, callback = () => {}) {
  fs.writeFile(filePath, contents, 'utf-8', (err) => {
    if (!err) {
      callback()
    }
  })
}

function getBackUpFile (filename) {
  var dir = path.dirname(filename)
  var base = path.basename(filename)
  return path.join(dir, '.' + base + '.markme.backup')
}

function deleteBackUpFile (filename) {
  if (filename !== '') {
    fs.unlink(getBackUpFile(filename), err => {})
  }
}

module.exports = {
  readFromFile: readFromFile,
  writeToFile: writeToFile,
  getBackUpFile: getBackUpFile,
  deleteBackUpFile: deleteBackUpFile
}
