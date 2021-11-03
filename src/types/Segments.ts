import { PaginatedResponse } from "./Pagination";
export interface Segment {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  sync_at: string;
}

export interface GetSegmentsOptions {
  limit?: number;
  page?: number;
}

export interface GetSegmentsResponse extends PaginatedResponse {
  segments: Segment[];
}
