import { EmailBlockContent, EmailHTMLContent } from "./Transactions";

export interface Template {
  id: number;
  name: string;
  blocks?: string[];
  content?: EmailBlockContent[] | EmailHTMLContent | string;
}

export interface GetTemplatesResponse {
  templates: Template[];
}

export interface GetTemplateOptions {
  id: number;
}
