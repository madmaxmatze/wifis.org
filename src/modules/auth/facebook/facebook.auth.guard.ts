import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from '../../config/config.service';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
    constructor(
        private readonly configService: ConfigService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        const result = (await super.canActivate(context)) as boolean;
        const request = context.switchToHttp().getRequest();
        await super.logIn(request);
        return result;
    }

    /**
     * Extend basic options with request scope specific option
     */
    getAuthenticateOptions(_context: ExecutionContext) {
        return {
            profileFields: ['email'],
            scope: ['email'],
            "callbackURL": `https://${this.configService.getHostname()}/auth/login/facebook/redirect`
        };
    }
}