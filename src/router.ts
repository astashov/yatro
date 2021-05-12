import {Endpoint, ParamType} from "./endpoint";
import {EndpointMatch, ExtractRouteParams} from "./types";

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "ANY";

export interface Route<_Name extends string, _PTypes, _Routes, _Payload> {
  endpoint: Endpoint<_Name, _PTypes>;
  method: Method;
  callback: IntRouteCallback<_Payload, _PTypes>;
}

export type RouteHandler<_Payload, _Endpoint> = _Endpoint extends Endpoint<infer _Name, infer _PTypes>
  ? IntRouteCallback<_Payload, _PTypes>
  : never;

export type IntRouteCallback<_Payload, _PTypes> = (args: {
  payload: _Payload;
  method: Method;
  url: string;
  match: EndpointMatch<_PTypes>;
}) => void | Promise<void>;

export type RouterArgs = {
  routes: Route<any, any, any, any>[];
};

export class Router<_Routes, _Payload> {
  private readonly args: RouterArgs;
  private readonly payload: _Payload;

  constructor(payload: _Payload, args: Partial<RouterArgs> = {}) {
    this.payload = payload;
    this.args = {
      routes: args.routes || [],
    };
  }

  public get<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _PTypes>
  ): Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload>}, _Payload>;
  public get<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): Router<_Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload>}, _Payload>;
  public get<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("GET", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public post<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _PTypes>
  ): Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload>}, _Payload>;
  public post<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): Router<_Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload>}, _Payload>;
  public post<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("POST", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public put<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _PTypes>
  ): Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload>}, _Payload>;
  public put<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): Router<_Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload>}, _Payload>;
  public put<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("PUT", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public delete<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _PTypes>
  ): Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload>}, _Payload>;
  public delete<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): Router<_Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload>}, _Payload>;
  public delete<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("DELETE", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public patch<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _PTypes>
  ): Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload>}, _Payload>;
  public patch<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): Router<_Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload>}, _Payload>;
  public patch<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("PATCH", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public options<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _PTypes>
  ): Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload>}, _Payload>;
  public options<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): Router<_Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload>}, _Payload>;
  public options<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("OPTIONS", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public head<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _PTypes>
  ): Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload>}, _Payload>;
  public head<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): Router<_Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload>}, _Payload>;
  public head<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("HEAD", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public any<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _PTypes>
  ): Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload>}, _Payload>;
  public any<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): Router<_Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload>}, _Payload>;
  public any<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("ANY", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public add<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    method: Method,
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, ExtractRouteParams<_Path> & _QS>
  ): any {
    let endpoint: Endpoint<_Name, _PTypes>;
    let callback: IntRouteCallback<_Payload, _PTypes>;
    if (nameOrEndpoint instanceof Endpoint && typeof pathOrCallback === "function") {
      endpoint = nameOrEndpoint;
      callback = pathOrCallback;
    } else {
      endpoint = Endpoint.build(nameOrEndpoint as _Name, pathOrCallback as _Path, q!) as any;
      callback = cb as any;
    }
    const route: Route<_Name, _PTypes, _Routes, _Payload> = {
      method,
      endpoint,
      callback: cb as any,
    };
    return new Router(this.payload, {...this.args, routes: [...this.args.routes, route]});
  }

  public async handle(method: Method, url: string): Promise<boolean> {
    for (const route of this.args.routes) {
      if (route.method === method || route.method === "ANY") {
        const endpointMatch = route.endpoint.match(url);
        if (endpointMatch != null) {
          await route.callback({payload: this.payload, method, url, match: endpointMatch});
          return true;
        }
      }
    }
    return false;
  }

  public endpoint<U extends keyof _Routes>(
    name: U
  ): _Routes[U] extends Route<any, any, any, any> ? _Routes[U]["endpoint"] : never {
    return this.args.routes.find((r) => r.endpoint.name === name)!.endpoint as any;
  }
}
