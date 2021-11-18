<a href="https://rule.io/">
    <img src="https://app.rule.io/img/logo-full.svg" alt="Rule logo" title="Rule" align="right" height="60" />
</a>

# Rule SDK for Node.js

Rule node API wrapper for the [Rule v2 API](https://apidoc.rule.se/). Supports promise handling.

## Contents

- [Rule SDK for Node.js](#rule-sdk-for-nodejs)
  - [Contents](#contents)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Initialization](#initialization)
    - [Subscribers](#subscribers)
      - [Create new subscriber](#create-new-subscriber)
      - [Get subscribers](#get-subscribers)
      - [Get subscriber](#get-subscriber)
      - [Get subscriber fields](#get-subscriber-fields)
      - [Update subscriber](#update-subscriber)
      - [Delete subscriber](#delete-subscriber)
    - [Subscriber Tags](#subscriber-tags)
      - [Create subscriber tag](#create-subscriber-tag)
      - [Get subscriber tags](#get-subscriber-tags)
      - [Clear subscriber tags](#clear-subscriber-tags)
      - [Delete subscriber tag](#delete-subscriber-tag)
    - [Transactions](#transactions)
      - [Create Transaction](#create-transaction)
    - [Templates](#templates)
      - [Get Templates](#get-templates)
      - [Get Template](#get-template)
    - [Tags](#tags)
      - [Get Tags](#get-tags)
      - [Get Tag](#get-tag)
      - [Update Tag](#update-tag)
      - [Delete Tag](#delete-tag)
      - [Clear Tag](#clear-tag)
    - [Segments](#segments)
      - [Get Segments](#get-segments)
    - [Subscriber Fields](#subscriber-fields)
      - [Create Subscriber Groups](#create-subscriber-groups)
      - [Get Subscriber Groups](#get-subscriber-groups)
      - [Get Subscriber Group](#get-subscriber-group)
    - [Suppressions](#suppressions)
      - [Create Suppression](#create-suppression)
      - [Get Suppressions](#get-suppressions)
      - [Delete Suppressions](#delete-suppressions)
    - [Campaigns](#campaigns)
      - [Get Campaigns](#get-campaigns)
      - [Create Campaign](#create-campaign)
      - [Get Campaign](#get-campaign)
      - [Get Campaign Statistics](#get-campaign-statistics)
      - [Send Campaign](#send-campaign)
      - [Delete Campaign](#delete-campaign)
      - [Schedule Campaign](#schedule-campaign)
    - [Preferences](#preferences)
      - [Get Preference Groups](#get-preference-groups)
      - [Get Preferences By Subscriber And Group ID](#get-preferences-by-subscriber-and-group-id)
      - [Update Preferences](#update-preferences)
  - [License](#license)

## Installation

```bash
# via npm
npm install rule-sdk-node

# via yarn
yarn add rule-sdk-node
```

## Usage

More in-depth information regarding all routes and fields can be found in the [Rule API Documentation](https://apidoc.rule.se/).

---

### Initialization

To be able to send requests using the Rule API you must initialize the SDK with a valid Rule API key generated from the [Rule developer tab](https://app.rule.io/#/settings/developer).

```typescript
const rule = new RuleSDK({ apiKey: “…” });
```

---

### Subscribers

#### Create new subscribers

Creates new subscribers, you can also not specify the `type` field in the `fields` array if you're unsure of the field's value type and the SDK will attempt to automatically identify it

```typescript
const subscriber = await rule.createSubscribers({
  update_on_duplicate?: boolean;
  automation?: false | "reset" | "force";
  sync_subscribers?: boolean; // If omitted, automations are sent if there are less than 20 subscribers in the request.
  fields_clear?: boolean;
  tags: string[], // Can consist of both names and/or ID’s of already existing tags (N.B. this means that tags consisting only of integers will be interpreted as IDs and not as text). If a tag does not exist it will be created.
  subscribers: [{
    language?: string; // (Optional) Needs to be ISO 639-1 formatted. If no language is passed the subscriber will default to the account language.
    fields: [{
      key: string;
      type?: "text" || "date" || "datetime" || "multiple" || "json";
      value: string;
    }]
  }]
});
```

#### Get subscribers

```typescript
const subscribers = await rule.getSubscribers({
  limit: number // Optional, max value is 100
});
```

#### Get subscriber

```typescript
const subscriber = await rule.getSubscriber({
  limit: number // Optional, max value is 100
});
```

#### Get subscriber fields

```typescript
const subscriber = await rule.getSubscriberFields({
  identifier: string;
  identified_by?: "email" | "phone_number" | "id";
})
```

#### Update subscriber

```typescript
const subscriber = await rule.updateSubscriber({
  id: number;
  data?: { // All fields are optional, so only the ones you specify below will be updated
    language?: string;
    fields?: [{
      key: string;
      type?: "text" | "date" | "datetime" | "multiple" | "json";
      value: string;
    }]
  };
})
```

#### Delete subscriber

```typescript
const deleted = await rule.deleteSubscriber({
  identifier: string;
  identified_by?: "email" | "phone_number" | "id";
})
```

---

### Subscriber Tags

#### Create subscriber tag

```typescript
const tag = await rule.createSubscriberTag({
  identifier: string;
  identified_by?: "email" | "phone_number" | "id";
  tags: string[]
})
```

#### Get subscriber tags

```typescript
const tags = await rule.getSubscriberTags({
  identifier: string;
  identified_by?: "email" | "phone_number" | "id";
})
```

#### Clear subscriber tags

```typescript
const tags = await rule.clearSubscriberTags({
  identifier: string;
  identified_by?: "email" | "phone_number" | "id";
})
```

#### Delete subscriber tag

```typescript
const tags = await rule.deleteSubscriberTag({
  identifier: string;
  identified_by?: "email" | "phone_number" | "id";
  tag_identifier: string
})
```

---

### Transactions

#### Create Transaction

There are three types of transaction content types, Block content type, HTML Content type and Plain-text Content Type

- **Block Content type (Array)**

  _Only supported for `transaction_type: email`_

  All items specified in the `content` array are rendered vertically, and each block can contain multiple elements in the `block_content` array which is rendered horizontally

  Example:

  ```typescript
  interface EmailBlockContent = {
    block_id: string;
    block_content: [
      {
        title: string;
        body: string;
        image?: string;
        url?: string;
      }
    ];
  }
  ```

- **HTML Content type**

  _Only supported for `transaction_type: email`_

  You can also specify custom HTML for the content you'd like to display in your email in case you'd like to implement designs that aren't possible with the Block Content Type

  Example:

  ```typescript
  interface EmailHTMLContent {
    html: string;
    plain: string; // In case the device viewing this email can't render the HTML properly, it will fallback to the plain text version of the email
  }
  ```

- **Text message Content type**

  Write down the message in plain-text format. You must specify this content type when you're sending a transaction message via `transaction_type: "text_message"`.

Here's an example of how you can specify those content types

```typescript
const tags = await rule.createTransaction({
  transaction_type: "email" | "text_message";
  transaction_name: string;
  subject: string;
  from: { name: string; email?: string };
  to: { name?: string; email: string } | { phone_number: string };
  content: EmailBlockContent[] | EmailHTMLContent | string;
})
```

---

### Templates

#### Get Templates

```typescript
const templates = await rule.getTemplates();
```

#### Get Template

```typescript
const template = await rule.getTemplate({
  id: number
});
```

---

### Tags

#### Get Tags

```typescript
const tags = await rule.getTags({
  limit?: number;
  page?: number;
});
```

#### Get Tag

```typescript
const tag = await rule.getTag({
  identifier: string | number;
  identified_by?: "name" | "id";
  with_count?: boolean;
});
```

#### Update Tag

```typescript
const tag = await rule.updateTag({
  identifier: string | number;
  data: {
    name?: string;
    description?: string;
  };
});
```

#### Delete Tag

```typescript
const tag = await rule.updateTag({
  identifier: string | number;
});
```

#### Clear Tag

```typescript
const tag = await rule.updateTag({
  identifier: string | number;
});
```

---

### Segments

#### Get Segments

```typescript
const segments = await rule.getSegments({
  limit?: number;
  page?: number;
});
```

---

### Subscriber Fields

#### Create Subscriber Groups

```typescript
const groupsCreated = await rule.createGroupsAndFields({
  fields: [{
    key: string;
    type?: "text" | "date" | "datetime" | "multiple" | "json";
  }];
});
```

#### Get Subscriber Groups

```typescript
const groups = await rule.getGroupsWithFields({
  limit?: number;
  page?: number;
});
```

#### Get Subscriber Group

```typescript
const group = await rule.getGroupWithFields({
  identifier: number | string;
});
```

---

### Suppressions

#### Create Suppression

```typescript
const created = await rule.createSuppression({
  subscribers: [
    {
      "email": string;
    },
    {
      "phone_number": string;
    },
    {
      "id": number;
    }
  ];
  suppress_on?: {
    campaign?: ["text_message" | "email"];
    transaction?: ["text_message" | "email"];
  };
});
```

#### Get Suppressions

```typescript
const suppressions = await rule.getSuppressions({
  limit?: number;
  page?: number;
});
```

#### Delete Suppressions

```typescript
const deleted = await rule.deleteSuppressions({
  identifier: string | number;
  identified_by?: "email" | "phone_number" | "id";
});
```

---

### Campaigns

#### Get Campaigns

```typescript
const campaigns = await rule.getCampaigns({
  limit?: number;
  page?: number;
});
```

#### Create Campaign

```typescript
const campaign = await rule.createCampaign({
  message_type: "email" | "text_message";
  language: string;
  subject: string;
  recipients: {
    tags?: [{
      identifier: string;
    }];
    segments?: [{
      identifier: string;
      negative: boolean;
    }];
  };
  from: {
    name: string;
    email?: string;
    phone_number?: string;
  };
  email_template_id?: number;
  content: [{
    block_id: string;
    block_content: [
      {
        title: string;
        body: string;
        image?: string;
        url?: string;
      }
    ];
  }] | {
    plain: string;
    html: string;
  } | string;
});
```

#### Get Campaign

```typescript
const campaign = await rule.getCampaign({
  id: number;
});
```

#### Get Campaign Statistics

```typescript
const statistics = await rule.getStatistics({
  id: number;
});
```

#### Send Campaign

```typescript
const statistics = await rule.sendCampaign({
  message_type: "email" | "text_message";
  language: string;
  subject: string;
  recipients: {
    tags?: [{
      identifier: string;
    }];
    segments?: [{
      identifier: string;
      negative: boolean;
    }];
  };
  from: {
    name: string;
    email?: string;
    phone_number?: string;
  };
  email_template_id?: number;
  content: [{
    block_id: string;
    block_content: [
      {
        title: string;
        body: string;
        image?: string;
        url?: string;
      }
    ];
  }] | {
    plain: string;
    html: string;
  } | string;
});
```

#### Delete Campaign

```typescript
const deleted = await rule.deleteCampaign({
  id: number;
});
```

#### Schedule Campaign

```typescript
const statistics = await rule.scheduleCampaign({
  message_type: "email" | "text_message";
  language: string;
  subject: string;
  recipients: {
    tags?: [{
      identifier: string;
    }];
    segments?: [{
      identifier: string;
      negative: boolean;
    }];
  };
  from: {
    name: string;
    email?: string;
    phone_number?: string;
  };
  email_template_id?: number;
  send_at: string;
  content: [{
    block_id: string;
    block_content: [
      {
        title: string;
        body: string;
        image?: string;
        url?: string;
      }
    ];
  }] | {
    plain: string;
    html: string;
  } | string;
});
```

---

### Preferences

#### Get Preference Groups

```typescript
const preferenceGroups = await rule.getPreferenceGroups({
  preference_group_id: number;
  identifier: string | number;
  identified_by?: "phone_number" | "id" | "email";
});
```

#### Get Preferences By Subscriber And Group ID

```typescript
const preferenceGroups = await rule.getPreferencesBySubscriberAndGroups({
  preference_group_id: number;
  identifier: string | number;
  identified_by?: "phone_number" | "id" | "email";
});
```

#### Update Preferences

```typescript
const preferenceGroups = await rule.getPreferencesBySubscriberAndGroups({
  preference_group_id: number;
  identifier: string | number;
  identified_by?: "phone_number" | "id" | "email";
  preferences: [{
    preference_id: number;
    is_opted_in: boolean;
  }]
});
```

## License

[MIT](/LICENSE)
