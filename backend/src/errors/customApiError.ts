export class CustomApiError extends Error {
    constructor(message: string | undefined){
        super(message)
        this.name = 'CustomApiError';
    }
}