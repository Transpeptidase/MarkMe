/* global Detector */

;
(function () {
  const ipc = require('electron').ipcRenderer
  const fonts =
  [ 'Aharoni',
  'Al Bayan',
  'Andale Mono',
  'Arial',
  'Arial Black',
  'Arial Narrow',
  'Arial Rounded MT Bold',
  'Beijing',
  'Bertram',
  'Bookman Old Style',
  'Comic Sans MS',
  'Consolas',
  'Courier',
  'Courier New',
  'Cracked',
  'FangSong',
  'Gabriola',
  'KaiTi',
  'Microsoft JhengHei',
  'Microsoft Sans Serif',
  'Microsoft YaHei',
  'Microsoft YaHei UI',
  'Mona Lisa Solid',
  'Monaco',
  'New York',
  'ST FangSong',
  'ST Heiti',
  'ST Kaiti',
  'ST Song',
  'SimHei' ]

  var d = new Detector()
  ipc.send('font', fonts.filter(x => d.detect(x)).toString())
})()
