import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class HtmlInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        let request = context.switchToHttp().getRequest()
        return next
            .handle()
            .pipe(
                map((response) => {
                    console.log(response)
                    // response = snakeCase(response)
                    return response
                }
                )
            )
    }
}