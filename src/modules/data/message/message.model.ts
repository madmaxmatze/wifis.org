export enum MessageError {

}

export class Message {
    creationDate?: Date;
    wifiId: string;
    wifiIdSuffix?: string;

    wifiOwnerId?: string;           // was owner
    wifiOwnerMail?: string;         // NEW
    wifiOwnerName?: string;         // NEW

    senderContact: string;             // WAS senderEmail     
    text: string;

    securityScore?: number;         // NEW
    wasSent?: boolean;

    error?: string;
}

