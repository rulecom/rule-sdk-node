import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { Buffer } from "buffer";
import config from "./config";
import APIError from "./utils/APIError";
import {
  CombinedSubscriber,
  DeleteSubscriberTagOptions,
  SubscriberFields
} from "./types/Subscribers";
import { GetSegmentsResponse, GetSegmentsOptions } from "./types/Segments";
import {
  CreateGroupOptions,
  GetGroupsResponse
} from "./types/SubscriberFields";
import { PaginationOptions } from "./types/Pagination";
import { GetGroupOptions, Group } from "./types/SubscriberFields";
import { DeleteTagOptions, Tag } from "./types/Tags";
import { DeleteSuppressionOptions } from "./types/Suppressions";
import {
  SendCampaignResponse,
  ScheduleCampaignOptions,
  UnifiedContent
} from "./types/Campaign";
import {
  GetCampaignOptions,
  Campaign,
  GetCampaignStatisticsOptions,
  CampaignStatistics
} from "./types/Campaign";
import {
  GetCampaignsResponse,
  CreateCampaignOptions,
  CreateCampaignResponse
} from "./types/Campaign";
import {
  CreateSuppressionOptions,
  GetSuppressionsResponse
} from "./types/Suppressions";
import { GetTagsResponse, GetTagOptions, UpdateTagOptions } from "./types/Tags";
import { EmailBlockContent, EmailHTMLContent } from "./types/Transactions";
import {
  GetTemplatesResponse,
  GetTemplateOptions,
  Template
} from "./types/Templates";
import {
  CreateTransactionResponse,
  CreateTransactionOptions
} from "./types/Transactions";
import {
  CreateSubscriberTagsOptions,
  SubscriberTagsResponse
} from "./types/Subscribers";
import {
  UpdateSubscriberOptions,
  GetSubscriberResponse,
  SubscriberSelector,
  GetSubscriberFieldsResponse,
  GetSubscribersOptions,
  GetSubscribersResponse,
  CreateSubscriberOptions,
  CreateSubscriberResponse
} from "./types/Subscribers";

interface SDKSettings {
  apiKey: string;
}

export default class RuleSDK {
  client: AxiosInstance;
  constructor({ apiKey }: SDKSettings) {
    if (!apiKey) {
      throw new Error(
        "Please specify a valid API Key when initializing the Rule SDK"
      );
    }

    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
  }

  private wrapRoute = async (
    routeRequest: Promise<AxiosResponse>
  ): Promise<boolean | any> => {
    try {
      const {
        data: { message, success, ...response }
      } = await routeRequest;

      if (!Object.keys(response).length) {
        return message?.toLowerCase() === "success" || success;
      }

      return response;
    } catch (e) {
      const err = e as AxiosError;

      if (err.response?.status === 429) {
        throw new APIError("API Rate-limit reached", "RateLimitError");
      }

      const { message, error, fields } = err.response?.data ?? {};
      throw new APIError(message, error, fields);
    }
  };

  private processSubscriber = (
    subscriber: CombinedSubscriber
  ): CombinedSubscriber => {
    return {
      ...subscriber,
      fields: subscriber.fields.map(
        (field): SubscriberFields => {
          if (field.type && typeof field.value === "string") {
            return field;
          }

          if (field.type && field.value instanceof Date) {
            if (field.type === "date") {
              return {
                ...field,
                value: field.value.toISOString().split("T")[0]
              };
            }

            return {
              ...field,
              value: field.value.toISOString()
            };
          }

          if (typeof field.value === "string") {
            const sanitizedValue = field.value.trim();
            const isJSON = /\{(?:[^}{]+|\{(?:[^}{]+|\{[^)(]\})\})\}/.test(
              sanitizedValue
            );

            if (isJSON) {
              return {
                ...field,
                type: "json"
              };
            }

            return {
              ...field,
              type: "text"
            };
          }

          if (typeof field.value === "object") {
            return {
              ...field,
              type: Array.isArray(field.value) ? "multiple" : "json",
              value: JSON.stringify(field.value)
            };
          }

          throw new Error(
            `[RULE] Invalid field type and value detected:\n${JSON.stringify(
              field
            )}`
          );
        }
      )
    };
  };

  private processSubscribers = (
    subscribers: CombinedSubscriber | CombinedSubscriber[]
  ) => {
    if (Array.isArray(subscribers)) {
      return subscribers.map(this.processSubscriber);
    }

    return this.processSubscriber(subscribers);
  };

  public createSubscribers = async (
    newSubscribers: CreateSubscriberOptions
  ) => {
    const parsedSubscriptions = {
      ...newSubscribers,
      subscribers: this.processSubscribers(newSubscribers.subscribers)
    };
    const response: CreateSubscriberResponse = await this.wrapRoute(
      this.client.post("/subscribers", parsedSubscriptions)
    );

    return response;
  };

