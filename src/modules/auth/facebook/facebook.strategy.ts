import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import { User } from '../../data/user/user.model';
import { UserRepo } from '../../data/user/user.repo';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(
        configService: ConfigService,
        private readonly userRepo: UserRepo
    ) {
        super({
            // app see: https://developers.facebook.com/apps/194803573923224/fb-login/settings/
            clientID: configService.getValue(ConfigService.KEYS.OAUTH_FACEBOOK_CLIENT_ID),
            clientSecret: configService.getValue(ConfigService.KEYS.OAUTH_FACEBOOK_CLIENT_SECRET),
            callbackURL: "__SET_IN_AUTH_GUARD_AT_REQUEST_SCOPE__",
            profileFields: ['email'],
            scope: ['email'],
            enableProof: true,
            passReqToCallback: true,
        });

        this.userRepo = userRepo;
    }

    async validate(request: Request, _refreshToken: string, _UNKNOWNOBJECT: any, profile: any, done: any): Promise<any> {
        var user : User = {
            "id": profile.provider + profile.id,
            "provider": profile.provider,
            "providerId": profile.id,
            "email": profile._json.email,
            "name": profile.displayName,
            "lastLoginDate": new Date(),
            "signupDate": new Date(),
        };

        if (request.headers["cf-ipcountry"]) {
            user.country = request.headers["cf-ipcountry"];
            user.city = request.headers["cf-ipcity"] || null;
        }

        console.log ("profile", profile);
        console.log ("user", user);

        user = await this.userRepo.upsert(user);

        return done(null, user);
    }
}