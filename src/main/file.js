const fs = require('fs')

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

module.exports = {
  readFromFile: readFromFile,
  writeToFile: writeToFile
}
