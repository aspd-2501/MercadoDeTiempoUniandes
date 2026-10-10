/* eslint-disable prettier/prettier */
/* archivo: src/shared/errors/business-errors.ts */
import { HttpException, HttpStatus } from '@nestjs/common';

export enum BusinessError {
    NOT_FOUND,
    PRECONDITION_FAILED,
    BAD_REQUEST,
}

export class BusinessLogicException extends HttpException {
    type: BusinessError;

    constructor(message: string, type: BusinessError) {
        let status: HttpStatus;
        switch (type) {
            case BusinessError.NOT_FOUND:
                status = HttpStatus.NOT_FOUND;
                break;
            case BusinessError.PRECONDITION_FAILED:
                status = HttpStatus.PRECONDITION_FAILED;
                break;
            case BusinessError.BAD_REQUEST:
                status = HttpStatus.BAD_REQUEST;
                break;
            default:
                status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        super(message, status);
        this.type = type;
    }
}