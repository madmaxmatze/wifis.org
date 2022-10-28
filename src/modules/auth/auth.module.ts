import { Module, MiddlewareConsumer } from '@nestjs/common';

import { PassportModule } from '@nestjs/passport';
// import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
    
@Module({
    // UsersModule, 
    imports: [PassportModule.register({ session: true })],
    providers: [AuthService, LocalStrategy, SessionSerializer],
    controllers: [AuthController],
})
export class AuthModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('*');   
    } 
}