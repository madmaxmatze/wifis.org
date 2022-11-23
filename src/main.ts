import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DataModule } from './modules/data/data.module';
import { resolve } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { ConfigService, ConfigKey } from './modules/config/config.service';
import * as FirestoreStoreFactory from 'firestore-store';  // https://www.npmjs.com/package/firestore-store

async function bootstrap() {
    var developmentDomain = "8080-cs-590268403158-default.cs-europe-west4-fycr.cloudshell.dev";
    await ConfigService.init(developmentDomain);
    
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    
    app.use(
        express.static(resolve(__dirname, "./public"))
        , express.json()
        , express.urlencoded({ extended: false })
        , cookieParser()
        , session({
            store: new (FirestoreStoreFactory(session))({
                database: app.select(DataModule).get("FIRESTORE"),
                collection : "__sessions"
            }),
            name: "__session", // required cookie name for Cloud Run!
            secret: app.get(ConfigService).getValue(ConfigKey.SESSION_SECRET),
            resave: true,
            saveUninitialized: true, // don't create session until something stored
            cookie: { maxAge: (24 * 60 * 60 * 1000) },
        }));

    await app.listen(parseInt(process.env.PORT) || 8080);
    
    console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();