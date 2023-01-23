import { from, Observable } from 'rxjs';
import { EmailMessage, EmailSender } from './emailsender';

const sgMail = require('@sendgrid/mail');

export interface SendGridOptions {
    serverSecureCode: string;
}

export class SendGridEmailSender implements EmailSender {
    send(options: any, email: EmailMessage): Observable<any> {
        const sendGridoptions = options as SendGridOptions;
        return this.sendBySendGrid(sendGridoptions, email);
    }

    sendBySendGrid(options: SendGridOptions, email: EmailMessage): Observable<any> {
        sgMail.setApiKey(options.serverSecureCode);

        const msg = {
            to: 'adamus79@poczta.onet.pl', // Change to your recipient
            from: 'adamus79@poczta.onet.pl', // Change to your verified sender
            subject: 'Sending with SendGrid is Fun',
            text: 'and easy to do anywhere, even with Node.js',
            html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        };

        return from(sgMail.send(msg));

    }
}
