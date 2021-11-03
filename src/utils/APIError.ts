type ErrorFields = Record<string, string>;

class APIError extends Error {
  errorCode?: string;
  fields?: ErrorFields;

  constructor(message?: string, code?: string, fields?: ErrorFields) {
    super(message);
    this.errorCode = code;
    this.fields = fields;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
