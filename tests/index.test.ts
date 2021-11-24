import Faker from "faker";
import RuleSDK from "../src";
import { SubscriberFields } from "../src/types/Subscribers";

const testEmail = Faker.internet.email("RuleTest", "SDK").toLowerCase();
const testPhoneNumber = `+${Faker.phone.phoneNumberFormat(2)}`;
let subscriberId: string | undefined;

if (!process.env.TEST_API_KEY) {
  throw new Error(
    "Please specify a TEST_API_KEY in the project's .env file before running the tests"
  );
}

const groupName = "Test";

const fields: Record<string, Partial<SubscriberFields>> = {
  SubscriberId: {
    type: "text",
    value: "1"
  },
  Created: {
    type: "datetime",
    value: new Date()
  },
  FavoriteFood: {
    type: "multiple",
    value: ["Ice Cream", "Sandwiches"]
  }
};

const Rule = new RuleSDK({
  apiKey: process.env.TEST_API_KEY ?? ""
});

beforeAll(async () => {
  try {
    await Promise.all([
      Rule.deleteSubscriber({
        identifier: testEmail,
        identified_by: "email"
      }),
      Rule.deleteSubscriber({
        identifier: testPhoneNumber,
        identified_by: "phone_number"
      })
    ]);
  } catch (err) {}
});

