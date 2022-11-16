export enum MessageError {

}

export class Message {
    wifiId: string;
    wifiIdSuffix?: string;          // was subWifiId
    wifiOwnerId: string;            // was owner 
    wifiOwnerMail?: string;         // NEW
    wifiOwnerName?: string;         // NEW

    senderContact: string;          // WAS senderEmail     
    senderText: string;             // WAS text  

    creationDate: Date;
    securityScore?: number;         // NEW
    wasSent: boolean;               // was wasSent
    sendError?: string;             // NEW
}

