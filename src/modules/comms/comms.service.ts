import { Injectable } from '@nestjs/common';
import { MessageRepo } from '../data/message/message.repo';
import { Message } from '../data/message/message.model';
import { UserRepo } from '../data/user/user.repo';
import { User, UserError } from '../data/user/user.model';
import { MailjetService, MailjetSendResponse } from 'nest-mailjet'

@Injectable()
export class CommsService {
    constructor(
        private readonly messageRepo: MessageRepo,
        private readonly userRepo: UserRepo,
        private readonly mailjetService: MailjetService
    ) { }

    async sendMessage(message: Message): Promise<boolean> {
        // verify message

        var ownerUser: User = await this.userRepo.get(message.wifiOwnerId);
        if (!ownerUser) { throw new Error(UserError.notFound); }
        if (!ownerUser.email) { throw new Error(UserError.emailMissing); }
        message.wifiOwnerMail = ownerUser.email;
        message.wifiOwnerName = ownerUser.displayName || "";
        if (!message.wifiIdSuffix) {
            delete message.wifiIdSuffix;
        }

        return new Promise((resolve, _reject) => {
            this.sendMessageWithMailJet(message).then((result) => {
                message.wasSent = (result.response.status == 200);
                resolve(message.wasSent);
            }).catch((error) => {
                console.error(error);
                message.sendError = error.message;
                throw new Error("Error sending mail to Wifi Owner");
            }).finally(() => {
                this.messageRepo.insert(message);
            });
        });
    }


    private async sendMessageWithMailJet(message: Message): Promise<MailjetSendResponse> {
        console.log("sendMessageWithMailJet", message)

        return this.mailjetService.send({
            "Messages": [
                {
                    "From": {
                        "Email": "noreply@mail.wifis.org",
                        "Name": "Wifis.org"
                    },
                    "To": [
                        {
                            "Email": message.wifiOwnerMail,
                            "Name": message.wifiOwnerName
                        }
                    ],
                    // "Subject": "New message from wifis.org",
                    // "TextPart": "text",
                    // "HTMLPart": "<h3>HTML TEXT</h3>",
                    "TemplateID": 4070621,
                    "TemplateLanguage": true,
                    "Subject": "Email from wifis.org",
                    "Variables": {
                        "name": message.wifiOwnerName,
                        "sender_contact": message.senderContact,
                        "text": message.senderText
                    },
                    // "CustomID": "wifi_mail"
                }
            ]
        });
    }
}