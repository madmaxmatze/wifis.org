import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext) {
        const request : any = context.switchToHttp().getRequest();

        return (request.session.user && request.session.user.id);
        // return request.isAuthenticated();
    }
}