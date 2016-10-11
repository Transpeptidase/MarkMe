function ParseRes (succ, content, tag, left) {
  this.succ = succ
  this.content = content
  this.tag = tag
  this.left = left
}

var gLinks = new Map()

const PARA = 'p'

const reHeader = /^ *(#{1,6}) +(.*)\n/
const rePara = /^(.*)\n/
const reNewPara = /^[\t \n]+/
const reCodePara = /^ *```(.*)\n((.*\n?)*?)```\n/
const reHr = /^ *[*\-] *[*\-] *[*\-] *[*\- ]*\n/

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

function pHeader (s) {
  var ans = s.split(reHeader)
  if (ans[0] === '') {
    var tag = `h${ans[1].length}`
    return new ParseRes(true, `<${tag}>${ans[2]}</${tag}>`, '', ans[3])
  }
  return new ParseRes(false, '', '', s)
}

function pPara (s) {
  var ans = s.split(rePara)
  if (ans[0] === '') {
    var len = ans[1].length
    var i = 0
    while (ans[1][len - 1 - i] === ' ') ++i
    var res = ans[1].trimLeft().replace(reImage, '<img src="$2" alt="$1">')
                               .replace(reLink, '<a href=$2>$1</a>')
                               .replace(reStrong1, '<strong>$1</strong>')
                               .replace(reStrong2, '<strong>$1</strong>')
                               .replace(reEm1, '<em>$1</em>')
                               .replace(reEm2, '<em>$1</em>')
                               .replace(reDel, '<del>$1</del>')
                               .replace(reCode, `<code>$2</code>`)

    return new ParseRes(true, `${res}${i > 1 ? '<br/>' : ''}`, PARA, ans[2])
  }
  return new ParseRes(false, '', '', s)
}

function pNewP (s) {
  var ans = s.split(reNewPara)
  if (ans[0] === '') {
    return new ParseRes(true, '', '', ans[1])
  }
  return new ParseRes(false, '', '', s)
}

function pCodeP (s) {
  var ans = s.split(reCodePara)
  if (ans[0] === '') {
    return new ParseRes(true, `<pre style="padding: 0;"><code class=${ans[1].trim()}>${ans[2]}</code></pre>`, '', ans[4])
  }
  return new ParseRes(false, '', '', s)
}

function pHr (s) {
  var ans = s.split(reHr)
  if (ans[0] === '') {
    return new ParseRes(true, '<hr/>', '', ans[1])
  }
  return new ParseRes(false, '', '', s)
}

function pGLink (s) {
  var ans = s.split(reGLink)
  if (ans[0] === '') {
    gLinks[ans[1]] = ans[2]
    return new ParseRes(true, '', '', ans[3])
  }
  return new ParseRes(false, '', '', s)
}

const parseList = [pHeader, pGLink, pNewP, pHr, pCodeP, pPara]

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

function recursionP (htmls, start, end) {
  const re = /^([\-+*]|[0-9].) +/
  const i = findIndex(htmls, start, end, (x) => {
    return x[0] === '>' || x.search(re) === 0
  })
  if (i === -1) {
    return joinP(htmls, start, end)
  } else {
    if (htmls[i][0] === '>') {
      map(htmls, i, end, x => x.replace(/^> */, ''))
      return `${joinP(htmls, start, i)}<blockquote>${recursionP(htmls, i, end)}</blockquote>`
    } else if (htmls[i][0] === '+' || htmls[i][0] === '*' || htmls[i][0] === '-') {
      return listGen('u')
    } else {
      return listGen('o')
    }
  }

  function listGen (c) {
    var ans = `${joinP(htmls, start, i)}<${c}l><li>`
    var pre = i
    htmls[i] = htmls[i].replace(re, '')
    for (var k = i + 1; k < end; ++k) {
      if (htmls[k].search(re) === 0) {
        ans += `${recursionP(htmls, pre, k)}</li><li>`
        htmls[k] = htmls[k].replace(re, '')
        pre = k
      }
    }
    return `${ans}${recursionP(htmls, pre, end)}</li></${c}l>`
  }
}

function join (htmls) {
  var res = groupBy(htmls, x => x.tag)
  return res.reduce((acc, x) => {
    var groups
    if (x[0].tag === PARA) {
      console.log(gLinks)
      groups = recursionP(x.map(t =>
        t.content.replace(reUseGLink, `<a href=$2>$1</a>`)), 0, x.length)
    } else {
      groups = x.reduce((acc, t) => acc + t.content, '')
    }
    return `${acc}${groups}`
  }, '')
}

function md2html (s) {
  const len = parseList.length
  var htmls = []
  s += '\n'
  while (s !== '') {
    for (var i = 0; i < len; ++i) {
      var pRes = parseList[i](s)
      if (pRes.succ) {
        htmls.push({tag: pRes.tag, content: pRes.content})
        s = pRes.left
        break
      }
    }
  }
  return join(htmls)
}
