import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";

export class MailContext {
    transaction: string
    ensName: string
    shippingInfo: {
        name: string
        postalCode: string
        city: string
        country: string
        address: string
    }
    email: string
}

@Injectable()
export class MailSender {
    
    private sender;
    private receiver;
    private transport;

    constructor(private readonly config: ConfigService) {
        this.sender = config.getOrThrow("EMAIL");
        const password = config.getOrThrow("EMAIL_PASSWORD");
        this.receiver = config.getOrThrow("RECEIVER_EMAIL")
        this.transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.sender,
                pass: password,
            },
        });
    }

    public async sendEmail(context: MailContext) {
        let mailOptions = {
            from: this.sender,
            to: this.receiver,
            subject: `Keychain order for ${context.ensName} - Namespace`,
            text: `
                Keychain has been ordered for name ${context.ensName}

                Transaction: https://basescan.org/tx/${context.transaction}

                Shiping info:
                
                - Email: ${context.email}
                - Name: ${context.shippingInfo?.name || "unknown"}
                - Postal code: ${context.shippingInfo?.postalCode || "unknown"}
                - Address: ${context.shippingInfo?.address || "unknown"}
                - City: ${context.shippingInfo?.city || "unknown"}
                - Country: ${context.shippingInfo?.country || "unknown"}
            
            `
        };
        await this.transport.sendMail(mailOptions)
    }
}