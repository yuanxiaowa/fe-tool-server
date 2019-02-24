import { getResolver } from "../util";
import ref from "../../utils/music";
export default getResolver({
  Query: {
    musicSearch(args: any) {
      return ref.getHandler(args.type).searchMusic(args)
    },
    musicRecomms(args: any) {
      return ref.getHandler(args.type).getRecomms()
    },
    musicSites() {
      return ref.sites
    }
  }
})