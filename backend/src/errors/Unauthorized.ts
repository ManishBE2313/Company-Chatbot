import { CustomApiError } from './customApiError';

export class UnauthorizedError extends CustomApiError{
    statusCode: number;
    constructor(message : string | undefined){
        super(message)
        this.statusCode = 401
    }
}