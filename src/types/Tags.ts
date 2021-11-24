import { PaginatedResponse } from "./Pagination";

export interface GetTagsOptions {
  limit?: number;
  page?: number;
}

export interface Tag {
  id: number;
  name: string;
  description: string;
  recipient_count?: string;
  created_at: string;
  updated_at: string;
}

export interface GetTagsResponse extends PaginatedResponse {
  tags: Tag[];
}

export interface GetTagOptions {
  identifier: string | number;
  identified_by?: "name" | "id";
  with_count?: boolean;
}

export interface UpdateTagOptions {
  identifier: string | number;
  data: {
    name?: string;
    description?: string;
  };
}

export interface DeleteTagOptions {
  identifier: string | number;
}
