import { Get, Controller, Res, Param, Session } from '@nestjs/common';
import { Response } from 'express';
import { WifiService } from '../data/wifi.service';
import { Wifi } from '../data/wifi.model';
import * as i18n from 'i18n';

//const SINGLE_WIFI_PAGE_REGEX = "^\/([\w\-]{3,})(.*)";

@Controller()
export class WebController {
    private wifiService = null;
   
    constructor(wifiService: WifiService) {
        this.wifiService = wifiService;
    }

    @Get()
    homepage(@Res() response: Response) {
        return response.render("home");
    }

    @Get('p/:pageId(about|faq|press|tos|languages|login)')
    pages(@Res() response: Response, @Param('pageId') pageId: string) {
        if (["about", "faq", "press", "tos"].includes(pageId)) {
            response.locals.page_id = pageId;
        }

        return response.render(pageId);
    }

    @Get('p/wifis')
    async wifis(@Res() response: Response, @Session() session: Record<string, any>) {
        response.locals.wifis = <Wifi[]>await this.wifiService.getAllForUser(session.user.id);
        return response.render("wifis");
    }

    @Get(":wifiId(*)")
    async wifi(@Res() response: Response, @Param('wifiId') wifiId: string) {
        console.log("wifiId", wifiId);
        
        var wifi : Wifi = await this.wifiService.get(wifiId);
        if (wifi && wifi.label != wifiId) {
            response.redirect('/' + wifi.label);
        }

        // TODO add split magic for sub-wifis
        response.locals.wifi = wifi;
        response.locals.wifiId = wifiId;
        response.locals.wifiIdSuffix = "";  
        response.render("wifi");
    }
}