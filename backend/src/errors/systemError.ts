import {CustomApiError} from "./customApiError";

export class SystemError extends CustomApiError {
    statusCode: number;
    constructor(message: string | undefined) {
      super(message);
      this.statusCode = 500;
    }
  }