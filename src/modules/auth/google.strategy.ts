import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { User } from '../data/user.model';
import { UserService } from '../data/user.service';

/*
[Nest] 11  - 11/01/2022, 8:26:47 PM   ERROR [ExceptionHandler] OAuth2Strategy requires a authorizationURL option
TypeError: OAuth2Strategy requires a authorizationURL option
    at GoogleStrategy.OAuth2Strategy (/node_modules/passport-oauth2/lib/strategy.js:85:42)
    at new Strategy (/node_modules/passport-google-oauth20/lib/strategy.js:52:18)
    at new MixinStrategy (/node_modules/@nestjs/passport/dist/passport/passport.strategy.js:32:13)
    at new GoogleStrategy (/dist/modules/auth/google.strategy.js:13:22)
    at Injector.instantiateClass (/node_modules/@nestjs/core/injector/injector.js:330:19)
    at callback (/node_modules/@nestjs/core/injector/injector.js:48:41)
    at async Injector.resolveConstructorParams (/node_modules/@nestjs/core/injector/injector.js:122:24)
    at async Injector.loadInstance (/node_modules/@nestjs/core/injector/injector.js:52:9)
    at async Injector.loadProvider (/node_modules/@nestjs/core/injector/injector.js:74:9)
    at async Promise.all (index 5)
*/

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    private userService = null;

    constructor(userService: UserService) {
        super({
            clientID: process.env.OAUTH_GOOGLE_CLIENT_ID,
            clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
            callbackURL: 'https://8080-cs-590268403158-default.cs-europe-west4-bhnf.cloudshell.dev/p/login/google/redirect',
            scope: ['email'],
            proxy: true,
            passReqToCallback: true
        });

        this.userService = userService;
    }

    async validate(_accessToken: string, _refreshToken: string, UNKNOWNONJECT: any, profile: any, done: VerifyCallback): Promise<any> {
        console.log("UNKNOWNONJECT", UNKNOWNONJECT);
        console.log("profile", profile);
        console.log("done", done);

        var user: User = {
            "id": profile.provider + profile.id,
            "provider": profile.provider,
            "providerId": profile.id,
            "email": profile._json.email,
            "displayName": profile.displayName,
            "lastLoginDate": new Date(),
            "signupDate": new Date()
        };

        this.userService.upsert(user)
            .then(function (user: User) {
                done(null, user);
            }).catch(function (error: Error) {
                console.log("Error inserting/updating user:", error);
                return done(error);
            });

        // done(null, user);
    }
}