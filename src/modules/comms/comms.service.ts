import { Injectable } from '@nestjs/common';
import { MessageRepo } from '../data/message/message.repo';
import { Message } from '../data/message/message.model';
import { UserRepo } from '../data/user/user.repo';
import { User, UserError } from '../data/user/user.model';
import { MailjetService, MailjetSendResponse } from 'nest-mailjet'
import { ConfigService, ConfigKey } from '../config/config.service';

@Injectable()
export class CommsService {
    constructor(
        private readonly configService: ConfigService,
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
        message.wifiOwnerName = ownerUser.name || "";
        if (!message.wifiIdSuffix) {
            delete message.wifiIdSuffix;
        }

        return this.sendMessageWithMailJet(message).then((result) => {
            message.sendSuccess = (result.response.status == 200);
            return (message.sendSuccess);
        }).catch((error) => {
            console.error(error);
            message.sendError = error.message;
            throw new Error("Error sending mail to Wifi Owner");
        }).finally(() => {
            this.messageRepo.insert(message);
        });
    }

    private async sendMessageWithMailJet(message: Message): Promise<MailjetSendResponse> {
        console.log("sendMessageWithMailJet", message);

        var fullWifiId = message.wifiId + (message.wifiIdSuffix ? "/" + message.wifiIdSuffix : "");

        return this.mailjetService.send({
            "Messages": [{
                "From": {
                    "Email": "noreply@mail.wifis.org",
                    "Name": "Wifis.org"
                },
                "To": [{
                    "Email": message.wifiOwnerMail,
                    "Name": message.wifiOwnerName
                }],
                "TemplateID": parseInt(this.configService.getValue(ConfigKey.MAILJET_TEMPLATE_ID)),
                "TemplateLanguage": true,
                "Subject": "Mail from  wifis.org/" + fullWifiId,
                "Variables": {
                    "wifiId": fullWifiId,
                    "senderContact": message.senderContact,
                    "senderText": message.senderText
                }
            }]
        });
    }
}