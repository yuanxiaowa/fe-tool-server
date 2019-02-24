import * as cheerio from 'cheerio'
import { req } from './crawler-base';

async function searchMusic({ kw, type, page }: any) {
  var ret = await req.post('http://www.170mv.com/tool/music/', {
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

async function getRecomms() {
  var html = await req.get('https://music.163.com/discover')
  var $ = cheerio.load(html)
  var items = $('.n-bilst .blk').get().map((cate) => {
    var $cates = $(cate)
    var title = $cates.find('h3').text()
    var items = $cates.find('li a.nm').get().map(ele => {
      var $ele = $(ele)
      var href = $ele.attr('href')
      var id = (<RegExpMatchArray>href.match(/\d+/))[0]
      return {
        id,
        url: `https://music.163.com${href}`,
        cover: 'http://p1.music.126.net/rUMHJ-LAKc6yqBw6jY16-g==/109951163868703823.jpg?param=140y140',
        title: $ele.text()
      }
    })
    return {
      title,
      items
    }
  })
  return items
}

const handler = {
  searchMusic,
  getRecomms
}

function getHandler(type: string) {
  return handler
}

const sites = [
  {
    value: "wangyiyun",
    text: "网易云音乐"
  },
  {
    value: 'qqjt',
    text: '千千静听'
  },
  {
    value: "qq",
    text: "QQ音乐"
  },
  {
    "value": "kuwo",
    "text": "酷我"
  },
  {
    "value": "netease",
    "text": "网易"
  },
  {
    "value": "xiami",
    "text": "虾米"
  },
  {
    "value": "kugou",
    "text": "酷狗"
  },
  {
    "value": "baidu",
    "text": "百度"
  },
  {
    "value": "1ting",
    "text": "一听"
  },
  {
    "value": "migu",
    "text": "咪咕"
  },
  {
    "value": "lizhi",
    "text": "荔枝"
  },
  {
    "value": "qingting",
    "text": "蜻蜓"
  },
  {
    "value": "ximalaya",
    "text": "喜马拉雅"
  },
  {
    "value": "kg",
    "text": "全民K歌"
  },
  {
    "value": "5singyc",
    "text": "5sing原创"
  },
  {
    "value": "5singfc",
    "text": "5sing翻唱"
  }
]

export default {
  getHandler,
  sites
}