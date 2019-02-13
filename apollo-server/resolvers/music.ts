import { getResolver } from "../util";
import * as request from 'request-promise-native'

export default getResolver({
  Query: {
    async musicSearch({
      kw,
      type,
      page
    }: any) {
      var ret = await request.post('http://www.170mv.com/tool/music/', {
        form: {
          input: kw,
          type,
          page,
          filter: 'name'
        },
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'Accept-Encoding': 'gzip, deflate',
          'X-Requested-With': 'XMLHttpRequest'
        },
        gzip: true
      })
      var { data, code, error } = JSON.parse(ret)
      if (code !== 200) {
        throw new Error(error)
      }
      return {
        page,
        pages: -1,
        items: data.map((item: any) => ({
          title: item.title,
          id: item.songid,
          lrc: item.lrc,
          cover: item.pic,
          url: item.url,
          singer: item.author
        }))
      }
    }
  }
})