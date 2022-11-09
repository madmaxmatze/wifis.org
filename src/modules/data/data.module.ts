import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { WifiService } from './wifi/wifi.service';
import { UserService } from './user/user.service';

@Module({
    imports: [DataModule],
    providers: [DataService, WifiService, UserService],
    exports: [WifiService, UserService],
})

export class DataModule { }