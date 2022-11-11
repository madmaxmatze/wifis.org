import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-local';
import { User } from "../../data/user/user.model";
import { ConfigService } from '../../config/config.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService
    ) {
        super();
    }

    async validate(username: string, password: string): Promise<any> {
        if (username == "dummy_username" && password == "dummy_password" && !this.configService.isProdEnv()) {
            return <User>{
                id: "local",
                displayName: username,
                email: 'dummy@example.com',
                provider: 'local',
                maxWifis: 5, 
            };
        } else {
            throw new UnauthorizedException("Dummy login is only available in Dev");
        }
    }
}