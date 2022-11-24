import { Controller, Post, Res, Session, UseFilters, Body, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { WifiRepo } from '../data/wifi/wifi.repo';
import { Wifi } from '../data/wifi/wifi.model';
import { ApiExceptionFilter } from './api.exception.filter';
import { AuthGuard } from '../auth/auth.guard';

@UseFilters(new ApiExceptionFilter())
@Controller("api")
export class ApiController {
    constructor(
        private readonly wifiRepo: WifiRepo
    ) { }

    @Post('wifi/exists')
    async existsWifi(@Res() response: Response, @Body('id') wifiId: string) {
        var wifi: Wifi = await this.wifiRepo.get(wifiId);
        response.json({ "success": (wifi !== null) });
    }

    @Post('wifi/add')
    @UseGuards(AuthGuard)
    async addWifi(@Session() session: Record<string, any>, @Res() response: Response, @Body('id') wifiLabel: string) {
        var wifiToAdd = <Wifi>{
            "id": wifiLabel.toLowerCase(),
            "userId": session.user.id,
            "creationDate": new Date()
        };
        if (wifiToAdd.id != wifiLabel) {
            wifiToAdd.label = wifiLabel;
        }
        var isAdded: boolean = await this.wifiRepo.insert(wifiToAdd);
        response.json({ "success": isAdded });
    }

    @Post('wifi/delete')
    @UseGuards(AuthGuard)
    async deleteWifi(@Session() session: Record<string, any>, @Res() response: Response, @Body('id') wifiId: string) {
        var isDeleted: boolean = await this.wifiRepo.delete(wifiId, session.user.id);
        response.json({ "success": isDeleted });
    }
}