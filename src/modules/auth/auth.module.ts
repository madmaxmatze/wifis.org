import { Module, MiddlewareConsumer } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local/local.strategy';
import { GoogleStrategy } from './google/google.strategy';
import { FacebookStrategy } from './facebook/facebook.strategy';
import { SessionSerializer } from './session.serializer';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { DataModule } from '../data/data.module';

@Module({
    imports: [PassportModule.register({ session: true }), DataModule],
    providers: [LocalStrategy, GoogleStrategy, FacebookStrategy, SessionSerializer],
    controllers: [AuthController],
})
export class AuthModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('*');
    }
}