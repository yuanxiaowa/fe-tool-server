import { CramlerEntity, getMatcher } from './crawler-base';
import iconv = require('iconv-lite');

interface BookSection {
  title: string
  url?: string
  current?: boolean
  items?: BookSection[]
}

interface SearchItem {
  id?: number
  title: string
  author?: string
  type?: string
  url?: string
  cover?: string
}

interface DepItem {
  title: string
  author: string
  cover: string
  type: string
  desc: string[]
  items: BookSection[]
}

interface BookInfo {
  title: string
  author: string
  items?: BookSection[]
}

interface Info {
  title: string
  contents: string[]
  navs?: {
    title: string
    url: string
  }[]
  book: BookInfo
}

interface Recomms {
  title: string
  items: {
    title: string
    url: string
    author?: string
    cover?: string
    type?: string
  }[]
}

class C99lib extends CramlerEntity<DepItem, Info, SearchItem, Recomms> {
  async getRecomms() {
    var $ = await this.requestAndParse(this.origin)
    var $tabs = $('#tab div')
    var ret = $('.body .list').map((i, ele) => {
      var $ele = $(ele)
      var items = $ele.children().map((_, ele) => {
        var $ele = $(ele)
        var $a = $ele.find('a')
        return {
          title: $a.text(),
          url: this.normalUrl($a.attr('href')),
          author: $ele.find('span').text().replace(/\((.*)\)/, '$1')
        }
      }).get()
      return {
        title: $tabs.eq(i).text(),
        items
      }
    }).get()
    return ret
  }
  async search(kw: string, page = 1): Promise<{ page: number; pages: number; items: { id: number; title: string; author: string; type: string; url: string; }[]; }> {
    var $ = await this.requestAndParse(this.normalUrl(`/book/search.list.php`), {
      keyword: kw,
      stat: true,
      page
    })
    var pages = Number($('stat').attr('page') || -1)
    var items = $('book').map((_, ele) => {
      var $ele = $(ele)
      var id = $ele.attr('id')
      return {
        id,
        title: $ele.attr('name'),
        author: $ele.attr('author'),
        type: $ele.attr('type'),
        url: this.normalUrl(`/book/${id}/index.html`)
      }
    }).get()
    return {
      page,
      pages,
      items
    }
  }
  async getDepInfo(url: string) {
    var $ = await this.requestAndParse(url)
    var title = $('.title').text().trim()
    var $binfo = $('.binfo')
    var cover = $binfo.find('img').attr('src')
    var $binfoa = $binfo.find('a')
    var author = $binfoa.eq(0).text()
    var type = $binfoa.eq(1).text()
    var desc = $('#intro p').map((_, ele) => $(ele).text()).get().filter(Boolean)
    return {
      title,
      desc,
      author,
      cover,
      type,
      items: this.getItems($, title)
    }
  }

  private getItems($: CheerioStatic, url?: string) {
    var prev: BookSection
    var items: BookSection[] = []
    var $items = $('#dir .dir').find('dt,dd')
    if (!$items.eq(0).is('dt')) {
      prev = {
        title: '',
        items: []
      }
      items.push(prev)
    }
    $items.each((_, ele) => {
      var $ele = $(ele)
      var title = $ele.text()
      if ($ele.is('dt')) {
        if (!prev || prev.title !== title) {
          prev = {
            title,
            items: []
          }
          items.push(prev)
        }
      } else {
        let current = $ele.hasClass('current')
        let _url = current ? url : this.normalUrl($ele.find('a').attr('href'))
        // @ts-ignore
        prev.items.push({
          title,
          current: current ? true : undefined,
          url: _url
        })
      }
    })
    return items
  }

  async getInfo(url: string) {
    var $ = await this.requestAndParse(url)
    var nums = new Buffer($('meta[name=client]').attr('content'), 'base64').toString().split(/[A-Z]+%/).map(Number)
    var $nodes = $('#content').children()
    var title_arr = <RegExpMatchArray>$('title').text().match(/([^_]+)_([^_]+)/)
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
    var contents: string[] = []
    nums.forEach((num, i) => {
      if (num < 3) {
        contents[num] = $nodes.eq(i + star).text();
        j++
      } else {
        contents[num - j] = $nodes.eq(i + star).text();
        j = j + 2
      }
    })
    var items: BookSection[] = this.getItems($, url)
    return {
      title: title_arr[2],
      book: {
        title: title_arr[1],
        author: title_arr[3],
        items
      },
      contents
    }
  }
  constructor() {
    super('99lib', 'http://m.99lib.net')
  }
}

