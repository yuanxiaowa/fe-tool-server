import crypto = require('crypto')


function md5(data: any) {
  var t = crypto.createHash('md5')
  t.update(data)
  return t.digest('hex')
}

export function getBanliUrl(zanpiancms_player: any) {
  if (zanpiancms_player.type == 'pmty') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'alicdn') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=alicdn&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'youku') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=youku&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'qiyi') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=iqiyiclient&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'iqiyi') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=iqiyiclient&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'qq') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=qq&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'mgtv') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=mgtv&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'pptv') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=pptv&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'sohu') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=sohu&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'letv') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=letv&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'tudou') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=tudou&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'bilibili') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=bilibili&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'cctv') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=cctv&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'migu') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=migu&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'dayu') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=dayu&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'cibn') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=cibn&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'litv') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=litv&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'coture') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == '47k') { //如果播放标识为m3u8
    return 'https://api.47ks.com/webcloud/?v=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'kandian') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=kandian&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'toutiao') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=toutiao&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'mp41') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=mp4&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'mp4') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=mp4&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'm3u8') { //如果播放标识为m3u8
    return 'http://api.siguady.com/m3u8/m3u8.php?url=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'ppyun') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=ppbox&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'ppbox') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=ppbox&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'qq1') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=qq&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'opentv') { //如果播放标识为m3u8
    return 'https://api.flvsp.com/?type=lepath&vid=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'maiduidui') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/maiduidui.php?id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'mmsid') { //如果播放标识为m3u8
    return 'https://api.flvsp.com/?type=mmsid&vid=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'sina') { //如果播放标识为m3u8
    return 'https://api.flvsp.com/index.php?type=sina&vid=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'DPm3u8') { //如果播放标识为m3u8
    return 'http://api.siguady.com/m3u8.php?url=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'weiyun') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=weiyun&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'bestv') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=bestv&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'chaoxing') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=chaoxing&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'm3u8share') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=m3u8share&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'zzz') { //如果播放标识为m3u8
    return 'http://api.siguady.com/mdparse/index.php?type=weiyun&id=' + zanpiancms_player.url;
  }
  else if (zanpiancms_player.type == 'kj') { //如果播放标识为m3u8
    return 'https://pan-yz.chaoxing.com/preview/showpreview_' + zanpiancms_player.url;
  }
}

