import type {ParamType} from "./endpoint";
import type {Either, GetIoTSType} from "./types";

export function stringToValue(value?: string): unknown {
  if (value == null) {
    return undefined;
  }
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

export function validate<A>(type: ParamType<A>, data: unknown): boolean {
  if (type === "string") {
    return typeof data === "string";
  } else if (type === "string?") {
    return typeof data === "string" || data == null;
  } else if (type === "number") {
    return typeof data === "number";
  } else if (type === "number?") {
    return typeof data === "number" || data == null;
  } else {
    return "right" in type.decode(data);
  }
}

export function encode<A>(type: ParamType<A>, data: unknown): string | undefined {
  if (type === "string") {
    return `${data}`;
  } else if (type === "string?") {
    return data == null ? undefined : `${data}`;
  } else if (type === "number") {
    return `${data}`;
  } else if (type === "number?") {
    return data == null ? undefined : `${data}`;
  } else {
    return `${type.encode(data as A)}`;
  }
}

export function decode<A>(type: ParamType<A>, data: string): Either<GetIoTSType<A>> {
  if (type === "string" || (typeof type !== "string" && type.name === "string")) {
    return {success: true, data: data as any};
  } else {
    const value = stringToValue(data);
    const isValid = validate(type, value);
    if (isValid) {
      return {success: true, data: value as any};
    } else {
      return {success: false, error: "Can't decode"};
    }
  }
}
