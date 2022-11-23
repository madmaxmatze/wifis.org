import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../data/user/user.repo';
import { ConfigService, ConfigKey } from '../../config/config.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(
        configService: ConfigService,
        private readonly userRepo: UserRepo
    ) {
        super({
            // app see: https://developers.facebook.com/apps/194803573923224/fb-login/settings/
            clientID: configService.getValue(ConfigKey.OAUTH_FACEBOOK_CLIENT_ID),
            clientSecret: configService.getValue(ConfigKey.OAUTH_FACEBOOK_CLIENT_SECRET),
            callbackURL: "/p/login/facebook/redirect",
            profileFields: ['id', 'displayName', 'email'],
            enableProof: true,
            passReqToCallback: true,
        });

        this.userRepo = userRepo;
    }

    async validate(_accessToken: string, _refreshToken: string, _UNKNOWNOBJECT: any, profile: any, done: any): Promise<any> {
        var user = {
            "id": profile.provider + profile.id,
            "provider": profile.provider,
            "providerId": profile.id,
            "email": profile._json.email,
            "name": profile.displayName,
            "lastLoginDate": new Date(),
            "signupDate": new Date(),
        };

        await this.userRepo.upsert(user);

        return done(null, user);
    }
}