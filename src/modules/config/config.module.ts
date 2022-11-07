import { Module, Global } from '@nestjs/common';
import { ConfigService } from './config.service';

@Global()
@Module({
    imports: [],
    providers: [ConfigService],
    controllers: [],
    exports: [ConfigService]
})

export class ConfigModule {}