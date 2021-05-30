import {expect} from "chai";
import "mocha";
import {Endpoint, Router} from "../src";

describe("Router", () => {
  describe(".route()", () => {
    it("routes properly", async () => {
      const endpoint = Endpoint.build("/foo/bar/:value", {zoo: "number?"});
      const router = new Router<{}, {result: string}>({})
        .get(endpoint, (args) => {
          return {result: `GET-${args.match.params.value}-${args.match.params.zoo}`};
        })
        .post(endpoint, (args) => {
          return {result: `POST-${args.match.params.value}-${args.match.params.zoo}`};
        });
      const result = await router.route("GET", "/foo/bar/val?zoo=3");
      expect(result).to.eql({success: true, data: {result: "GET-val-3"}});
    });
  });
});