class Luoxia extends CramlerEntity<DepItem, Info, SearchItem, Recomms> {
  constructor() {
    super('luoxia', 'http://www.luoxia.com')
  }
  async search(kw: string, page = 1): Promise<{ page: number; pages: number; items: SearchItem[]; }> {
    var $ = await this.requestAndParse(`http://www.luoxia.com/page/${page}/`, {
      s: kw
    })
    var items = $('.search-list a').map((_, ele) => {
      var $ele = $(ele)
      return {
        url: $ele.attr('href'),
        title: $ele.text()
      }
    }).get()
    var pages = Number($('.wp-pagenavi .page').last().text() || 0)
    return {
      page,
      pages,
      items
    }
  }
  async getDepInfo(url: string) {
    var $ = await this.requestAndParse(url)
    var $bd = $('.book-describe')
    var $ps = $bd.find('p')
    var title = $bd.find('h1').text()
    var author = $ps.eq(0).text().split('：')[1]
    var type = $ps.eq(1).text().split('：')[1]
    var desc = $('.describe-html p').map((_, ele) => $(ele).text()).get()
    var cover = $('.book-img img').attr('src')
    var items = $('.title').map((_, ele) => {
      var $ele = $(ele)
      var title = $ele.find('a').text()
      var items = $ele.next().find('a').map((_, ele) => {
        var $ele = $(ele)
        return {
          title: $ele.attr('title'),
          url: $ele.attr('href')
        }
      }).get()
      return {
        title,
        items
      }
    }).get()
    return {
      title,
      author,
      type,
      desc,
      cover,
      items
    }
  }
  async getRecomms(): Promise<Recomms[]> {
    var $ = await this.requestAndParse(this.origin)
    var items1 = $('.pop-books .pop-book').map((_, ele) => {
      var $ele = $(ele)
      var arr = $ele.find('span').text().split('/')
      return {
        cover: $ele.find('img').attr('src'),
        title: $ele.find('h2').text(),
        url: $ele.find('a').attr('href'),
        author: arr[1],
        type: arr[0]
      }
    }).get()
    var items2 = $('#slideBox a').map((_, ele) => {
      var $ele = $(ele)
      return {
        cover: $ele.find('img').attr('src'),
        title: $ele.attr('title'),
        url: $ele.attr('href')
      }
    }).get()
    return [{
      title: '编辑推荐',
      items: items1
    }/* , {
      title: '类别推荐',
      items: items2
    } */]
  }
  async getInfo(url: string): Promise<Info> {
    var $ = await this.requestAndParse(url)
    var contents = $('#nr1').children()
      .map((_, ele) => $(ele).text())
      .get().slice(0, -1)
    var $bcrumbs = $('#bcrumb span')
    var title = $bcrumbs.eq(4).text() + ' ' + $bcrumbs.eq(6).text()
    var author = $('.post-time b').text()
    var navs = $('.nav2').first().find('li').map((_, ele) => {
      var $ele = $(ele).find('a')
      return {
        title: $ele.attr('href'),
        url: $ele.text()
      }
    }).get()
    return {
      title,
      contents,
      navs,
      book: {
        author,
        title: $bcrumbs.eq(2).text()
      }
    }
  }
}

