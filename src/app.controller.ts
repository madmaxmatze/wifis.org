import { Get, Controller, Res, Req, Param } from '@nestjs/common';
import { Response } from 'express';
import { WifiService } from './modules/data/wifi.service';
import { Wifi } from './modules/data/wifi.model';

//const SINGLE_WIFI_PAGE_REGEX = "^\/([\w\-]{3,})(.*)";

@Controller()
export class AppController {
    private wifiService = null;

    constructor(wifiService: WifiService) {
        this.wifiService = wifiService;
    }

    @Get()
    homepage(@Res() res: Response) {
        return this.pages(res, "home");
    }

    @Get('p/:pageId(about|faq|languages|login|press|tos)')
    pages(@Res() res: Response, @Param('pageId') pageId: string) {
        if (["about", "faq", "press", "tos"].includes(pageId)) {
            res.locals.cms_id = pageId;
        }

        res.locals.viewname = pageId;
        return res.render(pageId);
    }

    @Get('p/wifis')
    wifis( @Req() req : any, @Res() res: Response) {
        this.wifiService.getAllForUser(req.session.user.id).then((wifis : any[]) => {
            res.locals.viewname = "wifis";
            res.locals.wifis = wifis;
            res.render(res.locals.viewname);
        });
    }

    @Get(":wifiId(*)")
    wifi(@Res() res: Response, @Param('wifiId') wifiId: string) {
        console.log(wifiId);
        res.locals.viewname = "wifi";
        res.locals.wifiId = wifiId;
        res.locals.wifiIdSuffix = "";

        this.wifiService.get(wifiId)
            .then((wifi: Wifi) => {
                if (wifi && wifi.label != wifiId) {
                    res.redirect('/' + wifi.label);
                }
                res.locals.wifi = wifi;
                console.log(wifi);
                res.render(res.locals.viewname);
            })
            .catch((error : Error) => {
                res.locals.error = error;
                res.render(res.locals.viewname);
            });
    }
}