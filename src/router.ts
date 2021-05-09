import * as t from "io-ts";
import {pipe} from "fp-ts/function";
import {fold} from "fp-ts/Either";

export interface Param<A extends string, B extends t.Type<C>, C> {
  name: A;
  type: B;
}

type EndpointArgs = {
  parts: (string | Param<any, any, any>)[];
  queryParams: {[key: string]: t.Type<any>};
};

type GetIoTSType<A> = A extends t.Type<infer B> ? B : never;
type GetTSParams<T> = T extends {[key in keyof T]: any} ? {[key in keyof T]: GetIoTSType<T[key]>} : never;

type EndpointMatch<T> = {params: GetTSParams<T>; rest: Partial<Record<string, string>>};

function stringToValue(value?: string): unknown {
  if (value == null) {
    return undefined;
  }
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

type ExtractParam<A> = A extends `:${infer B}` ? B : never;

export class Endpoint<N extends string, T> {
  private readonly args: EndpointArgs;

  constructor(public readonly name: N, args: Partial<EndpointArgs> = {}) {
    this.args = {
      parts: args.parts || [],
      queryParams: args.queryParams || {},
    };
  }

  public p(name: string): Endpoint<N, T>;
  public p<P extends string, A extends ExtractParam<P>, B extends t.Type<C>, C>(
    name: P,
    type: t.Type<C>
  ): Endpoint<N, T & {[key in A]: B}>;
  public p<Q extends {[key: string]: t.Type<any>}>(params: Q): Endpoint<N, T & Q>;
  public p(nameOrParams: any, type?: t.Type<any>): Endpoint<any, any> {
    if (type != null) {
      const paramName = nameOrParams.replace(/^:/, "");
      return new Endpoint(this.name, {
        ...this.args,
        parts: [...this.args.parts, type != null ? {name: paramName, type} : nameOrParams],
      });
    } else if (typeof nameOrParams === "string") {
      return new Endpoint(this.name, {...this.args, parts: [...this.args.parts, nameOrParams]});
    } else {
      return new Endpoint(this.name, {...this.args, queryParams: {...this.args.queryParams, ...nameOrParams}});
    }
  }

  public match(uri: string): EndpointMatch<T> | undefined {
    const url = new URL(uri, "http://www.example.com");
    const urlPathParts = url.pathname.split("/").filter((p) => p);
    const params: Record<string, any> = {};

    const parts = [...this.args.parts];
    while (urlPathParts.length > 0) {
      const urlPart = urlPathParts[0];
      const pathPart = parts[0];
      if (typeof pathPart === "string") {
        if (urlPart !== pathPart) {
          return undefined;
        }
      } else {
        const data = stringToValue(urlPart);
        const parseResult = (pathPart.type as t.Type<any>).decode(data);
        const result = pipe(
          parseResult,
          fold(
            () => false,
            (data) => {
              params[pathPart.name] = data;
              return true;
            }
          )
        );
        if (!result) {
          return undefined;
        }
      }
      urlPathParts.shift();
      parts.shift();
    }

    const searchParams: Partial<Record<string, string>> = {};
    url.searchParams.forEach((v, k) => {
      searchParams[k] = v == null ? undefined : v;
    });
    for (const key of Object.keys(this.args.queryParams)) {
      const value = stringToValue(searchParams[key]);
      const parseResult = this.args.queryParams[key].decode(value);
      const result = pipe(
        parseResult,
        fold(
          () => false,
          (data) => {
            if (data != null) {
              params[key] = data;
            }
            return true;
          }
        )
      );
      if (!result) {
        return undefined;
      }
      delete searchParams[key];
    }

    return {params: params as GetTSParams<T>, rest: searchParams};
  }

  public toUrl(params: GetTSParams<T>, host?: string): string {
    const paramsAny: any = params;
    const path =
      "/" +
      this.args.parts
        .map((p) => {
          if (typeof p === "string") {
            return p;
          } else {
            return (p.type as t.Type<unknown>).encode(paramsAny[p.name]);
          }
        })
        .join("/");
    const url = new URL(path, host || "http://example.com");
    for (const key of Object.keys(this.args.queryParams)) {
      const param = this.args.queryParams[key];
      const value = param.encode(paramsAny[key]);
      if (value != null) {
        url.searchParams.set(key, value);
      }
    }
    return host != null ? url.toString() : url.pathname + url.search;
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "ANY";

type RouteCallback<T> = (method: Method, url: string, endpointMatch: EndpointMatch<T>) => void;

interface Route<N extends string, T> {
  endpoint: Endpoint<N, T>;
  method: Method;
  callback: RouteCallback<T>;
}

type RouterArgs = {
  routes: Route<any, any>[];
};

class Router<T> {
  private readonly args: RouterArgs;

  constructor(args: Partial<RouterArgs> = {}) {
    this.args = {routes: args.routes || []};
  }

  public get<N extends string, U>(
    endpoint: Endpoint<N, U>,
    callback: RouteCallback<U>
  ): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("GET", endpoint, callback);
  }

  public post<N extends string, U>(
    endpoint: Endpoint<N, U>,
    callback: RouteCallback<U>
  ): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("POST", endpoint, callback);
  }

  public put<N extends string, U>(
    endpoint: Endpoint<N, U>,
    callback: RouteCallback<U>
  ): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("PUT", endpoint, callback);
  }

  public delete<N extends string, U>(
    endpoint: Endpoint<N, U>,
    callback: RouteCallback<U>
  ): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("DELETE", endpoint, callback);
  }

  public patch<N extends string, U>(
    endpoint: Endpoint<N, U>,
    callback: RouteCallback<U>
  ): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("PATCH", endpoint, callback);
  }

  public options<N extends string, U>(
    endpoint: Endpoint<N, U>,
    callback: RouteCallback<U>
  ): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("OPTIONS", endpoint, callback);
  }

  public head<N extends string, U>(
    endpoint: Endpoint<N, U>,
    callback: RouteCallback<U>
  ): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("HEAD", endpoint, callback);
  }

  public any<N extends string, U>(
    endpoint: Endpoint<N, U>,
    callback: RouteCallback<U>
  ): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("ANY", endpoint, callback);
  }

  public add<N extends string, U>(
    method: Method,
    endpoint: Endpoint<N, U>,
    callback: RouteCallback<U>
  ): Router<T & {[P in N]: Route<N, U>}> {
    const route: Route<N, U> = {method, endpoint, callback};
    return new Router({...this.args, routes: [...this.args.routes, route]});
  }

  public handle(method: Method, url: string): boolean {
    for (const route of this.args.routes) {
      if (route.method === method || route.method === "ANY") {
        const endpointMatch = route.endpoint.match(url);
        if (endpointMatch != null) {
          route.callback(method, url, endpointMatch);
          return true;
        }
      }
    }
    return false;
  }

  public endpoint<U extends keyof T>(name: U): T[U] extends Route<any, any> ? T[U]["endpoint"] : never {
    return this.args.routes.find((r) => r.endpoint.name === name)!.endpoint as any;
  }
}

// const path = new Path("getPeople").b`posts`(`:postId`, t.number)`comments`(
//   ":commentId",
//   t.number
// )({page: t.number, perPage: t.number});

// adding /foo/bar/:person/get?count=number

const endpoint = new Endpoint("getComments")
  .p("posts")
  .p(":id", t.number)
  .p("comments")
  .p({page: t.number, perPage: t.number, filterIds: t.array(t.number)});
console.log(endpoint);
const params = endpoint.match("/posts/1/comments?page=1&perPage=3");
console.log(params);
const url = endpoint.toUrl({filterIds: [1, 2, 3], page: 1, perPage: 3, id: 3});
console.log(url);

console.log("ROUTER");
const router = new Router()
  .get(endpoint, (method, url, params) => console.log(method, url, params))
  .get(new Endpoint("getPosts").p("posts").p(":id", t.number), (m, u, {params}) => console.log(params.id));
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
