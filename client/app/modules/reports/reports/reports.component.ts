import { Component, OnInit } from '@angular/core';
import { first, map, mergeMap, Observable, of, tap, zip } from 'rxjs';
import { FactoryInfoConfig, Report } from 'client/app/core/models';
import { Router } from '@angular/router';
import { UserNotificationService, ReportService, ArchiveReportGeneratorService, DbInspectionService  } from 'client/app/core/services';
import { ConfirmDialogComponent, ConfirmDialogModel } from 'client/app/shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';

export interface SelectionItem {
  isSelected: boolean;
}

type RerortWithSelection = Report & SelectionItem;

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  isBackupSelected = false;

  loadFactoryWithNoActive = false;
  factoryItems: FactoryInfoConfig[] = [];
  items: RerortWithSelection[] = [];
  selectedFactoryIds: string[] = [];
  productIdFilter = '';

  constructor(private reportService: ReportService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private userNotificationService: UserNotificationService,
    private archiveReportGeneratorService: ArchiveReportGeneratorService,
    private dbInspectionService: DbInspectionService,
    private router: Router) { }

  ngOnInit(): void {
    this.reloadFactories(false)//this.loadFactoryWithNoActive)
      .pipe(
        mergeMap(x => this.reloadReports()),
        first()
      )
      .subscribe({
        error: (err) =>{
          console.error(err);
          this.userNotificationService.notifyError('MESSAGE.LOAD.FAILED');
        }
      });
  }

  selectFactoryInfoConfig(id: string): FactoryInfoConfig | undefined {
    return this.factoryItems.find(x => x._id === id);
  }

  reloadReports(): Observable<boolean> {
    return this.reportService.getFiltered(this.productIdFilter, this.selectedFactoryIds)
      .pipe(
        tap(x => this.items = x.map(y => ({...y, isSelected: false } as RerortWithSelection))),
        map(x => true)
      );
  }

  filter() {
    this.reloadReports()
    .pipe(
      first()
    )
    .subscribe({
      error: (err) =>{
        console.error(err);
        this.userNotificationService.notifyError('MESSAGE.LOAD.FAILED');
      }
    });
  }

  clearFilter() {
    this.selectedFactoryIds = [];
    this.productIdFilter = '';
    this.filter();
  }

  reloadFactories(loadNoActive: boolean): Observable<boolean> {
    return this.reportService.getFactories()
      .pipe(
        tap(x => this.factoryItems = x),
        map(x => true)
      );
  }

  preview(event: any, id: string) {
    if (this.isBackupSelected) {return;}
    this.router.navigate(['/reports/preview', id]);
  }

  prepare(event: any, id: string) {
    event.stopPropagation();
    this.router.navigate(['/reports/prepare', id]);
  }

  onBackup(event: any) {
    if (!this.isBackupSelected) {
      this.isBackupSelected = true;
    } else {
      //operate backup backup
      const dialogData = new ConfirmDialogModel(
        this.translateService.instant('MESSAGE.BACKUP.BACKUP_REPORTS') as string,
        this.translateService.instant('MESSAGE.BACKUP.BACKUP_REPORTS_QUESTION') as string);

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: dialogData
      });

      dialogRef.afterClosed().pipe(
        //make backup
        mergeMap(x => {
          if (x === true) {
            return this.backupReports(this.items.filter(y => y.isSelected));
          } else {
            return of(false);
          }
        }),
        //ask about remove
        mergeMap(x => {
          if (x === true) {
            const dialogDataRemoveReport =
              new ConfirmDialogModel( this.translateService.instant('MESSAGE.BACKUP.REMOVE_REPORTS') as string,
                this.translateService.instant('MESSAGE.BACKUP.REMOVE_REPORTS_QUESTION') as string);
            const dialogRefRemoveReport = this.dialog.open(ConfirmDialogComponent, {
              maxWidth: '400px',
              data: dialogDataRemoveReport
            });
            return dialogRefRemoveReport.afterClosed();
          } else {
            return of(false);
          }
        }),
        mergeMap(x => {
          if (x === true) {
            return this.removeReports(this.items.filter(y => y.isSelected))
            .pipe(
              // remove reports (which were removed from system) from view)
              tap(y => { for (let i = this.items.length - 1; i >= 0; --i) {
                if (this.items[i].isSelected) {
                  this.items.splice(i,1);
                }
              }})
            );
          } else {
            return of(false);
          }
        }),
        map(x =>
           this.dbInspectionService.compactDb()
          //return of(false);
        ),
        tap(x => this.isBackupSelected = false)
      ).subscribe({
        error: (err) => {
          this.userNotificationService.notifyError('MESSAGE.BACKUP.FAILED');
          console.error(err);
        }
      });

    }
  }

  download(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  backupReports(reports: Report[]): Observable<boolean> {
    return this.archiveReportGeneratorService.generateZip(this.factoryItems, reports)
      .pipe(
        tap(x => this.download(x, `miuform_${moment().format('XXXX-MM-DD_HH-MM-SS')}.zip`, 'application/zip')),
        map(x => true)
      );
  }

  removeReports(reports: Report[]): Observable<boolean> {
    return zip(
      reports.map(x =>
        this.reportService.removeReport(x)
      )
    )
    .pipe(
      mergeMap(x => of(x.every(r => r === true)))
    );
  }

  checkToBackup(event: any, item: RerortWithSelection) {
    item.isSelected = !item.isSelected;
  }

  onCancelBackup(event: any) {
    this.items.forEach(x => x.isSelected = false);
    this.isBackupSelected = false;
  }

  anySelected(): boolean {
    return this.items.findIndex(x => x.isSelected) > -1;
  }
}
