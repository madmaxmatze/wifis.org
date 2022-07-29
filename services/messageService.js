var Mailjet = require('node-mailjet');

class MessageService {
    mailjet = new Mailjet({
        apiKey: process.env['MAILJET_APIKEY'],
        apiSecret: process.env['MAILJET_APISECRET']
    });

    /**
     * @description Create an instance of PostService
     */
    constructor() {

    }

    /**
     * @description Attempt to create a post with the provided object
     * @param options {object} Object containing all required fields
     * @returns {Promise<{success: boolean, error: *}|{success: boolean, body: *}>}
     */
    async sendMessage(options) {
        console.log ("sendMessage", options);
        return this.mailjet
            .post("send", { 'version': 'v3.1' })
            .request({
                "Messages": [
                    {
                        "From": {
                            "Email": "noreply@mail.wifis.org",
                            "Name": "Wifis.org"
                        },
                        "To": [
                            {
                                "Email": options.receiver_mail,
                                "Name": options.receiver_name
                            }
                        ],
                        // "Subject": "New message from wifis.org",
                        // "TextPart": "text",
                        // "HTMLPart": "<h3>HTML TEXT</h3>",
                        "TemplateID": 4070621,
                        "TemplateLanguage": true,
                        "Subject": "Email from wifis.org",
                        "Variables": {
                            "name": options.receiver_name,
                            "sender_contact": options.sender_contact,
                            "text": options.sender_text
                        },
                        // "CustomID": "wifi_mail"
                    }
                ]
            });
    }
}

module.exports = MessageService;