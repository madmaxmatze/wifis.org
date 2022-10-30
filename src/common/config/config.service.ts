import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as ini from 'ini';

/**
 * from https://github.com/googleapis/nodejs-secret-manager --> "Access Secret Version"
 * 
 * @param gcpProjectId 
 * @param gcpSecretId 
 */
async function getGcpSecret(gcpProjectId: String, gcpSecretId: String) {
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

function addConfigToEnv(configs : object) {
    try {
        for (const [key, value] of Object.entries(configs)) {
            process.env[key.toString()] = value.toString();
        }
    } catch (error) {
        console.error(error);
    }
}

export async function loadConfigFromGcpSecretToEnv(gcpProject: String, gcpSecretId: String) {
    addConfigToEnv(await getGcpSecret(gcpProject, gcpSecretId));
}