import { Injectable } from '@angular/core';

import { environment } from 'client/environments/environment';

export let isDebugMode = !environment.production;

export abstract class Logger {

  debug: any;
  info: any;
  warn: any;
  error: any;
}


const noop = (): any => undefined;

@Injectable({
  providedIn: 'root',
})
export class ConsoleLoggerService implements Logger {

  get debug() {
    if (isDebugMode) {
      // tslint:disable-next-line:no-console
      return console.info.bind(console);
    } else {
      return noop;
    }

  }

  get info() {
    if (isDebugMode) {
      // tslint:disable-next-line:no-console
      return console.info.bind(console);
    } else {
      return noop;
    }
  }

  get warn() {
    if (isDebugMode) {
      // tslint:disable-next-line:no-console
      return console.warn.bind(console);
    } else {
      return noop;
    }
  }

  get error() {
    if (isDebugMode) {
      // tslint:disable-next-line:no-console
      return console.error.bind(console);
    } else {
      return noop;
    }
  }

  invokeConsoleMethod(type: string, args?: any): void {
    // tslint:disable-next-line:ban-types
    const logFn: Function = (console)[type] || console.log || noop;
    logFn.apply(console, [args]);
  }
}


