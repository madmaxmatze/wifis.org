import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { User } from '../../data/user.model';
import { UserService } from '../../data/user.service';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    private userService = null;

    constructor(configService : ConfigService, userService: UserService) {
        super({
            clientID: process.env.OAUTH_GOOGLE_CLIENT_ID, // configService.get_OAUTH_GOOGLE_CLIENT_ID(),
            clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET, // configService.get_OAUTH_GOOGLE_CLIENT_SECRET(),
            callbackURL: "https://" + 
            process.env['DOMAIN_' + (process.env.NODE_ENV || "development").toUpperCase()] +
            //configService.getDomain() + 
            "/p/login/google/redirect",
            scope: ['email'],
            proxy: true,
            passReqToCallback: true
        });

        // console.log ("GoogleStrategy: ", configService.get_OAUTH_GOOGLE_CLIENT_ID());

        this.userService = userService;
    }

    async validate(_accessToken: string, _refreshToken: string, UNKNOWNONJECT: any, profile: any, done: VerifyCallback): Promise<any> {
        /*
        console.log("UNKNOWNONJECT", UNKNOWNONJECT);
        console.log("profile", profile);
        console.log("done", done);
        */
       
        var user: User = {
            "id": profile.provider + profile.id,
            "provider": profile.provider,
            "providerId": profile.id,
            "email": profile._json.email,
            "displayName": profile.displayName,
            "lastLoginDate": new Date(),
            "signupDate": new Date()
        };

        return done(null, user);

        this.userService.upsert(user)
            .then(function (user: User) {
                done(null, user);
            }).catch(function (error: Error) {
                console.log("Error inserting/updating user:", error);
                return done(error);
            });
    }
}