import { IdType, Base } from "./types";

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiFactoryOptions {
  host: string;
  cors?: boolean;
}

interface ApiOptions<T> {
  singular?: string;
  accessor?: (x: any) => T | void;
}

interface ApiConfig {
  entityName: string;
  resource: string;
}

export type ApiFactory = <T>(
  resource: string,
  apiOpts: ApiOptions<T>
) => ResourceApi<T>;

export interface ResourceApi<T> {
  getConfig: () => ApiConfig;
  show: (id: IdType) => Promise<T>;
  index: () => Promise<T[]>;
  create: ({ newItem }: { [entityName: string]: Partial<T> }) => Promise<T>;
  update: ({ update }: { [entityName: string]: Base<T> }) => Promise<void>;
  destroy: (id: IdType) => Promise<void>;
  get: (endpoint: string) => Promise<T>;
  post: (endpoint: string, data: any) => Promise<T | void>;
}

interface JsonRequestData<T> {
  method: HTTPMethod;
  id?: IdType;
  body?: Partial<T>;
  endpoint?: string;
}

const Factory: (factoryOpts: ApiFactoryOptions) => ApiFactory = ({
  host,
  cors
}) => <T>(resource, { singular, accessor }) => {
  const jsonRequest = <T>(resource: string) => ({
    id,
    body,
    endpoint,
    method
  }: JsonRequestData<T>) => {
    const requestUrl = [host, resource, endpoint || id]
      .filter(Boolean)
      .join("/");
    const jsonBody = !!body ? JSON.stringify(body) : undefined;
    const headers = !!body ? { "Content-Type": "application/json" } : undefined;
    return fetch(requestUrl, {
      headers,
      mode: cors ? "cors" : undefined,
      method,
      body: jsonBody
    }).then((res: Response) => {
      if (method !== "DELETE") {
        return res.json().then(accessor || (x => x["data"]));
      }
    });
  };

  const entityName = singular || resource.substr(0, resource.length - 1);
  const request = jsonRequest(resource);

  return {
    getConfig: () => ({ entityName, resource }),
    index: () => request({ method: "GET" }),
    show: id => request({ id, method: "GET" }),
    create: body => request({ body, method: "POST" }),
    update: body => request({ id: body[entityName].id, body, method: "PUT" }),
    destroy: id => request({ id, method: "DELETE" }),
    get: endpoint => request({ method: "GET", endpoint }),
    post: (endpoint, body) => request({ body, method: "POST", endpoint })
  };
};

export default Factory;
