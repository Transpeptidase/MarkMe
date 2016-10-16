const fs = require('fs')
const globalInfo = require('./globalInfo')

const settingsJSON = 'settings.json'

function readSetting () {
  var data
  try {
    data = fs.readFileSync(settingsJSON, 'utf-8')
  } catch (err) {
    return
  }
  var setting = JSON.parse(data)
  globalInfo.font = setting.font || ''
  globalInfo.preFont = setting.preFont || ''
  globalInfo.fontSize = setting.fontSize || ''
  globalInfo.preFontSize = setting.preFontSize || ''
}

function writeSetting () {
  var content = {
    font: globalInfo.font,
    preFont: globalInfo.preFont,
    fontSize: globalInfo.fontSize,
    preFontSize: globalInfo.preFontSize
  }
  fs.writeFile(settingsJSON, JSON.stringify(content), 'utf-8', (_) => {})
}

module.exports = {
  readSetting: readSetting,
  writeSetting: writeSetting
}
