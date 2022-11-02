import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-local';
import { User } from "../../data/user.model";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    async validate(username: string, password: string): Promise<any> {
        if (username == "dummy_username" && password == "dummy_password" && process.env.NODE_ENV == "development") {
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