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
    OAUTH_FACEBOOK_CLIENT_SECRET = "OAUTH_FACEBOOK_CLIENT_SECRET",
    RECAPTCHA_SECRET_KEY = "RECAPTCHA_SECRET_KEY",
    RECAPTCHA_SITE_KEY = "RECAPTCHA_SITE_KEY",
    MAILJET_APIKEY = "MAILJET_APIKEY",
    MAILJET_APISECRET = "MAILJET_APISECRET",
    MAILJET_TEMPLATE_ID = "MAILJET_TEMPLATE_ID"
}

@Injectable()
export class ConfigService {
    private static developmentHostname : String = "";
    private static requestHostname : String = "";

    private static config : {} = null;

    static async init() {
        if (ConfigService.config === null) {
            ConfigService.config = await ConfigService.getGcpSecret();
            // ConfigService.addConfigToEnv(ConfigService.config);
        }
    }

    private static async getGcpSecret() {
        try {
            var secretManagerServiceClient = new SecretManagerServiceClient();

            const [version] = await secretManagerServiceClient.accessSecretVersion({
                name: `projects/${process.env.K_SERVICE}/secrets/production/versions/latest`
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

    setRequestHostname(requestHostname: string) {
        ConfigService.requestHostname = requestHostname;
    }

    getHostname() {
        if (!ConfigService.requestHostname || ConfigService.requestHostname == "127.0.0.1") {
            this.setRequestHostname(process.env.HOSTNAME);
        }

        console.log ("ConfigService.requestHostname", ConfigService.requestHostname);

        return ConfigService.requestHostname;
    }

    isProdEnv() {
        return (process.env.NODE_ENV == "production");
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
