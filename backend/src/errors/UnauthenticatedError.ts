import { CustomApiError } from './customApiError';

export class UnauthenticatedError extends CustomApiError{
    statusCode: number;
    constructor(message : string | undefined){
        super(message)
        this.statusCode = 403
    }
}