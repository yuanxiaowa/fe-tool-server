import * as request from 'request-promise-native'
import * as cheerio from 'cheerio'
import fs = require('fs-extra')
import qs = require('querystring')

const req = request.defaults({
  headers: {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
  }
})

enum VideoType {
  MOVIE,
  SERIES
}

interface ListItem {
  title: string,
  img: string,
  url: string,
  type: VideoType,
  desc: string,
  rate: number | undefined
}

interface IVideo {
  search(kw: string, page: number): Promise<{
    items: ListItem[],
    pages: number,
    cur: number
  }>
  getVideoInfo(url: string): Promise<{
    title: string;
    type: VideoType;
    type_name: string;
    series: {
      title: string;
      items: {
        title: string
        url: string[]
      }[]
    } | undefined;
    publish_date: string;
    desc: string;
    rate: number | undefined
  }>
}

export class TencentVideo implements IVideo {
  async search(kw: string, page = 1) {
    var html: string = await req.get('https://v.qq.com/x/search/', {
      qs: {
        q: kw,
        cur: page
      }
    })
    var $ = cheerio.load(html)
    var $items = $('.result_item')
    var items: ListItem[] = $items.map(function (index, ele) {
      var $ele = $(ele)
      var $figure = $ele.find('.result_figure')
      var img = $figure.find('img').attr('src')
      var url = $figure.attr('href')
      var $title = $ele.find('.result_title a')
      var type = $title.find('.type').text()
      var title = $title.text()
      if (type) {
        title = title.substring(0, title.lastIndexOf(type)).trim()
      }
      var ele_desc = $ele.find('.desc_text')[0]
      var desc = ele_desc && ele_desc.firstChild.nodeValue
      var rate = +$ele.find('.result_score').text()
      return {
        title,
        img,
        url,
        type,
        desc,
        rate
      }
    }).get()
    var page_str = $('.search_container').attr('r-props')
    return {
      items,
      pages: +getMatch(/pages: (\d+)/, page_str),
      cur: +getMatch(/cur: (\d+)/, page_str)
    }
  }

