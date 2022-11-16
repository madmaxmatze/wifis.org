import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as passport from 'passport';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use(request: Request, response: Response, next: NextFunction) {
        // seems needed for dev - to enable session
        request.app.enable('trust proxy');

        response.app.use(
            passport.authenticate('session')
            , passport.initialize()             // connect passport to express
            , passport.session()                // create user object
        );

        next();
    }
}