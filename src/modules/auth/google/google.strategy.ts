import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { User } from '../../data/user/user.model';
import { UserRepo } from '../../data/user/user.repo';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    static setting: any;

    constructor(
        configService: ConfigService,
        private readonly userRepo: UserRepo
    ) {
        super(GoogleStrategy.setting = {
            clientID: configService.getValue(ConfigService.KEYS.OAUTH_GOOGLE_CLIENT_ID),
            clientSecret: configService.getValue(ConfigService.KEYS.OAUTH_GOOGLE_CLIENT_SECRET),
            callbackURL: "__SET_IN_AUTH_GUARD_AT_REQUEST_SCOPE__",
            scope: ['email'],   // "profile" for display name, but actually not needed
            proxy: true,
            passReqToCallback: true
        });
        this.userRepo = userRepo;
    }

    async validate(request: Request, _refreshToken: string, _UNKNOWNONJECT: any, profile: any, done: VerifyCallback): Promise<any> {
        var user: User = {
            "id": profile.provider + profile.id,
            "provider": profile.provider,
            "providerId": profile.id,
            "email": profile._json.email,
            "name": profile.displayName,
            "lastLoginDate": new Date(),
            "signupDate": new Date()
        };
        
        if (request.headers["cf-ipcountry"]) {
            user.country = request.headers["cf-ipcountry"];
            user.city = request.headers["cf-ipcity"] || null;
        }

        user = await this.userRepo.upsert(user);

        console.log (done);
        return done(null, user);
    }
}