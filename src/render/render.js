/* eslint-env jquery */
/* global md2html, hljs, renderMathInElement */

$('#editor').focus()

$('#editor').on('change input paste keyup', () => {
  document.getElementById('view').innerHTML = md2html(document.getElementById('editor').value)
  renderMathInElement(document.body)
  $(document).ready(() => {
    $('pre code').each((i, e) => { hljs.highlightBlock(e) })
  })
})
