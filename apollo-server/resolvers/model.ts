import { getResolver } from "../util";
import { transform } from "../../utils/ts";

export default getResolver({
  Query: {
    async tsToModel(args: any) {
      return transform(args.code, args.type)
    }
  }
})