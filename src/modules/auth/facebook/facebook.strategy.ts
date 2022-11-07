import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import { User } from '../../data/user.model';
import { UserService } from '../../data/user.service';
import { ConfigService, ConfigKey } from '../../config/config.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    private userService = null;

    constructor(configService: ConfigService, userService: UserService) {
        super({
            // app see: https://developers.facebook.com/apps/194803573923224/fb-login/settings/
            clientID: configService.getValue(ConfigKey.OAUTH_FACEBOOK_CLIENT_ID),
            clientSecret: configService.getValue(ConfigKey.OAUTH_FACEBOOK_CLIENT_SECRET),
            callbackURL: "https://" + configService.getDomain() + "/p/login/facebook/redirect",
            profileFields: ['id', 'displayName', 'email'],
            enableProof: true,
            passReqToCallback: true,
        });

        this.userService = userService;
    }

    async validate(_accessToken: string, _refreshToken: string, _UNKNOWNOBJECT: any, profile: any, done: any): Promise<any> {
        var user = {
            "id": profile.provider + profile.id,
            "provider": profile.provider,
            "providerId": profile.id,
            "email": profile._json.email,
            "displayName": profile.displayName,
            "lastLoginDate": new Date(),
            "signupDate": new Date(),
        };

        await this.userService.upsert(user);

        return done(null, user);
    }
}