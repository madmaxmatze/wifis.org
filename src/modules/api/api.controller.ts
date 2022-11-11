import { Controller, Post, Res, Session, UseFilters, Body, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { WifiRepo } from '../data/wifi/wifi.repo';
import { Wifi, WifiError } from '../data/wifi/wifi.model';
import { ApiExceptionFilter } from './api.exception.filter';
import { AuthGuard } from '../auth/auth.guard';

@UseFilters(new ApiExceptionFilter())
@Controller("api")
export class ApiController {
    private wifiRepo: WifiRepo = null;

    constructor(wifiRepo: WifiRepo) {
        this.wifiRepo = wifiRepo;
    }

    @Post('wifi/exists')
    async existsWifi(@Res() response: Response, @Body('id') wifiId: string) {
        this.wifiRepo.get(wifiId)
            .then((wifi: Wifi) => {
                response.json({ "success": (wifi !== null) });
            });
    }

    @Post('wifi/add')
    @UseGuards(AuthGuard)
    async addWifi(@Session() session: Record<string, any>, @Res() response: Response, @Body('id') wifiId: string) {
        var userWifis: Wifi[] = await this.wifiRepo.getAllByUserId(session.user.id);
        var maxWifis = session.user.maxWifis || 3;
        if (userWifis.length >= maxWifis) {
            throw new Error(WifiError.maxWifiCountReached);
        }

        var newWifi: Wifi = {
            "id": wifiId
            , "label": wifiId
            , "user": session.user.id
            , "creationDate": new Date()
        };

        this.wifiRepo.insert(newWifi)
            .then((addedWifi: Wifi) => {
                response.json({ "success": true, "wifi": addedWifi });
            });
    }

    @Post('wifi/delete')
    @UseGuards(AuthGuard)
    async deleteWifi(@Session() session: Record<string, any>, @Res() response: Response, @Body('id') wifiId: string) {
        this.wifiRepo.delete(session.user.id, wifiId)
            .then((isDeleted: boolean) => {
                response.json({ "success": isDeleted });
            });
    }
}