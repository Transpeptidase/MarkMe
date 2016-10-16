/* eslint-env jquery */
/* global md2html, hljs, renderMathInElement */

hljs.initHighlightingOnLoad()

$('#editor').focus()

$(document).ready(() => {
  $('.fancybox').fancybox({
    maxWidth: 600,
    maxHeight: 500,
    closeBtn: true,
    fitToView: false,
    title: 'Find'
  })
})

$('#editor').on('change input paste keyup', () => {
  document.getElementById('view').innerHTML = md2html(document.getElementById('editor').value)
  renderMathInElement(document.body)
  $(document).ready(() => {
    $('pre code').each((i, e) => { hljs.highlightBlock(e) })
  })
})

$('#editor').scroll(() => {
  document.getElementById('view').scrollTop = document.getElementById('editor').scrollTop
})
