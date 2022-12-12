import * as dotenv from 'dotenv';
dotenv.config();
import * as express from 'express';
import { Request, Response } from 'express';
import { first } from 'rxjs';
import { EmailMessage, EmailSender } from './emailsender';
import { SendGridEmailSender } from './sendgrid.emailsender';
import { SendInBlueSender } from './sendinblue.emailsender';
import * as path from 'path';


//const express = require('express');
const app = express();
app.set('port', (process.env.PORT || 4200));
app.use('/', express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var cors = require('cors')

var bodyParser = require('body-parser');
//const { response } = require('express');
// Create application/x-www-form-urlencoded parser  
var urlencodedParser = bodyParser.urlencoded({ extended: false, limit: '10mb' });

// for parsing application/json
app.use(bodyParser.json({ limit: '10mb' }));

app.options('/api', cors()) // cors for pre-flight

app.options('/', cors()) // cors for pre-flight

app.get('/api', (req: Request, res: Response) => {
    res.send("Express server to send email.");
})


app.post('/api', cors(), urlencodedParser, (req: Request, res: Response) => {
    // Prepare output in JSON format  
    const response = req.body;
    if (!response) {
        throw new Error("Body is not defined correctly.");
    }

    const emailMessage = response.emailMessage as EmailMessage;
    if (!emailMessage) {
        throw new Error("Email Message is not defined correctly or wrong formatted.");
    }
    
    const options = response.options;
    const provider = response.provider;

    let emailSender: EmailSender | undefined = undefined; 
    
    switch (provider) {
        case 'sendinblue': 
            emailSender = new SendInBlueSender();
            break;

        case 'sendgrid': 
            emailSender = new SendGridEmailSender();
            break;

        default: 
            throw new Error("Unknown provider.");
    }    

    emailSender.send(options, emailMessage)
        .pipe(first())
        .subscribe({
            next: (m) => res.end(JSON.stringify(m)),
            error: (err) => res.status(500).end(JSON.stringify(err))
        })
})

app.listen(process.env.PORT || 3000);

export { app } 