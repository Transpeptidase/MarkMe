/* eslint-env jquery */
/* global md2html, hljs, renderMathInElement */

;
(function () {
  const ipc = require('electron').ipcRenderer

  ipc.on('open_contents', (event, contents) => {
    document.getElementById('editor').value = contents
    var val = document.getElementById('editor').value
    ipc.send('confirm-contents', val)
    document.getElementById('view').innerHTML = md2html(val)
    renderMathInElement(document.body)
    $(document).ready(() => {
      $('pre code').each((i, e) => {
        hljs.highlightBlock(e)
      })
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

  ipc.on('request-change-font', (event, font) => {
    document.getElementById('editor').style.fontFamily = font
  })

  ipc.on('request-change-font-p', (event, font) => {
    document.getElementById('view').style.fontFamily = font
  })

  ipc.on('request-change-size', (event, size) => {
    document.getElementById('editor').style.fontSize = size + 'px'
  })

  ipc.on('request-change-size-p', (event, size) => {
    document.getElementById('view').style.fontSize = size + 'px'
  })

  ipc.on('init-setting', (event, data) => {
    console.log('dsadsa')
    var setting = data.split(',')
    if (setting[0] !== '') {
      document.getElementById('editor').style.fontFamily = setting[0]
    }
    if (setting[1] !== '') {
      document.getElementById('view').style.fontFamily = setting[1]
    }
    if (setting[2] !== '') {
      document.getElementById('editor').style.fontSize = setting[2] + 'px'
    }
    if (setting[3] !== '') {
      document.getElementById('view').style.fontSize = setting[3] + 'px'
    }
  })

  ipc.send('init-ok')
})()
