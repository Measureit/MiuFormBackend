import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first, from, map, mergeMap, of, tap, throwError, zip } from 'rxjs';
import { Report } from 'client/app/core/models';
import { blobToBase64, ConfigurationService, Logger, ReportService } from 'client/app/core/services';
import { EmailMessage, EmailService } from 'client/app/core/services/email.service';
import { UserNotificationService } from 'client/app/core/services/user-notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent, ConfirmDialogModel } from 'client/app/shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-preview-report',
  templateUrl: './preview-report.component.html',
  styleUrls: ['./preview-report.component.scss']
})
export class PreviewReportComponent implements OnInit {
  report: Report;
  reportBlob: Blob;
  genereting: boolean;

  constructor(
    private router: Router,
    private logger: Logger,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private translateService: TranslateService,
    private userNotificationService: UserNotificationService,
    private configurationService: ConfigurationService,
    private dialog: MatDialog,
    private emailService: EmailService) {

  }

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        first(),
        map(params => params.id),
        mergeMap(id => {
          this.genereting = true;
          this.logger.debug(`prepare report for id: ${id}`);
          if (id !== undefined && id !== '') {
            return this.reportService.getReport(id);
          } else {
            return throwError(() => new Error(`Report with id ${id} does not exist.`));
          }
        }),
        mergeMap(report => {
          this.report = report;
          return this.reportService.generatePdf(report);
        }),
        tap(x => { this.reportBlob = x; })
      )
      .subscribe({
        error: (err) => {
          this.genereting = false;
          console.error(err);
          this.userNotificationService.notifyError('MESSAGE.REPORT.PREVIEW_FAILED');
        },
        complete: () => this.genereting = false
      });

  }

  public enablePinchOnMobile = true;
  public isMobile = 'ontouchstart' in document.documentElement;
  public minZoom = 0.33;
  public maxZoom = 3;
  public zoomLevels = ['auto', 'page-actual', 'page-fit', 'page-width', 0.2, 0.25, 0.33, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4];
  private _zoomSetting: number | string | undefined = 'page-width';
  //private currentZoomFactor: number;
  // getter and setter make the demo nicer -
  // you probably don't need them in your code
  public get zoomSetting(): number | string {
    return String(this._zoomSetting);
  }
  public set zoomSetting(zoom: number | string) {
    if (isNaN(Number(zoom))) {
      this._zoomSetting = zoom;
    } else {
      this._zoomSetting = zoom + '%';
    }
  }
  public updateZoomFactor(zoom: number): void {
    //this.currentZoomFactor = zoom;
  }

  // blobToBase64 = (blob: Blob) : Promise<string> => {
  //   const reader = new FileReader();
  //   reader.readAsDataURL(blob);
  //   return new Promise<string>(resolve => {
  //     reader.onloadend = () => {
  //       resolve(reader.result.toString()); //todo: and tostring dodane
  //     };
  //   });
  // };

  send() {
    if (this.reportBlob && this.reportBlob.size > 0 && this.report) {
      const sufix = Date.now().toString();

      zip(
        this.configurationService.getDelivery(),
        this.configurationService.getFactory(this.report.factoryInfoId),
        this.translateService.get('PREVIEW_REPORT.SEND_EMAIL_QUESTION_TITLE'),
        this.translateService.get('PREVIEW_REPORT.SEND_EMAIL_QUESTION')
      )
        .pipe(
          mergeMap(deliveryInfo => {
            const delivery = deliveryInfo[0];
            const factory = deliveryInfo[1];
            const to = (factory.emails ?? []).concat(delivery.deliveryEmails);

            const dialogData = new ConfirmDialogModel(deliveryInfo[2], `${deliveryInfo[3]}: ${to.join(', ')}?`);

            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
              maxWidth: '400px',
              data: dialogData
            });

            return zip(dialogRef.afterClosed(), of(delivery), of(to));
          }),
          mergeMap(zipR => {
            const dialogRes = zipR[0];
            if (!dialogRes) {
              return of(false);
            }
            return zip(
              of(zipR[1]),
              of(zipR[2]),
              from(blobToBase64(this.reportBlob))
            ).pipe(
              map(zipRes => {
                const delivery = zipRes[0];
                const to = zipRes[1];
                const reportBase64 = zipRes[2].replace(/^data:(.*,)?/, '');
                return {
                  emailServerUrl: delivery.emailServerUrl,
                  options: { serverSecureCode: delivery.emailServerSecretCode },
                  email: {
                    report: reportBase64,
                    reportName: `${this.report.productId}_${sufix}.pdf`,
                    //reportData: JSON.stringify(this.report),
                    from: delivery.fromUser,
                    to,
                    subject: `Raport pokontrolny -> ${this.report.productName} (${this.report.productId}) ${this.report.productColor}`,
                    plainContent: `Dzień dobry,\n w załączniku znajduje się raport pokontrolny produktu ${this.report.productName} (${this.report.productId}) ${this.report.productColor}\n\n\n`
                  } as EmailMessage
                };
              }),
              mergeMap(x => this.emailService.send(x.emailServerUrl, 'sendinblue', x.options, x.email)),
              map(x => x.ok)
            );
          }),
        )
        .subscribe({
          next: (n) => {
            //console.log(n);
            if (n) {
              this.userNotificationService.notifyInfo('MESSAGE.REPORT.SEND_SUCCESSED');
            } else {
              //user canceled
            }
          },
          error: (err) => {
            console.error(err);
            this.userNotificationService.notifyError('MESSAGE.REPORT.SEND_FAILED');
          }
        });
    }
  }

  editReport() {
    this.router.navigate(['/reports/prepare', this.report._id]);
  }
}
