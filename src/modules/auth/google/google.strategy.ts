import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { User } from '../../data/user/user.model';
import { UserRepo } from '../../data/user/user.repo';
import { ConfigService, ConfigKey } from '../../config/config.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        configService: ConfigService,
        private readonly userRepo: UserRepo
    ) {
        super({
            clientID: configService.getValue(ConfigKey.OAUTH_GOOGLE_CLIENT_ID),
            clientSecret: configService.getValue(ConfigKey.OAUTH_GOOGLE_CLIENT_SECRET),
            callbackURL: "https://" + configService.getDomain() + "/p/login/google/redirect",
            scope: ['email'],
            proxy: true,
            passReqToCallback: true
        });

        this.userRepo = userRepo;
    }

    async validate(_accessToken: string, _refreshToken: string, _UNKNOWNONJECT: any, profile: any, done: VerifyCallback): Promise<any> {
        var user: User = {
            "id": profile.provider + profile.id,
            "provider": profile.provider,
            "providerId": profile.id,
            "email": profile._json.email,
            "displayName": profile.displayName,
            "lastLoginDate": new Date(),
            "signupDate": new Date()
        };

        await this.userRepo.upsert(user);

        return done(null, user);
    }
}