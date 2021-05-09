import {Endpoint} from "./endpoint";
import {EndpointMatch} from "./types";

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "ANY";

export interface Route<N extends string, T> {
  endpoint: Endpoint<N, T>;
  method: Method;
  callback: RouteCallback<T>;
}

export type RouteCallback<T> = (method: Method, url: string, endpointMatch: EndpointMatch<T>) => void;

export type RouterArgs = {
  routes: Route<any, any>[];
};

export class Router<T> {
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
