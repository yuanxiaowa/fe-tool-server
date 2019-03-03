import { getResolver } from "../util";
import { transform } from "../../utils/ts";
import { transform as vueTransform } from "../../utils/vue";

export default getResolver({
  Query: {
    async ts2Code(args: any) {
      return transform(args.code, args.type)
    },
    async vue2Code(args: any) {
      return vueTransform(args.code, args.type)
    }
  }
})