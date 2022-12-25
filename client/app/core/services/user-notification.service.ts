import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root',
})
export class UserNotificationService {

  constructor(private snackBar: MatSnackBar, 
    private translateService: TranslateService) {
    
  }

  notify(textKey: string, duration?: number, panelClass?: string) {
    duration = duration ?? 3000;
    let options = { 
      panelClass: panelClass ?? 'user-notify-info',
      duration: duration,
      horizontalPosition: 'right', 
      verticalPosition: 'top'
    } as MatSnackBarConfig<any>;
    this.translateService.get(textKey)
    .subscribe({
      next: (tran) => this.snackBar.open(tran, null, options),
      error: (err)  => {
        console.error(err);
        this.snackBar.open(textKey, null, options)
      }
    })
  }

  notifyInfo(textKey: string, duration?: number) {
    this.notify(textKey, duration, 'user-notify-info');    
  }

  notifyError(textKey: string, duration?: number) {
    this.notify(textKey, duration, 'user-notify-error');
  }
}
