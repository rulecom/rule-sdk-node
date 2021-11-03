export interface EmailHTMLContent {
  plain: string;
  html: string;
}

export interface EmailBlockContent {
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

export interface CreateTransactionOptions {
  transaction_type: "email" | "text_message";
  transaction_name: string;
  subject: string;
  from: { name: string; email?: string };
  to: { name?: string; email: string } | { phone_number: string };
  content: EmailBlockContent[] | EmailHTMLContent | string;
}

export interface CreateTransactionResponse {
  transaction_id: number;
}
