import { NotFoundException, Get, Post, All, Controller, Res, Param, Session, HttpStatus, UseGuards, Body, Next, Render } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { ConfigService } from '../config/config.service';
import { WifiRepo } from '../data/wifi/wifi.repo';
import { CommsService } from '../comms/comms.service';
import { Message } from '../data/message/message.model';
import { Wifi } from '../data/wifi/wifi.model';
import { AuthGuard } from '../auth/auth.guard';
import { Recaptcha, RecaptchaResult, RecaptchaVerificationResult } from '@nestlab/google-recaptcha';
import * as i18n from 'i18n';

@Controller()
export class WebController {
    private static WIFI_URL: string = ":wifiId([a-zA-Z0-9\_\-]{3,20})/:wifiIdSuffix(*)?";
    private static HOMEPAGE_URL: string = "";

    constructor(
        private readonly configService: ConfigService,
        private readonly wifiRepo: WifiRepo,
        private readonly commsService: CommsService,
    ) { }

    @Get([WebController.HOMEPAGE_URL, ":lang([a-z]{2})", ":lang([a-z]{2})/:pageId(about|faq|press|tos|languages|login)"])
    getPages(@Res() response: Response, @Param('pageId') pageId: string = "home") {
        return response.render(pageId);
    }

    @Get('p/wifis')
    @UseGuards(AuthGuard)
    async getWifis(@Res() response: Response, @Session() session: Record<string, any>) {
        return response.render("wifis", { "wifis": await this.wifiRepo.getAllByUserId(session.user.id) });
    }

    @Get('_js/config_:lang([a-z]{2}).js')
    async javascript1(@Res() response: Response, @Param('lang') lang: string) {
        var config = i18n.getLocales().includes(lang) ? {
            lang : lang,
            translations : i18n.getCatalog(lang)
        } : {};
        
        return response
            .contentType("application/javascript")
            .send(`var config = ${JSON.stringify(config)};`);
    }

    /**
     * Somehow a preperation middleware for GET and POST single Wifi page requests
     */
    @All(WebController.WIFI_URL)
    async requestWifi(@Res() response: Response, @Next() next: NextFunction,
        @Param('wifiId') wifiId: string, @Param('wifiIdSuffix') wifiIdSuffix: string) {
        response.locals.wifiId = wifiId;
        response.locals.wifiIdSuffix = wifiIdSuffix;
        
        response.locals.wifi = <Wifi>await this.wifiRepo.get(wifiId);
        if (!response.locals.wifi) {
            return response.status(HttpStatus.NOT_FOUND).render("wifi");
        }    
        
        if (response.locals.wifi.label != wifiId) {
            return response.redirect('/' + response.locals.wifi.label + (wifiIdSuffix ? "/" + wifiIdSuffix : ""));
        }
        response.locals.RECAPTCHA_SITE_KEY = this.configService.getValue(ConfigService.KEYS.RECAPTCHA_SITE_KEY);
        response.locals.wifiUserId = response.locals.wifi.userId;
        
        return next();
    }

    @Get(WebController.WIFI_URL)
    @Render("wifi")
    async getWifi() { }

    @Post(WebController.WIFI_URL)
    @Recaptcha()
    async postWifi(@Res() response: Response,
        @Body('contact') contact: string, @Body('text') text: string,
        @RecaptchaResult() recaptchaResult: RecaptchaVerificationResult) {

        // TODO: validate email and text
        response.locals.form_field_contact = contact;
        response.locals.form_field_text = text;

        /* recaptchaResult = {"success":true, "score":0.9, "errors":[], ...} */
        // TODO: check behaviour of moving score into config
        if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
            // pretending that all is good and the message was send ???
            return response.render("wifi", { "sendSuccess": true });
        }

        var message: Message = {
            wifiId: response.locals.wifi.label,
            wifiIdSuffix: response.locals.wifiIdSuffix,
            wifiOwnerId: response.locals.wifi.userId,
            senderContact: contact,
            senderText: text,
            senderSecurityScore: recaptchaResult.score,
            sendSuccess: false,
            sendDate: new Date()
        };

        this.commsService.sendMessage(message).then((sendSuccess) => {
            response.locals.sendSuccess = sendSuccess;
            return response.render("wifi");
        }).catch((error: Error) => {
            return response.render("wifi", { "sendSuccess": false, "errormessage": error.message });
        });
    }
}