  async getVideoInfo(url: string) {
    var html: string = await req.get(url)
    var str = (<string[]>/(var LIST_INFO = [\s\S]*?)<\/script>/.exec(html))[1]
    // str = str.replace(/\bvar /g, '__data.')
    var { LIST_INFO, COVER_INFO, VIDEO_INFO } = getJsData(str + '; return {LIST_INFO, COVER_INFO, VIDEO_INFO}')
    var type = COVER_INFO.type
    var type_name = COVER_INFO.type_name
    var rate = COVER_INFO.douban_score
    var series
    if (type === 2) {
      series = {
        title: COVER_INFO.title,
        items: COVER_INFO.nomal_ids.map(item => ({
          title: item.E,
          url: url.replace(/\w+(?=\.html$)/, item.V)
        }))
      }
    }
    return {
      title: VIDEO_INFO.title,
      type,
      type_name,
      series,
      publish_date: VIDEO_INFO.publish_date,
      desc: COVER_INFO.description,
      rate
    }

    /* var ret = await req.post('https://vd.l.qq.com/proxyhttp', {
      headers: {
        'content-type': 'text/plain'
      },
      body: JSON.stringify({
        "buid": "vinfoad",
        "adparam": qs.stringify({
          pf: 'in',
          ad_type: 'LD|KB|PVL',
          pf_ex: 'pc',
          url,
          refer: 'https://v.qq.com/x/cover/1egcxh1l6d8jyt1/i0026tithen.html',
          ty: 'web',
          plugin: '1.0.0',
          v: '3.5.57',
          coverid: '1egcxh1l6d8jyt1',
          vid: 'i0026tithen',
          pt: '',
          flowid: '996bc9691ade86f0fd9051bb959049be_10901',
          vptag: 'www_baidu_com',
          pu: '0',
          chid: '0',
          adaptor: '2',
          dtype: '1',
          live: '0',
          resp_type: 'json',
          guid: '33ae9ec564cd075744a582031e522eaf',
          req_type: '1',
          from: '0',
          appversion: '1.0.138',
          platform: '10901',
          tpid: '2',
          rfid: 'ee0134f0002f79bf71703914de385f25_1548517018'
        }),
        "vinfoparam": qs.stringify({
          charge: '0',
          defaultfmt: 'auto',
          otype: 'ojson',
          guid: '33ae9ec564cd075744a582031e522eaf',
          flowid: '996bc9691ade86f0fd9051bb959049be_10901',
          platform: '10901',
          sdtfrom: 'v1010',
          defnpayver: '1',
          appVer: '3.5.57',
          host: 'v.qq.com',
          ehost: url,
          refer: 'v.qq.com',
          sphttps: '1',
          tm: '1548996130',
          spwm: '4',
          logintoken:
            '{"main_login":"","openid":"","appid":"","access_token":"","vuserid":"","vusession":""}',
          unid: 'b614e9b4919911e89d19a0429186d00a',
          vid: 'i0026tithen',
          defn: '',
          fhdswitch: '0',
          show1080p: '1',
          isHLS: '1',
          dtype: '3',
          sphls: '2',
          spgzip: '1',
          dlver: '2',
          drm: '32',
          spau: '1',
          spaudio: '15',
          defsrc: '1',
          encryptVer: '8.1',
          cKey:
            '964EA22085C2EA332761D702C5D16202F1F1AF1C26927BC37D7116E2A852965D2A32B02ECE488902608845D0C38285013663E73F9807338DE2DBE3FAFDB4BF3F6ED35FD31C9FDA226CC4406638A76880395E915E7FAF57E67E4A6A2583EEA2A9EF2F227D3EBFC4F93DB68FE165DC354A204315A1F33F4575CA57D5A118D4184CE4CA3AFF488BB1D5B4DEB3BE06F6A9F8258171012C636B4AEC94D2F81C0DF99F6F9EBD694D5A582CBC757B67136C343B995EDC842850B77154C6418CDAE4555555AA82689356B67B37E65EECA7B137409EB4CCE796550E9962B12210A7F1F4BC7FD0BD5A22CDCF5E74D0AC6B253E397695C9BF5723F4B84B03E914D1906CB2FC8CC6963C70358BC258DAFCE8009E62F0',
          fp2p: '1',
          spadseg: '1'
        })
      })
    })
    console.log(ret)
    var { vinfo } = JSON.parse(ret)
    fs.writeFile('a.json', vinfo)
    var data = JSON.parse(vinfo)
    console.log(data) */
  }
}

function getJsData(text: string) {
  return new Function(text)()
}

function getMatch(reg: RegExp, str: string) {
  return (<string[]>reg.exec(str))[1]
}

/* var video = new TencentVideo()
video.search('西部世界').then(console.log)
video.getVideoInfo('https://v.qq.com/x/cover/1egcxh1l6d8jyt1/i0026tithen.html').then(console.log) */

export class YoukuVideo implements IVideo {
  async search(kw: string, page = 1) {
    var html: string = await req.get(`https://so.youku.com/search_video/q_${encodeURI(kw)}`, {
      qs: {
        pg: page
      }
    })
    var str = getMatch(
      /<script type="text\/javascript">bigview\.view\((.*?)\)<\/script/,
      html
    )
    html = JSON.parse(str).html
    var $ = cheerio.load(html)
    var items: ListItem[] = $('.sk-mod:not(.sk-about-search)').map((i, ele) => {
      var $ele = $(ele)
      var img = $ele.find('img').attr('src')
      var $main = $ele.find('.mod-main')
      var $header = $main.find('.mod-header')
      var $link = $header.find('a')
      var title = $link.text()
      var url = $link.attr('href')
      var type = $header.find('.base-type').text()
      var ele_desc = $main.find('.mod-info .row-ellipsis span')[0]
      var desc = ele_desc && ele_desc.lastChild.nodeValue
      var rate
      return {
        title,
        img,
        url,
        type,
        desc,
        rate
      }
    }).get()
    var $pages = $('.page-nav li')
    return {
      pages: +$pages.last().prev().text(),
      cur: +$pages.filter('.current').text(),
      items
    }
  }
  async getVideoInfo(url: string): Promise<any> {
    var html: string = await req.get(url)
    var $ = cheerio.load(html)
    var title = $('h1').text().trim()
    var desc = $('meta[name="description"]').attr('content')
    var $links = $('.drama-content .item a')
    var publish_date = $('meta[itemprop="datePublished"]').attr('content')
    var rate = +$('.score').text()
    var type = $('meta[property="og:type"]').attr('content')
    var type_name = $('meta[name="irCategory"]').attr('content')
    var series
    if ($links.length > 0) {
      series = $links.map((i, ele) => {
        var $ele = $(ele)
        return {
          title: $ele.find('.title').text(),
          url: $ele.attr('href')
        }
      }).get()
    }
    return {
      title,
      desc,
      series,
      type,
      type_name,
      publish_date,
      rate
    }
  }

}

