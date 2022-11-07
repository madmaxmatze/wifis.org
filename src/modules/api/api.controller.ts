import { Controller, Post, Req, Res, UseGuards, Body } from '@nestjs/common';
import { Response } from 'express';
import { WifiService } from '../data/wifi.service';
import { Wifi } from '../data/wifi.model';

@Controller("api")
export class ApiController {
    private wifiService = null;

    constructor(wifiService: WifiService) {
        this.wifiService = wifiService;
    }

    @Post('wifi/exists')
    async isWifiExisting(@Res() response: Response, @Body('id') wifiId: string) {
        this.wifiService.get(wifiId)
            .then((wifi: Wifi) => {
                response.json({ "exists": (wifi !== null) });
            })
            .catch((error: Error) => {
                response.json({ "exists": false, "error": error.message });
            });
    }

    /*
     *  API: Create new Wifi
     */
    @Post('wifi/add')
    async addWifi(@Req() request: any, @Res() response: Response, @Body('id') wifiId: string) {
        var userId = request.session.user.id

        var newWifi = {
            "id": wifiId
            , "label": wifiId
            , "user": userId
        };

        var userWifis = await this.wifiService.getAllForUser(userId);

        if (userWifis.length <= 3) { // 3 = res.locals.user.maxWifis
            this.wifiService.insert(newWifi)
                .then((createdWifi: Wifi) => {
                    response.json({ "newWifi": createdWifi });
                })
                .catch((error: Error) => {
                    console.error(error);
                    response.json({ "error": error.message });
                });
        } else {
            console.error(userWifis);
            response.json({ "error": "maxWifiCountReached" });
        }
    }

    /*
     *  API: Delete Wifi
     */
    @Post('wifi/delete')
    async deleteWifi(@Req() request: any, @Res() response: Response, @Body('id') wifiId: string) {
        var userId = request.session.user.id
        this.wifiService.delete(userId, wifiId)
            .then((isDeleted: boolean) => {
                response.json({ "deleted": isDeleted });
            })
            .catch((error: Error) => {
                console.error(error);
                response.json({ "deleted": false, "error": error.message });
            });
    }
}