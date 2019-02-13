import { getResolver } from "../util";
import { getVideor } from "../../utils/video";

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
      url,
      type
    }: any) {
      return getVideor(type).getVideoInfo(url)
    }
  }
})