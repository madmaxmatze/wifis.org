import { Controller, Post, Res, Session, UseFilters, Body, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { WifiService } from '../data/wifi/wifi.service';
import { Wifi, WifiError } from '../data/wifi/wifi.model';
import { ApiExceptionFilter } from './api.exception.filter';
import { AuthGuard } from '../auth/auth.guard';

@UseFilters(new ApiExceptionFilter())
@Controller("api")
export class ApiController {
    private wifiService: WifiService = null;

    constructor(wifiService: WifiService) {
        this.wifiService = wifiService;
    }

    @Post('wifi/exists')
    async existsWifi(@Res() response: Response, @Body('id') wifiId: string) {
        this.wifiService.get(wifiId)
            .then((wifi: Wifi) => {
                response.json({ "success": (wifi !== null) });
            });
    }

    @Post('wifi/add')
    @UseGuards(AuthGuard)
    async addWifi(@Session() session: Record<string, any>, @Res() response: Response, @Body('id') wifiId: string) {
        var userWifis: Wifi[] = await this.wifiService.getAllByUserId(session.user.id);
        if (userWifis.length >= session.user.maxWifis) {
            throw new Error(WifiError.maxWifiCountReached);
        }

        var newWifi: Wifi = {
            "id": wifiId
            , "label": wifiId
            , "user": session.user.id
            , "creationDate": new Date()
        };

        this.wifiService.insert(newWifi)
            .then((addedWifi: Wifi) => {
                response.json({ "success": true, "wifi": addedWifi });
            });
    }

    @Post('wifi/delete')
    @UseGuards(AuthGuard)
    async deleteWifi(@Session() session: Record<string, any>, @Res() response: Response, @Body('id') wifiId: string) {
        this.wifiService.delete(session.user.id, wifiId)
            .then((isDeleted: boolean) => {
                response.json({ "success": isDeleted });
            });
    }
}