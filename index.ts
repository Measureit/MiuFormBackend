import express, { Express, Request, Response } from 'express';

//const express = require('express');
const app: Express = express();

var cors = require('cors')

var bodyParser = require('body-parser');
//const { response } = require('express');
// Create application/x-www-form-urlencoded parser  
var urlencodedParser = bodyParser.urlencoded({ extended: false , limit: '10mb'});

// for parsing application/json
app.use(bodyParser.json({ limit: '10mb' })); 

app.options('/', cors()) // cors for pre-flight

app.get('/', (req: Request, res: Response) => {
    res.send("Express server to send email.");
})

// interface EmailMessage {
//     from: string;
//     to: string[];
//     subject: string;
//     plainContent: string;
//     reportName: string;
//     report: string; //base64
//     reportData: string;
// }

app.post('/', cors(), urlencodedParser, (req: Request, res: Response) => {
    // Prepare output in JSON format  
    const response = req.body;
    var emailMessage = response.emailMessage;// as EmailMessage;
    var serverSecureCode = response.serverSecureCode;
    console.log(response);
    res.end(JSON.stringify(response));
})

app.listen(process.env.PORT || 3000)