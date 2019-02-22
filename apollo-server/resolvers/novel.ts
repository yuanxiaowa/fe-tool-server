import { getResolver } from "../util";
import ref from "../../utils/novel";

export default getResolver({
  Query: {
    async novel({
      url
    }: any) {
      return ref.getHandlerFromUrl(url).getInfo(url)
    },
    novelDepInfo({
      url
    }: any) {
      return ref.getHandlerFromUrl(url).getDepInfo(url)
    },
    novelRecomms({
      type
    }: any) {
      return ref.getHandler(type).getRecomms()
    },
    async novelSearch({ kw, page, type }: any) {
      return ref.getHandler(type).search(kw, page)
    }
  }
})