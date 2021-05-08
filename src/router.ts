import * as t from "io-ts";
import {pipe} from "fp-ts/function";
import {fold} from "fp-ts/Either";

export interface Param<A extends string, B extends t.Type<C>, C> {
  name: A;
  type: B;
}

type PathArgs = {
  parts: (string | Param<any, any, any>)[];
  queryParams: {[key: string]: t.Type<any>};
};

type GetIoTSType<A> = A extends t.Type<infer B> ? B : never;
type GetTSParams<T> = T extends {[key in keyof T]: any} ? {[key in keyof T]: GetIoTSType<T[key]>} : never;

type PathMatch<T> = {params: GetTSParams<T>; rest: Partial<Record<string, string>>};

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

export class Path<N extends string, T> {
  private readonly args: PathArgs;

  constructor(public readonly name: N, args: Partial<PathArgs> = {}) {
    this.args = {
      parts: args.parts || [],
      queryParams: args.queryParams || {},
    };
  }

  public p(name: string): Path<N, T>;
  public p<P extends string, A extends ExtractParam<P>, B extends t.Type<C>, C>(
    name: P,
    type: t.Type<C>
  ): Path<N, T & {[key in A]: B}>;
  public p<A extends string, C>(name: A, type?: t.Type<C>): Path<N, T> {
    if (type != null) {
      const paramName = name.replace(/^:/, "");
      return new Path(this.name, {
        ...this.args,
        parts: [...this.args.parts, type != null ? {name: paramName, type} : name],
      });
    } else {
      return new Path(this.name, {...this.args, parts: [...this.args.parts, name]});
    }
  }

  public q<Q extends {[key: string]: t.Type<any>}>(params: Q): Path<N, T & Q> {
    return new Path(this.name, {...this.args, queryParams: {...this.args.queryParams, ...params}});
  }

  public match(uri: string): PathMatch<T> | undefined {
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
            params[key] = data;
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
      const value = param.encode(paramsAny[param.name]);
      url.searchParams.set(key, value);
    }
    return host != null ? url.toString() : url.pathname + url.search;
  }
}

// const path3 = Path.build("getPeople", ["foo", "bar", ["person", t.string], "get"]);

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "ANY";

type RouteCallback<T> = (method: Method, url: string, pathMatch: PathMatch<T>) => void;

interface Route<N extends string, T> {
  path: Path<N, T>;
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

  public get<N extends string, U>(path: Path<N, U>, callback: RouteCallback<U>): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("GET", path, callback);
  }

  public post<N extends string, U>(path: Path<N, U>, callback: RouteCallback<U>): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("POST", path, callback);
  }

  public put<N extends string, U>(path: Path<N, U>, callback: RouteCallback<U>): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("PUT", path, callback);
  }

  public delete<N extends string, U>(
    path: Path<N, U>,
    callback: RouteCallback<U>
  ): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("DELETE", path, callback);
  }

  public patch<N extends string, U>(path: Path<N, U>, callback: RouteCallback<U>): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("PATCH", path, callback);
  }

  public options<N extends string, U>(
    path: Path<N, U>,
    callback: RouteCallback<U>
  ): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("OPTIONS", path, callback);
  }

  public head<N extends string, U>(path: Path<N, U>, callback: RouteCallback<U>): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("HEAD", path, callback);
  }

  public any<N extends string, U>(path: Path<N, U>, callback: RouteCallback<U>): Router<T & {[P in N]: Route<N, U>}> {
    return this.add("ANY", path, callback);
  }

  public add<N extends string, U>(
    method: Method,
    path: Path<N, U>,
    callback: RouteCallback<U>
  ): Router<T & {[P in N]: Route<N, U>}> {
    const route: Route<N, U> = {method, path, callback};
    return new Router({...this.args, routes: [...this.args.routes, route]});
  }

  public handle(method: Method, url: string): boolean {
    for (const route of this.args.routes) {
      if (route.method === method || route.method === "ANY") {
        const pathMatch = route.path.match(url);
        if (pathMatch != null) {
          route.callback(method, url, pathMatch);
          return true;
        }
      }
    }
    return false;
  }

  public path<U extends keyof T>(name: U): T[U] extends Route<any, any> ? T[U]["path"] : never {
    return this.args.routes.find((r) => r.path.name === name)!.path as any;
  }
}

// adding /foo/bar/:person/get?count=number
const path = new Path("getPeople")
  .p("foo")
  .p("bar")
  .p(":person", t.string)
  .p("get")
  .q({count: t.array(t.number)});
console.log(path);
const params = path.match("/foo/bar/as3/get?count=[1,2,3]&foo=bar");
console.log(params);
const url = path.toUrl({count: [1, 4], person: "john"});
console.log(url);

console.log("ROUTER");
const router = new Router()
  .get(path, (method, url, params) => console.log(method, url, params))
  .get(new Path("getPosts").p("posts").p(":id", t.number), (m, u, {params}) => console.log(params.id));
const result = router.handle("GET", "/foo/bar/as3/get?count=[1,2,3]&foo=bar");
console.log(result);
const path2 = router.path("getPosts").toUrl({id: 3});
console.log(path2);

// router = router.get(path, ({param, person}) => {
//   console.log(param, person);
// });
// const result = router.match(path, "/foo/bar/as3/get?person=3"); // {param: 'as3', count: 3} | undefined
// const path2 = router.handle("/foo/bar/as3/get?person=3");

// path.toString({param: "blah", count: 3});
// // /foo/bar/:param/get?count=3
// router.path("getPeople");
