import { PaginatedResponse } from "./Pagination";
type MessageType = "text_message" | "email";
type Identifier = "email" | "id" | "phone_number";

export interface CreateSuppressionOptions {
  subscribers: Record<Identifier, number | string>[];
  suppress_on?: {
    campaign?: MessageType[];
    transaction?: MessageType[];
  };
}

export interface Suppression {
  id: number;
  created_at: string;
  dispatcher_type: "campaign" | "transactional";
  message_type: "text_message" | "email";
  suppressed_source_type: string;
  subscriber?: {
    id: number;
    email?: string;
    phone_number?: string;
  };
}

export interface GetSuppressionsResponse extends PaginatedResponse {
  suppressions: Suppression[];
}

export interface DeleteSuppressionOptions {
  identifier: string | number;
  identified_by?: "email" | "phone_number" | "id";
}
