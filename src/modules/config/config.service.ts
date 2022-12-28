import { Injectable } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { CloudShellServiceClient } from '@google-cloud/shell';
import * as ini from 'ini';

enum ConfigKeys {
    GCP_FIRESTORE_PROJECT_ID = "GCP_FIRESTORE_PROJECT_ID",
    GCP_FIRESTORE_CLIENT_EMAIL = "GCP_FIRESTORE_CLIENT_EMAIL",
    GCP_FIRESTORE_PRIVATE_KEY = "GCP_FIRESTORE_PRIVATE_KEY",
    HOSTNAME_CLOUDSHELL = "HOSTNAME_CLOUDSHELL",
    HOSTNAME_REQUEST = "HOSTNAME_REQUEST",
    MAILJET_APIKEY = "MAILJET_APIKEY",
    MAILJET_APISECRET = "MAILJET_APISECRET",
    MAILJET_TEMPLATE_ID = "MAILJET_TEMPLATE_ID",
    OAUTH_GOOGLE_CLIENT_ID = "OAUTH_GOOGLE_CLIENT_ID",
    OAUTH_GOOGLE_CLIENT_SECRET = "OAUTH_GOOGLE_CLIENT_SECRET",
    OAUTH_FACEBOOK_CLIENT_ID = "OAUTH_FACEBOOK_CLIENT_ID",
    OAUTH_FACEBOOK_CLIENT_SECRET = "OAUTH_FACEBOOK_CLIENT_SECRET",
    RECAPTCHA_SECRET_KEY = "RECAPTCHA_SECRET_KEY",
    RECAPTCHA_SITE_KEY = "RECAPTCHA_SITE_KEY",
    SESSION_SECRET = "SESSION_SECRET",
}

@Injectable()
export class ConfigService {
    static INJECTION = "CONFIGSERVICE_INJECTION_TOKEN";
    static KEYS = ConfigKeys;

    private config: {} = null;

    async init(): Promise<ConfigService> {
        this.config = await this.getGcpSecret();
        console.log(`${Object.keys(this.config).length} Configs loaded`);

        console.log("Env", process.env.NODE_ENV);

        if (this.isDevEnv()) {
            this.config[ConfigService.KEYS.HOSTNAME_CLOUDSHELL] = await this.getCloudShellHostname();
        }

        // this.addConfigToEnv(ConfigService.config);

        return this;
    }

    private async getCloudShellHostname(): Promise<string> {
        /*
            // TODO: find a way to also fetch current user automatically to avoid config, or replace CloudShell entirely
        
            // cli: cloudshell get-web-preview-url -p 8080
            // curl -s -H "Metadata-Flavor: Google" metadata/computeMetadata/v1/instance/zone
            // printenv

            // get current user on cli: https://cloud.google.com/sdk/gcloud/reference/auth/list
            // gcloud auth list --filter=status:ACTIVE --format="value(account)"

            // Creates a client
            // eslint-disable-next-line no-unused-vars
            const shellClient = new CloudShellServiceClient();
            async function initializeClient() {
                // Run request
                const response = await shellClient.getEnvironment({ "name": `users/${process.env.AUTH_USER}/environments/default` });
                console.log("HOST", response);
            }
            initializeClient();


            // https://cloud.google.com/compute/docs/metadata/default-metadata-values?hl=de
            async function loadFromMetadataAPI() {
                //    var result = await fetch("https://metadata.google.internal/computeMetadata/v1/instance").then(response => response.json());
                //    console.info("result", result);
            }
            loadFromMetadataAPI();

            const { exec } = require("child_process");
            console.log("before");
            exec(`printenv`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });
            console.log("after");
        */

        // https://cloud.google.com/nodejs/docs/reference/shell/latest
        const shellClient = new CloudShellServiceClient();
        var [environment] = await shellClient.getEnvironment(
            { "name": `users/${process.env.AUTH_USER}/environments/default` }
        );
        return process.env.PORT + "-" + environment.webHost;
    }

    private async getGcpSecret() {
        try {
            // https://cloud.google.com/nodejs/docs/reference/secret-manager/latest
            const secretManagerServiceClient = new SecretManagerServiceClient();
            const [version] = await secretManagerServiceClient.accessSecretVersion({
                name: `projects/${process.env.K_SERVICE}/secrets/production/versions/latest`
            });
            return ini.parse(version.payload.data.toString());
        } catch (error) {
            console.error(error);
        }
    }

    /*
    private addConfigToEnv(configs : object) {
        try {
            for (const [key, value] of Object.entries(configs)) {
                process.env[key.toString()] = value.toString();
            }
        } catch (error) {
            console.error(error);
        }
    }
    */

    saveRequestHostname(requestHostname: string) {
        this.config[ConfigService.KEYS.HOSTNAME_REQUEST] = requestHostname;
    }

    getHostname() {
        var hostname = this.getValue(this.isDevEnv() ? ConfigService.KEYS.HOSTNAME_CLOUDSHELL : ConfigService.KEYS.HOSTNAME_REQUEST);
        console.log("Hostname", hostname);
        return hostname;
    }

    isDevEnv() {
        return (process.env.NODE_ENV == "development");
    }

    getValue(configKey: ConfigKeys) {
        if (!this.config) {
            console.log("Config not loaded. Call init function before");
            return "empty";
        }
        if (!this.config[configKey]) {
            console.log(`Config key '${configKey}' not found`);
            return "empty";
        }
        return this.config[configKey];
    }
}