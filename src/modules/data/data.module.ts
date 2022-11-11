import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { WifiRepo } from './wifi/wifi.repo';
import { UserRepo } from './user/user.repo';
import { MessageRepo } from './message/message.repo';

@Module({
    imports: [],
    providers: [DataService, WifiRepo, UserRepo, MessageRepo],
    exports: [WifiRepo, UserRepo, MessageRepo],
})

export class DataModule { }