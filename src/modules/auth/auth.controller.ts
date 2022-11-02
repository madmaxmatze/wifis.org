import { Get, Controller, Post, Req, Res, UseGuards, Query } from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from './local/local.auth.guard';
import { AuthGuard } from "@nestjs/passport";

@Controller()
export class AuthController {
    @UseGuards(LocalAuthGuard)
    @Post('p/login/local')
    localLogin(@Req() request : any, @Res() response: Response): any {
        // TODO: How to remove this workaround? Why is user not saved to session
        if (request.user) {
            request.session.user = request.user;
        }

        return response.redirect('/p/wifis');
    }

    @UseGuards(AuthGuard('google'))
    @Get('p/login/google')
    googleLogin(@Req() request : any, @Res() response: Response): any {
        // TODO: How to remove this workaround? Why is user not saved to session
        if (request.user) {
            request.session.user = request.user;
        }

        return response.redirect('/p/wifis');
    }

    @Get('p/login/google/redirect')
    @UseGuards(AuthGuard('google'))
    googleAuthRedirect(@Req() request : any, @Res() response: Response): any {
        response.json({
            message: 'User information from google',
            user: request.user
        });

        return;

        // TODO: How to remove this workaround? Why is user not saved to session
        if (request.user) {
            request.session.user = request.user;
        }

        return response.redirect('/p/wifis');
    }

    @Get('p/logout')
    logout(@Req() request : any, @Res() response : Response, @Query('redirect') redirectUrl: string): any {
        request.session.user = null;

        /*
        request.logout(function (err : Error) {
            if (err) { return next(err); }
        });
        */
 
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