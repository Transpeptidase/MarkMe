;
(function () {
  function ParseRes (succ, content, tag, left) {
    this.succ = succ
    this.content = content
    this.tag = tag
    this.left = left
  }

  const ParseFail = new ParseRes(false)

  var gLinks = new Map()

  const PARA = 'p'
  const HEADER = 'h'

  const reHeader = /^ *(#{1,6}) +(.*)\n/
  const rePara = /^(.*)\n/
  const reNewPara = /^\s*\n/
  const reCodePara = /^ *```(.*)\n([\s\S]*?)``` *\n/
  const reHr = /^ *[*\-] *[*\-] *[*\-] *[*\- ]*\n/
  const reTable = /^( *\|.*\| *\n)( *\|.*\| *\n)(( *\|.*\| *\n)+)/

  const reLink = /\[(.*?)\]\((.*?)\)/g
  const reUseGLink = /\[(.*?)\]\[(.*?)\]/g
  const reImage = /!\[(.*?)\]\((.*?)\)/g
  const reEm1 = /\*([^ ].*?)\*/g
  const reEm2 = /_([^ ].*?)_/g
  const reStrong1 = /\*\*([^ ].*?)\*\*/g
  const reStrong2 = /__([^ ].*?)__/g
  const reDel = /~~([^ ].*?)~~/g
  const reCode = /(`+)(.*)\1/g

  const reGLink = /^ *\[(.*)\]: *(.*)\n/

  function transInline (s) {
    return s.replace(reImage, '<img src="$2" alt="$1">')
      .replace(reLink, '<a href=$2>$1</a>')
      .replace(reStrong1, '<strong>$1</strong>')
      .replace(reStrong2, '<strong>$1</strong>')
      .replace(reEm1, '<em>$1</em>')
      .replace(reEm2, '<em>$1</em>')
      .replace(reDel, '<del>$1</del>')
      .replace(reCode, `<code>$2</code>`)
  }

  function pHeader (s) {
    var ans = s.split(reHeader)
    if (ans[0] === '') {
      var tag = `h${ans[1].length}`
      return new ParseRes(true, `<${tag}>${transInline(ans[2])}</${tag}>`, HEADER, ans[3])
    }
    return ParseFail
  }

  function pPara (s) {
    var ans = s.split(rePara)
    if (ans[0] === '') {
      var len = ans[1].length
      var i = 0
      while (ans[1][len - 1 - i] === ' ') ++i
      return new ParseRes(true, `${transInline(ans[1])}${i > 1 ? '<br/>' : ''}`, PARA, ans[2])
    }
    return ParseFail
  }

  function pNewP (s) {
    var ans = s.split(reNewPara)
    if (ans[0] === '') {
      return new ParseRes(true, '', '', ans[1])
    }
    return ParseFail
  }

  function pCodeP (s) {
    var ans = s.split(reCodePara)
    if (ans[0] === '') {
      var html = `<pre style="padding: 0;"><code class=${ans[1].trim()}>${ans[2].replace(/</g, '&lt;')}</code></pre>`
      return new ParseRes(true, html, '', ans[3])
    }
    return ParseFail
  }

  function pHr (s) {
    var ans = s.split(reHr)
    if (ans[0] === '') {
      return new ParseRes(true, '<hr/>', '', ans[1])
    }
    return ParseFail
  }

  function pGLink (s) {
    var ans = s.split(reGLink)
    if (ans[0] === '') {
      gLinks[ans[1]] = ans[2]
      return new ParseRes(true, '', '', ans[3])
    }
    return ParseFail
  }

  function pTable (s) {
    var splitLine = (str, tag) => {
      var t = str.trim().split('|')
      var l = t.length
      console.log(t)
      var res = ''
      for (var i = 1; i < l - 1; ++i) {
        res += `<${tag}>${t[i]}</${tag}>\n`
      }
      return res
    }
    var ans = s.split(reTable)
    if (ans[0] === '') {
      var th = `<thead><tr>${splitLine(ans[1], 'th')}</tr></thead>`
      var tds = ans[3].split('\n')
      var td = []
      var l = tds.length
      for (var i = 0; i < l - 1; ++i) {
        td.push(`<tr>${splitLine(tds[i], 'td')}</tr>`)
      }
      td = `<tbody>${td.join('')}</tbody>`
      return new ParseRes(true, transInline(`<table>${th}${td}</table>`), '', ans[5])
    }
    return ParseFail
  }

  const parseList = [pHeader, pGLink, pNewP, pHr, pCodeP, pTable, pPara]

  function groupBy (array, f) {
    var len = array.length
    var ans = []
    var ansLen = 0
    var pre
    for (var i = 0; i < len; ++i) {
      var cur = array[i]
      if (f(cur) === pre) {
        ans[ansLen - 1].push(cur)
      } else {
        ans.push([cur])
        ++ansLen
        pre = f(cur)
      }
    }
    return ans
  }

  function findIndex (array, start, end, f) {
    for (var i = start; i < end; ++i) {
      if (f(array[i])) {
        return i
      }
    }
    return -1
  }

  function joinP (array, start, end) {
    var ans = ''
    for (var i = start; i < end; ++i) {
      ans += array[i]
    }
    if (ans === '') return ''
    return `<p>${ans}</p>`
  }

  function map (array, start, end, f) {
    for (var i = start; i < end; ++i) {
      array[i] = f(array[i])
    }
  }

  function firstNotBlank (s) {
    var len = s.length
    var i
    for (i = 0; i < len; ++i) {
      if (s[i] !== ' ') {
        return [i, s[i]]
      }
    }
  }

  function recursionP (htmls, start, end) {
    const reList = /^ *([\-+*]|[0-9].) /
    const reQuote = /^ *>/
    const rePureList = /^([\-+*]|[0-9].) /
    const i = findIndex(htmls, start, end, (x) => {
      return x.search(reQuote) === 0 || x.search(reList) === 0
    })
    if (i === -1) {
      return joinP(htmls, start, end)
    } else {
      var token = firstNotBlank(htmls[i])
      if (token[1] === '>') {
        map(htmls, i, end, x => x.replace(reQuote, ''))
        return `${joinP(htmls, start, i)}<blockquote>${recursionP(htmls, i, end)}</blockquote>`
      } else if (token[1] === '+' || token[1] === '*' || token[1] === '-') {
        return listGen('u', token[0])
      } else {
        return listGen('o', token[0])
      }
    }

    function listGen (c, indent) {
      var ans = `${joinP(htmls, start, i)}<${c}l><li>`
      var pre = i
      htmls[i] = htmls[i].replace(reList, '')
      for (var k = i + 1; k < end; ++k) {
        if (htmls[k].slice(indent).search(rePureList) === 0) {
          ans += `${recursionP(htmls, pre, k)}</li><li>`
          htmls[k] = htmls[k].replace(reList, '')
          pre = k
        }
      }
      return `${ans}${recursionP(htmls, pre, end)}</li></${c}l>`
    }
  }

  function join (htmls) {
    var res = groupBy(htmls, x => x.tag)
    var fillLink = t => t.content.replace(reUseGLink, (match, p1, p2) =>
    `<a href=${gLinks[p2] || '#'}>${p1}</a>`)
    return res.reduce((acc, x) => {
      var groups
      if (x[0].tag === PARA) {
        groups = recursionP(x.map(fillLink), 0, x.length)
      } else if (x[0].tag === HEADER) {
        groups = x.reduce((acc, t) => acc + fillLink(t), '')
      } else {
        groups = x.reduce((acc, t) => acc + t.content, '')
      }
      return `${acc}${groups}`
    }, '')
  }

  window.md2html = (s) => {
    const len = parseList.length
    var htmls = []
    s += '\n'
    while (s !== '') {
      for (var i = 0; i < len; ++i) {
        var pRes = parseList[i](s)
        if (pRes.succ) {
          htmls.push({
            tag: pRes.tag,
            content: pRes.content
          })
          s = pRes.left
          break
        }
      }
    }
    return join(htmls)
  }
})()