class Zongheng extends CramlerEntity<DepItem, Info, SearchItem, Recomms> {
  test(url: string) {
    return url.startsWith(this.origin) || url.startsWith('http://www.zongheng.com')
  }
  async search(kw: string, page = 1): Promise<{ page: number; pages: number; items: SearchItem[]; }> {
    var $ = await this.requestAndParse(`http://search.zongheng.com/s`, {
      keyword: kw,
      pageNo: page
    })
    var items = $('.search-result-list').map((_, ele) => {
      var $ele = $(ele)
      var cover = $ele.find('img').attr('src')
      var $link = $ele.find('.tit a')
      var title = $link.text()
      var url = $link.attr('href')
      var $links = $('.bookinfo a')
      var author = $links.eq(0).text()
      var type = $links.eq(0).text()
      return {
        title,
        url,
        cover,
        author,
        type
      }
    }).get()
    var pages = Number($('.search_d_pagesize a').last().prev().text())
    return {
      page,
      pages,
      items
    }
  }
  async getItems(url: string): Promise<BookSection[]> {
    var $ = await this.requestAndParse(url)
    var items = $('.chapter-list').last().map((_, ele) => {
      var $ele = $(ele)
      var title = $ele.prev().find('.count')[0].previousSibling.nodeValue
      var items = this.getLinks($ele.find('a'), $)
      return {
        title,
        items
      }
    }).get()
    return items
  }
  async getDepInfo(url: string) {
    var [$, items] = await Promise.all([this.requestAndParse(url), this.getItems(url.replace('/book/', '/showchapter/'))])
    var title = $('.book-name').text().trim()
    var author = $('.au-name a').text()
    var type = $('.crumb a').eq(1).text().trim()
    var desc = $('.book-dec p').map((_, ele) => $(ele).text()).get()
    var cover = $('.book-img img').attr('src')
    return {
      title,
      author,
      type,
      desc,
      cover,
      items
    }
  }
  async getRecomms(): Promise<Recomms[]> {
    var $ = await this.requestAndParse(this.origin)
    var ret = $('.tab-lists').map((_, ele) => {
      var $ele = $(ele)
      var items = $ele.find('.list-box,.lists li').map((_, ele) => {
        var $ele = $(ele).find('a').first()
        return {
          title: $ele.text().trim(),
          url: $ele.attr('href')
        }
      }).get()
      return {
        title: $ele.find('.top-title .title').text(),
        items
      }
    }).get()
    return ret
  }
  async getInfo(url: string): Promise<Info> {
    var [_] = <RegExpMatchArray>url.match(/\d+\/\d+/)
    var $ = await this.requestAndParse(`${this.origin}/chapter/${_}.html`)
    var title = $('.title_txtbox').text()
    var author = $('.bookinfo a').first().text()
    var book_title = $('.reader_crumb a').last().text()
    var contents = this.getContents('.content', $)
    var navs = $('.chap_btnbox a').first().nextAll().map((_, ele) => {
      var $ele = $(ele)
      var url = $ele.attr('href')
      return {
        title: $ele.text(),
        url: url === 'javascript:void(0)' ? '' : url
      }
    }).get()
    return {
      title,
      contents,
      navs,
      book: {
        title: book_title,
        author
      }
    }
  }
  constructor() {
    super('zongheng', 'http://book.zongheng.com')
  }
}

class Ppzuowen extends CramlerEntity<DepItem, Info, SearchItem, Recomms> {
  async search(kw: string, page = 0): Promise<{ page: number; pages: number; items: SearchItem[]; }> {
    var html = await this.request('http://search.ppzuowen.com/cse/search', {
      qs: {
        q: kw,
        p: page - 1,
        s: '7520588606970330124'
      }
    })
    var $ = this.parse(html)
    var items = this.getLinks('#results h3 a', $) //.filter(({ url }) => !url.endsWith('.html'))
    var pages = Number($('#pageFooter').children().not('.n').last().text())
    return {
      page,
      pages,
      items
    }
  }
  async getDepInfo(url: string) {
    var $ = await this.requestAndParse(url)
    var title = $('.articleH22').text()
    var desc = this.getContents('.text', $)
    var cover = this.normalUrl($('.ablum img').attr('src'))
    var author = ''
    var type = $('.searchWarp').next().find('a').prev().text()
    var $links = $('.bookList a')
    var items: BookSection[] = []
    if ($links.first().text().includes(' ')) {
      let prev: BookSection
      $links.each((_, ele) => {
        var $ele = $(ele)
        var arr = $ele.text().split(' ')
        if (!prev || prev.title !== arr[0]) {
          prev = {
            title: arr[0],
            items: []
          }
          items.push(prev)
        }
        // @ts-ignore
        prev.items.push({
          url: this.normalUrl($ele.attr('href')),
          title: arr[1]
        })
      })
    } else {
      items.push({
        title: '',
        items: this.getLinks($links, $)
      })
    }
    return {
      title,
      author,
      desc,
      cover,
      items,
      type
    }
  }
  async getRecomms(): Promise<Recomms[]> {
    var $ = await this.requestAndParse(this.origin)
    var $ele = $('.dyBox').eq(1)
    var title = $ele.find('h2').text()
    var items = this.getLinks($ele.find('a'), $)
    return [{
      title,
      items
    }]
  }
  async getInfo(url: string): Promise<Info> {
    var $ = await this.requestAndParse(url)
    var title = $('h2').text()
    var $bd = $('.searchWarp').next().find('a')
    var book_title = $bd.last().text()
    // var type = $bd.last().prev().text()
    var promises = $('.pagelist a').slice(2, -2).map((_, ele) => {
      var $ele = $(ele)
      var href = $ele.attr('href')
      if (href === '#') {
        return this.getContents('.articleContent', $)
      }
      return this.requestAndParse(url.replace(/\w+\.html/, href)).then($ => this.getContents('.articleContent', $))
    }).get()
    var items = await Promise.all(promises)
    var contents: string[] = [].concat.apply([], items)
    var navs = $('.www4').map((_, ele) => {
      var $ele = $(ele)
      var url = $ele.find('a').attr('href')
      return {
        url: url ? this.normalUrl(url) : '',
        title: $ele.text().replace(/【(.*)】/, '$1')
      }
    }).get()
    return {
      title,
      contents,
      navs,
      book: {
        title: book_title,
        author: ''
      }
    }
  }

