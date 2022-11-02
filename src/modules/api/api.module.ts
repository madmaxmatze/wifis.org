import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { DataModule } from '../data/data.module';

@Module({
    imports: [DataModule],
    providers: [],
    controllers: [ApiController],
})
export class ApiModule {
}