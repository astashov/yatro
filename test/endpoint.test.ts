import { expect } from "chai";
import "mocha";
import { Endpoint } from "../src";

describe("Endpoint", () => {
  describe(".match()", () => {
    it("returns empty parameters if no params specified", () => {
      const endpoint = Endpoint.build("/foo/bar");
      const { params, rest } = endpoint.match("/foo/bar")!;
      expect(params).to.be.eql({});
      expect(rest).to.be.eql({});
    });

    it("returns unmatched parameters in rest", () => {
      const endpoint = Endpoint.build("/foo/bar", { blah: "string" });
      expect(endpoint.match("/foo/bar?blah=one&zoo=two")).to.eql({
        params: { blah: "one" },
        rest: { zoo: "two" },
      });
    });

    it("returns undefined if doesn't match", () => {
      const endpoint = Endpoint.build("/foo/bar", { blah: "string", zoo: "number" });
      const result = endpoint.match("/foo/bar?blah=one&zoo=two")!;
      expect(result).to.be.undefined;
    });

    it("parses numbers", () => {
      const endpoint = Endpoint.build("/foo/bar", { blah: "string", zoo: "number" });
      expect(endpoint.match("/foo/bar?blah=one&zoo=3")).to.eql({
        params: { blah: "one", zoo: 3 },
        rest: {},
      });
    });

    it("parses optional types", () => {
      const endpoint = Endpoint.build("/foo/bar", { blah: "string?", zoo: "number?" });
      expect(endpoint.match("/foo/bar?blah=one&zoo=4")).to.eql({
        params: { blah: "one", zoo: 4 },
        rest: {},
      });
      expect(endpoint.match("/foo/bar")).to.eql({ params: {}, rest: {} });
    });

    it("parses encoded params", () => {
      const endpoint = Endpoint.build("/foo/bar/:id", { blah: "string" });
      expect(endpoint.match("/foo/bar/A%20B?blah=C%20D")).to.eql({
        params: { blah: "C D", id: "A B" },
        rest: {},
      });
    });

    it("parses path parameters", () => {
      const endpoint = Endpoint.build("/foo/:value/bar", { blah: "string?" });
      expect(endpoint.match("/foo/3/bar?blah=one&zoo=4")).to.eql({
        params: { blah: "one", value: "3" },
        rest: { zoo: "4" },
      });
    });

    it("parses path with host", () => {
      const endpoint = Endpoint.build("/foo/:value/bar", { blah: "string?" });
      expect(endpoint.match("https://www.example.com/foo/3/bar?blah=one&zoo=4")).to.eql({
        params: { blah: "one", value: "3" },
        rest: { zoo: "4" },
      });
    });

    it("parses number path parameters", () => {
      const endpoint = Endpoint.build("/foo/:value|i/bar/:another", { blah: "string?" });
      expect(endpoint.match("/foo/3/bar/5?blah=one&zoo=4")).to.eql({
        params: { blah: "one", value: 3, another: "5" },
        rest: { zoo: "4" },
      });
    });
  });

  describe(".toUrl()", () => {
    it("builds URL", () => {
      const endpoint = Endpoint.build("/foo/:value|i/bar/:another", { blah: "string?" });
      expect(endpoint.toUrl({ value: 5, another: "hmm", blah: undefined })).to.eql("/foo/5/bar/hmm");
    });

    it("builds URL with querystring params", () => {
      const endpoint = Endpoint.build("/foo/:value|i/bar/:another", { blah: "string?" });
      expect(endpoint.toUrl({ value: 5, another: "hmm", blah: "too" })).to.eql("/foo/5/bar/hmm?blah=too");
    });
  });

  describe(".p()", () => {
    it("incrementally builds URL", () => {
      const endpoint = new Endpoint().p("foo").p(":value", "number").p("bar").p({ blah: "string?" });
      expect(endpoint.toUrl({ value: 5, blah: "yay" })).to.eql("/foo/5/bar?blah=yay");
    });
  });
});