  async requestAndParse(url: string, qs?: Record<string, any>) {
    var buffer = await this.request.get(url, {
      qs,
      encoding: null
    })
    var html = iconv.decode(buffer, 'gb2312')
    return this.parse(html)
  }
  constructor() {
    super('ppzuowen', 'https://www.ppzuowen.com')
  }
}

class Huayu extends CramlerEntity<BookSection, Info, SearchItem, Recomms> {
  async search(kw: string, page = 1): Promise<{ page: number; pages: number; items: SearchItem[]; }> {
    var $ = await this.requestAndParse(`http://search.zongheng.com/search/book`, {
      keyword: kw,
      pageNo: page
    })
    var items = $('.search-result-list').map((_, ele) => {
      var $ele = $(ele)
      var cover = $ele.find('img').attr('src')
      var $link = $ele.find('.tit a')
      var title = $link.text()
      var url = $link.attr('href')
      var $links = $('.bookinfo a')
      var author = $links.eq(0).text()
      var type = $links.eq(0).text()
      return {
        title,
        url,
        cover,
        author,
        type
      }
    }).get()
    var pages = Number($('.search_d_pagesize a').last().prev().text())
    return {
      page,
      pages,
      items
    }
  }
  async getItems(url: string): Promise<BookSection[]> {
    var $ = await this.requestAndParse(url)
    var items = this.getLinks($('.pinklow').next().find('a'), $)
    return [
      {
        title: '',
        items
      }
    ]
  }
  async getDepInfo(url: string) {
    var [$, items] = await Promise.all([this.requestAndParse(url), this.getItems(url.replace('/book/', '/showchapter/'))])
    var $as = $('h1 a')
    var title = $as.first().text()
    var author = $as.last().text()
    var type = $('.loca a').last().text()
    var desc = $('.jj br').map((_, ele) => ele.nextSibling.nodeValue || '').get()
    var cover = $('.img img').attr('src')
    return {
      title,
      author,
      type,
      desc,
      cover,
      items
    }
  }
  async getRecomms(): Promise<Recomms[]> {
    var $ = await this.requestAndParse(this.origin)
    return $('.qltj,.third_nor,.zbtj').map((_, ele) => {
      var $ele = $(ele)
      var title = $ele.find('h1,h2').first().text()
      var items = $ele.find('.qt_first,li,.zbtj_box').map(((_, ele) => {
        var $ele = $(ele)
        var cover = $ele.find('img').attr('src')
        var $as = $ele.find('a')
        var $a = $as.eq($as.length / 2 >> 0)
        var title = $a.text()
        var url = this.normalUrl($a.attr('href'))
        return {
          title,
          url,
          cover
        }
      })).get()
      return {
        title,
        items
      }
    }).get()
  }
  async getInfo(url: string): Promise<Info> {
    var $ = await this.requestAndParse(url)
    var book_title = $('h1').text()
    var title = $('h2').last().text().replace('正文', '')
    var author = $('.bookinfo a').first().text()
    var book_title = $('.reader_crumb a').last().text()
    var contents = $('.book_con p').map((_, ele) => ele.firstChild.nodeValue).get()
    var $navs = $('.key a')
    var navs: any[] = []
    $navs.each((i, ele) => {
      var $ele = $(ele)
      var title = $ele.text()
      if (title === '回目录') {
        if ($navs.length === 2) {
          navs.push({
            title: '无',
            url: ''
          })
        }
        return
      }
      navs.push({
        title,
        url: this.normalUrl($ele.attr('href'))
      })
    })
    return {
      title,
      contents,
      navs,
      book: {
        title: book_title,
        author
      }
    }
  }
  constructor() {
    super('huayu', 'http://huayu.baidu.com')
  }
}

export default getMatcher(
  [
    new C99lib(),
    new Luoxia(),
    new Zongheng(),
    new Ppzuowen(),
    new Huayu()
  ]
)