import * as request from 'request-promise-native'
import * as cheerio from 'cheerio'

export abstract class CramlerEntity<DepItem, Info, SearchItem, Recomms> {
  request = request
  parse = cheerio.load

  async requestAndParse(url: string, qs?: Record<string, any>) {
    var html = await this.request.get(url, {
      qs
    })
    return this.parse(html)
  }

  normalUrl(url: string) {
    return this.origin + url
  }

  constructor(public key: string, public origin: string) { }

  abstract search(kw: string, page: number): Promise<{
    page: number
    pages: number
    items: SearchItem[]
  }>
  abstract getDepInfo(url: string): Promise<{
    title: string
    [key: string]: any
    items: DepItem[]
  }>
  abstract getRecomms(): Promise<Recomms[]>
  abstract getInfo(url: string): Promise<Info>
}

type GeneralCramlerEntity = CramlerEntity<any, any, any, any>

export function getMatcher(targets: GeneralCramlerEntity[]) {
  const key_mappings: Record<string, GeneralCramlerEntity> = {}
  targets.forEach(item => {
    key_mappings[item.key] = item
  })
  return {
    getHandler(key: string) {
      var item = key_mappings[key]
      if (item) {
        return item
      }
      throw new Error('暂无功能')
    },
    getHandlerFromUrl(url: string) {
      var item = targets.find(item => url.startsWith(item.origin))
      if (item) {
        return item
      }
      throw new Error('暂无功能')
    }
  }
}