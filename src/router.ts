import {Endpoint, ParamType} from "./endpoint";
import {Either, EndpointMatch, ExtractRouteParams} from "./types";

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "ANY";

export interface Route {
  endpoint: Endpoint<any>;
  method: Method;
  callback: IntRouteCallback<any, any, any>;
}

export type RouteHandler<_Payload, _Response, _Endpoint> = _Endpoint extends Endpoint<infer _PTypes>
  ? IntRouteCallback<_Payload, _Response, _PTypes>
  : never;

export type IntRouteCallback<_Payload, _Response, _PTypes> = (args: {
  payload: _Payload;
  method: Method;
  url: string;
  match: EndpointMatch<_PTypes>;
}) => _Response | Promise<_Response>;

export type RouterArgs = {
  routes: Route[];
};

export class Router<_Payload, _Response = void> {
  private readonly args: RouterArgs;
  private readonly payload: _Payload;

  constructor(payload: _Payload, args: Partial<RouterArgs> = {}) {
    this.payload = payload;
    this.args = {
      routes: args.routes || [],
    };
  }

  public get<_Name extends string, _PTypes>(
    endpoint: Endpoint<_PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): Router<_Payload, _Response>;
  public get<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response>;
  public get<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    pathOrEndpoint: _Path | Endpoint<_PTypes>,
    q: _QS | IntRouteCallback<_Payload, _Response, _PTypes>,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response> {
    return this.add("GET", pathOrEndpoint, q, cb);
  }

  public post<_Name extends string, _PTypes>(
    endpoint: Endpoint<_PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): Router<_Payload, _Response>;
  public post<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response>;
  public post<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    pathOrEndpoint: _Path | Endpoint<_PTypes>,
    q: _QS | IntRouteCallback<_Payload, _Response, _PTypes>,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response> {
    return this.add("POST", pathOrEndpoint, q, cb);
  }

  public put<_Name extends string, _PTypes>(
    endpoint: Endpoint<_PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): Router<_Payload, _Response>;
  public put<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response>;
  public put<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    pathOrEndpoint: _Path | Endpoint<_PTypes>,
    q: _QS | IntRouteCallback<_Payload, _Response, _PTypes>,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response> {
    return this.add("PUT", pathOrEndpoint, q, cb);
  }

  public delete<_Name extends string, _PTypes>(
    endpoint: Endpoint<_PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): Router<_Payload, _Response>;
  public delete<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response>;
  public delete<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    pathOrEndpoint: _Path | Endpoint<_PTypes>,
    q: _QS | IntRouteCallback<_Payload, _Response, _PTypes>,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response> {
    return this.add("DELETE", pathOrEndpoint, q, cb);
  }

  public patch<_Name extends string, _PTypes>(
    endpoint: Endpoint<_PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): Router<_Payload, _Response>;
  public patch<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response>;
  public patch<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    pathOrEndpoint: _Path | Endpoint<_PTypes>,
    q: _QS | IntRouteCallback<_Payload, _Response, _PTypes>,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response> {
    return this.add("PATCH", pathOrEndpoint, q, cb);
  }

  public options<_Name extends string, _PTypes>(
    endpoint: Endpoint<_PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): Router<_Payload, _Response>;
  public options<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response>;
  public options<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    pathOrEndpoint: _Path | Endpoint<_PTypes>,
    q: _QS | IntRouteCallback<_Payload, _Response, _PTypes>,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response> {
    return this.add("OPTIONS", pathOrEndpoint, q, cb);
  }

  public head<_Name extends string, _PTypes>(
    endpoint: Endpoint<_PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): Router<_Payload, _Response>;
  public head<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response>;
  public head<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    pathOrEndpoint: _Path | Endpoint<_PTypes>,
    q: _QS | IntRouteCallback<_Payload, _Response, _PTypes>,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response> {
    return this.add("HEAD", pathOrEndpoint, q, cb);
  }

  public any<_Name extends string, _PTypes>(
    endpoint: Endpoint<_PTypes>,
    callback: IntRouteCallback<_Payload, _Response, _PTypes>
  ): Router<_Payload, _Response>;
  public any<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    path: _Path,
    queryParams: _QS,
    callback: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response>;
  public any<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    pathOrEndpoint: _Path | Endpoint<_PTypes>,
    q: _QS | IntRouteCallback<_Payload, _Response, _PTypes>,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response> {
    return this.add("ANY", pathOrEndpoint, q, cb);
  }

  public add<_Name extends string, _PTypes, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    method: Method,
    pathOrEndpoint: _Path | Endpoint<_PTypes>,
    q: _QS | IntRouteCallback<_Payload, _Response, _PTypes>,
    cb?: IntRouteCallback<_Payload, _Response, ExtractRouteParams<_Path> & _QS>
  ): Router<_Payload, _Response> {
    let endpoint: Endpoint<_PTypes>;
    let callback: IntRouteCallback<_Payload, _Response, _PTypes>;
    if (pathOrEndpoint instanceof Endpoint && typeof q === "function") {
      endpoint = pathOrEndpoint;
      callback = q;
    } else {
      endpoint = Endpoint.build(pathOrEndpoint as _Path, q as _QS) as any;
      callback = cb as any;
    }
    const route: Route = {method, endpoint, callback};
    this.args.routes.push(route);
    return this;
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
}
