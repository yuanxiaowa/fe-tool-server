import { getResolver } from "../util";
import { getInfoFromUrl } from "../../utils/novel";

export default getResolver({
  Query: {
    async novel({
      url
    }: any) {
      return getInfoFromUrl(url).getInfo(url)
    }
  }
})