import {Endpoint} from "./endpoint";
import {Router} from "./router";

const endpoint = Endpoint.build("getComments", "/posts/:id|i/comments", {
  page: "number",
  perPage: "number",
});
console.log(endpoint);
const params = endpoint.match("/posts/1/comments?page=1&perPage=3&filterIds=%5B1%2C2%2C3%5D");
console.log(params);
const url = endpoint.toUrl({page: 1, perPage: 3, id: 3});
console.log(url);

const e = new Endpoint("empty");
console.log(e.toUrl({}));

console.log("ROUTER");
const router = new Router()
  .get(endpoint, (method, url, params) => console.log(method, url, params))
  .get(new Endpoint("getPosts").p("posts").p(":id", "number"), (m, u, {params}) => console.log(params.id));
const result = router.handle("GET", "/foo/bar/as3/get?count=[1,2,3]&foo=bar");
console.log(result);
const path2 = router.endpoint("getPosts").toUrl({id: 3});
console.log(path2);

// router = router.get(path, ({param, person}) => {
//   console.log(param, person);
// });
// const result = router.match(path, "/foo/bar/as3/get?person=3"); // {param: 'as3', count: 3} | undefined
// const path2 = router.handle("/foo/bar/as3/get?person=3");

// path.toString({param: "blah", count: 3});
// // /foo/bar/:param/get?count=3
// router.path("getPeople");
