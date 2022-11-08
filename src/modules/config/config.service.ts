import { Injectable } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as ini from 'ini';

export enum ConfigKey {
    SESSION_SECRET = "SESSION_SECRET",
    GCP_FIRESTORE_PROJECT_ID = "GCP_FIRESTORE_PROJECT_ID",
    GCP_FIRESTORE_CLIENT_EMAIL = "GCP_FIRESTORE_CLIENT_EMAIL",
    GCP_FIRESTORE_PRIVATE_KEY = "GCP_FIRESTORE_PRIVATE_KEY",
    OAUTH_GOOGLE_CLIENT_ID = "OAUTH_GOOGLE_CLIENT_ID",
    OAUTH_GOOGLE_CLIENT_SECRET = "OAUTH_GOOGLE_CLIENT_SECRET",
    OAUTH_FACEBOOK_CLIENT_ID = "OAUTH_FACEBOOK_CLIENT_ID",
    OAUTH_FACEBOOK_CLIENT_SECRET = "OAUTH_FACEBOOK_CLIENT_SECRET"
}

@Injectable()
export class ConfigService {
    private static config = null;

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

    isProdEnv() {
        return (process.env.NODE_ENV == "production");
    }

    getDomain() {
        return this.getConfigValue('DOMAIN_' + (this.isProdEnv() ? "PRODUCTION" : "DEVELOPMENT").toUpperCase());
    }

    getValue(key: ConfigKey) {
        return this.getConfigValue(key.toString());
    }

    private getConfigValue(configKey: string) {
        if (!ConfigService.config) {
            console.log("Config not loaded. Call init function before");
            return "empty";
        }
        if (!ConfigService.config[configKey]) {
            console.log(`Config key '${configKey}' not found`);
            return "empty";
        }
        return ConfigService.config[configKey];
    }
}