describe("Subscriber Fields", () => {
  it("creates a new group", async () => {
    try {
      const response = await Rule.createGroupsAndFields({
        fields: Object.entries(fields).map(([key, item]) => ({
          key: `${groupName}.${key}`,
          type: item.type
        }))
      });

      expect(response).toBe(true);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it("gets all groups", async () => {
    const limit = 10;
    const response = await Rule.getGroupsWithFields({
      limit
    });

    expect(response.groups.length).toBeGreaterThanOrEqual(1);
    expect(response.groups.length).toBeLessThanOrEqual(limit);
  });

  it("gets group by name", async () => {
    const group = await Rule.getGroupWithFields({
      identifier: groupName
    });

    expect(group).toBeDefined();
    expect(typeof group.id).toBe("number");
    expect(group.name).toBe(groupName);
  });
});

describe("Subscribers", () => {
  it("creates a subscriber", async () => {
    const response = await Rule.createSubscribers({
      subscribers: {
        email: testEmail,
        fields: [
          {
            key: "Test.SubscriberId",
            value: "1"
          },
          {
            key: "Test.Created",
            value: new Date()
          },
          {
            key: "Test.FavoriteFood",
            value: ["Ice Cream", "Sandwiches"]
          }
        ],
        language: "en"
      },
      tags: ["Test"]
    });

    subscriberId = response.subscriber?.id;

    expect(typeof response.subscriber?.id).toBe("number");
    expect(response.subscriber?.email).toBe(testEmail);
  });
  it("gets the subscriber", async () => {
    const response = await Rule.getSubscriber({
      identifier: testEmail,
      identified_by: "email"
    });

    expect(typeof response.id).toBe("number");
    expect(response.email).toBe(testEmail);
  });
  it("gets all subscribers", async () => {
    const limit = 10;
    const response = await Rule.getSubscribers({
      limit
    });

    expect(response.length).toBeLessThanOrEqual(limit);
    if (response[0]) {
      expect(typeof response[0].id).toBe("number");
      expect(typeof response[0].email).toBe("string");
    }
  });
  it("gets subscriber fields", async () => {
    const groups = await Rule.getSubscriberFields({
      identifier: testEmail,
      identified_by: "email"
    });

    const testGroup = groups.find(group => group.name === "Test");
    expect(testGroup).not.toBeUndefined();

    if (testGroup) {
      const matchingFields = testGroup.fields.every(
        field => !fields[field.key] || fields[field.key].type === field.type
      );
      expect(matchingFields).toBe(true);
    }
  });
  it("updates subscriber", async () => {
    if (!subscriberId) {
      throw new Error("Subscriber was not created");
    }
    const subscriber = await Rule.updateSubscriber({
      id: subscriberId,
      data: {
        language: "sv"
      }
    });

    expect(subscriber.language).toBe("sv");
  });
});

describe("Subscriber Tags", () => {
  it("adds tag", async () => {
    const tagsCreated = await Rule.createSubscriberTag({
      identifier: testEmail,
      identified_by: "email",
      tags: ["AddTagTest", "DeleteTagTest", "CampaignTagTest"]
    });

    expect(tagsCreated).toBe(true);
  });
  it("deletes tag", async () => {
    const deleted = await Rule.deleteSubscriberTag({
      identifier: testEmail,
      identified_by: "email",
      tag_identifier: "DeleteTagTest"
    });

    expect(deleted).toBe(true);
  });
  it("lists tags", async () => {
    const tags = await Rule.getSubscriberTags({
      identifier: testEmail,
      identified_by: "email"
    });

    expect(Array.isArray(tags)).toBe(true);
  });
  it("clears tags", async () => {
    const cleared = await Rule.clearSubscriberTags({
      identifier: testEmail,
      identified_by: "email"
    });

    expect(cleared).toBe(true);
  });
});

describe("Tags", () => {
  it("lists all tags", async () => {
    const limit = 10;
    const tags = await Rule.getTags({
      limit
    });

    expect(tags.length).toBeLessThanOrEqual(limit);
  });
  it("gets a tag", async () => {
    const tagName = "AddTagTest";
    const tag = await Rule.getTag({
      identifier: tagName,
      identified_by: "name",
      with_count: true
    });

    expect(typeof tag.id).toBe("number");
    expect(tag.name).toBe(tagName);
  });
  it("updates a tag", async () => {
    const tagDescription = "tag description test";
    const tag = await Rule.updateTag({
      identifier: "AddTagTest",
      data: {
        description: tagDescription
      }
    });

    expect(tag.description).toBe(tagDescription);
  });
  it("clears tag subscribers", async () => {
    const deleted = await Rule.clearTag({
      identifier: "AddTagTest"
    });

    expect(deleted).toBe(true);
  });
  it("deletes a tag", async () => {
    const deleted = await Rule.deleteTag({
      identifier: "AddTagTest"
    });

    expect(deleted).toBe(true);
  });
});

describe("Transactions", () => {
  it("creates a transaction", async () => {
    const transaction = await Rule.createTransaction({
      from: {
        name: "Test",
        email: Faker.internet.email("RuleTest", "SDK")
      },
      to: {
        email: testEmail,
        phone_number: testPhoneNumber
      },
      transaction_type: "email",
      transaction_name: "Test transaction",
      subject: "Rule SDK Test",
      content: {
        html: "<h1>Hello there!</h1>",
        plain: "Hello there!"
      }
    });

    expect(typeof transaction.transaction_id).toBe("number");
  });
});

describe("Templates", () => {
  it("Get templates", async () => {
    const templates = await Rule.getTemplates();

    expect(typeof templates.length).toBe("number");
  });
});

describe("Segments", () => {
  it("Get segments", async () => {
    const limit = 10;
    const segments = await Rule.getSegments({
      limit
    });

    expect(segments.length).toBeLessThanOrEqual(limit);
  });
});

describe("Suppressions", () => {
  it("adds Suppression", async () => {
    const suppression = await Rule.createSuppression({
      subscribers: [
        {
          email: testEmail
        }
      ],
      suppress_on: {
        campaign: ["email"]
      }
    });

    expect(suppression).toBe(true);
  });
  it("gets suppressions", async () => {
    const limit = 10;
    const response = await Rule.getSuppressions({
      limit
    });

    expect(response.suppressions.length).toBeLessThanOrEqual(limit);
  });
  it("deletes suppressions", async () => {
    const deleted = await Rule.deleteSuppressions({
      identifier: testEmail,
      identified_by: "email"
    });

    expect(deleted).toBe(true);
  });
});

describe("Campaigns", () => {
  let campaignId: number;
  it("gets campaigns", async () => {
    const limit = 10;
    const response = await Rule.getCampaigns({
      limit
    });

    expect(response.campaigns.length).toBeLessThanOrEqual(limit);
  });
  it("creates a campaign", async () => {
    const campaign = await Rule.createCampaign({
      from: {
        name: "Test",
        email: Faker.internet.email("RuleTest", "SDK")
      },
      recipients: {
        tags: [{ identifier: "CampaignTagTest" }]
      },
      message_type: "email",
      language: "sv",
      subject: "Rule SDK Test",
      content: {
        html: "<h1>Hello there!</h1>",
        plain: "Hello there!"
      }
    });

    expect(campaign).toBeDefined();
    expect(typeof campaign.id).toBe("number");
    campaignId = campaign.id;
    expect(campaign.status).toBe("draft");
  });
  it("gets campaign by ID", async () => {
    if (!campaignId) {
      throw new Error("Campaign ID is not yet available");
    }

    const campaign = await Rule.getCampaign({
      id: campaignId
    });

    expect(campaign).toBeDefined();
    expect(typeof campaign.id).toBe("number");
    expect(campaign.status).toBe("draft");
  });
  it("gets campaign statistics by ID", async () => {
    if (!campaignId) {
      throw new Error("Campaign ID is not yet available");
    }

    const campaign = await Rule.getStatistics({
      id: campaignId
    });

    expect(campaign).toBeDefined();
    expect(campaign.sent).toBe(0);
  });
  it("sends a campaign", async () => {
    const campaign = await Rule.sendCampaign({
      from: {
        name: "Test",
        email: Faker.internet.email("RuleTest", "SDK")
      },
      recipients: {
        tags: [{ identifier: "CampaignTagTest" }]
      },
      message_type: "email",
      language: "sv",
      subject: "Rule SDK Test",
      content: {
        html: "<h1>Hello there!</h1>",
        plain: "Hello there!"
      }
    });

    expect(campaign).toBe(true);
  });
  it("deletes a campaign", async () => {
    if (!campaignId) {
      throw new Error("Campaign ID is not yet available");
    }

    const campaign = await Rule.deleteCampaign({
      id: campaignId
    });

    expect(campaign).toBe(true);
  });
  it("schedules a campaign", async () => {
    const now = Date.now();
    const campaign = await Rule.scheduleCampaign({
      from: {
        name: "Test",
        email: Faker.internet.email("RuleTest", "SDK")
      },
      send_at: new Date(now + 1000 * 60), // 1 minute from now
      recipients: {
        tags: [{ identifier: "CampaignTagTest" }]
      },
      message_type: "email",
      language: "sv",
      subject: "Rule SDK Test",
      content: {
        html: "<h1>Hello there!</h1>",
        plain: "Hello there!"
      }
    });

    expect(campaign).toBeDefined();
    expect(typeof campaign.campaign_id).toBe("number");
  });
});

describe("Destructive Actions", () => {
  it("deletes subscriber", async () => {
    const deleted = await Rule.deleteSubscriber({
      identifier: testEmail,
      identified_by: "email"
    });
    expect(deleted).toBe(true);
  });
});
