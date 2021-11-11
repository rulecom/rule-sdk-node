import Http, { AxiosError, AxiosResponse } from "axios";
import config from "./config";
import { DeleteSubscriberTagOptions } from "./types/Subscribers";
import { GetSegmentsResponse, GetSegmentsOptions } from "./types/Segments";
import {
  CreateGroupOptions,
  GetGroupsResponse
} from "./types/SubscriberFields";
import { PaginationOptions } from "./types/Pagination";
import { GetGroupOptions, Group } from "./types/SubscriberFields";
import { DeleteTagOptions } from "./types/Tags";
import { DeleteSuppressionOptions } from "./types/Suppressions";
import {
  SendCampaignResponse,
  ScheduleCampaignOptions
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
  constructor({ apiKey }: SDKSettings) {
    if (!apiKey) {
      throw new Error(
        "Please specify a valid API Key when initializing the Rule SDK"
      );
    }

    this.init({ apiKey });
  }

  private init = ({ apiKey }: SDKSettings) => {
    Http.defaults.headers.common.Authorization = `Bearer ${apiKey}`;
    Http.defaults.baseURL = config.apiUrl;
  };

  private wrapRoute = async (
    routeRequest: Promise<AxiosResponse>
  ): Promise<boolean | any> => {
    try {
      const {
        data: { message, ...response }
      } = await routeRequest;

      if (!Object.keys(response).length) {
        return message === "Success";
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

  public createSubscribers = async (
    newSubscribers: CreateSubscriberOptions
  ) => {
    const response: CreateSubscriberResponse = await this.wrapRoute(
      Http.post("/subscribers", newSubscribers)
    );

    return response;
  };

  public getSubscriber = async (options: GetSubscribersOptions) => {
    const response: GetSubscriberResponse = await this.wrapRoute(
      Http.get("/subscribers", {
        params: options
      })
    );

    return response.subscriber;
  };

  public getSubscribers = async (options: GetSubscribersOptions) => {
    const response: GetSubscribersResponse = await this.wrapRoute(
      Http.get("/subscribers", {
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
      Http.get(`/subscriber/${sanitizedIdentifier}`, {
        params: {
          identified_by
        }
      })
    );

    return response.groups;
  };

  public updateSubscriber = async (updatedData: UpdateSubscriberOptions) => {
    const response: GetSubscriberResponse = await this.wrapRoute(
      Http.put(`/subscriber/${updatedData.id}`, updatedData.data)
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
      Http.delete(`/subscriber/${sanitizedIdentifier}`, {
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
      Http.post(
        `/subscriber/${sanitizedIdentifier}/tags`,
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
      Http.get(`/subscriber/${sanitizedIdentifier}/tags/clear`, {
        params: {
          identified_by
        }
      })
    );

    return response;
  };

  public clearSubscriberTags = async ({
    identifier,
    identified_by = "email"
  }: SubscriberSelector) => {
    const sanitizedIdentifier = encodeURIComponent(
      identifier.trim().toLowerCase()
    );
    const response: boolean = await this.wrapRoute(
      Http.delete(`/subscriber/${sanitizedIdentifier}/tags/clear`, {
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
      Http.delete(`/subscriber/${sanitizedIdentifier}/tags/${tag_identifier}`, {
        params: {
          identified_by
        }
      })
    );

    return response;
  };

  public createTransaction = async (transaction: CreateTransactionOptions) => {
    const response: CreateTransactionResponse = await this.wrapRoute(
      Http.post(`/transactionals`, transaction)
    );

    return response;
  };

  public getTemplates = async () => {
    const response: GetTemplatesResponse = await this.wrapRoute(
      Http.get(`/templates`)
    );

    return response;
  };

  public getTemplate = async ({ id }: GetTemplateOptions) => {
    const response: Template = await this.wrapRoute(
      Http.get(`/template/${id}`)
    );

    return response;
  };

  public getTags = async ({ limit = 100, page = 1 }: PaginationOptions) => {
    const response: GetTagsResponse = await this.wrapRoute(
      Http.get(`/tags`, {
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
    const response: GetTagsResponse = await this.wrapRoute(
      Http.get(`/tags/${identifier}`, {
        params: {
          identified_by,
          with_count
        }
      })
    );

    return response.tags;
  };

  public updateTag = async ({ identifier, data }: UpdateTagOptions) => {
    const response: GetTagsResponse = await this.wrapRoute(
      Http.put(`/tags/${identifier}`, data)
    );

    return response.tags;
  };

  public deleteTag = async ({ identifier }: DeleteTagOptions) => {
    const response: boolean = await this.wrapRoute(
      Http.delete(`/tags/${identifier}`)
    );

    return response;
  };

  public clearTag = async ({ identifier }: DeleteTagOptions) => {
    const response: boolean = await this.wrapRoute(
      Http.delete(`/tags/${identifier}/clear`)
    );

    return response;
  };

  public getSegments = async ({ limit = 20, page = 1 }: PaginationOptions) => {
    const response: GetSegmentsResponse = await this.wrapRoute(
      Http.get(`/segments`, {
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
      Http.post(`/customizations`, data)
    );

    return response;
  };

  public getGroupsWithFields = async (options: PaginationOptions) => {
    const response: GetGroupsResponse = await this.wrapRoute(
      Http.get(`/customizations`, { params: options })
    );

    return response;
  };

  public getGroupWithFields = async ({ identifier }: GetGroupOptions) => {
    const response: Group = await this.wrapRoute(
      Http.get(`/customizations/${identifier}`)
    );

    return response;
  };

  public createSuppression = async (data: CreateSuppressionOptions) => {
    const response: boolean = await this.wrapRoute(
      Http.post(`/suppressions`, data)
    );

    return response;
  };

  public getSuppressions = async (data: PaginationOptions) => {
    const response: GetSuppressionsResponse = await this.wrapRoute(
      Http.get(`/suppressions`, { params: data })
    );

    return response;
  };

  public deleteSuppressions = async ({
    identifier,
    identified_by = "email"
  }: DeleteSuppressionOptions) => {
    const response: boolean = await this.wrapRoute(
      Http.delete(`/suppressions/${identifier}`, { params: { identified_by } })
    );

    return response;
  };

  public getCampaigns = async (data: PaginationOptions) => {
    const response: GetCampaignsResponse = await this.wrapRoute(
      Http.get(`/campaigns`, { params: data })
    );

    return response;
  };

  public createCampaign = async (data: CreateCampaignOptions) => {
    const response: CreateCampaignResponse = await this.wrapRoute(
      Http.post(`/campaigns`, data)
    );

    return response;
  };

  public getCampaign = async (data: GetCampaignOptions) => {
    const response: Campaign = await this.wrapRoute(
      Http.get(`/campaign/${data.id}`)
    );

    return response;
  };

  public getStatistics = async (data: GetCampaignStatisticsOptions) => {
    const response: CampaignStatistics = await this.wrapRoute(
      Http.get(`/campaign/${data.id}/statistics`)
    );

    return response;
  };

  public sendCampaign = async (data: CreateCampaignOptions) => {
    const response: SendCampaignResponse = await this.wrapRoute(
      Http.post(`/campaign/send`, data)
    );

    return response;
  };

  public deleteCampaign = async (data: GetCampaignOptions) => {
    const response: boolean = await this.wrapRoute(
      Http.delete(`/campaign/${data.id}`)
    );

    return response;
  };

  public scheduleCampaign = async (data: ScheduleCampaignOptions) => {
    const response: SendCampaignResponse = await this.wrapRoute(
      Http.post(`/campaigns/schedule`, data)
    );

    return response;
  };

  public getPreferenceGroups = async (data: GroupOptions) => {
    const response: Group[] = await this.wrapRoute(
      Http.get(`/preference-groups`, {
        params: data
      })
    );

    return response;
  };

  public getPreferencesBySubscriberAndGroups = async (data: GroupOptions) => {
    const response: Group[] = await this.wrapRoute(
      Http.get(
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
      Http.patch(
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
