# Yet Another Typesafe Router - Yatro

It's a prototype of a typesafe router. Basically, it's a combination of several ideas:

- Allow to iteratively build endpoints
- Use [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) and recursive types we can extract parameters from express-like path syntax
- Use [`io-ts`](https://github.com/gcanti/io-ts) for describing the expected types of path and querystring parameters

## Usage

### Basics

You can create typesafe endpoints like this:

```ts
import {Endpoint} from "yatro";

const postCommentsEndpoint = Endpoint.build("postComments", "/posts/:postName/comments", {
  page: "number",
  perPage: "number",
});
```

That will create an endpoint with type: `Endpoint<"postComments", {postName: "string", page: "number", "perPage: "number"}>`. Note that it even extracts `postName` from the path string - all thanks to the TS 4.1 Template Literal Types feature!

The endpoint has 2 main methods - `match` and `toUrl`. `match` allows to match a path with the endpoint, and it will return the extracted parameters if successful, or `undefined` if it doesn't match:

```ts
postCommentsEndpoint.match("/foo/bar");
// => undefined
postCommentsEndpoint.match("/posts/cool-post/comments?page=3&perPage=blah");
// => undefined, because perPage should be a number
postCommentsEndpoint.match("/posts/cool-post/comments?page=3&perPage=8&foo=bar");
// => {params: {postName: "cool-post", page: 3, perPage: 8}, rest: {foo: "bar"}}
```

We can also create string URLs from the endpoint param using `toUrl` method:

```ts
postCommentsEndpoint.toUrl({postName: "cool-post", page: 3, perPage: 8});
// => "/posts/cool-post/comments?page=3&perPage=8"
postCommentsEndpoint.toUrl({postName: 32, page: 3});
// Results in a type error because it expects `postName` to be a string, and also missing `perPage` param.
```

Now, we can add those `Endpoint`s instances to a `Router`:

```ts
import {Endpoint, Router} from "yatro";

const postCommentsEndpoint = Endpoint.build("postComments", "/posts/:postName/comments", {
  author: "string"
  page: "number",
  perPage: "number",
});
const addComment = Endpoint.build("addComment", "/posts/:postName/comments", {});

const router = new Router()
  .get(postCommentsEndpoint, (method, url, params) => {
    // params here will be of type {postName: string; page: number; perPage: number, author: string}
  })
  .post(addComment, (method, url, params) => {
    // handle post here
  });
```

To handle an incoming request in a router, you need to pass the HTTP method and the path to it:

```ts
router.handle("GET", "/posts/cool-post/comments?page=3&perPage=8&author=john");
```

That will delegate handling to the first route that matches this method and path.

You can also fetch an endpoint by name from a router, that also will be typesafe:

```ts
router.endpoint("postComments").toUrl({postName: "cool-post", page: 3, perPage: 8, author: "john"});
// /posts/cool-post/comments?page=3&perPage=8&author=john
```

### Advanced

By default, if you specify a path param like: `/posts/:postName/comments`, it will be a type of string.
If you want to make it a number, you could add `|i` to the param name, like: `/posts/:id|i/comments`.
It will get `{id: number}` type.

```ts
const postCommentsEndpoint = Endpoint.build("postComments", "/posts/:id|i/comments", {
  page: "number",
  perPage: "number",
});
// Endpoint<"postComments", {id: "number", page: "number", "perPage: "number"}>
```

We support two built-in types - `"string"` and `"number"`, but also you can express any type with [`io-ts`](https://github.com/gcanti/io-ts) type builder.
For example, let's say we want to add `categoryIds` to our `postComments` endpoint, which is an array of numbers.
It'll look like this:

```ts
import * as t from "io-ts";

const postCommentsEndpoint = Endpoint.build("postComments", "/posts/:postName/comments", {
  page: "number",
  perPage: "number",
  categoryIds: t.array(t.number),
});
```

It will match a route like this:

```ts
postCommentsEndpoint.match("/posts/cool-post/comments?page=3&perPage=8&categoryIds=[1,2,3]");
// {params: {postName: "cool-post", page: 3, perPage: 8, categoryIds: [1, 2, 3]}, rest: {}}
```

There's also another way of building endpoints - iteratively, by the `.p()` method:

```ts
const endpoint = new Endpoint("postComments")
  .p("posts")
  .p(":postName", "string"),
  .p("comments")
  .p({
    page: "number",
    perPage: "number",
    categoryIds: t.array(t.number),
  })
});
```

This way, you can also specify any `io-ts` type for the `postName` path param, not only `"string"` or `"number"`.