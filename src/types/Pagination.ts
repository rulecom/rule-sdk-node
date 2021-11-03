export interface PaginationOptions {
  limit?: number;
  page?: number;
}

export interface PaginatedResponse {
  meta: {
    next: string;
  };
}
