import { PaginatedResponse } from "./Pagination";
import { EmailBlockContent, EmailHTMLContent } from "./Transactions";

export interface Segment {
  identifier: string;
  negative: boolean;
}

export interface Tag {
  identifier: string;
}

export interface CampaignUser {
  name: string;
  email?: string;
  phone_number?: string;
}

export interface Campaign {
  id: number;
  name: string;
  sent_at: string;
  created_at: string;
  status: "draft" | "sent";
  type: "email" | "text_message";
  recipients: {
    tags: Tag[];
    segments: Segment[];
    subscribers: CampaignUser[];
  };
}

export interface GetCampaignsResponse extends PaginatedResponse {
  campaigns: Campaign[];
}

export interface CreateCampaignOptions {
  message_type: "email" | "text_message";
  language: string;
  subject: string;
  recipients: {
    tags?: Tag[];
    segments?: Segment[];
  };
  from: {
    name: string;
    email?: string;
    phone_number?: string;
  };
  email_template_id?: number;
  content: EmailBlockContent[] | EmailHTMLContent | string;
}

export interface ScheduleCampaignOptions extends CreateCampaignOptions {
  send_at: string;
}

export interface CreateCampaignResponse extends Campaign {
  email_template_id: number;
}

export interface CampaignRecipientItem {
  id: 1;
  name: "Newsletter";
  negative: boolean;
}

export interface GetCampaignOptions {
  id: number;
}

export interface GetCampaignStatisticsOptions {
  id: number;
}

export interface CampaignStatistics {
  sent: number;
  name: string;
  sent_at: string;
  open: {
    unique: number;
    total: number;
  };
  click: {
    unique: number;
    total: number;
  };
  browser: {
    unique: number;
    total: number;
  };
  bounced: {
    hard: number;
    soft: number;
  };
  unsubscribed: {
    user: number;
    spam: number;
  };
}

export interface SendCampaignResponse {
  success: true;
  campaign_id: string;
}
