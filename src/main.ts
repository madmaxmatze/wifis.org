import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { resolve } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use(
        express.static(resolve(__dirname, "./public"))
        , express.json()
        , express.urlencoded({ extended: false })
        , cookieParser()
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

bootstrap();