// var video = new YoukuVideo()

// video.search('西部世界').then(console.log)
// video.getVideoInfo('https://v.youku.com/v_show/id_XMTQ3OTY0MzIwMA==.html?spm=a2h0j.11185381.listitem_page2.5~A').then(console.log)

export const videoSites = [
  {
    "id": "youku",
    "name": "优酷",
    "url": "http://v.youku.com"
  },
  {
    "id": "tudou",
    "name": "土豆",
    "url": "http://video.tudou.com"
  },
  {
    "id": "iqiyi",
    "name": "爱奇艺",
    "url": "http://www.iqiyi.com"
  },
  {
    "id": "mgtv",
    "name": "芒果TV",
    "url": "http://www.mgtv.com"
  },
  {
    "id": "le",
    "name": "乐视网",
    "url": "http://www.le.com"
  },
  {
    "id": "qq",
    "name": "腾讯视频",
    "url": "https://v.qq.com"
  },
  {
    "id": "sohu",
    "name": "搜狐视频",
    "url": "http://tv.sohu.com"
  },
  {
    "id": "pptv",
    "name": "pptv",
    "url": "http://v.pptv.com"
  },
  {
    "id": "360kan",
    "name": "360影视",
    "url": "http://v.360kan.com"
  },
  {
    "id": "1905",
    "name": "1905",
    "url": "http://vip.1905.com"
  },
  {
    "id": 'migu',
    "name": '咪咕',
    "url": "630300937&type=migu"
  },
  {
    "id": "acfun",
    "name": "acfun",
    "url": "http://www.acfun.cn/v/ac2720630"
  },
  {
    "id": "yinyuetai",
    "name": "音悦台",
    "url": "http://v.yinyuetai.com/video/2769045"
  },
  {
    "id": "kugou",
    "name": "kugou",
    "url": "http://www.kugou.com/mvweb/html/mv_72414.html"
  },
  {
    "id": "qq",
    "name": "qq",
    "url": "https://y.qq.com/n/yqq/mv/v/k0022mankwm.html"
  },
  {
    "id": "lizhi",
    "name": "lizhi",
    "url": "http://cdn1.lizhi.fm/audio/2018/09/30/2695215907877255686_hd.mp3"
  },
  {
    "id": "ximalaya",
    "name": "ximalaya",
    "url": "https://www.ximalaya.com/youshengshu/3768275/12971133"
  },
  {
    "id": "yy",
    "name": "yy",
    "url": "http://www.yy.com/shenqu/play/id_1092306775097375700.html"
  },
  {
    "id": "bilibili",
    "name": "bilibili",
    "url": "http://www.bilibili.com/video/av8268711"
  },
  {
    "id": "wasu",
    "name": "wasu",
    "url": "https://www.wasu.cn/Play/show/id/9190792"
  },
  {
    "id": "163",
    "name": "163",
    "url": "http://open.163.com/movie/2018/10/E/N/MDSRLN75L_MDSRLQDEN.html"
  },
  {
    "id": "56",
    "name": "56",
    "url": "http://www.56.com/u57/v_MTQxODAwNjk0.html"
  },
  {
    "id": "fun",
    "name": "fun",
    "url": "http://www.fun.tv/vplay/g-210266/"
  },
  {
    "id": "jsyunbf",
    "name": "jsyunbf",
    "url": "http://dy2.jsyunbf.com/20171023/UrROLy8k/index.m3u8"
  },
  {
    "id": "meitudata",
    "name": "meitudata",
    "url": "http://mvvideo2.meitudata.com/57ad6b2331bc9122.mp4"
  },
  {
    "id": "kankan",
    "name": "kankan",
    "url": "http://vod.kankan.com/v/88/88304/469563.shtml"
  },
  {
    "id": "daum",
    "name": "daum",
    "url": "http://media.daum.net/entertain/tv/242903/video/387778117"
  },
  {
    "id": "sina",
    "name": "sina",
    "url": "http://video.sina.com.cn/view/251134258.html"
  },
  {
    "id": null,
    "name": null,
    "url": "http://weibo.com/tv/v/F1AORDRNy?from=vfun"
  },
  {
    "id": "vlook",
    "name": "vlook",
    "url": "http://www.vlook.cn/show/qs/YklkPTQ2Njk4Mzk="
  },
  {
    "id": "meipai",
    "name": "meipai",
    "url": "http://www.meipai.com/media/542797580"
  },
  {
    "id": "28a",
    "name": "28a",
    "url": "http://v.28a.im/f241"
  },
  {
    "id": "duowan",
    "name": "duowan",
    "url": "http://ahuya.duowan.com/play/10442596.html"
  },
  {
    "id": "longzhu",
    "name": "longzhu",
    "url": "http://v.longzhu.com/bestvideo/v/1973090"
  },
  {
    "id": "tangdou",
    "name": "tangdou",
    "url": "http://www.tangdou.com/v92/dAOEOYOjwT2T0Q2.html"
  },
  {
    "id": "miaopai",
    "name": "miaopai",
    "url": "http://n.miaopai.com/media/ASzwUGC8lH3KA2NLjMxFo1eZvESRPTtf"
  },
  {
    "id": "kuaishou",
    "name": "kuaishou",
    "url": "https://live.kuaishou.com/u/3x3hv69hj5g7a9e/3xjxhttrq2yut8u/"
  },
  {
    "id": "17173",
    "name": "17173",
    "url": "http://v.17173.com/v_1_12046/Mzg4NDU1MzU.html"
  },
  {
    "id": "pearvideo",
    "name": "pearvideo",
    "url": "https://www.pearvideo.com/video_1352720"
  },
  {
    "id": "v1",
    "name": "v1",
    "url": "http://www.v1.cn/video/14906477.shtml"
  },
  {
    "id": "eastday",
    "name": "eastday",
    "url": "http://video.eastday.com/a/180610095032571464694.html"
  },
  {
    "id": "toutiao",
    "name": "toutiao",
    "url": "http://www.toutiao.com/a6411327209693315330/"
  },
  {
    "id": "365yg",
    "name": "365yg",
    "url": "https://www.365yg.com/a6548347084297208333/"
  },
  {
    "id": null,
    "name": null,
    "url": "b9893d8eb7094675bc2ef12c3ef19163&baiyug_xg"
  },
  {
    "id": null,
    "name": null,
    "url": "wwNock&QQkandian"
  },
  {
    "id": null,
    "name": null,
    "url": "1614045508645783977~baijiahao.c166"
  },
  {
    "id": "mtime",
    "name": "mtime",
    "url": "http://video.mtime.com/72493/?mid=219170"
  },
  {
    "id": null,
    "name": null,
    "url": "27panJB5RUTll3REqiUTR"
  },
  {
    "id": null,
    "name": null,
    "url": "baiyug20208149822186304914~tianyiyun.3496"
  },
  {
    "id": null,
    "name": null,
    "url": "15250182372400415~360yun.b800"
  },
  {
    "id": null,
    "name": null,
    "url": "/影视大全/广告.mp4~baiduyun.73a9"
  },
  {
    "id": "weiyun",
    "name": "weiyun",
    "url": "https://share.weiyun.com/5PbcCVd"
  }
]

export const videoResolverList = [{
  name: '百域阁',
  url: `http://app.baiyug.cn:2019/vip/index.php?url=`
}]