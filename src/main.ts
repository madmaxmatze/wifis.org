import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { resolve } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { HttpExceptionFilter } from './modules/web/filter/http-exception.filter';
import { ConfigService, ConfigKey } from './modules/config/config.service';

async function bootstrap() {
    await ConfigService.init();

    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use(
        express.static(resolve(__dirname, "./public"))
        , express.json()
        , express.urlencoded({ extended: false })
        , cookieParser()
        // TODO:  https://cloud.google.com/nodejs/getting-started/session-handling-with-firestore
        , session({
            secret: app.get(ConfigService).getValue(ConfigKey.SESSION_SECRET),
            resave: true,
            saveUninitialized: true,   // don't create session until something stored
            cookie: { maxAge: (24 * 60 * 60 * 1000) },
        }));

    app.useGlobalFilters(new HttpExceptionFilter());

    await app.listen(parseInt(process.env.PORT) || 8080);

    console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();