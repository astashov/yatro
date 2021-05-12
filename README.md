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

const postCommentsEndpoint = Endpoint.build("/posts/:postName/comments", {
  page: "number",
  perPage: "number",
});
```

That will create an endpoint with type: `Endpoint<{postName: "string", page: "number", "perPage: "number"}>`. Note that it even extracts `postName` from the path string - all thanks to the TS 4.1 Template Literal Types feature!

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

const postCommentsEndpoint = Endpoint.build("/posts/:postName/comments", {
  author: "string",
  page: "number",
  perPage: "number",
});
const addComment = Endpoint.build("/posts/:postName/comments");

const router = new Router()
  .get(postCommentsEndpoint, (args) => {
    // args.match.params here will be of type {postName: string; page: number; perPage: number, author: string}
  })
  .post(addComment, () => {
    // handle post here
  });
```

To handle an incoming request in a router, you need to pass the HTTP method and the path to it:

```ts
await router.route("GET", "/posts/cool-post/comments?page=3&perPage=8&author=john");
```

That will delegate handling to the first route that matches this method and path.
There's also short syntax for adding routes, without explicit creating of endpoint instances:

```ts
// prettier-ignore
const router = new Router()
  .get("/posts/:postName/comments", {page: "number"}, (args) => {
    // args.match.params here will be of type {postName: string; page: number}
  });
```

You can also initialize `Router` with any object, and it will be passed into the routes (and will be typesafe too!)

```ts
const router = new Router({foo: "bar"}).get("/posts/:postName", {}, (args) => {
  console.log(args.payload);
  // {foo: "bar"}
});
```

You can also specify the desired request and response types when creating a router, then it will be enforced
in route handlers. All of that together could look like this:

```ts
interface IRequest {
  path: string;
  method: string;
  headers: Partial<Record<string, string>>
}

interface IResponse {
  body: string;
  statusCode: number;
}

const router = new Router<IRequest, IResponse>(request)
  .get("/posts/:postName", {}, (args) => {
    return { statusCode: 200, body: `Post ${args.match.params.postName}` };
  });

const result = await router.route(request.method, request.path);
if (result.success) {
  const response = result.data;
  // handle response somehow
} else
  // handle 404 somehow
}
```

You could use it to pass e.g. the request object into the route handlers.

### Advanced

By default, if you specify a path param like: `/posts/:postName/comments`, it will be a type of string.
If you want to make it a number, you could add `|i` to the param name, like: `/posts/:id|i/comments`.
It will get `{id: number}` type.

```ts
const postCommentsEndpoint = Endpoint.build("/posts/:id|i/comments", {
  page: "number",
  perPage: "number",
});
// Endpoint<"postComments", {id: "number", page: "number", "perPage: "number"}>
```

We support two built-in types - `"string"` and `"number"`, and if you want them to be optional, you can add `?` to the end, like: `"string?"` and `"number?"`. You also can express any type with [`io-ts`](https://github.com/gcanti/io-ts) type builder.
For example, let's say we want to add `categoryIds` to our `postComments` endpoint, which is an array of numbers.
It'll look like this:

```ts
import * as t from "io-ts";

const postCommentsEndpoint = Endpoint.build("/posts/:postName/comments", {
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
const endpoint = new Endpoint()
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

### Web server example

You could use it together with e.g. Node's `http` library like this:

```ts
import http from "http";
import {Endpoint, Router, Method, RouteHandler} from ".";

interface IRequest {
  req: http.IncomingMessage;
  res: http.ServerResponse;
}

const addCommentEndpoint = Endpoint.build("/posts/:postName/comment/create");
const handleAddComment: RouteHandler<IRequest, void, typeof addCommentEndpoint> = (args) => {
  // ---
  // Add comment to the database somehow here
  // ---
  const {req, res} = args.payload;
  const {params} = args.match;
  res.statusCode = 302;
  const location = postCommentsEndpoint.toUrl(
    {postName: params.postName, page: 1, perPage: 8},
    "http://localhost:3000"
  );
  res.setHeader("Location", location);
  res.end("");
};

const postCommentsEndpoint = Endpoint.build("/posts/:postName/comments", {
  page: "number",
  perPage: "number",
});
const handlePostComments: RouteHandler<IRequest, void, typeof postCommentsEndpoint> = (args) => {
  // ---
  // Fetch comments from the database somehow here
  // ---
  const {req, res} = args.payload;
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end("Comments");
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url!, "http://localhost:3000");

    const router = new Router<IRequest>({req, res})
      .get(postCommentsEndpoint, handlePostComments)
      .get(addCommentEndpoint, handleAddComment);

    const result = await router.route(req.method as Method, url.pathname + url.search);
    if (!result.success) {
      res.statusCode = 404;
      res.end("Not Found");
    }
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({name: e.name, error: e.message, stack: e.stack}));
  }
});
server.listen(3000, "localhost", () => {
  console.log(`--------- Server is running ----------`);
});
```
