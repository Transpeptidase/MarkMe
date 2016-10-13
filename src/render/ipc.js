/* eslint-env jquery */
/* global md2html, hljs, renderMathInElement */

const ipc = require('electron').ipcRenderer

ipc.on('open_contents', (event, contents) => {
  document.getElementById('editor').value = contents
  var val = document.getElementById('editor').value
  ipc.send('confirm-contents', val)
  document.getElementById('view').innerHTML = md2html(val)
  renderMathInElement(document.body)
  $(document).ready(() => {
    $('pre code').each((i, e) => { hljs.highlightBlock(e) })
  })
})

ipc.on('request-open', (event, contents) => {
  ipc.send('response-open', document.getElementById('editor').value)
})

ipc.on('request-new', (event, contents) => {
  ipc.send('response-new', document.getElementById('editor').value)
})

ipc.on('request-save', (event, contents) => {
  ipc.send('response-save', document.getElementById('editor').value)
})

ipc.on('request-saveas', (event, contents) => {
  ipc.send('response-saveas', document.getElementById('editor').value)
})

ipc.on('request-close', (event, contents) => {
  ipc.send('response-close', document.getElementById('editor').value)
})

ipc.on('request-backup', (event, contents) => {
  ipc.send('response-backup', document.getElementById('editor').value)
})

ipc.on('request-find', (event, contents) => {
  $('#find').click()
  $('#find-content').focus()
})

var findInfo = []
var findIndex = 0

function find () {
  var text = document.getElementById('editor')
  var finded = $('#find-content').val()
  var isCaseInS = $('#case').is(':checked')
  var isRe = $('#re').is(':checked')
  if (findInfo[0] !== finded && findInfo[1] !== isCaseInS && findInfo[2] !== isRe) {
    findInfo = [finded, isCaseInS, isRe]
    findIndex = 0
  }
  if (find === '') return false
  var content = text.value

  if (!isRe) {
    if (isCaseInS) {
      content = content.toLowerCase()
      finded = finded.toLowerCase()
    }
    var l = finded.length
    var index = content.indexOf(finded, findIndex)
    if (index === -1) {
      findIndex = 0
      index = content.indexOf(finded, findIndex)
    }
    if (index !== -1) {
      text.value = content.substring(0, index)
      text.scrollTop = index
      text.value = content
      text.setSelectionRange(index, l + index)
      findIndex = index + l
    }
  } else {
    var re
    try {
      if (isCaseInS) {
        re = new RegExp(finded, 'i')
      } else {
        re = new RegExp(finded)
      }
    } catch (err) {
      return false
    }

    var ans = content.slice(findIndex).match(re)
    var clen = content.length
    if (ans === null) {
      findIndex = 0
      ans = content.slice(findIndex).match(re)
    }
    if (ans[0] === '') {
      while (ans !== null && ans[0] === '') {
        ++findIndex
        if (findIndex > clen) {
          findIndex = 0
          break
        }
        ans = content.slice(findIndex).match(re)
      }
    }
    if (ans !== null && ans[0] !== '') {
      var i = findIndex + ans.index
      l = ans[0].length
      text.value = content.substring(0, i)
      text.scrollTop = i
      text.value = content
      text.setSelectionRange(i, i + l)
      findIndex = i + l
    }
  }

  return false
}
