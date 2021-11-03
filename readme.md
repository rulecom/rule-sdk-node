## Subscribers

### Create new subscriber

---

## **Attributes**

> For more in-depth info regarding each field's functionality for this section, refer to this section of the [Rule API Documentation](https://apidoc.rule.se/#header-attributes)

```typescript
const subscriber = await SDK.createSubscribers({
  update_on_duplicate?: boolean;
  automation?: false | "reset" | "force";
  sync_subscribers?: boolean; // If omitted, automations are sent if there are less than 20 subscribers in the request.
  fields_clear?: boolean;
  tags: string[], // can consist of both names and/or ID’s of already existing tags (N.B. this means that tags consisting only of integers will be interpreted as IDs and not as text). If a tag does not exist it will be created.
  subscribers: [{
    language?: string; // (optional) Needs to be ISO 639-1 formatted. If no language is passed the subscriber will default to the account language.
    fields: [{
      key: string;
      type?: "text" || "date" || "datetime" || "multiple" || "json";
      value: string;
    }]
  }]
});
```

### Get subscribers

---

```typescript
const subscribers = await SDK.getSubscribers({
  limit: number // Optional, max value is 100
});
```

### Get subscriber

---

```typescript
const subscriber = await SDK.getSubscriber({
  limit: number // Optional, max value is 100
});
```

### Get subscriber fields

---

```typescript
const subscriber = await SDK.getSubscriberFields({
  identifier: string;
  identified_by?: "email" | "phone_number" | "id";
})
```

### Update subscriber

---

```typescript
const subscriber = await SDK.updateSubscriber({
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

### Delete subscriber

---

```typescript
const deleted = await SDK.deleteSubscriber({
  identifier: string;
  identified_by?: "email" | "phone_number" | "id";
})
```

## Subscriber Tags

### Create subscriber tag

---

```typescript
const tag = await SDK.createSubscriberTag({
  identifier: string;
  identified_by?: "email" | "phone_number" | "id";
  tags: string[]
})
```

### Get subscriber tags

---

```typescript
const tags = await SDK.getSubscriberTags({
  identifier: string;
  identified_by?: "email" | "phone_number" | "id";
})
```

### Clear subscriber tags

---

```typescript
const tags = await SDK.clearSubscriberTags({
  identifier: string;
  identified_by?: "email" | "phone_number" | "id";
})
```

### Delete subscriber tag

---

```typescript
const tags = await SDK.deleteSubscriberTag({
  identifier: string;
  identified_by?: "email" | "phone_number" | "id";
  tag_identifier: string
})
```

## Transactions

### Create Transaction

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
const tags = await SDK.createTransaction({
  transaction_type: "email" | "text_message";
  transaction_name: string;
  subject: string;
  from: { name: string; email?: string };
  to: { name?: string; email: string } | { phone_number: string };
  content: EmailBlockContent[] | EmailHTMLContent | string;
})
```
