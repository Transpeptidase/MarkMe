const ipc = require('electron').ipcRenderer

ipc.on('open_contents', (event, contents) => {
  document.getElementById('editor').value = contents
  document.getElementById('view').innerHTML = marked(contents)
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

$("#editor").on("change input paste keyup", () => {
  document.getElementById('view').innerHTML = marked(document.getElementById('editor').value)
})
