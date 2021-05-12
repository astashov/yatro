import {Endpoint, ParamType} from "./endpoint";
import {Either, EndpointMatch, ExtractRouteParams} from "./types";

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "ANY";

export interface Route<_Name extends string, _PTypes, _Routes, _Payload, _Response> {
  endpoint: Endpoint<_Name, _PTypes>;
  method: Method;
  callback: IntRouteCallback<_Payload, _Response, _PTypes>;
}

export type RouteHandler<_Payload, _Response, _Endpoint> = _Endpoint extends Endpoint<infer _Name, infer _PTypes>
  ? IntRouteCallback<_Payload, _Response, _PTypes>
  : never;

export type IntRouteCallback<_Payload, _Response, _PTypes> = (args: {
  payload: _Payload;
  method: Method;
  url: string;
  match: EndpointMatch<_PTypes>;
}) => _Response | Promise<_Response>;

export type RouterArgs = {
  routes: Route<any, any, any, any, any>[];
};

export class Router<_Routes, _Payload, _Response = void> {
  private readonly args: RouterArgs;
  private readonly payload: _Payload;

  constructor(payload: _Payload, args: Partial<RouterArgs> = {}) {
    this.payload = payload;
    this.args = {
      routes: args.routes || [],
    };
  }

  public setResponseType<_R>(): _Router<_Routes, _Payload, _R> {
    return new _Router<_Routes, _Payload, _R>(this.payload, {...this.args});
  }
}

class _Router<_Routes, _Payload, _Response> {
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
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): _Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload, _Response>}, _Payload, _Response>;
  public get<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): _Router<
    _Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload, _Response>},
    _Payload,
    _Response
  >;
  public get<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _Response, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("GET", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public post<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): _Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload, _Response>}, _Payload, _Response>;
  public post<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): _Router<
    _Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload, _Response>},
    _Payload,
    _Response
  >;
  public post<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _Response, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("POST", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public put<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): _Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload, _Response>}, _Payload, _Response>;
  public put<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): _Router<
    _Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload, _Response>},
    _Payload,
    _Response
  >;
  public put<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _Response, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("PUT", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public delete<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): _Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload, _Response>}, _Payload, _Response>;
  public delete<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): _Router<
    _Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload, _Response>},
    _Payload,
    _Response
  >;
  public delete<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _Response, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("DELETE", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public patch<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): _Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload, _Response>}, _Payload, _Response>;
  public patch<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): _Router<
    _Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload, _Response>},
    _Payload,
    _Response
  >;
  public patch<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _Response, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("PATCH", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public options<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): _Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload, _Response>}, _Payload, _Response>;
  public options<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): _Router<
    _Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload, _Response>},
    _Payload,
    _Response
  >;
  public options<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _Response, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("OPTIONS", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public head<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): _Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload, _Response>}, _Payload, _Response>;
  public head<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): _Router<
    _Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload, _Response>},
    _Payload,
    _Response
  >;
  public head<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _Response, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("HEAD", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public any<_Name extends string, _PTypes>(
    endpoint: Endpoint<_Name, _PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): _Router<_Routes & {[P in _Name]: Route<_Name, _PTypes, _Routes, _Payload, _Response>}, _Payload, _Response>;
  public any<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): _Router<
    _Routes & {[P in _Name]: Route<_Name, ExtractRouteParams<_Path> & _QS, _Routes, _Payload, _Response>},
    _Payload,
    _Response
  >;
  public any<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _Response, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): any {
    return this.add("ANY", nameOrEndpoint, pathOrCallback, q, cb);
  }

  public add<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    method: Method,
    nameOrEndpoint: _Name | Endpoint<_Name, _PTypes>,
    pathOrCallback: _Path | IntRouteCallback<_Payload, _Response, _PTypes>,
    q?: _QS,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): any {
    let endpoint: Endpoint<_Name, _PTypes>;
    let callback: IntRouteCallback<_Payload, _Response, _PTypes>;
    if (nameOrEndpoint instanceof Endpoint && typeof pathOrCallback === "function") {
      endpoint = nameOrEndpoint;
      callback = pathOrCallback;
    } else {
      endpoint = Endpoint.build(nameOrEndpoint as _Name, pathOrCallback as _Path, q!) as any;
      callback = cb as any;
    }
    const route: Route<_Name, _PTypes, _Routes, _Payload, _Response> = {
      method,
      endpoint,
      callback: cb as any,
    };
    return new _Router(this.payload, {...this.args, routes: [...this.args.routes, route]});
  }

  public async route(method: Method, url: string): Promise<Either<_Response>> {
    for (const route of this.args.routes) {
      if (route.method === method || route.method === "ANY") {
        const endpointMatch = route.endpoint.match(url);
        if (endpointMatch != null) {
          const result = await route.callback({payload: this.payload, method, url, match: endpointMatch});
          return {success: true, data: result};
        }
      }
    }
    return {success: false, error: "Not found"};
  }

  public endpoint<U extends keyof _Routes>(
    name: U
  ): _Routes[U] extends Route<any, any, any, any, any> ? _Routes[U]["endpoint"] : never {
    return this.args.routes.find((r) => r.endpoint.name === name)!.endpoint as any;
  }
}