  public getSubscriber = async ({
    identifier,
    identified_by
  }: SubscriberSelector) => {
    const response: GetSubscriberResponse = await this.wrapRoute(
      this.client.get(`/subscribers/${identifier}`, {
        params: {
          identified_by
        }
      })
    );

    return response.subscriber;
  };

  public getSubscribers = async (options: GetSubscribersOptions) => {
    const response: GetSubscribersResponse = await this.wrapRoute(
      this.client.get("/subscribers", {
        params: options
      })
    );

    return response.subscribers;
  };

  public getSubscriberFields = async ({
    identifier,
    identified_by = "email"
  }: SubscriberSelector) => {
    const sanitizedIdentifier = encodeURIComponent(
      identifier.trim().toLowerCase()
    );
    const response: GetSubscriberFieldsResponse = await this.wrapRoute(
      this.client.get(`/subscriber/${sanitizedIdentifier}/fields`, {
        params: {
          identified_by
        }
      })
    );

    return response.groups;
  };

  public updateSubscriber = async (updatedData: UpdateSubscriberOptions) => {
    const response: GetSubscriberResponse = await this.wrapRoute(
      this.client.put(`/subscribers/${updatedData.id}`, updatedData.data)
    );

    return response.subscriber;
  };

  public deleteSubscriber = async ({
    identifier,
    identified_by = "email"
  }: SubscriberSelector) => {
    const sanitizedIdentifier = encodeURIComponent(
      identifier.trim().toLowerCase()
    );
    const response: boolean = await this.wrapRoute(
      this.client.delete(`/subscribers/${sanitizedIdentifier}`, {
        params: {
          identified_by
        }
      })
    );

    return response;
  };

  public createSubscriberTag = async ({
    identifier,
    identified_by,
    tags
  }: CreateSubscriberTagsOptions) => {
    const sanitizedIdentifier = encodeURIComponent(
      identifier.trim().toLowerCase()
    );
    const response: boolean = await this.wrapRoute(
      this.client.post(
        `/subscribers/${sanitizedIdentifier}/tags`,
        { tags },
        {
          params: {
            identified_by
          }
        }
      )
    );

    return response;
  };

  public getSubscriberTags = async ({
    identifier,
    identified_by = "email"
  }: SubscriberSelector) => {
    const sanitizedIdentifier = encodeURIComponent(
      identifier.trim().toLowerCase()
    );
    const response: SubscriberTagsResponse = await this.wrapRoute(
      this.client.get(`/subscribers/${sanitizedIdentifier}/tags`, {
        params: {
          identified_by
        }
      })
    );

    return response.tags;
  };

  public clearSubscriberTags = async ({
    identifier,
    identified_by = "email"
  }: SubscriberSelector) => {
    const sanitizedIdentifier = encodeURIComponent(
      identifier.trim().toLowerCase()
    );
    const response: boolean = await this.wrapRoute(
      this.client.delete(`/subscribers/${sanitizedIdentifier}/tags/clear`, {
        params: {
          identified_by
        }
      })
    );

    return response;
  };

  public deleteSubscriberTag = async ({
    identifier,
    identified_by,
    tag_identifier
  }: DeleteSubscriberTagOptions) => {
    const sanitizedIdentifier = encodeURIComponent(
      identifier.trim().toLowerCase()
    );
    const response: boolean = await this.wrapRoute(
      this.client.delete(
        `/subscribers/${sanitizedIdentifier}/tags/${tag_identifier}`,
        {
          params: {
            identified_by
          }
        }
      )
    );

    return response;
  };

  public createTransaction = async (transaction: CreateTransactionOptions) => {
    const parsedData = {
      ...transaction,
      content: this.processContent(transaction.content)
    };
    const response: CreateTransactionResponse = await this.wrapRoute(
      this.client.post(`/transactionals`, parsedData)
    );

    return response;
  };

  public getTemplates = async () => {
    const response: GetTemplatesResponse = await this.wrapRoute(
      this.client.get(`/templates`)
    );

    return response.templates;
  };

  public getTemplate = async ({ id }: GetTemplateOptions) => {
    const response: Template = await this.wrapRoute(
      this.client.get(`/template/${id}`)
    );

    return response;
  };

  public getTags = async ({ limit = 100, page = 1 }: PaginationOptions) => {
    const response: GetTagsResponse = await this.wrapRoute(
      this.client.get(`/tags`, {
        params: {
          limit,
          page
        }
      })
    );

    return response.tags;
  };

  public getTag = async ({
    identifier,
    identified_by = "name",
    with_count = true
  }: GetTagOptions) => {
    const response: Tag = await this.wrapRoute(
      this.client.get(`/tags/${identifier}`, {
        params: {
          identified_by,
          with_count
        }
      })
    );

    return response;
  };

  public updateTag = async ({ identifier, data }: UpdateTagOptions) => {
    const response: Tag = await this.wrapRoute(
      this.client.put(`/tags/${identifier}`, data)
    );

    return response;
  };

  public deleteTag = async ({ identifier }: DeleteTagOptions) => {
    const response: boolean = await this.wrapRoute(
      this.client.delete(`/tags/${identifier}`)
    );

    return response;
  };

