import { PaginatedResponse } from "./Pagination";

export interface GroupFields {
  id: number;
  name: string;
  type: string;
}

export interface Group {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  fields: GroupFields[];
}

export interface Field {
  key: string;
  type?: "text" | "date" | "datetime" | "multiple" | "json";
}

export interface CreateGroupOptions {
  fields: Field[];
}

export interface GetGroupOptions {
  identifier: number | string;
}

export interface GetGroupsResponse extends PaginatedResponse {
  groups: Group[];
}
