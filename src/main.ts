import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { resolve } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { HttpExceptionFilter } from './modules/web/filter/http-exception.filter';
import { ConfigService } from './modules/config/config.service';
import { loadConfigFromGcpSecretToEnv } from './common/config/config.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    await loadConfigFromGcpSecretToEnv(process.env.GCP_PROJECT_ID, "production");
    
    NestFactory.create

    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    
    var configService : ConfigService = app.get(ConfigService);
    await configService.init();
    Logger.warn("ConfigService", configService);
    console.warn("test");

    app.use(
        express.static(resolve(__dirname, "./public"))
        , express.json()
        , express.urlencoded({ extended: false })
        , cookieParser()
        // https://cloud.google.com/nodejs/getting-started/session-handling-with-firestore
        , session({
            secret: 'session_demo',
            resave: true,
            saveUninitialized: true,   // don't create session until something stored
            cookie: { maxAge: (24 * 60 * 60 * 1000) },
        }));

    app.useGlobalFilters(new HttpExceptionFilter());

    await app.listen(parseInt(process.env.PORT) || 8080);

    console.log(`Application is running on: ${await app.getUrl()}`);
}


console.log("bootstrap1");

bootstrap();

console.log("bootstrap2");