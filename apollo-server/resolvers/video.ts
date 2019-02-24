import { getResolver } from "../util";
import ref, { videoResolvers } from "../../utils/video";

export default getResolver({
  Query: {
    async videoSearch({
      kw,
      type,
      page
    }: any) {
      var videor = ref.getHandler(type)
      return videor.search(kw, page)
    },
    async video({
      url
    }: any) {
      return ref.getHandlerFromUrl(url).getInfo(url)
    },
    videoResolvers: () => videoResolvers,
    videoSites: () => ref.sites
  }
})