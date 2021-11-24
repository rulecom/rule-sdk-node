import { Suppression } from "./Suppressions";
import { Segment } from "./Segments";

type Tag = string | number;

export interface SavedTag {
  id: string;
  name: string;
}

export interface SubscriberFields {
  id?: number;
  key: string;
  type?: "text" | "date" | "datetime" | "multiple" | "json";
  value: string | Date | any[] | object;
}

interface Subscriber {
  language?: string;
  fields: SubscriberFields[];
}

interface PhoneSubscriber extends Subscriber {
  phone_number: string;
}

interface EmailSubscriber extends Subscriber {
  email: string;
}

export interface SavedSubscriber {
  id: string;
  opted_in?: boolean;
  language?: string;
  created_at: string;
  updated_at: string;
  phone_number?: string;
  email?: string;
  tags: SavedTag[];
  suppressed: Suppression[];
  syncAtSegments: Segment[];
}

export type CombinedSubscriber = PhoneSubscriber | EmailSubscriber;

export interface CreateSubscriberOptions {
  update_on_duplicate?: boolean;
  automation?: false | "reset" | "force";
  sync_subscribers?: boolean;
  fields_clear?: boolean;
  tags: Tag[];
  subscribers: CombinedSubscriber[] | CombinedSubscriber;
}

export interface CreateSubscriberResponse {
  subscriber?: SavedSubscriber;
  subscribers?: SavedSubscriber[];
  suppressed: CombinedSubscriber[];
}

export interface GetSubscribersOptions {
  limit?: number;
}

export interface GetSubscriberResponse {
  subscriber: SavedSubscriber;
}

export interface GetSubscribersResponse {
  subscribers: SavedSubscriber[];
}

export interface SubscriberSelector {
  identifier: string;
  identified_by: "email" | "phone_number" | "id";
}

export interface SubscriberGroup {
  name: string;
  historical: boolean;
  fields: SubscriberFields[];
}

export interface GetSubscriberFieldsResponse {
  groups: SubscriberGroup[];
}

export interface UpdateSubscriberOptions {
  id: string | number;
  data: Partial<CombinedSubscriber>;
}

export interface CreateSubscriberTagsOptions extends SubscriberSelector {
  tags: Tag[];
}

export interface DeleteSubscriberTagOptions extends SubscriberSelector {
  tag_identifier: string;
}

export interface SubscriberTagsResponse {
  tags: SavedTag[];
}
