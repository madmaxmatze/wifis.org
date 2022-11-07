import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-local';
import { User } from "../../data/user.model";
import { ConfigService } from '../../config/config.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    private configService: ConfigService = null;

    constructor(configService: ConfigService) {
        super();
        this.configService = configService;
    }

    async validate(username: string, password: string): Promise<any> {
        if (username == "dummy_username" && password == "dummy_password" && !this.configService.isProdEnv()) {
            return <User>{
                id: "local",
                displayName: username,
                email: 'dummy@example.com',
                provider: 'local'
            };
        } else {
            throw new UnauthorizedException("Dummy login is only available in Dev");
        }
    }
}