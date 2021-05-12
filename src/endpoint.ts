import type {Type} from "io-ts";
import type {EndpointMatch, ExtractParam, ExtractRouteParams, GetTSParams} from "./types";
import {decode, encode} from "./utils";

export interface Param<_Name extends string, _PType extends ParamType<C>, C> {
  name: _Name;
  type: _PType;
}

export type ParamType<_TSType = any> = Type<_TSType> | "string" | "number" | "string?" | "number?";

export type EndpointArgs = {
  parts: (string | Param<any, any, any>)[];
  queryParams: {[key: string]: ParamType};
};

export class Endpoint<_Name extends string, _PTypes = {}> {
  private readonly args: EndpointArgs;

  public static build<_Name extends string, _Path extends string, _QS extends {[key: string]: ParamType<any>}>(
    name: _Name,
    path: _Path,
    params?: _QS
  ): Endpoint<_Name, ExtractRouteParams<_Path> & _QS> {
    const parts = path
      .split("/")
      .filter((p) => p)
      .map((p) => {
        if (p.startsWith(":")) {
          const partName = p.replace(/^:/, "");
          if (partName.endsWith("|i")) {
            return {type: "number", name: partName.replace(/\|i$/, "")};
          } else {
            return {type: "string", name: partName};
          }
        } else {
          return p;
        }
      });
    return new Endpoint(name, {parts, queryParams: params || {}});
  }

  constructor(public readonly name: _Name, args: Partial<EndpointArgs> = {}) {
    this.args = {
      parts: args.parts || [],
      queryParams: args.queryParams || {},
    };
  }

  public p(name: string): Endpoint<_Name, _PTypes>;
  public p<_Name extends string, _ParamName extends ExtractParam<_Name>, _PType extends ParamType<C>, C>(
    name: _Name,
    type: _PType
  ): Endpoint<_Name, _PTypes & {[key in _ParamName]: _PType}>;
  public p<_QS extends {[key: string]: ParamType<any>}>(params: _QS): Endpoint<_Name, _PTypes & _QS>;
  public p(nameOrParams: any, type?: ParamType<any>): Endpoint<any, any> {
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

  public match(uri: string): EndpointMatch<_PTypes> | undefined {
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
        const result = decode(pathPart.type, urlPart);
        if (result.success) {
          if (result.data != null) {
            params[pathPart.name] = result.data;
          }
        } else {
          return undefined;
        }
      }
      urlPathParts.shift();
      parts.shift();
    }

    console.log("STILL HERE");

    const searchParams: Partial<Record<string, string>> = {};
    url.searchParams.forEach((v, k) => {
      searchParams[k] = v == null ? undefined : v;
    });
    for (const key of Object.keys(this.args.queryParams)) {
      console.log(key, searchParams[key]);
      const result = decode(this.args.queryParams[key], searchParams[key]!);
      if (result.success) {
        if (result.data != null) {
          params[key] = result.data;
        }
      } else {
        console.log("KEY", key);
        return undefined;
      }
      delete searchParams[key];
    }

    return {params: params as GetTSParams<_PTypes>, rest: searchParams};
  }

  public toUrl(params: GetTSParams<_PTypes>, host?: string): string {
    const paramsAny: any = params;
    const path =
      "/" +
      this.args.parts
        .map((p) => {
          if (typeof p === "string") {
            return p;
          } else {
            return encode(p.type, paramsAny[p.name]);
          }
        })
        .join("/");
    const url = new URL(path, host || "http://example.com");
    for (const key of Object.keys(this.args.queryParams)) {
      const param = this.args.queryParams[key];
      const value = paramsAny[key];
      if (value != null) {
        url.searchParams.set(key, typeof value === "string" ? value : JSON.stringify(value));
      }
    }
    return host != null ? url.toString() : url.pathname + url.search;
  }
}
