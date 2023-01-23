import { Observable } from 'rxjs';

export interface EmailMessage {
    from: string;
    to: string[];
    subject: string;
    plainContent: string;
    reportName: string;
    report: string; //base64
    //reportData: string;
}

export interface EmailSender {
    send(options: any, email: EmailMessage): Observable<any>;
}
