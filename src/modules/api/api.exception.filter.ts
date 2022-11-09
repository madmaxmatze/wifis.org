import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        console.log("ApiExceptionFilter: ", exception);

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        var responseJson: any = {
            "status": exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.OK,
            "success": false,
            "error": (exception.hasOwnProperty('message') ? exception.message : "unknown")
        };

        if (process.env.NODE_ENV == "development" && exception.hasOwnProperty('stack')) {
            responseJson.stack = exception.stack;
        }

        response
            .status(responseJson.status)
            .json(responseJson);
    }
}