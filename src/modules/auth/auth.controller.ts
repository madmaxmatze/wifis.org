import { Get, Controller, Post, Req, Res, UseGuards, Query, Session } from '@nestjs/common';
import { Response, Request } from 'express';
import { LocalAuthGuard } from './local/local.auth.guard';
import { GoogleAuthGuard } from './google/google.auth.guard';
import { FacebookAuthGuard } from './facebook/facebook.auth.guard';

@Controller()
export class AuthController {
    @UseGuards(LocalAuthGuard)
    @Post('p/login/local')
    localLogin(@Req() request: any, @Res() response: Response): any {
        // TODO: How to remove this workaround? Why is user not saved to session
        if (request.user) {
            request.session.user = request.user;
        }

        return response.redirect('/p/wifis');
    }

    @UseGuards(GoogleAuthGuard)
    @Get('p/login/google')
    googleLogin(@Req() request: any, @Res() response: Response): any {
        // TODO: How to remove this workaround? Why is user not saved to session
        if (request.user) {
            request.session.user = request.user;
        }

        return response.redirect('/p/wifis');
    }

    @UseGuards(GoogleAuthGuard)
    @Get('p/login/google/redirect')
    googleAuthRedirect(@Req() request: Request, @Res() response: Response, @Session() session: Record<string, any>): any {
        console.log("google/redirect request.user:", request.user);
        console.log("google/redirect request.session.user", session.user);

        // TODO: How to remove this workaround? Why is user not saved to session
        if (request.user) {
            session.user = request.user;
        }

        return response.redirect('/p/wifis');
    }

    @UseGuards(FacebookAuthGuard)
    @Get('p/login/facebook')
    facebookLogin(@Req() request: any, @Res() response: Response): any {
        // TODO: How to remove this workaround? Why is user not saved to session
        if (request.user) {
            request.session.user = request.user;
        }

        return response.redirect('/p/wifis');
    }

    @UseGuards(FacebookAuthGuard)
    @Get('p/login/facebook/redirect')
    facebookAuthRedirect(@Req() request: any, @Res() response: Response): any {
        console.log("facebook/redirect request.user:", request.user);
        console.log("facebook/redirect request.session.user", request.session.user);

        // TODO: How to remove this workaround? Why is user not saved to session
        if (request.user) {
            request.session.user = request.user;
        }

        return response.redirect('/p/wifis');
    }

    @Get('p/logout')
    logout(@Req() request: any, @Res() response: Response, @Query('redirect') redirectUrl: string): any {
        request.session.user = null;

        /*
        request.logout(function (err : Error) {
            if (err) { return next(err); }
        });
        */

        console.log("redirectUrl", redirectUrl);

        return response.redirect(redirectUrl || '/');
    }

    /*
    @UseGuards(AuthenticatedGuard)
    @Get('protected')
    getHello(@Request() req): string {
      return req.user;
    }
    */

}