  public clearTag = async ({ identifier }: DeleteTagOptions) => {
    const response: boolean = await this.wrapRoute(
      this.client.delete(`/tags/${identifier}/clear`)
    );

    return response;
  };

  public getSegments = async ({ limit = 20, page = 1 }: PaginationOptions) => {
    const response: GetSegmentsResponse = await this.wrapRoute(
      this.client.get(`/segments`, {
        params: {
          limit,
          page
        }
      })
    );

    return response.segments;
  };

  public createGroupsAndFields = async (data: CreateGroupOptions) => {
    const response: boolean = await this.wrapRoute(
      this.client.post(`/customizations`, data)
    );

    return response;
  };

  public getGroupsWithFields = async (options: PaginationOptions) => {
    const response: GetGroupsResponse = await this.wrapRoute(
      this.client.get(`/customizations`, { params: options })
    );

    return response;
  };

  public getGroupWithFields = async ({ identifier }: GetGroupOptions) => {
    const response: Group = await this.wrapRoute(
      this.client.get(`/customizations/${identifier}`)
    );

    return response;
  };

  public createSuppression = async (data: CreateSuppressionOptions) => {
    const response: boolean = await this.wrapRoute(
      this.client.post(`/suppressions`, data)
    );

    return response;
  };

  public getSuppressions = async (data: PaginationOptions) => {
    const response: GetSuppressionsResponse = await this.wrapRoute(
      this.client.get(`/suppressions`, { params: data })
    );

    return response;
  };

  public deleteSuppressions = async ({
    identifier,
    identified_by = "email"
  }: DeleteSuppressionOptions) => {
    const response: boolean = await this.wrapRoute(
      this.client.delete(`/suppressions/${identifier}`, {
        params: { identified_by }
      })
    );

    return response;
  };

  public getCampaigns = async (data: PaginationOptions) => {
    const response: GetCampaignsResponse = await this.wrapRoute(
      this.client.get(`/campaigns`, { params: data })
    );

    return response;
  };

  private processContent = (content: UnifiedContent): UnifiedContent => {
    if (Array.isArray(content) || typeof content === "string") {
      return content;
    }

    return {
      plain: Buffer.from(content.plain).toString("base64"),
      html: Buffer.from(content.html).toString("base64")
    };
  };

  public createCampaign = async (data: CreateCampaignOptions) => {
    const parsedData = {
      ...data,
      content: this.processContent(data.content)
    };
    const response: CreateCampaignResponse = await this.wrapRoute(
      this.client.post(`/campaigns`, parsedData)
    );

    return response;
  };

  public getCampaign = async (data: GetCampaignOptions) => {
    const response: Campaign = await this.wrapRoute(
      this.client.get(`/campaigns/${data.id}`)
    );

    return response;
  };

  public getStatistics = async (data: GetCampaignStatisticsOptions) => {
    const response: CampaignStatistics = await this.wrapRoute(
      this.client.get(`/campaigns/${data.id}/statistics`)
    );

    return response;
  };

  public sendCampaign = async (data: CreateCampaignOptions) => {
    const parsedData = {
      ...data,
      content: this.processContent(data.content)
    };
    const response: boolean = await this.wrapRoute(
      this.client.post(`/campaigns/send`, parsedData)
    );

    return response;
  };

  public deleteCampaign = async (data: GetCampaignOptions) => {
    const response: boolean = await this.wrapRoute(
      this.client.delete(`/campaign/${data.id}`)
    );

    return response;
  };

  public scheduleCampaign = async (data: ScheduleCampaignOptions) => {
    const parsedData = {
      ...data,
      send_at:
        data.send_at instanceof Date
          ? data.send_at.toISOString().replace("T", " ")
          : data.send_at,
      content: this.processContent(data.content)
    };
    const response: SendCampaignResponse = await this.wrapRoute(
      this.client.post(`/campaigns/schedule`, parsedData)
    );

    return response;
  };

  public getPreferenceGroups = async (data: GroupOptions) => {
    const response: Group[] = await this.wrapRoute(
      this.client.get(`/preference-groups`, {
        params: data
      })
    );

    return response;
  };

  public getPreferencesBySubscriberAndGroups = async (data: GroupOptions) => {
    const response: Group[] = await this.wrapRoute(
      this.client.get(
        `/subscriber/${data.identifier}/preference_group/${data.preference_group_id}`,
        {
          params: {
            identified_by: data.identified_by
          }
        }
      )
    );

    return response;
  };

  public updatePreferences = async ({
    identifier,
    preference_group_id,
    identified_by,
    preferences
  }: UpdateGroupOptions) => {
    const response: Group[] = await this.wrapRoute(
      this.client.patch(
        `/subscriber/${identifier}/preference_group/${preference_group_id}`,
        {
          preferences
        },
        {
          params: {
            identified_by
          }
        }
      )
    );

    return response;
  };
}
