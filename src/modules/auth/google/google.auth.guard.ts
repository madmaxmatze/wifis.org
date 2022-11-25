import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from '../../config/config.service';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    constructor(
        private readonly configService: ConfigService,
    ) {
        super()
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
        return { "callbackURL": `https://${this.configService.getHostname()}/p/login/google/redirect`};
    }
}