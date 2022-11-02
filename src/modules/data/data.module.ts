import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { WifiService } from './wifi.service';
import { UserService } from './user.service';

@Module({
    imports: [DataModule],
    providers: [ DataService, WifiService, UserService ],
  // providers: [...datastoreProviders],
  exports: [ WifiService, UserService ],
})

export class DataModule {}