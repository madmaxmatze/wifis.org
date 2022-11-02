import { Module, MiddlewareConsumer } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { GoogleStrategy } from './google.strategy';
import { SessionSerializer } from './session.serializer';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { DataModule } from '../data/data.module';

@Module({
    // UsersModule, 
    imports: [PassportModule.register({ session: true }), DataModule],
    providers: [AuthService, LocalStrategy, GoogleStrategy, SessionSerializer],
    controllers: [AuthController],
})
export class AuthModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('*');   
    } 
}