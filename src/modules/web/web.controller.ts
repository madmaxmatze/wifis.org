import { Get, Controller, Res, Param, Session } from '@nestjs/common';
import { Response } from 'express';
import { WifiService } from '../data/wifi.service';
import { Wifi } from '../data/wifi.model';

@Controller()
export class WebController {
    private wifiService: WifiService;

    constructor(wifiService: WifiService) {
        this.wifiService = wifiService;
    }

    @Get()
    getHomepage(@Res() response: Response) {
        return response.render("home");
    }

    @Get('p/:pageId(about|faq|press|tos|languages|login)')
    getPages(@Res() response: Response, @Param('pageId') pageId: string) {
        return response.render(pageId);
    }

    @Get('p/wifis')
    async getWifis(@Res() response: Response, @Session() session: Record<string, any>) {
        response.locals.wifis = <Wifi[]>await this.wifiService.getAllForUser(session.user.id);
        return response.render("wifis");
    }

    @Get(":wifiId/:wifiIdSuffix(*)?")
    async getWifi(@Res() response: Response, @Param('wifiId') wifiId: string, @Param('wifiIdSuffix') wifiIdSuffix: string) {
        var wifi: Wifi = await this.wifiService.get(wifiId);
        if (wifi) {
            if (wifi.label != wifiId) {
                return response.redirect('/' + wifi.label + (wifiIdSuffix ? "/" + wifiIdSuffix : ""));
            }
            response.locals.wifiUserId = wifi.user;
        }

        response.locals.wifiId = wifiId;
        response.locals.wifiIdSuffix = wifiIdSuffix;
        response.render("wifi");
    }
}