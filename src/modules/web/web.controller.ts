import { Get, Controller, Res, Param, Session, NotFoundException, HttpStatus, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { WifiService } from '../data/wifi/wifi.service';
import { Wifi } from '../data/wifi/wifi.model';
import { AuthGuard } from '../auth/auth.guard';

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

    @Get('p/wifis')
    @UseGuards(AuthGuard)
    async getWifis(@Res() response: Response, @Session() session: Record<string, any>) {
        response.locals.wifis = <Wifi[]>await this.wifiService.getAllByUserId(session.user.id);
        return response.render("wifis");
    }

    @Get('p/:pageId(*)?')
    getPages(@Res() response: Response, @Param('pageId') pageId: string) {
        if (!["about", "faq", "press", "tos", "languages", "login"].includes(pageId)) {
            throw new NotFoundException("Page not found: " + pageId);
        }
        return response.render(pageId);
    }

    @Get(":wifiId/:wifiIdSuffix(*)?")
    async getWifi(@Res() response: Response, @Param('wifiId') wifiId: string, @Param('wifiIdSuffix') wifiIdSuffix: string) {
        var wifi: Wifi = await this.wifiService.get(wifiId);
        if (wifi) {
            if (wifi.label != wifiId) {
                return response.redirect('/' + wifi.label + (wifiIdSuffix ? "/" + wifiIdSuffix : ""));
            }
            response.locals.wifiUserId = wifi.user;
        } else {
            response.status(HttpStatus.NOT_FOUND);            
        }

        response.locals.wifiId = wifiId;
        response.locals.wifiIdSuffix = wifiIdSuffix;
        response.render("wifi");
    }
}