// @ts-ignore
eval(function (p, a, c, k, e, r) { e = function (c) { return (c < a ? '' : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) r[e(c)] = k[c] || e(c); k = [function (e) { return r[e] }]; e = function () { return '\\w+' }; c = 1 }; while (c--) if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]); return p }('v j=["\\r\\r\\p\\n\\o\\z\\l\\E\\O\\p\\m\\q\\n\\l\\q\\m\\k\\t\\r\\t\\t\\s\\r\\k\\I\\w\\r\\M\\A\\x\\l\\k\\r\\p\\n\\o\\z\\1p\\s\\k\\u\\q\\J\\s\\k\\u","\\G\\l\\w","\\J\\s\\k\\u\\p","\\C","\\C\\y\\P","\\A\\k\\s","\\C\\B\\B\\C\\P\\1e\\X\\1t","\\B","","\\p\\n\\o\\z\\l\\E\\O\\p\\m\\q\\n\\l\\q\\m\\k\\t","\\y","\\B\\y\\y\\y","\\m\\H\\s","\\m\\u","\\r\\r\\p\\n\\o\\z\\q\\G\\C\\p\\E\\k\\F\\z\\q\\n\\l\\m\\n\\k\\I\\x\\q\\m\\k\\t","\\C\\X\\y","\\x\\A\\s\\p\\o\\w\\m\\H","\\p\\n\\o\\z\\I\\E\\n","\\t\\s\\G\\s","\\1a\\Q\\k\\E\\t\\o\\w\\T\\B\\1a\\l\\F\\p\\l\\m\\w\\T\\B\\y","\\n\\l\\u\\G\\w\\H","\\u\\k\\x\\l\\n\\A\\s\\w","\\r\\p\\n\\o\\z\\q\\M\\A\\x\\l\\k\\m\\o\\m\\H\\l\\q\\n\\l\\m\\n\\k\\I\\x\\q\\m\\k\\t\\r","\\A\\u\\x\\l\\F\\1G\\Q","\\n\\k\\m\\o\\w\\A\\k\\u","\\l\\F\\l\\m","\\o\\J\\o\\F"];D 1k(){$[j[V]]({W:j[0],Z:j[1],N:j[2],1q:{1r:j[3],1u:j[4],1w:j[5],1z:j[6],1M:j[7],1J:j[8],1b:j[7],1c:j[9],1d:R(1f(+1g 1h/1i)),1j:j[10],1l:j[11],1m:j[12],1n:j[13],1o:j[10]},S:D(g,h,i){$[j[V]]({W:j[14]+g[j[18]][j[17]][j[16]][j[15]][0]+j[19],Z:j[1],N:j[2],1s:j[2],S:D(a,b,c){1v(v d=a[j[K]][j[1x]]-1;d>=0;d--){1y(a[j[K]][d][j[Y]][j[1A]](j[1B])==-1){v e=/\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}/;v f=e[j[1D]](a[j[K]][d][j[Y]]);1E=f[0];1F();L 1H}}}})}})}D R(a){v b=1I;v c=U(a,b%17);v c=c^b;L c}D U(a,b){v c=0;1K(c<b){a=(1L&(a>>1))|((a&1)<<1C);++c};L a}', 62, 111, '|||||||||||||||||||_0xe392|x6F|x65|x63|x6C|x61|x70|x2E|x2F|x73|x6D|x6E|var|x74|x64|x30|x79|x69|x31|x33|function|x72|x78|x67|x68|x75|x6A|21|return|x76|dataType|x2D|x34|x66|getMmsKey|success|x3D|rotateRight|26|url|x35|24|type|||||||||||x26|accessyx|domain|tkey|x36|parseInt|new|Date|1000|devid|getleip|source|lang|region|isHttps|x4A|data|platid|jsonp|x37|splatid|for|tss|20|if|id|23|22|31|25|iqiyicip|player|x4F|false|185025305|dvtype|while|2147483647|detect'.split('|'), 0, {}))
// @ts-ignore
var _0x9ba7 = ["\x64\x20\x31\x3D\x5B\x22\x5C\x62\x5C\x33\x5C\x34\x5C\x63\x5C\x35\x5C\x37\x5C\x38\x5C\x33\x5C\x35\x5C\x34\x5C\x39\x5C\x61\x22\x5D\x3B\x36\x2B\x32\x5B\x31\x5B\x30\x5D\x5D\x28\x65\x29\x2B\x32\x5B\x31\x5B\x30\x5D\x5D\x28\x66\x29\x2B\x32\x5B\x31\x5B\x30\x5D\x5D\x28\x67\x29\x2B\x32\x5B\x31\x5B\x30\x5D\x5D\x28\x68\x29\x2B\x32\x5B\x31\x5B\x30\x5D\x5D\x28\x69\x29\x2B\x32\x5B\x31\x5B\x30\x5D\x5D\x28\x6A\x29\x2B\x32\x5B\x31\x5B\x30\x5D\x5D\x28\x6B\x29\x2B\x32\x5B\x31\x5B\x30\x5D\x5D\x28\x6C\x29", "\x7C", "\x73\x70\x6C\x69\x74", "\x7C\x5F\x30\x78\x62\x37\x38\x30\x7C\x53\x74\x72\x69\x6E\x67\x7C\x78\x37\x32\x7C\x78\x36\x46\x7C\x78\x34\x33\x7C\x73\x74\x72\x7C\x78\x36\x38\x7C\x78\x36\x31\x7C\x78\x36\x34\x7C\x78\x36\x35\x7C\x78\x36\x36\x7C\x78\x36\x44\x7C\x76\x61\x72\x7C\x33\x33\x7C\x39\x37\x7C\x39\x38\x7C\x31\x30\x31\x7C\x31\x30\x32\x7C\x35\x37\x7C\x35\x36\x7C\x35\x35", "\x72\x65\x70\x6C\x61\x63\x65", "", "\x5C\x77\x2B", "\x5C\x62", "\x67", "\x73\x75\x62\x73\x74\x72\x69\x6E\x67", "\x38\x61\x62\x35\x64\x36", "\x6C\x6F\x69\x6A"];
// @ts-ignore
export function sign(str: string) { var abc = md5(eval(function (p, a, c, k, e, r) { e = function (c) { return c.toString(a) }; if (!_0x9ba7[5][_0x9ba7[4]](/^/, String)) { while (c--) { r[e(c)] = k[c] || e(c) }; k = [function (e) { return r[e] }]; e = function () { return _0x9ba7[6] }; c = 1 }; while (c--) { if (k[c]) { p = p[_0x9ba7[4]](new RegExp(_0x9ba7[7] + e(c) + _0x9ba7[7], _0x9ba7[8]), k[c]) } }; return p }(_0x9ba7[0], 22, 22, _0x9ba7[3][_0x9ba7[2]](_0x9ba7[1]), 0, {}))); var _a = abc[_0x9ba7[9]](10, 22); var _b = abc[_0x9ba7[9]](24, 30); return (![] + [])[+!+[]] + (+(+!+[] + [+!+[]]))[(!![] + [])[+[]] + (!![] + [][(![] + [])[+[]] + ([![]] + [][[]])[+!+[] + [+[]]] + (![] + [])[!+[] + !+[]] + (!![] + [])[+[]] + (!![] + [])[!+[] + !+[] + !+[]] + (!![] + [])[+!+[]]])[+!+[] + [+[]]] + (+![] + ([] + [])[([][(![] + [])[+[]] + ([![]] + [][[]])[+!+[] + [+[]]] + (![] + [])[!+[] + !+[]] + (!![] + [])[+[]] + (!![] + [])[!+[] + !+[] + !+[]] + (!![] + [])[+!+[]]] + [])[!+[] + !+[] + !+[]] + (!![] + [][(![] + [])[+[]] + ([![]] + [][[]])[+!+[] + [+[]]] + (![] + [])[!+[] + !+[]] + (!![] + [])[+[]] + (!![] + [])[!+[] + !+[] + !+[]] + (!![] + [])[+!+[]]])[+!+[] + [+[]]] + ([][[]] + [])[+!+[]] + (![] + [])[!+[] + !+[] + !+[]] + (!![] + [])[+[]] + (!![] + [])[+!+[]] + ([][[]] + [])[+[]] + ([][(![] + [])[+[]] + ([![]] + [][[]])[+!+[] + [+[]]] + (![] + [])[!+[] + !+[]] + (!![] + [])[+[]] + (!![] + [])[!+[] + !+[] + !+[]] + (!![] + [])[+!+[]]] + [])[!+[] + !+[] + !+[]] + (!![] + [])[+[]] + (!![] + [][(![] + [])[+[]] + ([![]] + [][[]])[+!+[] + [+[]]] + (![] + [])[!+[] + !+[]] + (!![] + [])[+[]] + (!![] + [])[!+[] + !+[] + !+[]] + (!![] + [])[+!+[]]])[+!+[] + [+[]]] + (!![] + [])[+!+[]]])[+!+[] + [+[]]] + (!![] + [])[+[]] + (!![] + [])[+!+[]] + ([![]] + [][[]])[+!+[] + [+[]]] + ([][[]] + [])[+!+[]] + (+![] + [![]] + ([] + [])[([][(![] + [])[+[]] + ([![]] + [][[]])[+!+[] + [+[]]] + (![] + [])[!+[] + !+[]] + (!![] + [])[+[]] + (!![] + [])[!+[] + !+[] + !+[]] + (!![] + [])[+!+[]]] + [])[!+[] + !+[] + !+[]] + (!![] + [][(![] + [])[+[]] + ([![]] + [][[]])[+!+[] + [+[]]] + (![] + [])[!+[] + !+[]] + (!![] + [])[+[]] + (!![] + [])[!+[] + !+[] + !+[]] + (!![] + [])[+!+[]]])[+!+[] + [+[]]] + ([][[]] + [])[+!+[]] + (![] + [])[!+[] + !+[] + !+[]] + (!![] + [])[+[]] + (!![] + [])[+!+[]] + ([][[]] + [])[+[]] + ([][(![] + [])[+[]] + ([![]] + [][[]])[+!+[] + [+[]]] + (![] + [])[!+[] + !+[]] + (!![] + [])[+[]] + (!![] + [])[!+[] + !+[] + !+[]] + (!![] + [])[+!+[]]] + [])[!+[] + !+[] + !+[]] + (!![] + [])[+[]] + (!![] + [][(![] + [])[+[]] + ([![]] + [][[]])[+!+[] + [+[]]] + (![] + [])[!+[] + !+[]] + (!![] + [])[+[]] + (!![] + [])[!+[] + !+[] + !+[]] + (!![] + [])[+!+[]]])[+!+[] + [+[]]] + (!![] + [])[+!+[]]])[!+[] + !+[] + [+[]]]](!+[] + !+[] + [+[]]) + [!+[] + !+[] + !+[] + !+[] + !+[]] + [!+[] + !+[] + !+[] + !+[] + !+[] + !+[] + !+[] + !+[] + !+[]] + _b + _0x9ba7[10] + _a + _0x9ba7[11] }
