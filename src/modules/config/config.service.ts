import { Injectable } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as ini from 'ini';

@Injectable()
export class ConfigService {
    private static config = null;

    constructor() {
        console.log("ConfigService constructor");
    }

    static async init() {
        console.log("Static ConfigService init");
        console.log("Static config already loaded: ", (ConfigService.config !== null));
        if (ConfigService.config === null) {
            console.log("Static start init");
            ConfigService.config = await ConfigService.getGcpSecret(process.env.GCP_PROJECT_ID, "production");
            // ConfigService.addConfigToEnv(ConfigService.config);
            console.log("Static config loaded: ", (ConfigService.config !== null));
            console.log("Static finish init");
        }
    }

    private static async getGcpSecret(gcpProjectId: String, gcpSecretId: String) {
        try {
            var secretManagerServiceClient = new SecretManagerServiceClient();

            const [version] = await secretManagerServiceClient.accessSecretVersion({
                name: `projects/${gcpProjectId}/secrets/${gcpSecretId}/versions/latest`
            });

            const payload = version.payload.data.toString();

            return ini.parse(payload);
        } catch (error) {
            console.error(error);
        }
    }

    /*
    private static addConfigToEnv(configs : object) {
        try {
            for (const [key, value] of Object.entries(configs)) {
                process.env[key.toString()] = value.toString();
            }
        } catch (error) {
            console.error(error);
        }
    }
    */

    isDevEnv() {
        return (process.env.NODE_ENV == "development");
    }


    getSessionSecret() {
        return "sdfsdfdsfjsdfjkl _ TO BE MOVED INTO Manager";
    }

    getDomain() {
        return this.getConfigValue('DOMAIN_' + (process.env.NODE_ENV || "development").toUpperCase());
    }

    get_GCP_FIRESTORE_PROJECT_ID() {
        return this.getConfigValue("GCP_FIRESTORE_PROJECT_ID");
    }

    get_GCP_FIRESTORE_CLIENT_EMAIL() {
        return this.getConfigValue("GCP_FIRESTORE_CLIENT_EMAIL");
    }

    get_GCP_FIRESTORE_PRIVATE_KEY() {
        return this.getConfigValue("GCP_FIRESTORE_PRIVATE_KEY");
    }

    get_OAUTH_GOOGLE_CLIENT_ID() {
        return this.getConfigValue("OAUTH_GOOGLE_CLIENT_ID");
    }

    get_OAUTH_GOOGLE_CLIENT_SECRET() {
        return this.getConfigValue("OAUTH_GOOGLE_CLIENT_SECRET");
    }

    private getConfigValue(configKey: string) {
        if (!ConfigService.config) {
            console.log("Config not loaded. Call init function before")
            return "";
            // throw Error("Config not loaded. Call init function before");
        }
        if (!ConfigService.config[configKey]) {
            console.log("Config key '${configKey}' not found")
            return "";
            // throw Error("Config key '${configKey}' not found");
        }
        return ConfigService.config[configKey];
    }
}