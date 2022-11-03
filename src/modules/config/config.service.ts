import { Injectable } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as ini from 'ini';

@Injectable()
export class ConfigService {
    private config = null;

    constructor() {
        console.log("ConfigService constructor");
    }
    
    async init() {
        console.log("ConfigService constructor");
        if (this.config === null) {
            console.log("start init");
            this.config = await this.getGcpSecret(process.env.GCP_PROJECT_ID, "production");
            this.addConfigToEnv(this.config);
            console.log("config loaded: ", (this.config !== null));
            console.log("process.env: ", process.env);
            console.log("finish init");
        }
    }

    private async getGcpSecret(gcpProjectId: String, gcpSecretId: String) {
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

    addConfigToEnv(configs : object) {
        try {
            for (const [key, value] of Object.entries(configs)) {
                process.env[key.toString()] = value.toString();
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    getDomain() {
        return this.getConfigValue('DOMAIN_' + (process.env.NODE_ENV || "development").toUpperCase());
    }

    get_OAUTH_GOOGLE_CLIENT_ID() {
        return this.getConfigValue("OAUTH_GOOGLE_CLIENT_ID");
    }
    
    get_OAUTH_GOOGLE_CLIENT_SECRET() {
        return this.getConfigValue("OAUTH_GOOGLE_CLIENT_SECRET");
    }

    private getConfigValue(configKey: string) {
        console.log (this.config);
        
        if (!this.config) {
            console.log ("Config not loaded. Call init function before")
            return "";
            // throw Error("Config not loaded. Call init function before");
        }
        if (!this.config[configKey]) {
            console.log ("Config key '${configKey}' not found")
            return "";
            // throw Error("Config key '${configKey}' not found");
        }
        return this.config[configKey];
    }
}