import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-local';
import { User } from "../../data/user/user.model";
import { UserRepo } from '../../data/user/user.repo';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userRepo: UserRepo
    ) {
        super();
    }

    async validate(username: string, password: string): Promise<User> {
        if (username == "dummy_username" && password == "dummy_password" && this.configService.isDevEnv()) {
            var user : User = <User>{
                id: "local",
                name: username,
                email: 'madmaxmatze+localTestUser@gmail.com',
                provider: 'local',
                maxWifis: 5 
            };
            
            return await this.userRepo.upsert(user);
        } else {
            throw new UnauthorizedException("Dummy login is only available in Dev");
        }
    }
}