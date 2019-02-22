import { CramlerEntity, getMatcher } from './crawler-base';

interface BookSection {
  title: string
  url?: string
  current?: boolean
  sections?: BookSection[]
}

interface BookInfo {
  title: string
  author: string
  sections?: BookSection[]
}

interface SearchItem {
  id: number
  title: string
  author: string
  type: string
  url: string
}

interface DepItem {
  title: string
  author: string
  cover: string
  type: string
  desc: string[]
  items: BookSection[]
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
    author: string
    cover?: string
    type?: string
  }[]
}

class C99lib extends CramlerEntity<BookSection, Info, SearchItem, Recomms> {
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
  async search(kw: string, page: number): Promise<{ page: number; pages: number; items: { id: number; title: string; author: string; type: string; url: string; }[]; }> {
    page = page || 1
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
      items: this.getSections($, title)
    }
  }

  private getSections($: CheerioStatic, url?: string) {
    var prev: BookSection
    var sections: BookSection[] = []
    var $items = $('#dir .dir').find('dt,dd')
    if (!$items.eq(0).is('dt')) {
      prev = {
        title: '',
        sections: []
      }
      sections.push(prev)
    }
    $items.each((_, ele) => {
      var $ele = $(ele)
      var title = $ele.text()
      if ($ele.is('dt')) {
        if (!prev || prev.title !== title) {
          prev = {
            title,
            sections: []
          }
          sections.push(prev)
        }
      } else {
        let current = $ele.hasClass('current')
        let _url = current ? url : this.normalUrl($ele.find('a').attr('href'))
        // @ts-ignore
        prev.sections.push({
          title,
          current: current ? true : undefined,
          url: _url
        })
      }
    })
    return sections
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
    var sections: BookSection[] = this.getSections($, url)
    return {
      title: title_arr[2],
      book: {
        title: title_arr[1],
        author: title_arr[3],
        sections
      },
      contents
    }
  }
  constructor() {
    super('99lib', 'http://m.99lib.net')
  }
}

class Luoxia extends CramlerEntity<BookSection, Info, SearchItem, Recomms> {
  constructor() {
    super('luoxia', 'http://www.luoxia.com')
  }
  async search(kw: string, page: number): Promise<{ page: number; pages: number; items: SearchItem[]; }> {
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
  async getDepInfo(url: string): Promise<{ [key: string]: any; title: string; items: DepItem[]; }> {
    var $ = await this.requestAndParse(url)
    var $bd = $('.book-describe')
    var $ps = $bd.find('p')
    var title = $bd.find('h1').text()
    var author = $ps.eq(0).text().split('：')[1]
    var type = $ps.eq(1).text().split('：')[1]
    var desc = $('.describe-html p').map((_, ele) => $(ele).text()).get()
    var items = $('.title').map((_, ele) => {
      var $ele = $(ele)
      var title = $ele.find('a').text()
      var sections = $ele.next().find('a').map((_, ele) => {
        var $ele = $(ele)
        return {
          title: $ele.attr('title'),
          url: $ele.attr('href')
        }
      }).get()
      return {
        title,
        sections
      }
    }).get()
    return {
      title,
      author,
      type,
      desc,
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

class Zongheng extends CramlerEntity<BookSection, Info, SearchItem, Recomms> {
  search(kw: string, page: number): Promise<{ page: number; pages: number; items: SearchItem[]; }> {
    throw new Error("Method not implemented.");
  }
  async getDepInfo(url: string): Promise<{ [key: string]: any; title: string; items: BookSection[]; }> {
    var [$, $2] = await [this.requestAndParse(url), this.requestAndParse(url.replace('/book/', '/showchapter/'))]
    var title = $('.book-name').text().trim()
    var author = $('.au-name a').text()
    var type = $('.crumb a').eq(1).text()
    var desc = $('.book-dec p').map((_, ele) => $(ele).text()).get()
    var items: any[] = []
    return {
      title,
      author,
      type,
      desc,
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
  getInfo(url: string): Promise<Info> {
    throw new Error("Method not implemented.");
  }
  constructor() {
    super('zongheng', 'http://www.zongheng.com')
  }
}

export default getMatcher(
  [new C99lib(), new Luoxia(), new Zongheng()]
)