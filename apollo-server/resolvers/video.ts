import { getResolver } from "../util";
import { getVideor, videoResolvers, videoSites, getVideorFromUrl } from "../../utils/video";

export default getResolver({
  Query: {
    async videoSearch({
      kw,
      type,
      page
    }: any) {
      var videor = getVideor(type)
      return videor.search(kw, page + 1)
    },
    async video({
      url
    }: any) {
      return getVideorFromUrl(url).getVideoInfo(url)
    },
    videoResolvers: () => videoResolvers,
    videoSites: () => videoSites
  }
})