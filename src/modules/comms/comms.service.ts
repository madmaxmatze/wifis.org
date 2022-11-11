import { Injectable } from '@nestjs/common';
import { Message } from '../data/message/message.model';
import { MessageRepo } from '../data/message/message.repo';
import { MailjetService, MailjetSendResponse } from 'nest-mailjet'

@Injectable()
export class CommsService {
    constructor(private readonly messageRepo: MessageRepo, private readonly mailjetService: MailjetService) {}

    async sendMessage(newMessage: Message) {
        // verify message

        // send message
        var sendResult = await this.sendMessageWithMailJet(newMessage);
        console.log (sendResult);

        //newMessage.wasSent = sendResult.success;
        
        //if (!sendResult.success) {
            // newMessage.error = sendResult.error;
        //}

        return;
        
        // save message
        // var writeResponse = await this.messageRepo.insert(newMessage);
    }


    private async sendMessageWithMailJet(newMessage: Message): Promise<MailjetSendResponse> {
        return this.mailjetService.send({
            "Messages": [
                {
                    "From": {
                        "Email": "noreply@mail.wifis.org",
                        "Name": "Wifis.org"
                    },
                    "To": [
                        {
                            "Email": newMessage.wifiOwnerMail,
                            "Name": newMessage.wifiOwnerName
                        }
                    ],
                    // "Subject": "New message from wifis.org",
                    // "TextPart": "text",
                    // "HTMLPart": "<h3>HTML TEXT</h3>",
                    "TemplateID": 4070621,
                    "TemplateLanguage": true,
                    "Subject": "Email from wifis.org",
                    "Variables": {
                        "name": newMessage.wifiOwnerName,
                        "sender_contact": newMessage.senderContact,
                        "text": newMessage.text
                    },
                    // "CustomID": "wifi_mail"
                }
            ]
        });
    }
}