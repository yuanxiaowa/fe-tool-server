import * as request from 'request-promise-native'
import * as cheerio from 'cheerio'

interface IBase {
  origin: string
  getInfo(url: string): Promise<any>
}

const $99lib: IBase = {
  origin:'http://m.99lib.net',
  async getInfo(url: string) {
    var html = await request.get(url)
    var $ = cheerio.load(html)
    var nums = new Buffer($('meta[name=client]').attr('content'), 'base64').toString().split(/[A-Z]+%/).map(Number)
    var $nodes = $('#content').children()
    var star = 0
    for (let i = 0; i < $nodes.length; i++) {
      let ele = $nodes[0]
      if (ele.tagName === 'H2') {
        star = i + 1
      } else if (ele.tagName === 'DIV' && $(ele).attr('class') !== 'chapter') {
        break
      }
    }
    var j = 0
    var nodes: string[] = []
    nums.forEach((num, i) => {
      if (num < 3) {
        nodes[num] = $nodes.eq(i + star).text();
        j++
      } else {
        nodes[num - j] = $nodes.eq(i + star).text();
        j = j + 2
      }
    })
    var prev: {
      title: string
      items: {
        text: string
        url: string
        current: boolean
      }[]
    }
    var dirs: (typeof prev)[] = []
    $('#dir .dir').find('dt,dd a').each((_, ele) => {
      var $ele = $(ele)
      var text = $ele.text()
      if ($ele.is('dt')) {
        if (!prev || prev.title !== text) {
          prev = {
            title: text,
            items: []
          }
          dirs.push(prev)
        }
      } else {
        
      prev.items.push({
        text,
        current: $ele.hasClass('current'),
        url: this.origin + $ele.attr('href')
      })
      }
    })
    return {
      dirs,
      content: nodes.map(s => `<p>${s}</p>`).join('')
    }
  }
}

const mappings: Record<string, IBase> = {
  $99lib
}

export function getInfoFromUrl(url: string) {
  /* var _url = url.replace(/https?:\/\//, '')
  var item = videoSites.find(item => _url.startsWith(item.value))
  if (item) {
    return mappings[item.id]
  } */
  if (url) {
    return $99lib
  }
  throw new Error('暂无功能')
}