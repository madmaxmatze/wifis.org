import { Get, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { LocalAuthGuard } from './local-auth.guard';


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

    @Get('p/logout')
    logout(@Req() request : any, @Res() response : Response, _next : NextFunction): any {
        request.session.user = null;
        /*
        request.logout(function (err) {
            if (err) { return next(err); }
        });
        */

        return response.redirect('/');
    }

    /*
    @UseGuards(AuthenticatedGuard)
    @Get('protected')
    getHello(@Request() req): string {
      return req.user;
    }
    */

}