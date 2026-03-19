import {CustomApiError} from "./customApiError";

export class BadRequestError extends CustomApiError {
    statusCode: number;
    constructor(message: string | undefined) {
      super(message);
      this.statusCode = 400;
    }
  }