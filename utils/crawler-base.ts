import * as request from 'request-promise-native'
import * as cheerio from 'cheerio'

export const req = request.defaults({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36'
  },
  timeout: 5000
})

export abstract class CramlerEntity<DepItem, Info, SearchItem, Recomms> {
  request = req
  parse = cheerio.load
  private _url: URL
  host: string
  indirect = false

  test(url: string) {
    return new URL(url).host === this.host
  }

  async requestAndParse(url: string, qs?: Record<string, any>) {
    var html = await this.request.get(url, {
      qs
    })
    return this.parse(html)
  }

  normalUrl(url: string) {
    if (/^https?:/.test(url)) {
      return url
    }
    if (url.startsWith('//')) {
      return this._url.protocol + url
    }
    return this.origin + url
  }

  getContents(selector: string | Cheerio, $: CheerioStatic) {
    return $(selector).children().map((_, ele) => $(ele).text()).get()
  }

  getLinks(selector: string | Cheerio, $: CheerioStatic): {
    url: string
    title: string
  }[] {
    return $(selector).map((_, ele) => {
      var $ele = $(ele)
      return {
        title: $ele.text(),
        url: this.normalUrl($ele.attr('href'))
      }
    }).get()
  }

  constructor(public key: string, public origin: string, public name = key) {
    this._url = new URL(origin)
    this.host = this._url.host
  }

  abstract search(kw: string, page: number): Promise<{
    page: number
    pages: number
    items: SearchItem[]
  }>
  abstract getDepInfo(url: string): Promise<DepItem>
  abstract getRecomms(): Promise<Recomms[]>
  abstract getInfo(url: string): Promise<Info>
}

type GeneralCramlerEntity = CramlerEntity<any, any, any, any>

export function getMatcher(targets: GeneralCramlerEntity[]) {
  const key_mappings: Record<string, GeneralCramlerEntity> = {}
  targets.forEach(item => {
    key_mappings[item.key] = item
  })
  const sites = targets.map(item => ({
    text: item.name,
    value: item.key,
    indirect: item.indirect
  }))
  return {
    getHandler(key: string) {
      var item = key_mappings[key]
      if (item) {
        return item
      }
      throw new Error('暂无功能')
    },
    getHandlerFromUrl(url: string) {
      var item = targets.find(item => item.test(url))
      if (item) {
        return item
      }
      throw new Error('暂无功能')
    },
    sites
  }
}