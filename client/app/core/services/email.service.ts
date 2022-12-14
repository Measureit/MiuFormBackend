

import { Injectable } from '@angular/core';
import { from, map, mergeMap, Observable } from 'rxjs';
import { ConfigurationService } from './configuration.service';

export interface EmailMessage {
  from: string;
  to: string[];
  subject: string;
  plainContent: string;
  reportName: string;
  report: string; //base64
  //reportData: string;
}
@Injectable({
  providedIn: 'root',
})
export class EmailService {
  constructor() {
    
  }

  send(serverUrl: string, provider: string, options: any, emailMessage: EmailMessage): Observable<Response> {
    var myHeaders = new Headers({
      "Content-Type": "application/json",
    });

    return from(fetch(serverUrl, 
      {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify({ provider: provider, options: options, emailMessage: emailMessage })
      }))

  }
}
