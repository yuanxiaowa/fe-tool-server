import * as request from 'request-promise-native'
import * as cheerio from 'cheerio'
import fs = require('fs-extra')
import qs = require('querystring')

const { getBanliUrl, sign } = require('./banli_tool');

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
  cover: string,
  url: string,
  type: VideoType,
  desc: string,
  rate: number | undefined
  series?: {
    name: string
    url: string
  }[]
}

export interface IVideo {
  origin: string
  search(kw: string, page: number): Promise<{
    items: ListItem[],
    pages: number,
    page: number
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
    publish_date?: string;
    desc: string;
    url?: string
    rate?: number
  }>
}

export const tencent: IVideo = {
  origin: 'https://v.qq.com',
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
      var cover = $figure.find('img').attr('src')
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
      var $list = $ele.find('._playlist .item').filter(':not(.item_fold)').find('a')
      var series: any
      if ($list.length > 0) {
        series = $list.map(function (_, ele) {
          var $ele = $(ele)
          return {
            name: $ele.text().trim(),
            url: $ele.attr('href')
          }
        }).get()
      }
      return {
        title,
        cover,
        url,
        type,
        desc,
        rate,
        series
      }
    }).get()
    var page_str = $('.search_container').attr('r-props')
    return {
      items,
      pages: +getMatch(/pages: (\d+)/, page_str),
      page: +getMatch(/cur: (\d+)/, page_str)
    }
  },

  async getVideoInfo(url: string) {
    var html: string = await req.get(url)
    var str = (<string[]>/(var LIST_INFO = [\s\S]*?)<\/script>/.exec(html))[1]
    // str = str.replace(/\bvar /g, '__data.')
    var { LIST_INFO, COVER_INFO, VIDEO_INFO } = getJsData(str + '; return {LIST_INFO, COVER_INFO, VIDEO_INFO}')
    var type = +COVER_INFO.type
    var type_name = COVER_INFO.type_name
    var rate = COVER_INFO.douban_score
    var series
    if (type === 2) {
      if (url.includes('?vid=')) {
        url = url.replace(/(\.html)\?vid=(\w+)/, '/$2$1')
      }
      series = {
        title: COVER_INFO.title,
        items: COVER_INFO.nomal_ids.map((item: any) => {
          return {
            title: item.E,
            url: url.replace(/\w+(?=\.html$)/, item.V)
          }
        })
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

export const youku: IVideo = {
  origin: 'https://so.youku.com',
  async search(kw: string, page = 1) {
    var html: string = await req.get(`https://so.youku.com/search_video/q_${encodeURI(kw)}`, {
      qs: {
        pg: page,
        aaid: '194eb56f05e260ad3e1eec35e8d43ece'
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
      var cover = $ele.find('img').attr('src')
      var $main = $ele.find('.mod-main')
      var $header = $main.find('.mod-header')
      var $link = $header.find('a')
      var title = $link.text()
      var url = $link.attr('href')
      if (url.startsWith('//')) {
        url = 'https:' + url
      }
      var type = $header.find('.base-type').text()
      var ele_desc = $main.find('.mod-info .row-ellipsis span')[0]
      var desc = ele_desc && ele_desc.lastChild.nodeValue
      var rate
      var $list = $ele.find('.mod-play-list').children().not('.item-expand,.item-hold').children()
      var series: any
      if ($list.length > 0) {
        series = $list.map(function (_, ele) {
          var $ele = $(ele)
          return {
            name: $ele.text().trim(),
            url: $ele.attr('href')
          }
        }).get()
      }
      return {
        title,
        cover,
        url,
        type,
        desc,
        rate,
        series
      }
    }).get()
    var $pages = $('.page-nav li')
    return {
      pages: +$pages.last().prev().text(),
      page: +$pages.filter('.current').text(),
      items
    }
  },
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
      let items = $links.map((i, ele) => {
        var $ele = $(ele)
        let url = $ele.attr('href')
        if (url.startsWith('//')) {
          url = 'https:' + url
        }
        return {
          title: $ele.find('.sn_num').text(),
          url
        }
      }).get()
      series = {
        title: $('h2 a').text(),
        items
      }
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

const iqiyi: IVideo = {
  origin: 'https://so.iqiyi.com',
  async search(kw, page) {
    var html: string = await req.get(`https://so.iqiyi.com/so/q_${encodeURI(kw)}_ctg__t_0_page_${page}_p_1_qc_0_rd__site__m_1_bitrate_`)
    var $ = cheerio.load(html)
    var items = $('.mod_result_list').children().map(function (i, ele) {
      var $ele = $(ele)
      var title = $ele.attr('data-widget-searchlist-tvname')
      var id = $ele.attr('data-widget-searchlist-albumid')
      var type = $ele.attr('data-widget-searchlist-catageory')
      var url = $ele.children('a').attr('href')
      var cover = $ele.find('img').attr('src')
      var desc = $ele.find('.result_info_txt').text()
      var rate = +$ele.find('.result-info-score').text()
      var series
      var $links = $ele.find('.album_item a')
      if ($links.length > 0) {
        series = $ele.find('.album_item a').map((i, ele) => {
          var $ele = $(ele)
          return {
            name: $ele.text(),
            url: $ele.attr('href')
          }
        }).get()
      }
      return {
        title,
        id,
        url,
        type,
        cover,
        desc,
        rate,
        series
      }
    }).get()
    var pages = +$('.mod-page').children().last().prev().text()
    return {
      page,
      pages,
      items
    }
  },
  async getVideoInfo(url) {
    var html: string = await req.get(url)
    var $ = cheerio.load(html)
    var title = $('.title-txt').text()
    var rate = +$('.score-new').text()
    var desc = $('.content-paragraph').text()
    var cover = 'https:' + $('.intro-img').attr('src')
    var series
    var type
    var type_name
    var $links = $('[is=i71-playpage-sdrama-list]')
    if ($links.length > 0) {
      let items = JSON.parse($links.attr(':initialized-data')).map((item: any) => {
        return {
          title: item.name,
          url: item.url
        }
      })
      series = {
        title: $('.header-txt a').text(),
        items
      }
      type = 2
      type_name = '电视剧'
    } else {
      type = 1
      type_name = '电影'
    }
    return {
      title,
      desc,
      cover,
      type,
      type_name,
      series,
      rate
    }
  }
}

const imeiju: IVideo = {
  origin: 'https://www.imeiju.cc',
  async search(kw, page) {
    var html: string = await req.get(this.origin + '/search.php', {
      qs: {
        page,
        searchword: kw,
        searchtype: ''
      }
    })
    var $ = cheerio.load(html)
    var items = $('.hy-video-details').map((i, ele) => {
      var $ele = $(ele)
      var $link = $ele.find('h3 a')
      var title = $link.text()
      var url = this.origin + $link.attr('href')
      var type = $ele.find('li').eq(3).find('a').text()
      var cover = (<RegExpMatchArray>$ele.find('.videopic').attr('style').match(/url\((.*?)\)/))[1]
      var desc = ''
      var rate = +$ele.find('.branch').text()
      var series
      var m_text = $ele.find('.score').text().match(/\d+/)
      var reg = /Meiju\/M(\w+)(?=\.html)/
      if (m_text) {
        series = [...Array(+m_text[0])].map((_, i) => {
          return {
            name: String(i + 1),
            url: url.replace(reg, `Play/$1-0-${i}`)
          }
        })
      }
      url = url.replace(reg, `Play/$1-0-1`)
      return {
        title,
        url,
        type,
        cover,
        desc,
        rate,
        series
      }
    }).get()
    var pages = Math.ceil(+(<RegExpMatchArray>$('.hy-video-head span').last().text().match(/\d+/))[0] / 10)
    return {
      page,
      pages,
      items
    }
  },
  async getVideoInfo(_url) {
    var html: string = await req.get(_url)
    var $ = cheerio.load(html)
    var $title = $('.footer>a')
    var title = $title .text() + $title[0].nextSibling.nodeValue.trim()
    var type
    var type_name = ''
    var $links = $('#playlist1 a')
    var list_str = (<RegExpMatchArray>html.match(/var VideoInfoList="(.*?)"/))[1]
    var list_urls = list_str.split('$$$')[0].split('$$')[1].split('#')
    var index = +(<RegExpMatchArray>_url.match(/\d+(?=\.html)/))[0]
    var url = list_urls.map(url => url.split('$')[1])[index]
    var series
    if ($links.length > 1) {
      var items = $links.map((i, ele) => {
        var $ele = $(ele)
        return {
          title: $ele.text(),
          url: this.origin + $ele.attr('href')
        }
      }).get()
      series = {
        title: $title.text(),
        items
      }
      type = 2
    } else {
      type = 1
    }
    return {
      title,
      desc: '',
      type,
      type_name,
      url,
      series
    }
  }
}

const siguady: IVideo = {
  origin: 'http://www.siguady.com',
  async search(kw, page) {
    var html: string = await req.get(`http://www.siguady.com/index.php?s=search-index-wd-${encodeURIComponent(kw)}-sid-1-p-${page}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    var $ = cheerio.load(html)
    var items = $('.details-info-min').map((i, ele) => {
      var $ele = $(ele)
      var $a = $ele.find('a.video-pic')
      var title = $a.attr('title')
      var url = this.origin + $a.attr('href')
      var cover = this.origin + $a.attr('data-original')
      var desc = $ele.find('.details-content-default').text()
      var type_text = $ele.find('.info').children().eq(2)[0].lastChild.nodeValue.trim()
      var type
      var series
      if (/(\d+)/.test(type_text)) {
        type = '电视剧'
        series = [...Array(Number(RegExp.$1))].map((_, i) => ({
          name: (i + 1).toString(),
          url: url.replace(/vod\/(\w+)/, `play/$1-0-${i + 1}`)
        }))
        url = series[0].url
      } else {
        type = '电影'
      }
      return {
        title,
        url,
        cover,
        desc,
        type,
        series
      }
    }).get()
    var mp = $('#count span').text().match(/\d+/)
    var pages = 0
    if (mp) {
      pages = Math.ceil(+[0] / 5)
    }
    return {
      page,
      pages,
      items
    }
  },
  async getVideoInfo(_url) {
    var html: string = await req.get(_url)
    var $ = cheerio.load(html)
    var title = $('h1').text().replace('在线观看', '')
    var data = getJsData((<string>$('#cms_play script').html()).replace('var ', 'return '))
    var burl = getBanliUrl(data)
    var $navs = $('.play_nav').children()
    var url
    var type
    var type_name = $navs.eq(2).text().replace('吧', '')
    var $links = $('#con_playlist_1 a')
    var series
    if ($links.length > 1) {
      var items = $links.map((_, ele) => {
        var $ele = $(ele)
        return {
          title: $ele.text(),
          url: this.origin + $ele.attr('href')
        }
      }).get()
      series = {
        title: $navs.eq(6).text(),
        items
      }
      type = 2
    } else {
      type = 1
    }
    if (burl) {
      html = await req.get(burl, {
        headers: {
          Referer: 'http://api.siguady.com'
        }
      })
      let pstr = (<RegExpMatchArray>html.match(/eval\("([^"]+)/))[1]
      let pstr2 = eval('"' + pstr + '"')
      let md5_str = (<RegExpMatchArray>pstr2.match(/\$\('#hdMd5'\)\.val\('(\w+)/))[1]
      let type = data.type
      if (type === 'zzz') {
        type = 'weiyun'
      } else if (type === 'qiyi') {
        type = 'iqiyiclient'
      }
      let ret = await req.post('http://api.siguady.com/mdparse/url.php', {
        form: {
          id: data.url,
          type,
          siteuser: '',
          hd: '',
          lg: '',
          md5: sign(md5_str)
        },
        headers: {
          Referer: 'http://api.siguady.com'
        }
      })
      console.log(ret)
      url = JSON.parse(ret).url
    }
    return {
      title,
      desc: '',
      type,
      type_name,
      url,
      series
    }
  }
}

// 青苹果影院
const qpgyy: IVideo = {
  origin: 'http://www.qpgyy.com',
  async search(kw, page) {
    var html: string = await req.post(`${this.origin}/so/`, {
      form: {
        wd: kw
      }
    })
    var $ = cheerio.load(html)
    var items = $('.itemList').map((i, ele) => {
      var $ele = $(ele)
      var $a = $ele.find('a').eq(1)
      var title = $a.attr('title')
      var url = $a.attr('href')
      var cover = $ele.find('img').attr('src')
      var desc = $ele.find('.pIntro').text()
      var type_text = $ele.find('.pic .pRightBottom').text()
      var type = $ele.find('.tit .sStyle').text()
      var series
      if (/(\d+)/.test(type_text)) {
        type = '电视剧'
        series = [...Array(Number(RegExp.$1))].map((_, i) => ({
          name: (i + 1).toString(),
          url: url.replace(/video\/(\w+)/, `play/$1-0-${i + 1}`)
        }))
      } else {
        type = '电影'
      }
      return {
        title,
        url,
        cover,
        desc,
        type,
        series
      }
    }).get()
    return {
      page,
      pages: items.length > 0 ? 1 : 0,
      items
    }
  },
  async getVideoInfo(_url) {
    var html: string = await req.get(_url)
    var $ = cheerio.load(html)
    var rate = +$('.p10idt-gold').text()
    var $breakcrumbs = $('.bread-crumbs a')
    var title = $breakcrumbs.filter('.current').text().replace('在线观看', '')
    var type_name = $breakcrumbs.eq(1).text()
    var type
    var publish_date
    var $links = $('.player_list').children()
    var desc = $('.tjuqing')[0].firstChild.nodeValue.trim()
    var arr_url = (<string>$('#zanpiancms_player').html()).match(/"url":"([^"]+)"/)
    var url = arr_url && arr_url[1].replace(/\\/g, '')
    var series
    if ($links.length > 0) {
      series = {
        title: $('.ui-title strong').text(),
        items: $links.map((_, ele) => {
          var $ele = $(ele)
          return {
            title: $ele.text(),
            url: this.origin + $ele.attr('href')
          }
        }).get()
      }
      type = VideoType.SERIES
    } else {
      type = VideoType.MOVIE
    }
    return {
      title,
      desc,
      type,
      type_name,
      publish_date,
      rate,
      series,
      url
    }
  }
}

var mappings: Record<string, IVideo> = {
  tencent,
  youku,
  iqiyi,
  siguady,
  qpgyy,
  imeiju
}

// var video = new YoukuVideo()

// video.search('西部世界').then(console.log)
// video.getVideoInfo('https://v.youku.com/v_show/id_XMTQ3OTY0MzIwMA==.html?spm=a2h0j.11185381.listitem_page2.5~A').then(console.log)

export function getVideor(type: string) {
  var item = mappings[type]
  if (item) {
    return item
  }
  throw new Error('暂无功能')
}

export function getVideorFromUrl(url: string) {
  var item = videoSites.find(item => url.startsWith(item.value))
  if (item) {
    return mappings[item.id]
  }
  throw new Error('暂无功能')
}

export const videoSites: {
  id: string
  text: string
  value: string
  direct?: boolean
}[] = [
    {
      "id": "tencent",
      "text": "腾讯视频",
      "value": "https://v.qq.com"
    },
    {
      "id": "youku",
      "text": "优酷",
      "value": "https://v.youku.com"
    },
    {
      "id": "bilibili",
      "text": "哔哩哔哩",
      "value": "http://www.bilibili.com"
    },
    {
      id: 'imeiju',
      text: '爱美剧',
      value: 'https://www.imeiju.cc',
      direct: true
    },
    {
      "id": "tudou",
      "text": "土豆",
      "value": "http://video.tudou.com"
    },
    {
      "id": "iqiyi",
      "text": "爱奇艺",
      "value": "http://www.iqiyi.com"
    },
    {
      "id": "mgtv",
      "text": "芒果TV",
      "value": "http://www.mgtv.com"
    },
    {
      "id": "le",
      "text": "乐视网",
      "value": "http://www.le.com"
    },
    {
      "id": "sohu",
      "text": "搜狐视频",
      "value": "http://tv.sohu.com"
    },
    {
      id: 'siguady',
      value: "http://www.siguady.com",
      text: "板栗电影网",
      direct: true
    },
    {
      id: 'qpgyy',
      value: "http://www.qpgyy.com",
      text: "青苹果影院",
      direct: true
    },
    {
      "id": "pptv",
      "text": "pptv",
      "value": "http://v.pptv.com"
    },
    {
      "id": "360kan",
      "text": "360影视",
      "value": "http://v.360kan.com"
    },
    {
      "id": "1905",
      "text": "1905",
      "value": "http://vip.1905.com"
    },
    {
      "id": 'migu',
      "text": '咪咕',
      "value": "630300937&type=migu"
    },
    {
      "id": "acfun",
      "text": "acfun",
      "value": "http://www.acfun.cn"
    },
    {
      "id": "yinyuetai",
      "text": "音悦台",
      "value": "http://v.yinyuetai.com"
    },
    {
      "id": "kugou",
      "text": "kugou",
      "value": "http://www.kugou.com"
    },
    {
      "id": "qq",
      "text": "qq",
      "value": "https://y.qq.com"
    },
    {
      "id": "lizhi",
      "text": "lizhi",
      "value": "http://cdn1.lizhi.fm"
    },
    {
      "id": "ximalaya",
      "text": "ximalaya",
      "value": "https://www.ximalaya.com"
    },
    {
      "id": "yy",
      "text": "yy",
      "value": "http://www.yy.com"
    },
    {
      "id": "wasu",
      "text": "wasu",
      "value": "https://www.wasu.cn"
    },
    {
      "id": "163",
      "text": "163",
      "value": "http://open.163.com"
    },
    {
      "id": "56",
      "text": "56",
      "value": "http://www.56.com"
    },
    {
      "id": "fun",
      "text": "fun",
      "value": "http://www.fun.tv"
    },
    {
      "id": "jsyunbf",
      "text": "jsyunbf",
      "value": "http://dy2.jsyunbf.com"
    },
    {
      "id": "meitudata",
      "text": "meitudata",
      "value": "http://mvvideo2.meitudata.com"
    },
    {
      "id": "kankan",
      "text": "kankan",
      "value": "http://vod.kankan.com"
    },
    {
      "id": "daum",
      "text": "daum",
      "value": "http://media.daum.net"
    },
    {
      "id": "sina",
      "text": "sina",
      "value": "http://video.sina.com.cn"
    },
    {
      "id": 'weibo',
      "text": '微博',
      "value": "http://weibo.com"
    },
    {
      "id": "vlook",
      "text": "vlook",
      "value": "http://www.vlook.cn"
    },
    {
      "id": "meipai",
      "text": "meipai",
      "value": "http://www.meipai.com"
    },
    {
      "id": "28a",
      "text": "28a",
      "value": "http://v.28a.im"
    },
    {
      "id": "duowan",
      "text": "duowan",
      "value": "http://ahuya.duowan.com"
    },
    {
      "id": "longzhu",
      "text": "longzhu",
      "value": "http://v.longzhu.com"
    },
    {
      "id": "tangdou",
      "text": "tangdou",
      "value": "http://www.tangdou.com"
    },
    {
      "id": "miaopai",
      "text": "miaopai",
      "value": "http://n.miaopai.com"
    },
    {
      "id": "kuaishou",
      "text": "kuaishou",
      "value": "https://live.kuaishou.com"
    },
    {
      "id": "17173",
      "text": "17173",
      "value": "http://v.17173.com"
    },
    {
      "id": "pearvideo",
      "text": "pearvideo",
      "value": "https://www.pearvideo.com"
    },
    {
      "id": "v1",
      "text": "v1",
      "value": "http://www.v1.cn"
    },
    {
      "id": "eastday",
      "text": "eastday",
      "value": "http://video.eastday.com"
    },
    {
      "id": "toutiao",
      "text": "toutiao",
      "value": "http://www.toutiao.com"
    },
    {
      "id": "365yg",
      "text": "365yg",
      "value": "https://www.365yg.com"
    },
    /* {
      "id": null,
      "text": null,
      "value": "b9893d8eb7094675bc2ef12c3ef19163&baiyug_xg"
    },
    {
      "id": null,
      "text": null,
      "value": "wwNock&QQkandian"
    },
    {
      "id": null,
      "text": null,
      "value": "1614045508645783977~baijiahao.c166"
    }, */
    {
      "id": "mtime",
      "text": "mtime",
      "value": "http://video.mtime.com"
    },
    /* {
      "id": null,
      "text": null,
      "value": "27panJB5RUTll3REqiUTR"
    },
    {
      "id": null,
      "text": null,
      "value": "baiyug20208149822186304914~tianyiyun.3496"
    },
    {
      "id": null,
      "text": null,
      "value": "15250182372400415~360yun.b800"
    },
    {
      "id": null,
      "text": null,
      "value": "/影视大全/广告.mp4~baiduyun.73a9"
    }, */
    {
      "id": "weiyun",
      "text": "weiyun",
      "value": "https://share.weiyun.com"
    }
  ]

export const videoResolvers = [
  {
    id: "jqaaa",
    text: "金桥解析",
    value: "http://jqaaa.com/jx.php"
  },
  {
    id: "baiyug",
    text: "百域阁",
    value: "http://app.baiyug.cn:2019/vip/index.php"
  }
]