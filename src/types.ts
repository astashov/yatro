import type {Type} from "io-ts";

export type EndpointMatch<T> = {params: GetTSParams<T>; rest: Partial<Record<string, string>>};

export type GetIoTSType<A> = A extends "string"
  ? string
  : A extends "number"
  ? number
  : A extends Type<infer B>
  ? B
  : never;
export type GetTSParams<T> = T extends {[key in keyof T]: any} ? {[key in keyof T]: GetIoTSType<T[key]>} : never;

export type ExtractParam<A> = A extends `:${infer B}` ? B : never;

export type Either<A> = {success: true; data: A} | {success: false; error: string};

export type ExtractParamName<T> = T extends `${infer Name}|i` ? Name : T;
export type ExtractParamType<T> = T extends `${infer Name}|i` ? "number" : "string";

export type ExtractRouteParams<T extends string> = T extends `${infer Start}:${infer Param}/${infer Rest}`
  ? {[k in ExtractParamName<Param>]: ExtractParamType<Param>} & ExtractRouteParams<Rest>
  : T extends `${infer Start}:${infer Param}`
  ? {[k in ExtractParamName<Param>]: ExtractParamType<Param>}
  : {};
