import { NestFactory } from '@nestjs/core';
import { Server } from 'net';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DataModule } from './modules/data/data.module';
import { resolve } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { ConfigService } from './modules/config/config.service';
import * as FirestoreStoreFactory from 'firestore-store';  // https://www.npmjs.com/package/firestore-store

NestFactory.create<NestExpressApplication>(AppModule)
    .then(app => (
        console.log ("process.env: ", process.env),
        app.use(
            express.static(resolve(__dirname, "./public")),
            express.json(),
            express.urlencoded({ extended: false }),
            cookieParser(),
            session({
                store: new (FirestoreStoreFactory(session))({
                    database: app.select(DataModule).get("FIRESTORE"),
                    collection: "__sessions"
                }),
                name: "__session", // required cookie name for Cloud Run!
                secret: app.get(ConfigService).getValue(ConfigService.KEYS.SESSION_SECRET),
                resave: true,
                saveUninitialized: true, // don't create session until something stored
                cookie: { maxAge: (24 * 60 * 60 * 1000) },
            })
        ),
        app.listen(parseInt(process.env.PORT) || 8080)
    ))
    .then((server: Server) => console.log("Application is running on: ", server.address()));