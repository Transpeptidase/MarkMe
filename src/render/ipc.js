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
